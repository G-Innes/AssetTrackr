import { randomBytes } from 'node:crypto'
import bcrypt from 'bcrypt'
import { LessThan } from 'typeorm'
import config from '../../config'
import { dataSource } from '../../database/dataSource'
import { Asset, Transaction, TransactionType, User } from '../../entities'
import { signToken } from '../../middleware/auth'
import { Decimal } from '../../utils/decimal'
import logger from '../../utils/logger'
import { getDailyCloses, getQuotesIfAvailable } from '../market/service'
import { toPublicUser } from '../users/service'
import type { AuthResult } from './service'

const DAY_MS = 24 * 60 * 60 * 1000
const DEMO_LIFETIME_MS = DAY_MS

interface DemoTrade {
  daysAgo: number
  ticker: string
  name: string
  type: 'buy' | 'sell'
  quantity: string
  /** Used only if the market has no price for that day */
  fallbackPrice: number
  note?: string
}

/**
 * A believable ten months of activity: a few positions built up over time,
 * some profit taken, one position sold at a loss. Every sale is covered by
 * earlier buys (a test checks this).
 */
export const DEMO_TRADES: DemoTrade[] = [
  {
    daysAgo: 290,
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'buy',
    quantity: '0.15',
    fallbackPrice: 62000,
    note: 'First buy',
  },
  {
    daysAgo: 268,
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'buy',
    quantity: '2.5',
    fallbackPrice: 2400,
  },
  {
    daysAgo: 241,
    ticker: 'SOL',
    name: 'Solana',
    type: 'buy',
    quantity: '40',
    fallbackPrice: 110,
  },
  {
    daysAgo: 203,
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'buy',
    quantity: '0.1',
    fallbackPrice: 66000,
    note: 'Monthly buy',
  },
  {
    daysAgo: 177,
    ticker: 'LINK',
    name: 'Chainlink',
    type: 'buy',
    quantity: '150',
    fallbackPrice: 13,
  },
  {
    daysAgo: 149,
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'sell',
    quantity: '1',
    fallbackPrice: 2700,
    note: 'Took some profit',
  },
  {
    daysAgo: 121,
    ticker: 'DOGE',
    name: 'Dogecoin',
    type: 'buy',
    quantity: '8000',
    fallbackPrice: 0.11,
  },
  {
    daysAgo: 92,
    ticker: 'SOL',
    name: 'Solana',
    type: 'sell',
    quantity: '15',
    fallbackPrice: 125,
  },
  {
    daysAgo: 61,
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'buy',
    quantity: '0.05',
    fallbackPrice: 70000,
  },
  {
    daysAgo: 44,
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'buy',
    quantity: '1.2',
    fallbackPrice: 2100,
    note: 'Bought the dip',
  },
  {
    daysAgo: 29,
    ticker: 'LINK',
    name: 'Chainlink',
    type: 'sell',
    quantity: '50',
    fallbackPrice: 11,
  },
  {
    daysAgo: 13,
    ticker: 'SOL',
    name: 'Solana',
    type: 'buy',
    quantity: '10',
    fallbackPrice: 85,
  },
  {
    daysAgo: 4,
    ticker: 'DOGE',
    name: 'Dogecoin',
    type: 'sell',
    quantity: '3000',
    fallbackPrice: 0.07,
    note: 'Trimmed',
  },
]

/** Removes demo accounts older than a day (their transactions cascade). */
async function purgeExpiredDemos() {
  await dataSource.getRepository(User).delete({
    isDemo: true,
    createdAt: LessThan(new Date(Date.now() - DEMO_LIFETIME_MS)),
  })
}

/**
 * Creates a brand-new account pre-filled with sample trades and signs the
 * visitor in. Each visitor gets their own, so nobody sees anyone else's
 * changes, and each is deleted after a day.
 */
export async function startDemo(): Promise<AuthResult> {
  await purgeExpiredDemos().catch((error) =>
    logger.warn({ err: error }, 'Could not purge expired demo accounts')
  )

  const now = Date.now()
  const oldest = Math.max(...DEMO_TRADES.map((trade) => trade.daysAgo))
  const from = new Date(now - oldest * DAY_MS)
  const tickers = [...new Set(DEMO_TRADES.map((trade) => trade.ticker))]

  // Price the trades at what the market really did, so the demo's profit and
  // loss look like a real portfolio's. Any failure falls back to fixed prices.
  const quotes = await getQuotesIfAvailable()
  const closes = new Map(
    await Promise.all(
      tickers.map(
        async (ticker) =>
          [
            ticker,
            await getDailyCloses(ticker, from).catch(
              () => new Map<string, number>()
            ),
          ] as const
      )
    )
  )

  const suffix = randomBytes(4).toString('hex')
  // Nobody knows this password: a demo account is entered by token only.
  const passwordHash = await bcrypt.hash(
    randomBytes(32).toString('hex'),
    config.auth.passwordCost
  )

  const user = await dataSource.transaction(async (manager) => {
    const created = await manager.save(
      manager.create(User, {
        username: `demo-${suffix}`,
        email: `demo-${suffix}@example.com`,
        passwordHash,
        isDemo: true,
      })
    )

    await manager
      .createQueryBuilder()
      .insert()
      .into(Asset)
      .values(
        tickers.map((ticker) => ({
          ticker,
          name: DEMO_TRADES.find((trade) => trade.ticker === ticker)!.name,
        }))
      )
      .orIgnore()
      .execute()
    const assets = await manager.find(Asset)
    const assetId = (ticker: string) =>
      assets.find((asset) => asset.ticker === ticker)!.id

    await manager.insert(
      Transaction,
      DEMO_TRADES.map((trade) => {
        const executedAt = new Date(now - trade.daysAgo * DAY_MS)
        const day = executedAt.toISOString().slice(0, 10)
        const price =
          closes.get(trade.ticker)?.get(day) ??
          quotes.get(trade.ticker)?.price ??
          trade.fallbackPrice
        return {
          userId: created.id,
          assetId: assetId(trade.ticker),
          type: trade.type as TransactionType,
          quantity: trade.quantity,
          price: new Decimal(price).toFixed(),
          executedAt,
          note: trade.note ?? null,
        }
      })
    )
    return created
  })

  return { user: toPublicUser(user), token: signToken(user.id) }
}
