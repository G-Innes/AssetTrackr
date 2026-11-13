import request from 'supertest'
import createApp from '../src/app'
import { signup } from '../src/modules/auth/service'

export const app = createApp()

let counter = 0

/** Registers a fresh user and returns them with a valid token. */
export async function createUser(
  overrides: Partial<{
    username: string
    email: string
    password: string
  }> = {}
) {
  counter += 1
  const credentials = {
    username: `user${counter}`,
    email: `user${counter}@example.com`,
    password: 'Password123',
    ...overrides,
  }
  const { user, token } = await signup(credentials)
  return { user, token, password: credentials.password }
}

/** A supertest client that sends the given user's token with every request. */
export function as(token: string) {
  const auth = { Authorization: `Bearer ${token}` }
  return {
    get: (url: string) => request(app).get(url).set(auth),
    post: (url: string, body?: object) =>
      request(app).post(url).set(auth).send(body),
    patch: (url: string, body?: object) =>
      request(app).patch(url).set(auth).send(body),
    put: (url: string, body?: object) =>
      request(app).put(url).set(auth).send(body),
    delete: (url: string) => request(app).delete(url).set(auth),
  }
}

type TradeOptions = {
  price?: number | string
  executedAt?: string
  note?: string
}

const trade =
  (type: 'buy' | 'sell') =>
  (
    token: string,
    ticker: string,
    quantity: number | string,
    options: TradeOptions = {}
  ) =>
    as(token).post('/api/transactions', {
      ticker,
      type,
      quantity,
      price: 100,
      ...options,
    })

export const buy = trade('buy')
export const sell = trade('sell')

/** An ISO timestamp at noon UTC, `days` days before today. */
export function daysAgo(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return `${date.toISOString().slice(0, 10)}T12:00:00.000Z`
}

/** Sorted "TICKER quantity" pairs of what a user currently holds. */
export async function holdingsOf(token: string): Promise<string[]> {
  const res = await as(token).get('/api/portfolio')
  return res.body.holdings
    .map((h: any) => `${h.asset.ticker} ${h.quantity}`)
    .sort()
}
