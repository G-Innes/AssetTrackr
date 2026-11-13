import { TransactionType } from '../../entities'
import {
  LedgerEntry,
  balanceAt,
  calculatePosition,
  findOversell,
} from './ledger'

let nextId = 1
function entry(
  type: 'buy' | 'sell',
  quantity: string,
  price: string,
  day: string
): LedgerEntry {
  nextId += 1
  return {
    id: nextId,
    type: type as TransactionType,
    quantity,
    price,
    executedAt: new Date(`${day}T12:00:00Z`),
  }
}

const summary = (entries: LedgerEntry[]) => {
  const position = calculatePosition(entries)
  return {
    quantity: position.quantity.toFixed(),
    costBasis: position.costBasis.toFixed(),
    realizedPnl: position.realizedPnl.toFixed(),
  }
}

describe('calculatePosition', () => {
  it('is empty for no transactions', () => {
    expect(summary([])).toEqual({
      quantity: '0',
      costBasis: '0',
      realizedPnl: '0',
    })
  })

  it('adds up buys at their own prices', () => {
    const entries = [
      entry('buy', '1', '100', '2026-01-01'),
      entry('buy', '3', '200', '2026-01-02'),
    ]

    // 1 x 100 + 3 x 200
    expect(summary(entries)).toEqual({
      quantity: '4',
      costBasis: '700',
      realizedPnl: '0',
    })
  })

  it('realises profit against the average cost when selling', () => {
    const entries = [
      entry('buy', '1', '100', '2026-01-01'),
      entry('buy', '3', '200', '2026-01-02'),
      // average cost is 700 / 4 = 175; selling 2 at 250 makes 2 x 75
      entry('sell', '2', '250', '2026-01-03'),
    ]

    expect(summary(entries)).toEqual({
      quantity: '2',
      costBasis: '350',
      realizedPnl: '150',
    })
  })

  it('realises a loss when selling below cost', () => {
    const entries = [
      entry('buy', '2', '100', '2026-01-01'),
      entry('sell', '1', '60', '2026-01-02'),
    ]

    expect(summary(entries)).toMatchObject({
      costBasis: '100',
      realizedPnl: '-40',
    })
  })

  it('leaves no cost behind when everything is sold', () => {
    const entries = [
      entry('buy', '0.1', '3', '2026-01-01'),
      entry('buy', '0.2', '7', '2026-01-02'),
      entry('sell', '0.3', '10', '2026-01-03'),
    ]

    expect(summary(entries)).toMatchObject({ quantity: '0', costBasis: '0' })
  })

  it('starts a fresh cost basis after selling out and buying back', () => {
    const entries = [
      entry('buy', '1', '100', '2026-01-01'),
      entry('sell', '1', '150', '2026-01-02'),
      entry('buy', '1', '300', '2026-01-03'),
    ]

    expect(summary(entries)).toEqual({
      quantity: '1',
      costBasis: '300',
      realizedPnl: '50',
    })
  })

  it('orders by date, not by the order transactions were entered', () => {
    const sellEnteredFirst = [
      entry('sell', '1', '150', '2026-01-02'),
      entry('buy', '1', '100', '2026-01-01'),
    ]

    expect(summary(sellEnteredFirst)).toMatchObject({
      quantity: '0',
      realizedPnl: '50',
    })
  })
})

describe('findOversell', () => {
  it('accepts a ledger that never goes negative', () => {
    const entries = [
      entry('buy', '1', '100', '2026-01-01'),
      entry('sell', '1', '100', '2026-01-02'),
    ]

    expect(findOversell(entries)).toBeUndefined()
  })

  it('finds a sale dated before the units were bought', () => {
    const early = entry('sell', '1', '100', '2026-01-01')
    const entries = [entry('buy', '1', '100', '2026-01-02'), early]

    expect(findOversell(entries)).toBe(early)
  })

  it('finds the later sale that a missing buy leaves short', () => {
    const second = entry('sell', '1', '100', '2026-01-04')
    const entries = [
      entry('buy', '1', '100', '2026-01-01'),
      entry('sell', '1', '100', '2026-01-02'),
      second,
    ]

    expect(findOversell(entries)).toBe(second)
  })
})

describe('balanceAt', () => {
  it('only counts transactions up to that moment', () => {
    const entries = [
      entry('buy', '5', '100', '2026-01-01'),
      entry('sell', '2', '100', '2026-01-10'),
    ]

    expect(balanceAt(entries, new Date('2026-01-05T00:00:00Z')).toFixed()).toBe(
      '5'
    )
    expect(balanceAt(entries, new Date('2026-01-11T00:00:00Z')).toFixed()).toBe(
      '3'
    )
  })
})
