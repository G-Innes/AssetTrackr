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

// Fake market: BTC $60,000 (+25% today), ETH $3,000 (-50% today), SOL $100.
// Every earlier day closed at half of those prices.

describe('GET /api/portfolio', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/portfolio')

    expect(res.status).toBe(401)
  })

  it('is empty for a new user', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/portfolio')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      holdings: [],
      totals: {
        value: 0,
        costBasis: 0,
        unrealizedPnl: 0,
        unrealizedPnlPercent: null,
        realizedPnl: 0,
        change24h: 0,
        change24hPercent: null,
      },
      unpriced: [],
    })
  })

  it('values each holding and works out profit against average cost', async () => {
    const { token } = await createUser()
    // 2 BTC for 60,000 in total: average cost 30,000
    await buy(token, 'BTC', 1, { price: 20000 })
    await buy(token, 'BTC', 1, { price: 40000 })

    const res = await as(token).get('/api/portfolio')

    expect(res.body.holdings).toEqual([
      {
        asset: { id: expect.any(Number), ticker: 'BTC', name: 'Bitcoin' },
        quantity: '2',
        averageCost: 30000,
        costBasis: 60000,
        realizedPnl: 0,
        price: 60000,
        change24h: 25,
        value: 120000,
        unrealizedPnl: 60000,
        unrealizedPnlPercent: 100,
        allocation: 100,
      },
    ])
  })

  it('totals the portfolio, largest holding first', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10, { price: 1000 }) // worth 30,000, cost 10,000
    await buy(token, 'BTC', 1, { price: 50000 }) // worth 60,000, cost 50,000
    await buy(token, 'SOL', 100, { price: 150 }) // worth 10,000, cost 15,000

    const { holdings, totals } = (await as(token).get('/api/portfolio')).body

    expect(holdings.map((h: any) => [h.asset.ticker, h.allocation])).toEqual([
      ['BTC', 60],
      ['ETH', 30],
      ['SOL', 10],
    ])
    expect(totals).toMatchObject({
      value: 100000,
      costBasis: 75000,
      unrealizedPnl: 25000,
      realizedPnl: 0,
    })
    expect(totals.unrealizedPnlPercent).toBeCloseTo(33.33, 2)
    // Yesterday: BTC 48,000 + ETH 60,000 + SOL 10,000 = 118,000
    expect(totals.change24h).toBeCloseTo(-18000, 6)
    expect(totals.change24hPercent).toBeCloseTo(-15.25, 2)
  })

  it('keeps realised profit after a position is sold completely', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 2, { price: 1000 })
    await sell(token, 'ETH', 2, { price: 1500 })
    await buy(token, 'BTC', 1, { price: 60000 })

    const { holdings, totals } = (await as(token).get('/api/portfolio')).body

    expect(holdings.map((h: any) => h.asset.ticker)).toEqual(['BTC'])
    expect(totals.realizedPnl).toBe(1000)
    expect(totals.unrealizedPnl).toBe(0)
  })

  it('reports holdings it cannot price instead of counting them as zero', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 1, { price: 50000 })
    await buy(token, 'SOL', 10, { price: 150 })
    fakeMarket.quotes.delete('SOL')

    const { holdings, totals, unpriced } = (
      await as(token).get('/api/portfolio')
    ).body

    expect(unpriced).toEqual(['SOL'])
    expect(holdings[1]).toMatchObject({
      quantity: '10',
      costBasis: 1500,
      price: null,
      value: null,
      unrealizedPnl: null,
      allocation: null,
    })
    // Profit covers the priced holding only: 60,000 - 50,000
    expect(totals).toMatchObject({
      value: 60000,
      costBasis: 51500,
      unrealizedPnl: 10000,
    })
  })

  it('still lists holdings when the market is unreachable', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 1, { price: 50000 })
    fakeMarket.down = true

    const res = await as(token).get('/api/portfolio')

    expect(res.status).toBe(200)
    expect(res.body.unpriced).toEqual(['BTC'])
    expect(res.body.holdings[0]).toMatchObject({ quantity: '1', value: null })
  })

  it("never includes another user's holdings", async () => {
    const { token } = await createUser()
    const other = await createUser()
    await buy(other.token, 'BTC', 5)

    expect(await holdingsOf(token)).toEqual([])
  })
})

describe('GET /api/portfolio/history', () => {
  it('is empty for a new user', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/portfolio/history')

    expect(res.body).toEqual({ range: '90d', points: [] })
  })

  it('rebuilds daily value from the ledger and closing prices', async () => {
    const { token } = await createUser()
    await buy(token, 'BTC', 1, { price: 20000, executedAt: daysAgo(3) })
    await buy(token, 'BTC', 1, { price: 40000, executedAt: daysAgo(1) })

    const { points } = (await as(token).get('/api/portfolio/history?range=30d'))
      .body

    // Starts the day before the first trade; past days close at 30,000 a coin
    expect(points.map((p: any) => [p.value, p.costBasis])).toEqual([
      [0, 0], // 4 days ago: nothing held yet
      [30000, 20000], // 3 days ago: 1 BTC
      [30000, 20000],
      [60000, 60000], // yesterday: 2 BTC
      [120000, 60000], // today, at the live price of 60,000
    ])
    expect(points.at(-1).date).toBe(new Date().toISOString().slice(0, 10))
  })

  it('drops an asset from the value once it has been sold', async () => {
    const { token } = await createUser()
    await buy(token, 'ETH', 10, { price: 1000, executedAt: daysAgo(3) })
    await sell(token, 'ETH', 10, { price: 2000, executedAt: daysAgo(2) })

    const { points } = (await as(token).get('/api/portfolio/history?range=30d'))
      .body

    expect(points.map((p: any) => p.value)).toEqual([0, 15000, 0, 0, 0])
  })

  it('covers the whole range when trading started before it', async () => {
    const { token } = await createUser()
    await buy(token, 'SOL', 1, { price: 10, executedAt: daysAgo(200) })

    const { points } = (await as(token).get('/api/portfolio/history?range=30d'))
      .body

    expect(points).toHaveLength(30)
    expect(points[0]).toMatchObject({ value: 50, costBasis: 10 })
  })

  it('rejects an unknown range', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/portfolio/history?range=5y')

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/portfolio/assets/:assetId', () => {
  it("removes the asset and its transactions from the caller's portfolio only", async () => {
    const { token } = await createUser()
    const other = await createUser()
    const btc = await buy(token, 'BTC', 1)
    await buy(token, 'ETH', 2)
    await buy(other.token, 'BTC', 5)

    const res = await as(token).delete(
      `/api/portfolio/assets/${btc.body.asset.id}`
    )

    expect(res.status).toBe(204)
    const myTransactions = await as(token).get('/api/transactions')
    expect(await holdingsOf(token)).toEqual(['ETH 2'])
    expect(await holdingsOf(other.token)).toEqual(['BTC 5'])
    expect(myTransactions.body).toHaveLength(1)
  })

  it('returns 404 for an asset the caller has never traded', async () => {
    const owner = await createUser()
    const { token } = await createUser()
    const btc = await buy(owner.token, 'BTC', 1)

    const res = await as(token).delete(
      `/api/portfolio/assets/${btc.body.asset.id}`
    )

    expect(res.status).toBe(404)
  })

  it('returns 400 for a malformed id', async () => {
    const { token } = await createUser()

    const res = await as(token).delete('/api/portfolio/assets/abc')

    expect(res.status).toBe(400)
  })
})
