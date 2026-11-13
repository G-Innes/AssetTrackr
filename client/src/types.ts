export interface User {
  id: number
  username: string
  email: string
  /** A throwaway account with sample data, deleted after a day */
  isDemo: boolean
  createdAt: string
}

export interface AssetRef {
  id: number
  ticker: string
  name: string
}

export type TransactionType = 'buy' | 'sell'

/** Amounts arrive from the API as decimal strings so no precision is lost in transit. */
export interface Transaction {
  id: number
  type: TransactionType
  quantity: string
  price: string
  executedAt: string
  note: string | null
  asset: AssetRef
}

export interface NewTransaction {
  ticker: string
  type: TransactionType
  quantity: string
  /** Left out, the server uses the market price on the trade's date */
  price?: string
  /** ISO timestamp; left out, the trade is recorded as happening now */
  executedAt?: string
  note?: string
}

export type TransactionChanges = Partial<Omit<NewTransaction, 'ticker'>>

/** One asset the user currently owns. Money fields are null when no price is available. */
export interface Holding {
  asset: AssetRef
  quantity: string
  averageCost: number
  costBasis: number
  realizedPnl: number
  price: number | null
  change24h: number | null
  value: number | null
  unrealizedPnl: number | null
  unrealizedPnlPercent: number | null
  /** Share of the portfolio's value, 0-100 */
  allocation: number | null
}

export interface PortfolioTotals {
  value: number
  costBasis: number
  unrealizedPnl: number
  unrealizedPnlPercent: number | null
  realizedPnl: number
  change24h: number
  change24hPercent: number | null
}

export interface Portfolio {
  holdings: Holding[]
  totals: PortfolioTotals
  /** Tickers that could not be priced and are left out of the totals */
  unpriced: string[]
  pricedAt: string
}

export type HistoryRange = '30d' | '90d' | '1y'

export interface HistoryPoint {
  /** UTC day, e.g. 2026-03-05 */
  date: string
  value: number
  costBasis: number
}

export interface MarketAsset {
  ticker: string
  name: string
  price: number | null
  change24h: number | null
}
