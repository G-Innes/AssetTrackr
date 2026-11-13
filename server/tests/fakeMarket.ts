import {
  MarketAsset,
  MarketDataProvider,
  Quote,
} from '../src/modules/market/provider'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * A market that never changes unless a test changes it: fixed quotes, and
 * every past day closing at half of today's price. Keeps tests off the network
 * and makes profit figures easy to work out by hand.
 */
export const fakeMarket = {
  assets: [] as MarketAsset[],
  quotes: new Map<string, Quote>(),
  /** Set to make every call fail, as if the price source were down */
  down: false,

  reset() {
    this.down = false
    this.assets = [
      { ticker: 'ADA', name: 'Cardano' },
      { ticker: 'BTC', name: 'Bitcoin' },
      { ticker: 'DOGE', name: 'Dogecoin' },
      { ticker: 'ETH', name: 'Ethereum' },
      { ticker: 'LINK', name: 'Chainlink' },
      { ticker: 'SOL', name: 'Solana' },
      { ticker: 'XRP', name: 'XRP' },
    ]
    this.quotes = new Map([
      ['ADA', { price: 0.5, change24h: 0 }],
      ['BTC', { price: 60000, change24h: 25 }],
      ['DOGE', { price: 0.1, change24h: 0 }],
      ['ETH', { price: 3000, change24h: -50 }],
      ['LINK', { price: 10, change24h: 0 }],
      ['SOL', { price: 100, change24h: 0 }],
      ['XRP', { price: 2, change24h: 0 }],
    ])
  },

  /** What a unit closed at on any day before today */
  historicalPrice(ticker: string): number {
    return this.quotes.get(ticker)!.price / 2
  },
}

export const fakeProvider: MarketDataProvider = {
  async listAssets() {
    if (fakeMarket.down) throw new Error('market is down')
    return fakeMarket.assets
  },

  async getQuotes() {
    if (fakeMarket.down) throw new Error('market is down')
    return new Map(fakeMarket.quotes)
  },

  async getDailyCloses(ticker, from) {
    if (fakeMarket.down) throw new Error('market is down')
    const closes = new Map<string, number>()
    if (!fakeMarket.quotes.has(ticker)) return closes

    const today = new Date().toISOString().slice(0, 10)
    for (let day = from.getTime(); day <= Date.now(); day += DAY_MS) {
      const date = new Date(day).toISOString().slice(0, 10)
      if (date !== today) closes.set(date, fakeMarket.historicalPrice(ticker))
    }
    return closes
  },
}
