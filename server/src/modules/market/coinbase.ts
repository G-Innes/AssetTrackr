import { MarketAsset, MarketDataProvider, Quote } from './provider'

const RETAIL_API = 'https://api.coinbase.com/v2'
const EXCHANGE_API = 'https://api.exchange.coinbase.com'
const DAY_MS = 24 * 60 * 60 * 1000
// The candles endpoint returns at most 300 rows per request
const MAX_CANDLES = 300

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'portfolio-tracker' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(`Coinbase responded ${response.status} for ${url}`)
  }
  return response.json() as Promise<T>
}

interface Product {
  base_currency: string
  quote_currency: string
  status: string
  trading_disabled: boolean
}

type ProductStats = Record<
  string,
  { stats_24hour?: { open: string; last: string } }
>

// [time (unix seconds), low, high, open, close, volume], newest first
type Candle = [number, number, number, number, number, number]

/** Public, key-less Coinbase market data. */
export const coinbaseProvider: MarketDataProvider = {
  async listAssets(): Promise<MarketAsset[]> {
    const [currencies, products] = await Promise.all([
      getJson<{ data: { code: string; name: string }[] }>(
        `${RETAIL_API}/currencies/crypto`
      ),
      getJson<Product[]>(`${EXCHANGE_API}/products`),
    ])

    // Only offer assets that actually trade against USD, so each has a price.
    const tradable = new Set(
      products
        .filter(
          (product) =>
            product.quote_currency === 'USD' &&
            product.status === 'online' &&
            !product.trading_disabled
        )
        .map((product) => product.base_currency)
    )
    const names = new Map(currencies.data.map((c) => [c.code, c.name]))

    return [...tradable]
      .map((ticker) => ({ ticker, name: names.get(ticker) ?? ticker }))
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
  },

  async getQuotes(): Promise<Map<string, Quote>> {
    const stats = await getJson<ProductStats>(`${EXCHANGE_API}/products/stats`)
    const quotes = new Map<string, Quote>()

    Object.entries(stats).forEach(([productId, { stats_24hour: day }]) => {
      const [ticker, quoteCurrency] = productId.split('-')
      if (quoteCurrency !== 'USD' || !day) return

      const price = Number(day.last)
      const open = Number(day.open)
      if (!Number.isFinite(price) || price <= 0) return

      quotes.set(ticker, {
        price,
        change24h: open > 0 ? ((price - open) / open) * 100 : 0,
      })
    })
    return quotes
  },

  async getDailyCloses(
    ticker: string,
    from: Date
  ): Promise<Map<string, number>> {
    const closes = new Map<string, number>()
    const end = Date.now()
    let windowStart = Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate()
    )

    const requests: Promise<Candle[]>[] = []
    while (windowStart <= end) {
      const windowEnd = Math.min(windowStart + (MAX_CANDLES - 1) * DAY_MS, end)
      requests.push(
        getJson<Candle[]>(
          `${EXCHANGE_API}/products/${ticker}-USD/candles?granularity=86400` +
            `&start=${new Date(windowStart).toISOString()}` +
            `&end=${new Date(windowEnd).toISOString()}`
        )
      )
      windowStart = windowEnd + DAY_MS
    }

    ;(await Promise.all(requests)).flat().forEach(([time, , , , close]) => {
      closes.set(new Date(time * 1000).toISOString().slice(0, 10), close)
    })
    return closes
  },
}
