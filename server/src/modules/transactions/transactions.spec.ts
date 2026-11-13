import request from 'supertest'
import {
  app,
  as,
  buy,
  createUser,
  daysAgo,
  holdingsOf,
  sell,
} from '../../../tests/helpers'
import { fakeMarket } from '../../../tests/fakeMarket'

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
      type: 'buy',
      quantity: 1.5,
      price: 60000.55,
      note: '  First buy ',
    })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.any(Number),
      type: 'buy',
      quantity: '1.5',
      price: '60000.55',
      executedAt: expect.any(String),
      note: 'First buy',
      asset: { id: expect.any(Number), ticker: 'BTC', name: 'Bitcoin' },
    })
  })

  it('keeps small crypto amounts exact', async () => {
    const { token } = await createUser()

    await buy(token, 'BTC', '0.00012345')
    await buy(token, 'BTC', '0.1')
    await buy(token, 'BTC', '0.2')

    // 0.1 + 0.2 is 0.30000000000000004 in floating point
    expect(await holdingsOf(token)).toEqual(['BTC 0.30012345'])
  })

  it('records a sell and reduces the holding', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    const res = await sell(token, 'ETH', 4)

    expect(res.status).toBe(201)
    expect(res.body.type).toBe('sell')
    expect(await holdingsOf(token)).toEqual(['ETH 6'])
  })

  it('lets a user sell their entire holding', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10)

    const res = await sell(token, 'ETH', 10)
    const transactions = await as(token).get('/api/transactions')

    expect(res.status).toBe(201)
    expect(await holdingsOf(token)).toEqual([])
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

    const statuses = results.map((res) => res.status)
    expect(statuses.filter((status) => status === 201)).toHaveLength(5)
    expect(statuses.filter((status) => status === 400)).toHaveLength(3)
    expect(await holdingsOf(token)).toEqual([])
  })

  it('keeps different tickers apart', async () => {
    const { token } = await createUser()

    await buy(token, 'SOL', 100)
    await buy(token, 'XRP', 5)

    expect(await holdingsOf(token)).toEqual(['SOL 100', 'XRP 5'])
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

    expect(res.status).toBe(400) // the attacker owns no BTC
    expect(await holdingsOf(victim.token)).toEqual(['BTC 1'])
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
    [{ type: 'short' }, 'Type must be "buy" or "sell"'],
    [{ ticker: '' }, expect.stringContaining('Ticker')],
    [{ ticker: 'BTC; DROP TABLE' }, expect.stringContaining('Ticker')],
    [{ executedAt: 'yesterday-ish' }, 'Date is not valid'],
    [{ executedAt: '2999-01-01T00:00:00Z' }, 'Date cannot be in the future'],
    [{ executedAt: '1999-01-01T00:00:00Z' }, 'Date is too far in the past'],
    [{ note: 'x'.repeat(201) }, 'Note must be at most 200 characters'],
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

  describe('assets', () => {
    it('only accepts assets the market lists, and names them itself', async () => {
      const { token } = await createUser()

      const unknown = await buy(token, 'NOPE', 1)
      const known = await as(token).post('/api/transactions', {
        ticker: 'ETH',
        name: 'Totally Not Ethereum',
        type: 'buy',
        quantity: 1,
        price: 1,
      })

      expect(unknown.status).toBe(400)
      expect(unknown.body.message).toContain('Unknown asset "NOPE"')
      expect(known.body.asset.name).toBe('Ethereum')
    })

    it('still accepts an asset already held when the market is unreachable', async () => {
      const { token } = await createUser()
      await buy(token, 'BTC', 1)
      fakeMarket.down = true

      const res = await buy(token, 'BTC', 1, { price: 50000 })

      expect(res.status).toBe(201)
    })
  })

  describe('price', () => {
    it("uses the live price when none is given for today's trade", async () => {
      const { token } = await createUser()

      const res = await as(token).post('/api/transactions', {
        ticker: 'BTC',
        type: 'buy',
        quantity: 1,
      })

      expect(res.body.price).toBe('60000')
    })

    it("uses that day's closing price for a backdated trade", async () => {
      const { token } = await createUser()

      const res = await as(token).post('/api/transactions', {
        ticker: 'BTC',
        type: 'buy',
        quantity: 1,
        executedAt: daysAgo(30),
      })

      expect(res.body.price).toBe(String(fakeMarket.historicalPrice('BTC')))
      expect(res.body.executedAt).toBe(daysAgo(30))
    })

    it('asks for a price when the market has none', async () => {
      const { token } = await createUser()
      fakeMarket.quotes.delete('BTC')

      const res = await as(token).post('/api/transactions', {
        ticker: 'BTC',
        type: 'buy',
        quantity: 1,
      })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe(
        'No market price found for BTC. Enter the price yourself.'
      )
    })
  })

  describe('backdated trades', () => {
    it('checks a sale against the balance on its own date', async () => {
      const { token } = await createUser()
      await buy(token, 'ETH', 10, { executedAt: daysAgo(5) })

      const before = await sell(token, 'ETH', 1, { executedAt: daysAgo(20) })
      const after = await sell(token, 'ETH', 1, { executedAt: daysAgo(2) })

      expect(before.status).toBe(400)
      expect(before.body.message).toMatch(/^You did not own any ETH on /)
      expect(after.status).toBe(201)
    })

    it('refuses a backdated sale that would leave a later sale short', async () => {
      const { token } = await createUser()
      await buy(token, 'ETH', 10, { executedAt: daysAgo(30) })
      await sell(token, 'ETH', 10, { executedAt: daysAgo(10) })

      // 10 were held 20 days ago, but they have all been sold since
      const res = await sell(token, 'ETH', 5, { executedAt: daysAgo(20) })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(
        /^That would leave your sale on .* without enough ETH$/
      )
    })
  })
})

