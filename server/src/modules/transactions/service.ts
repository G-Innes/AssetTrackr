import { EntityManager } from 'typeorm'
import { dataSource } from '../../database/dataSource'
import { Asset, Transaction, TransactionType, User } from '../../entities'
import { badRequest } from '../../utils/errors'
import { Decimal, formatDecimal } from '../../utils/decimal'
import { CreateTransactionInput, ListTransactionsInput } from './schemas'

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

/** Finds the asset for a ticker, creating it the first time it is traded. */
async function findOrCreateAsset(
  manager: EntityManager,
  ticker: string,
  name: string | undefined
): Promise<Asset> {
  // ON CONFLICT makes this safe when two users trade a new ticker at once.
  await manager
    .createQueryBuilder()
    .insert()
    .into(Asset)
    .values({ ticker, name: name ?? ticker })
    .orIgnore()
    .execute()
  return manager.findOneByOrFail(Asset, { ticker })
}

/** How much of an asset a user currently owns, according to the ledger. */
export async function getBalance(
  manager: EntityManager,
  userId: number,
  assetId: number
): Promise<Decimal> {
  const row = await manager
    .createQueryBuilder(Transaction, 't')
    .select(
      `COALESCE(SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END), 0)`,
      'balance'
    )
    .where('t.userId = :userId AND t.assetId = :assetId', { userId, assetId })
    .getRawOne<{ balance: string }>()
  return new Decimal(row?.balance ?? 0)
}

export async function createTransaction(
  userId: number,
  input: CreateTransactionInput
): Promise<TransactionView> {
  // Everything happens in one database transaction: either the trade is
  // recorded in full or nothing changes.
  return dataSource.transaction(async (manager) => {
    // Serialise this user's trades. Without the lock two simultaneous sells
    // could both pass the balance check and oversell the holding.
    await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    })

    const asset = await findOrCreateAsset(manager, input.ticker, input.name)

    if (input.type === TransactionType.SELL) {
      const balance = await getBalance(manager, userId, asset.id)
      if (balance.isZero()) {
        throw badRequest(`You do not own any ${asset.ticker}`)
      }
      if (balance.lt(input.quantity)) {
        throw badRequest(
          `Insufficient balance: you own ${balance.toFixed()} ${asset.ticker}`
        )
      }
    }

    const transaction = await manager.save(
      manager.create(Transaction, {
        userId,
        assetId: asset.id,
        type: input.type,
        quantity: input.quantity,
        price: input.price,
        executedAt: new Date(),
        note: null,
      })
    )
    return toView(transaction, asset)
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
