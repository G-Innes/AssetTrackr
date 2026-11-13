import request from 'supertest'
import { app, as, createUser, daysAgo } from '../../../tests/helpers'
import { fakeMarket } from '../../../tests/fakeMarket'
import { getQuotes, setMarketDataProvider } from './service'

describe('GET /api/market/assets', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/market/assets')

    expect(res.status).toBe(401)
  })

  it('lists popular assets with prices when there is no search term', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/market/assets?limit=3')

    expect(res.body).toEqual([
      { ticker: 'BTC', name: 'Bitcoin', price: 60000, change24h: 25 },
      { ticker: 'ETH', name: 'Ethereum', price: 3000, change24h: -50 },
      { ticker: 'SOL', name: 'Solana', price: 100, change24h: 0 },
    ])
  })

  it('searches tickers and names, best match first', async () => {
    const { token } = await createUser()

    const byTicker = await as(token).get('/api/market/assets?q=do')
    const byName = await as(token).get('/api/market/assets?q=chain')
    const inside = await as(token).get('/api/market/assets?q=oin')

    expect(byTicker.body.map((a: any) => a.ticker)).toEqual(['DOGE'])
    expect(byName.body.map((a: any) => a.ticker)).toEqual(['LINK'])
    // "oin" is inside Bitcoin, Dogecoin and USD Coin
    expect(inside.body.map((a: any) => a.ticker)).toEqual([
      'BTC',
      'DOGE',
      'USDC',
    ])
  })

  it('offers USD Coin even though it has no USD market', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/market/assets?q=usdc')

    expect(res.body).toEqual([
      { ticker: 'USDC', name: 'USD Coin', price: 1, change24h: 0 },
    ])
  })

  it('answers 503 when the market has never been reachable', async () => {
    const { token } = await createUser()
    fakeMarket.down = true

    const res = await as(token).get('/api/market/assets')

    expect(res.status).toBe(503)
    expect(res.body.message).toBe('Market data is temporarily unavailable')
  })
})

describe('GET /api/market/assets/:ticker/price', () => {
  it('returns the live price by default', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/market/assets/btc/price')

    expect(res.body).toMatchObject({ ticker: 'BTC', price: 60000 })
  })

  it("returns a past day's closing price", async () => {
    const { token } = await createUser()
    const day = daysAgo(10).slice(0, 10)

    const res = await as(token).get(`/api/market/assets/BTC/price?date=${day}`)

    expect(res.body).toEqual({ ticker: 'BTC', date: day, price: 30000 })
  })

  it('returns 404 for an unknown asset and 400 for a bad date', async () => {
    const { token } = await createUser()

    const unknown = await as(token).get('/api/market/assets/NOPE/price')
    const badDate = await as(token).get(
      '/api/market/assets/BTC/price?date=soon'
    )

    expect(unknown.status).toBe(404)
    expect(badDate.status).toBe(400)
  })
})

describe('market data cache', () => {
  it('shares one upstream request between simultaneous callers', async () => {
    let calls = 0
    setMarketDataProvider({
      listAssets: async () => [],
      getDailyCloses: async () => new Map(),
      getQuotes: async () => {
        calls += 1
        return new Map([['BTC', { price: 1, change24h: 0 }]])
      },
    })

    await Promise.all([getQuotes(), getQuotes(), getQuotes()])
    await getQuotes()

    expect(calls).toBe(1)
  })

  it('keeps serving the last good prices when a refresh fails', async () => {
    vi.useFakeTimers()
    try {
      let fail = false
      setMarketDataProvider({
        listAssets: async () => [],
        getDailyCloses: async () => new Map(),
        getQuotes: async () => {
          if (fail) throw new Error('upstream down')
          return new Map([['BTC', { price: 123, change24h: 0 }]])
        },
      })
      await getQuotes()

      fail = true
      vi.advanceTimersByTime(5 * 60 * 1000) // well past the cache lifetime
      const quotes = await getQuotes()

      expect(quotes.get('BTC')?.price).toBe(123)
    } finally {
      vi.useRealTimers()
    }
  })
})
