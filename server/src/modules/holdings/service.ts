import { dataSource } from '../../database/dataSource'
import { Transaction } from '../../entities'
import { formatDecimal } from '../../utils/decimal'
import { notFound } from '../../utils/errors'

export interface HoldingView {
  asset: { id: number; ticker: string; name: string }
  quantity: string
}

const SIGNED_QUANTITY = `CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END`

/** Current positions, derived from the ledger. Fully sold assets are omitted. */
export async function listHoldings(userId: number): Promise<HoldingView[]> {
  const rows = await dataSource
    .getRepository(Transaction)
    .createQueryBuilder('t')
    .innerJoin('t.asset', 'asset')
    .select('asset.id', 'id')
    .addSelect('asset.ticker', 'ticker')
    .addSelect('asset.name', 'name')
    .addSelect(`SUM(${SIGNED_QUANTITY})`, 'quantity')
    .where('t.userId = :userId', { userId })
    .groupBy('asset.id')
    .having(`SUM(${SIGNED_QUANTITY}) > 0`)
    .orderBy('asset.ticker', 'ASC')
    .getRawMany<{
      id: number
      ticker: string
      name: string
      quantity: string
    }>()

  return rows.map((row) => ({
    asset: { id: row.id, ticker: row.ticker, name: row.name },
    quantity: formatDecimal(row.quantity),
  }))
}

/**
 * Removes an asset from the portfolio altogether by deleting its
 * transactions. (Selling is a transaction; this is "I never meant to add it".)
 */
export async function removeHolding(userId: number, assetId: number) {
  const result = await dataSource
    .getRepository(Transaction)
    .delete({ userId, assetId })
  if (!result.affected)
    throw notFound('You have no transactions for this asset')
}
