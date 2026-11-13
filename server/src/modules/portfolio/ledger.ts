import { TransactionType } from '../../entities'
import { Decimal } from '../../utils/decimal'

/** The parts of a transaction the maths needs. */
export interface LedgerEntry {
  id: number
  type: TransactionType
  quantity: string
  price: string
  executedAt: Date
}

export interface Position {
  /** Units currently held */
  quantity: Decimal
  /** What the units still held cost to buy */
  costBasis: Decimal
  /** Profit or loss locked in by sales so far */
  realizedPnl: Decimal
}

const ZERO = new Decimal(0)

/** Oldest first; the id breaks ties so the order is always the same. */
export function sortEntries<T extends LedgerEntry>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => a.executedAt.getTime() - b.executedAt.getTime() || a.id - b.id
  )
}

/**
 * Applies one transaction to a position using the average cost method:
 * a sale removes cost in proportion to the units sold, and the difference
 * between the sale price and that average cost is realised profit.
 */
export function applyEntry(position: Position, entry: LedgerEntry): Position {
  const quantity = new Decimal(entry.quantity)
  const price = new Decimal(entry.price)

  if (entry.type === TransactionType.BUY) {
    return {
      quantity: position.quantity.plus(quantity),
      costBasis: position.costBasis.plus(quantity.times(price)),
      realizedPnl: position.realizedPnl,
    }
  }

  const averageCost = position.quantity.isZero()
    ? ZERO
    : position.costBasis.div(position.quantity)
  const remaining = position.quantity.minus(quantity)
  return {
    quantity: remaining,
    // Selling everything must leave exactly zero cost, not rounding dust.
    costBasis: remaining.isZero()
      ? ZERO
      : position.costBasis.minus(quantity.times(averageCost)),
    realizedPnl: position.realizedPnl.plus(
      quantity.times(price.minus(averageCost))
    ),
  }
}

export const emptyPosition = (): Position => ({
  quantity: ZERO,
  costBasis: ZERO,
  realizedPnl: ZERO,
})

/** The position after every entry has been applied in date order. */
export function calculatePosition(entries: LedgerEntry[]): Position {
  return sortEntries(entries).reduce(applyEntry, emptyPosition())
}

/**
 * The first sale that tries to sell more than was held at that moment, if
 * any. Transactions can be backdated, edited and deleted, so a ledger has to
 * be checked as a whole: removing an old buy can invalidate a later sale.
 */
export function findOversell<T extends LedgerEntry>(
  entries: T[]
): T | undefined {
  let held = ZERO
  return sortEntries(entries).find((entry) => {
    const quantity = new Decimal(entry.quantity)
    held =
      entry.type === TransactionType.BUY
        ? held.plus(quantity)
        : held.minus(quantity)
    return held.isNegative()
  })
}

/** Units held at a moment in time. */
export function balanceAt(entries: LedgerEntry[], moment: Date): Decimal {
  return calculatePosition(
    entries.filter((entry) => entry.executedAt.getTime() <= moment.getTime())
  ).quantity
}
