export interface MarketAsset {
  ticker: string
  name: string
}

export interface Quote {
  /** Latest USD price of one unit */
  price: number
  /** Percentage change over the last 24 hours, e.g. -2.5 */
  change24h: number
}

/**
 * Where prices come from. The app talks to this interface only, so the real
 * source can be swapped out - the tests use an in-memory fake.
 */
export interface MarketDataProvider {
  /** Every asset that can be priced in USD */
  listAssets(): Promise<MarketAsset[]>
  /** Latest quote per ticker, for every asset at once */
  getQuotes(): Promise<Map<string, Quote>>
  /**
   * Daily closing prices in USD keyed by UTC date ("2026-03-05"), covering
   * `from` up to today where the source has data.
   */
  getDailyCloses(ticker: string, from: Date): Promise<Map<string, number>>
}
