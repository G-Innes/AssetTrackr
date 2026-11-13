export interface User {
  id: number
  username: string
  email: string
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

export interface Holding {
  asset: AssetRef
  quantity: string
}

export interface NewTransaction {
  ticker: string
  name?: string
  type: TransactionType
  quantity: string
  price: string
}
