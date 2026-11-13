import request from 'supertest'
import createApp from '../src/app'
import { signup } from '../src/modules/auth/service'

export const app = createApp()

let counter = 0

/** Registers a fresh user and returns them with a valid token. */
export async function createUser(
  overrides: Partial<{ username: string; email: string; password: string }> = {}
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
    delete: (url: string) => request(app).delete(url).set(auth),
  }
}

export const buy = (
  token: string,
  ticker: string,
  quantity: number | string,
  price = 100
) =>
  as(token).post('/api/transactions', { ticker, type: 'buy', quantity, price })

export const sell = (
  token: string,
  ticker: string,
  quantity: number | string,
  price = 100
) =>
  as(token).post('/api/transactions', { ticker, type: 'sell', quantity, price })