describe('PATCH /api/transactions/:id', () => {
  it('updates the given fields and leaves the rest alone', async () => {
    const { token } = await createUser()
    const created = await buy(token, 'BTC', 1, { price: 100, note: 'old' })

    const res = await as(token).patch(`/api/transactions/${created.body.id}`, {
      quantity: '2.5',
      executedAt: daysAgo(3),
      note: '',
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: created.body.id,
      type: 'buy',
      quantity: '2.5',
      price: '100',
      executedAt: daysAgo(3),
      note: null,
    })
    expect(await holdingsOf(token)).toEqual(['BTC 2.5'])
  })

  it('refuses a change that would make the balance negative', async () => {
    const { token } = await createUser()
    const bought = await buy(token, 'BTC', 2, { executedAt: daysAgo(10) })
    await sell(token, 'BTC', 2, { executedAt: daysAgo(5) })

    const shrink = await as(token).patch(
      `/api/transactions/${bought.body.id}`,
      {
        quantity: 1,
      }
    )
    const moveLater = await as(token).patch(
      `/api/transactions/${bought.body.id}`,
      { executedAt: daysAgo(1) }
    )

    expect(shrink.status).toBe(400)
    expect(shrink.body.message).toMatch(
      /^That change would take your BTC balance below zero on /
    )
    expect(moveLater.status).toBe(400)
  })

  it("cannot touch another user's transaction", async () => {
    const owner = await createUser()
    const { token } = await createUser()
    const theirs = await buy(owner.token, 'BTC', 1)

    const res = await as(token).patch(`/api/transactions/${theirs.body.id}`, {
      quantity: 99,
    })

    expect(res.status).toBe(404)
    expect(await holdingsOf(owner.token)).toEqual(['BTC 1'])
  })

  it('rejects an empty or invalid update', async () => {
    const { token } = await createUser()
    const created = await buy(token, 'BTC', 1)

    const empty = await as(token).patch(
      `/api/transactions/${created.body.id}`,
      {}
    )
    const invalid = await as(token).patch(
      `/api/transactions/${created.body.id}`,
      { quantity: -1 }
    )

    expect(empty.status).toBe(400)
    expect(empty.body.message).toBe('Nothing to update')
    expect(invalid.status).toBe(400)
  })
})

describe('DELETE /api/transactions/:id', () => {
  it('deletes a transaction', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 1)
    const second = await buy(token, 'BTC', 2)

    const res = await as(token).delete(`/api/transactions/${second.body.id}`)

    expect(res.status).toBe(204)
    expect(await holdingsOf(token)).toEqual(['BTC 1'])
  })

  it('refuses to delete a buy that a later sale depends on', async () => {
    const { token } = await createUser()
    const bought = await buy(token, 'BTC', 1, { executedAt: daysAgo(10) })
    await sell(token, 'BTC', 1, { executedAt: daysAgo(5) })

    const res = await as(token).delete(`/api/transactions/${bought.body.id}`)

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Delete that sale first')
  })

  it("cannot delete another user's transaction", async () => {
    const owner = await createUser()
    const { token } = await createUser()
    const theirs = await buy(owner.token, 'BTC', 1)

    const res = await as(token).delete(`/api/transactions/${theirs.body.id}`)

    expect(res.status).toBe(404)
    expect(await holdingsOf(owner.token)).toEqual(['BTC 1'])
  })
})

describe('GET /api/transactions', () => {
  it("returns only the caller's transactions, newest first", async () => {
    const { token } = await createUser()
    const other = await createUser()
    await buy(token, 'BTC', 1, { executedAt: daysAgo(1) })
    await buy(token, 'ETH', 2, { executedAt: daysAgo(9) })
    await buy(token, 'SOL', 3, { executedAt: daysAgo(4) })
    await buy(other.token, 'BTC', 99)

    const res = await as(token).get('/api/transactions')

    expect(res.status).toBe(200)
    expect(res.body.map((t: any) => t.asset.ticker)).toEqual([
      'BTC',
      'SOL',
      'ETH',
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
