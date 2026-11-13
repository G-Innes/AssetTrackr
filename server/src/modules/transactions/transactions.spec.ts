import request from 'supertest'
import { app, as, buy, createUser, sell } from '../../../tests/helpers'

describe('POST /api/transactions', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ ticker: 'BTC', type: 'buy', quantity: 1, price: 100 })

    expect(res.status).toBe(401)
  })

  it('records a buy', async () => {
    const { token } = await createUser()

    const res = await as(token).post('/api/transactions', {
      ticker: 'btc',
      name: 'Bitcoin',
      type: 'buy',
      quantity: 1.5,
      price: 60000.55,
    })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.any(Number),
      type: 'buy',
      quantity: '1.5',
      price: '60000.55',
      executedAt: expect.any(String),
      note: null,
      asset: { id: expect.any(Number), ticker: 'BTC', name: 'Bitcoin' },
    })
  })

  it('keeps small crypto amounts exact', async () => {
    const { token } = await createUser()

    await buy(token, 'BTC', '0.00012345')
    await buy(token, 'BTC', '0.1')
    await buy(token, 'BTC', '0.2')
    const holdings = await as(token).get('/api/holdings')

    // 0.1 + 0.2 is 0.30000000000000004 in floating point
    expect(holdings.body[0].quantity).toBe('0.30012345')
  })

  it('records a sell and reduces the holding', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    const res = await sell(token, 'ETH', 4)
    const holdings = await as(token).get('/api/holdings')

    expect(res.status).toBe(201)
    expect(res.body.type).toBe('sell')
    expect(holdings.body[0].quantity).toBe('6')
  })

  it('lets a user sell their entire holding', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    const res = await sell(token, 'ETH', 10)
    const holdings = await as(token).get('/api/holdings')
    const transactions = await as(token).get('/api/transactions')

    expect(res.status).toBe(201)
    expect(holdings.body).toEqual([])
    expect(transactions.body).toHaveLength(2)
  })

  it('refuses to sell more than the user owns', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    const res = await sell(token, 'ETH', 10.000001)

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Insufficient balance: you own 10 ETH')
  })

  it('refuses to sell an asset the user does not own', async () => {
    const owner = await createUser()
    const { token } = await createUser()
    await buy(owner.token, 'ETH', 10)

    const res = await sell(token, 'ETH', 1)

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('You do not own any ETH')
  })

  it('cannot be oversold by simultaneous sells', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    // Eight sells of 2 against a balance of 10: exactly five may succeed.
    const results = await Promise.all(
      Array.from({ length: 8 }, () => sell(token, 'ETH', 2))
    )
    const holdings = await as(token).get('/api/holdings')

    const statuses = results.map((res) => res.status)
    expect(statuses.filter((status) => status === 201)).toHaveLength(5)
    expect(statuses.filter((status) => status === 400)).toHaveLength(3)
    expect(holdings.body).toEqual([])
  })

  it('keeps different tickers apart', async () => {
    const { token } = await createUser()

    await buy(token, 'SOL', 100)
    await buy(token, 'XRP', 5)
    const holdings = await as(token).get('/api/holdings')

    expect(holdings.body.map((h: any) => [h.asset.ticker, h.quantity])).toEqual(
      [
        ['SOL', '100'],
        ['XRP', '5'],
      ]
    )
  })

  it("ignores a userId in the body: nobody can trade on another user's behalf", async () => {
    const victim = await createUser()
    const attacker = await createUser()
    await buy(victim.token, 'BTC', 1)

    const res = await as(attacker.token).post('/api/transactions', {
      userId: victim.user.id,
      ticker: 'BTC',
      type: 'sell',
      quantity: 1,
      price: 1,
    })
    const victimHoldings = await as(victim.token).get('/api/holdings')

    expect(res.status).toBe(400) // the attacker owns no BTC
    expect(victimHoldings.body[0].quantity).toBe('1')
  })

  it.each([
    [{ quantity: 'not a number' }, 'Quantity must be a number'],
    [{ quantity: -5 }, 'Quantity must be greater than zero'],
    [{ quantity: 0 }, 'Quantity must be greater than zero'],
    [{ quantity: undefined }, 'Quantity is required and must be a number'],
    [{ quantity: 'Infinity' }, 'Quantity must be a number'],
    [
      { quantity: '0.0000000000000000001' },
      expect.stringContaining('decimal places'),
    ],
    [{ price: -1 }, 'Price cannot be negative'],
    [{ price: null }, 'Price is required and must be a number'],
    [{ type: 'short' }, 'Type must be "buy" or "sell"'],
    [{ ticker: '' }, expect.stringContaining('Ticker')],
    [{ ticker: 'BTC; DROP TABLE' }, expect.stringContaining('Ticker')],
  ])('rejects invalid input %j', async (override, message) => {
    const { token } = await createUser()

    const res = await as(token).post('/api/transactions', {
      ticker: 'BTC',
      type: 'buy',
      quantity: 1,
      price: 100,
      ...override,
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toEqual(message)
  })
})

describe('GET /api/transactions', () => {
  it("returns only the caller's transactions, newest first", async () => {
    const { token } = await createUser()
    const other = await createUser()
    await buy(token, 'BTC', 1)
    await buy(token, 'ETH', 2)
    await buy(other.token, 'BTC', 99)

    const res = await as(token).get('/api/transactions')

    expect(res.status).toBe(200)
    expect(res.body.map((t: any) => [t.asset.ticker, t.quantity])).toEqual([
      ['ETH', '2'],
      ['BTC', '1'],
    ])
  })

  it('returns an empty list for a new user', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/transactions')

    expect(res.body).toEqual([])
  })

  it('filters by type', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 2)
    await sell(token, 'BTC', 1)

    const sells = await as(token).get('/api/transactions?type=sell')

    expect(sells.body).toHaveLength(1)
    expect(sells.body[0].type).toBe('sell')
  })

  it('filters by asset', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 2)
    const eth = await buy(token, 'ETH', 3)

    const res = await as(token).get(
      `/api/transactions?assetId=${eth.body.asset.id}`
    )

    expect(res.body.map((t: any) => t.asset.ticker)).toEqual(['ETH'])
  })

  it('rejects an unknown type', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/transactions?type=gift')

    expect(res.status).toBe(400)
  })
})
