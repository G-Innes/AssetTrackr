import { dataSource } from '../../database/dataSource'
import { Asset, Transaction } from '../../entities'
import { Decimal } from '../../utils/decimal'
import { notFound } from '../../utils/errors'
import {
  getDailyCloses,
  getQuotesIfAvailable,
  isDollarPegged,
} from '../market/service'
import {
  Position,
  applyEntry,
  calculatePosition,
  emptyPosition,
  sortEntries,
} from './ledger'

const DAY_MS = 24 * 60 * 60 * 1000
const toDay = (date: Date) => date.toISOString().slice(0, 10)

interface AssetLedger {
  asset: Asset
  entries: Transaction[]
}

/** A user's transactions grouped by asset, each group oldest first. */
async function loadLedgers(userId: number): Promise<AssetLedger[]> {
  const transactions = await dataSource.getRepository(Transaction).find({
    where: { userId },
    relations: { asset: true },
  })

  const byAsset = new Map<number, AssetLedger>()
  transactions.forEach((transaction) => {
    const ledger = byAsset.get(transaction.assetId) ?? {
      asset: transaction.asset!,
      entries: [],
    }
    ledger.entries.push(transaction)
    byAsset.set(transaction.assetId, ledger)
  })

  return [...byAsset.values()].map((ledger) => ({
    asset: ledger.asset,
    entries: sortEntries(ledger.entries),
  }))
}

export interface HoldingView {
  asset: { id: number; ticker: string; name: string }
  /** Exact decimal string, safe to send back as a "sell everything" amount */
  quantity: string
  averageCost: number
  costBasis: number
  realizedPnl: number
  // The fields below depend on a live price and are null without one.
  price: number | null
  change24h: number | null
  value: number | null
  unrealizedPnl: number | null
  unrealizedPnlPercent: number | null
  /** Share of the portfolio's total value, 0-100 */
  allocation: number | null
}

export interface PortfolioSummary {
  holdings: HoldingView[]
  totals: {
    value: number
    costBasis: number
    unrealizedPnl: number
    unrealizedPnlPercent: number | null
    /** Includes profit from positions that have since been sold completely */
    realizedPnl: number
    change24h: number
    change24hPercent: number | null
  }
  /** Tickers held that could not be priced; they are left out of `value` */
  unpriced: string[]
  pricedAt: Date
}

const percent = (part: Decimal, whole: Decimal): number | null =>
  whole.isZero() ? null : part.div(whole).times(100).toNumber()

/** Current holdings with cost basis and, where prices exist, market value. */
export async function getPortfolio(userId: number): Promise<PortfolioSummary> {
  const [ledgers, quotes] = await Promise.all([
    loadLedgers(userId),
    getQuotesIfAvailable(),
  ])

  let totalValue = new Decimal(0)
  let totalCost = new Decimal(0)
  let pricedCost = new Decimal(0)
  let totalRealized = new Decimal(0)
  let valueYesterday = new Decimal(0)
  const unpriced: string[] = []

  const open = ledgers.flatMap(({ asset, entries }) => {
    const position = calculatePosition(entries)
    totalRealized = totalRealized.plus(position.realizedPnl)
    if (!position.quantity.gt(0)) return []

    const quote = quotes.get(asset.ticker)
    const value = quote ? position.quantity.times(quote.price) : null
    totalCost = totalCost.plus(position.costBasis)
    if (quote && value) {
      totalValue = totalValue.plus(value)
      pricedCost = pricedCost.plus(position.costBasis)
      valueYesterday = valueYesterday.plus(
        value.div(new Decimal(1).plus(new Decimal(quote.change24h).div(100)))
      )
    } else {
      unpriced.push(asset.ticker)
    }
    return [{ asset, position, quote, value }]
  })

  const holdings = open
    .map(({ asset, position, quote, value }): HoldingView => {
      const unrealized = value ? value.minus(position.costBasis) : null
      return {
        asset: { id: asset.id, ticker: asset.ticker, name: asset.name },
        quantity: position.quantity.toFixed(),
        averageCost: position.costBasis.div(position.quantity).toNumber(),
        costBasis: position.costBasis.toNumber(),
        realizedPnl: position.realizedPnl.toNumber(),
        price: quote?.price ?? null,
        change24h: quote?.change24h ?? null,
        value: value?.toNumber() ?? null,
        unrealizedPnl: unrealized?.toNumber() ?? null,
        unrealizedPnlPercent: unrealized
          ? percent(unrealized, position.costBasis)
          : null,
        allocation: value ? percent(value, totalValue) : null,
      }
    })
    // Largest position first; unpriced ones last
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))

  // Profit is only meaningful for the holdings that could be priced.
  const unrealized = totalValue.minus(pricedCost)
  const change = totalValue.minus(valueYesterday)

  return {
    holdings,
    totals: {
      value: totalValue.toNumber(),
      costBasis: totalCost.toNumber(),
      unrealizedPnl: unrealized.toNumber(),
      unrealizedPnlPercent: percent(unrealized, pricedCost),
      realizedPnl: totalRealized.toNumber(),
      change24h: change.toNumber(),
      change24hPercent: percent(change, valueYesterday),
    },
    unpriced,
    pricedAt: new Date(),
  }
}

