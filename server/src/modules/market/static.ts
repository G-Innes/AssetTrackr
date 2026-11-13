import { MarketDataProvider } from './provider'

const DAY_MS = 24 * 60 * 60 * 1000

const ASSETS = [
  { ticker: 'BTC', name: 'Bitcoin', price: 60000, change24h: 2 },
  { ticker: 'ETH', name: 'Ethereum', price: 3000, change24h: -1.5 },
  { ticker: 'SOL', name: 'Solana', price: 150, change24h: 4 },
  { ticker: 'XRP', name: 'XRP', price: 2, change24h: 0.5 },
  { ticker: 'ADA', name: 'Cardano', price: 0.5, change24h: -0.8 },
  { ticker: 'DOGE', name: 'Dogecoin', price: 0.2, change24h: 6 },
  { ticker: 'LINK', name: 'Chainlink', price: 15, change24h: 1 },
]

/**
 * Fixed, made-up prices with no network access: for working offline and for
 * end-to-end tests, which need the same numbers on every run. Enabled with
 * MARKET_DATA=static. Past days climb steadily from 60% of today's price a
 * year ago, with a ripple so charts are not a straight line.
 */
export const staticProvider: MarketDataProvider = {
  async listAssets() {
    return ASSETS.map(({ ticker, name }) => ({ ticker, name }))
  },

  async getQuotes() {
    return new Map(
      ASSETS.map(({ ticker, price, change24h }) => [
        ticker,
        { price, change24h },
      ])
    )
  },

  async getDailyCloses(ticker, from) {
    const closes = new Map<string, number>()
    const asset = ASSETS.find((candidate) => candidate.ticker === ticker)
    if (!asset) return closes

    const today = Math.floor(Date.now() / DAY_MS)
    for (let day = Math.floor(from.getTime() / DAY_MS); day < today; day += 1) {
      const age = Math.min(today - day, 365)
      const trend = 1 - 0.4 * (age / 365)
      const ripple = 1 + 0.04 * Math.sin(day / 6)
      const date = new Date(day * DAY_MS).toISOString().slice(0, 10)
      closes.set(date, Number((asset.price * trend * ripple).toPrecision(6)))
    }
    return closes
  },
}
