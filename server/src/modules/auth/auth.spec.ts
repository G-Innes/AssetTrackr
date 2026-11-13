import request from 'supertest'
import createApp from '../../app'
import { dataSource } from '../../database/dataSource'
import { app, as, createUser } from '../../../tests/helpers'
import { fakeMarket } from '../../../tests/fakeMarket'
import { findOversell } from '../portfolio/ledger'
import { DEMO_TRADES } from './demo'

const validSignup = {
  username: 'satoshi',
  email: 'Satoshi@Example.com',
  password: 'Password123',
}

describe('POST /api/auth/signup', () => {
  it('creates an account and returns the user with a token', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup)

    expect(res.status).toBe(201)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toEqual({
      id: expect.any(Number),
      username: 'satoshi',
      email: 'satoshi@example.com',
      isDemo: false,
      createdAt: expect.any(String),
    })
  })

  it('stores a hash, never the password itself', async () => {
    await request(app).post('/api/auth/signup').send(validSignup)

    const [row] = await dataSource.query('SELECT password FROM "user"')
    expect(row.password).not.toContain(validSignup.password)
    expect(row.password).toMatch(/^\$2[aby]\$/)
  })

  it.each([
    [{ email: 'not-an-email' }, 'Invalid email format'],
    [{ password: 'short' }, 'Password must be at least 8 characters'],
    [{ username: 'ab' }, 'Username must be at least 3 characters'],
    [{ username: 'has spaces' }, expect.stringContaining('can only contain')],
    [{ username: undefined }, 'Username is required'],
  ])('rejects invalid input %j', async (override, message) => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validSignup, ...override })

    expect(res.status).toBe(400)
    expect(res.body.message).toEqual(message)
  })

  it('rejects a username that differs only by letter case', async () => {
    await createUser({ username: 'Satoshi' })

    const res = await request(app).post('/api/auth/signup').send(validSignup)

    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Username already in use')
  })

  it('rejects an email that is already registered', async () => {
    await createUser({ email: 'satoshi@example.com' })

    const res = await request(app).post('/api/auth/signup').send(validSignup)

    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Email already in use')
  })
})

describe('POST /api/auth/login', () => {
  it.each([
    'satoshi',
    'SATOSHI',
    'satoshi@example.com',
    ' Satoshi@Example.com ',
  ])('logs in with "%s"', async (usernameOrEmail) => {
    const { user } = await createUser(validSignup)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail, password: validSignup.password })

    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(user.id)
    expect(res.body.token).toEqual(expect.any(String))
    expect(JSON.stringify(res.body)).not.toContain('password')
  })

  it('gives the same answer for a wrong password and an unknown account', async () => {
    await createUser(validSignup)

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'satoshi', password: 'WrongPassword1' })
    const unknownUser = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'nobody', password: 'Password123' })

    expect(wrongPassword.status).toBe(401)
    expect(unknownUser.status).toBe(401)
    expect(wrongPassword.body).toEqual(unknownUser.body)
  })

  it('requires both fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'satoshi' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Password is required')
  })

  it('blocks repeated attempts from one client', async () => {
    const limitedApp = createApp({ authAttemptLimit: 3 })
    const attempt = () =>
      request(limitedApp)
        .post('/api/auth/login')
        .send({ usernameOrEmail: 'satoshi', password: 'guess-guess' })

    await attempt()
    await attempt()
    await attempt()
    const blocked = await attempt()

    expect(blocked.status).toBe(429)
    expect(blocked.body.message).toContain('Too many attempts')
  })
})

describe('POST /api/auth/demo', () => {
  it('creates a signed-in account that already has a portfolio', async () => {
    const res = await request(app).post('/api/auth/demo')

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ isDemo: true })
    expect(res.body.user.username).toMatch(/^demo-[0-9a-f]{8}$/)

    const client = as(res.body.token)
    const portfolio = (await client.get('/api/portfolio')).body
    const transactions = (await client.get('/api/transactions')).body
    expect(transactions).toHaveLength(DEMO_TRADES.length)
    expect(portfolio.holdings.map((h: any) => h.asset.ticker).sort()).toEqual([
      'BTC',
      'DOGE',
      'ETH',
      'LINK',
      'SOL',
    ])
    expect(portfolio.totals.value).toBeGreaterThan(0)
    // Bought at historical closes (half of today's fake prices)
    expect(portfolio.totals.unrealizedPnl).toBeGreaterThan(0)
  })

  it('gives every visitor their own account', async () => {
    const first = await request(app).post('/api/auth/demo')
    const second = await request(app).post('/api/auth/demo')

    await as(first.body.token).delete('/api/me')

    expect(first.body.user.id).not.toBe(second.body.user.id)
    expect((await as(second.body.token).get('/api/me')).status).toBe(200)
  })

  it('still works, with fallback prices, when the market is unreachable', async () => {
    fakeMarket.down = true

    const res = await request(app).post('/api/auth/demo')
    const transactions = await as(res.body.token).get('/api/transactions')

    expect(res.status).toBe(201)
    expect(transactions.body).toHaveLength(DEMO_TRADES.length)
  })

  it('deletes demo accounts older than a day, and only those', async () => {
    const old = await request(app).post('/api/auth/demo')
    const real = await createUser()
    await dataSource.query(
      `UPDATE "user" SET created_at = now() - interval '25 hours'`
    )

    await request(app).post('/api/auth/demo')

    expect((await as(old.body.token).get('/api/me')).status).toBe(401)
    expect((await as(real.token).get('/api/me')).status).toBe(200)
  })

  it('ships a sample history in which every sale is covered', () => {
    const tickers = [...new Set(DEMO_TRADES.map((trade) => trade.ticker))]

    tickers.forEach((ticker) => {
      const entries = DEMO_TRADES.filter(
        (trade) => trade.ticker === ticker
      ).map((trade, index) => ({
        id: index,
        type: trade.type as any,
        quantity: trade.quantity,
        price: '1',
        executedAt: new Date(Date.now() - trade.daysAgo * 86400000),
      }))
      expect(findOversell(entries)).toBeUndefined()
    })
  })
})

describe('request handling', () => {
  it('answers malformed JSON with a 400 instead of crashing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"usernameOrEmail": ')

    expect(res.status).toBe(400)
  })

  it('answers unknown routes with a 404', async () => {
    const res = await request(app).get('/api/nope')

    expect(res.status).toBe(404)
  })
})