export const HISTORY_RANGES = { '30d': 30, '90d': 90, '1y': 365 } as const
export type HistoryRange = keyof typeof HISTORY_RANGES

export interface HistoryPoint {
  /** UTC day, "2026-03-05" */
  date: string
  /** Market value of everything held at the end of that day */
  value: number
  /** What those holdings had cost - the gap to `value` is unrealised profit */
  costBasis: number
}

/**
 * Daily portfolio value over a period, rebuilt from the ledger: for each day,
 * the units held at the end of it multiplied by that day's closing price.
 */
export async function getPortfolioHistory(
  userId: number,
  range: HistoryRange
): Promise<HistoryPoint[]> {
  const ledgers = await loadLedgers(userId)
  if (!ledgers.length) return []

  const today = toDay(new Date())
  const todayStart = Date.parse(`${today}T00:00:00Z`)
  const rangeStart = todayStart - (HISTORY_RANGES[range] - 1) * DAY_MS
  // Start the chart the day before the first trade rather than drawing months
  // of an empty portfolio.
  const firstTrade = Math.min(
    ...ledgers.map(({ entries }) => entries[0].executedAt.getTime())
  )
  const firstTradeDay = Date.parse(`${toDay(new Date(firstTrade))}T00:00:00Z`)
  const start = Math.min(
    Math.max(rangeStart, firstTradeDay - DAY_MS),
    todayStart
  )

  const quotes = await getQuotesIfAvailable()
  const closes = await Promise.all(
    ledgers.map(({ asset }) =>
      // One asset without history should not blank the whole chart.
      getDailyCloses(asset.ticker, new Date(start)).catch(
        () => new Map<string, number>()
      )
    )
  )

  // Walk each asset's ledger forward one day at a time.
  const cursors = ledgers.map(({ asset, entries }, index) => ({
    ticker: asset.ticker,
    entries,
    closes: closes[index],
    next: 0,
    position: emptyPosition() as Position,
    lastPrice: undefined as number | undefined,
  }))

  const points: HistoryPoint[] = []
  for (let day = start; day <= todayStart; day += DAY_MS) {
    const date = toDay(new Date(day))
    const endOfDay = day + DAY_MS
    let value = new Decimal(0)
    let costBasis = new Decimal(0)

    cursors.forEach((cursor) => {
      const state = cursor
      while (
        state.next < state.entries.length &&
        state.entries[state.next].executedAt.getTime() < endOfDay
      ) {
        state.position = applyEntry(state.position, state.entries[state.next])
        state.next += 1
      }

      // Today's candle is still forming, so prefer the live quote for it.
      // Otherwise use the day's close, carrying the last one over any gap.
      const live = date === today ? quotes.get(state.ticker)?.price : undefined
      const price = live ?? state.closes.get(date) ?? state.lastPrice
      if (price !== undefined) state.lastPrice = price

      if (state.position.quantity.isZero()) return
      costBasis = costBasis.plus(state.position.costBasis)
      // Dollar-pegged assets have no candles; they are worth their quantity.
      const unitPrice = price ?? (isDollarPegged(state.ticker) ? 1 : undefined)
      if (unitPrice !== undefined) {
        value = value.plus(state.position.quantity.times(unitPrice))
      }
    })

    points.push({
      date,
      value: value.toDecimalPlaces(2).toNumber(),
      costBasis: costBasis.toDecimalPlaces(2).toNumber(),
    })
  }
  return points
}

/**
 * Removes an asset from the portfolio altogether by deleting its
 * transactions. (Selling is a transaction; this is "I never meant to add it".)
 */
export async function removeAsset(userId: number, assetId: number) {
  const result = await dataSource
    .getRepository(Transaction)
    .delete({ userId, assetId })
  if (!result.affected)
    throw notFound('You have no transactions for this asset')
}
