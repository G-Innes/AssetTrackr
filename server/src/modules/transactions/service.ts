import { EntityManager } from 'typeorm'
import { dataSource } from '../../database/dataSource'
import { Asset, Transaction, TransactionType, User } from '../../entities'
import { Decimal, formatDecimal } from '../../utils/decimal'
import { badRequest, notFound } from '../../utils/errors'
import { MarketAsset } from '../market/provider'
import { findAsset, getPrice } from '../market/service'
import { balanceAt, findOversell } from '../portfolio/ledger'
import {
  CreateTransactionInput,
  ListTransactionsInput,
  UpdateTransactionInput,
} from './schemas'

export interface TransactionView {
  id: number
  type: TransactionType
  quantity: string
  price: string
  executedAt: Date
  note: string | null
  asset: { id: number; ticker: string; name: string }
}

function toView(transaction: Transaction, asset: Asset): TransactionView {
  return {
    id: transaction.id,
    type: transaction.type,
    quantity: formatDecimal(transaction.quantity),
    price: formatDecimal(transaction.price),
    executedAt: transaction.executedAt,
    note: transaction.note,
    asset: { id: asset.id, ticker: asset.ticker, name: asset.name },
  }
}

const formatDay = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

/**
 * Serialises a user's writes. Without the lock two simultaneous sells could
 * both pass the balance check and oversell the holding.
 */
async function lockUser(manager: EntityManager, userId: number) {
  await manager.findOne(User, {
    where: { id: userId },
    lock: { mode: 'pessimistic_write' },
  })
}

/** The user's full history for one asset - what every balance check runs on. */
function loadLedger(manager: EntityManager, userId: number, assetId: number) {
  return manager.find(Transaction, { where: { userId, assetId } })
}

/**
 * Finds the asset row for a ticker, creating it the first time it is traded.
 * New assets must exist in the market catalogue, which also supplies their
 * name - so a client can neither invent assets nor rename them.
 */
async function findOrCreateAsset(
  manager: EntityManager,
  ticker: string,
  listing: MarketAsset | undefined
): Promise<Asset> {
  const existing = await manager.findOneBy(Asset, { ticker })
  if (existing) return existing
  if (!listing) {
    throw badRequest(`Unknown asset "${ticker}". Choose one from the list.`)
  }

  // ON CONFLICT makes this safe when two users trade a new ticker at once.
  await manager
    .createQueryBuilder()
    .insert()
    .into(Asset)
    .values({ ticker, name: listing.name })
    .orIgnore()
    .execute()
  return manager.findOneByOrFail(Asset, { ticker })
}

export async function createTransaction(
  userId: number,
  input: CreateTransactionInput
): Promise<TransactionView> {
  const executedAt = input.executedAt ?? new Date()
  const isBackdated = Date.now() - executedAt.getTime() > 60 * 1000
  const when = isBackdated ? ` on ${formatDay(executedAt)}` : ''

  // Talk to the market before opening the database transaction, so a slow
  // price source never holds a row lock.
  const listing = await findAsset(input.ticker).catch(() => undefined)
  let { price } = input
  if (price === undefined) {
    const marketPrice = await getPrice(
      input.ticker,
      executedAt.toISOString().slice(0, 10)
    )
    if (marketPrice === undefined) {
      throw badRequest(
        `No market price found for ${input.ticker}${when}. Enter the price yourself.`
      )
    }
    price = new Decimal(marketPrice).toFixed()
  }

  // Either the trade is recorded in full or nothing changes.
  return dataSource.transaction(async (manager) => {
    await lockUser(manager, userId)
    const asset = await findOrCreateAsset(manager, input.ticker, listing)
    const ledger = await loadLedger(manager, userId, asset.id)

    if (input.type === TransactionType.SELL) {
      const held = balanceAt(ledger, executedAt)
      if (held.isZero()) {
        throw badRequest(
          isBackdated
            ? `You did not own any ${asset.ticker}${when}`
            : `You do not own any ${asset.ticker}`
        )
      }
      if (held.lt(input.quantity)) {
        throw badRequest(
          isBackdated
            ? `Insufficient balance: you owned ${held.toFixed()} ${asset.ticker}${when}`
            : `Insufficient balance: you own ${held.toFixed()} ${asset.ticker}`
        )
      }
    }

    const transaction = manager.create(Transaction, {
      userId,
      assetId: asset.id,
      type: input.type,
      quantity: input.quantity,
      price,
      executedAt,
      note: input.note ?? null,
    })

    // A backdated sale can be covered on its own date yet leave a sale
    // made since then short.
    const short = findOversell([
      ...ledger,
      { ...transaction, id: Number.MAX_SAFE_INTEGER },
    ])
    if (short) {
      throw badRequest(
        `That would leave your sale on ${formatDay(short.executedAt)} without enough ${asset.ticker}`
      )
    }

    return toView(await manager.save(transaction), asset)
  })
}

export async function updateTransaction(
  userId: number,
  transactionId: number,
  changes: UpdateTransactionInput
): Promise<TransactionView> {
  return dataSource.transaction(async (manager) => {
    await lockUser(manager, userId)

    // Looking up by id AND owner means another user's id is simply "not found".
    const transaction = await manager.findOne(Transaction, {
      where: { id: transactionId, userId },
      relations: { asset: true },
    })
    if (!transaction) throw notFound('Transaction not found')
    const asset = transaction.asset!

    Object.entries(changes).forEach(([field, value]) => {
      if (value !== undefined) Object.assign(transaction, { [field]: value })
    })

    const others = (await loadLedger(manager, userId, asset.id)).filter(
      (entry) => entry.id !== transaction.id
    )
    const short = findOversell([...others, transaction])
    if (short) {
      throw badRequest(
        `That change would take your ${asset.ticker} balance below zero on ${formatDay(short.executedAt)}`
      )
    }

    return toView(await manager.save(transaction), asset)
  })
}

export async function deleteTransaction(
  userId: number,
  transactionId: number
): Promise<void> {
  await dataSource.transaction(async (manager) => {
    await lockUser(manager, userId)

    const transaction = await manager.findOne(Transaction, {
      where: { id: transactionId, userId },
      relations: { asset: true },
    })
    if (!transaction) throw notFound('Transaction not found')

    const others = (
      await loadLedger(manager, userId, transaction.assetId)
    ).filter((entry) => entry.id !== transaction.id)
    const short = findOversell(others)
    if (short) {
      throw badRequest(
        `Deleting this would leave your sale on ${formatDay(short.executedAt)} without enough ${transaction.asset!.ticker}. Delete that sale first.`
      )
    }

    await manager.remove(transaction)
  })
}

export async function listTransactions(
  userId: number,
  filters: ListTransactionsInput = {}
): Promise<TransactionView[]> {
  const transactions = await dataSource.getRepository(Transaction).find({
    where: { userId, type: filters.type, assetId: filters.assetId },
    relations: { asset: true },
    order: { executedAt: 'DESC', id: 'DESC' },
  })
  return transactions.map((transaction) =>
    toView(transaction, transaction.asset!)
  )
}
