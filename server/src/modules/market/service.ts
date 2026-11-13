import config from '../../config'
import { HttpError } from '../../utils/errors'
import logger from '../../utils/logger'
import { coinbaseProvider } from './coinbase'
import { MarketAsset, MarketDataProvider, Quote } from './provider'
import { staticProvider } from './static'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

let provider: MarketDataProvider =
  config.marketData === 'static' ? staticProvider : coinbaseProvider

interface CacheEntry<T> {
  value?: T
  fetchedAt: number
  pending?: Promise<T>
}
const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Caches an upstream call for `ttl` ms. Concurrent callers share one request,
 * and if a refresh fails the last good value keeps being served - a blip at
 * the price source should not take the dashboard down with it.
 */
async function cached<T>(
  key: string,
  ttl: number,
  load: () => Promise<T>
): Promise<T> {
  const entry = (cache.get(key) ?? { fetchedAt: 0 }) as CacheEntry<T>
  cache.set(key, entry)

  if (entry.value !== undefined && Date.now() - entry.fetchedAt < ttl) {
    return entry.value
  }
  if (!entry.pending) {
    entry.pending = load()
      .then((value) => {
        entry.value = value
        entry.fetchedAt = Date.now()
        return value
      })
      .finally(() => {
        entry.pending = undefined
      })
  }

  try {
    return await entry.pending
  } catch (error) {
    logger.warn({ err: error, key }, 'Market data request failed')
    if (entry.value !== undefined) return entry.value
    throw new HttpError(503, 'Market data is temporarily unavailable')
  }
}

/** Swaps the price source and clears everything cached from the old one. */
export function setMarketDataProvider(next: MarketDataProvider) {
  provider = next
  cache.clear()
}

// Coinbase settles USDC 1:1 with the dollar, so it has no USDC-USD market.
const DOLLAR_PEGGED: MarketAsset[] = [{ ticker: 'USDC', name: 'USD Coin' }]

/** True for assets that are worth exactly one dollar by definition. */
export const isDollarPegged = (ticker: string) =>
  DOLLAR_PEGGED.some((pegged) => pegged.ticker === ticker)

export async function listAssets(): Promise<MarketAsset[]> {
  return cached('assets', 6 * HOUR, async () => {
    const assets = await provider.listAssets()
    const missing = DOLLAR_PEGGED.filter(
      (pegged) => !assets.some((asset) => asset.ticker === pegged.ticker)
    )
    return [...assets, ...missing]
  })
}

export async function findAsset(
  ticker: string
): Promise<MarketAsset | undefined> {
  return (await listAssets()).find((asset) => asset.ticker === ticker)
}

export async function getQuotes(): Promise<Map<string, Quote>> {
  return cached('quotes', 30 * SECOND, async () => {
    const quotes = await provider.getQuotes()
    DOLLAR_PEGGED.forEach(({ ticker }) => {
      if (!quotes.has(ticker)) quotes.set(ticker, { price: 1, change24h: 0 })
    })
    return quotes
  })
}

/** Like getQuotes, but an outage yields "no prices" instead of an error. */
export async function getQuotesIfAvailable(): Promise<Map<string, Quote>> {
  try {
    return await getQuotes()
  } catch {
    return new Map()
  }
}

/** Daily closes keyed by UTC date, from `from` until today. */
export async function getDailyCloses(
  ticker: string,
  from: Date
): Promise<Map<string, number>> {
  if (isDollarPegged(ticker)) return new Map()
  const fromDay = from.toISOString().slice(0, 10)
  // Keyed by start day, so a longer range is a separate (larger) request.
  return cached(`closes:${ticker}:${fromDay}`, HOUR, () =>
    provider.getDailyCloses(ticker, from)
  )
}

/**
 * The USD price of one unit: the live quote for today (or no date), otherwise
 * that day's closing price. Undefined when the source has no price.
 */
export async function getPrice(
  ticker: string,
  day?: string
): Promise<number | undefined> {
  if (isDollarPegged(ticker)) return 1
  const today = new Date().toISOString().slice(0, 10)
  if (!day || day >= today) return (await getQuotes()).get(ticker)?.price
  return (await getDailyCloses(ticker, new Date(day))).get(day)
}

/** Ranks assets for the search box: ticker matches first, then names. */
export async function searchAssets(query: string, limit: number) {
  const [assets, quotes] = await Promise.all([
    listAssets(),
    getQuotesIfAvailable(),
  ])
  const term = query.trim().toUpperCase()

  const rank = (asset: MarketAsset): number => {
    const name = asset.name.toUpperCase()
    if (asset.ticker === term) return 0
    if (asset.ticker.startsWith(term)) return 1
    if (name.startsWith(term)) return 2
    if (name.includes(term) || asset.ticker.includes(term)) return 3
    return -1
  }

  // With no search term, lead with the names people look for most.
  const popular = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'LINK', 'AVAX']
  const matches = term
    ? assets
        .map((asset) => ({ asset, score: rank(asset) }))
        .filter(({ score }) => score >= 0)
        .sort((a, b) => a.score - b.score)
        .map(({ asset }) => asset)
    : [
        ...popular.flatMap((ticker) =>
          assets.filter((a) => a.ticker === ticker)
        ),
        ...assets.filter((asset) => !popular.includes(asset.ticker)),
      ]

  return matches.slice(0, limit).map((asset) => ({
    ...asset,
    price: quotes.get(asset.ticker)?.price ?? null,
    change24h: quotes.get(asset.ticker)?.change24h ?? null,
  }))
}
