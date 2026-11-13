import request from 'supertest'
import { app, as, buy, createUser, sell } from '../../../tests/helpers'

describe('GET /api/holdings', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/holdings')

    expect(res.status).toBe(401)
  })

  it('returns an empty list for a new user', async () => {
    const { token } = await createUser()

    const res = await as(token).get('/api/holdings')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('adds up buys and sells per asset', async () => {
    const { token } = await createUser()
    const other = await createUser()
    await buy(token, 'BTC', 1.5)
    await sell(token, 'BTC', 0.5)
    await buy(token, 'ETH', 10)
    await buy(other.token, 'BTC', 99)

    const res = await as(token).get('/api/holdings')

    expect(res.body).toEqual([
      {
        asset: { id: expect.any(Number), ticker: 'BTC', name: 'BTC' },
        quantity: '1',
      },
      {
        asset: { id: expect.any(Number), ticker: 'ETH', name: 'ETH' },
        quantity: '10',
      },
    ])
  })
})

describe('DELETE /api/holdings/:assetId', () => {
  it("removes the asset and its transactions from the caller's portfolio only", async () => {
    const { token } = await createUser()
    const other = await createUser()
    const btc = await buy(token, 'BTC', 1)
    await buy(token, 'ETH', 2)
    await buy(other.token, 'BTC', 5)

    const res = await as(token).delete(`/api/holdings/${btc.body.asset.id}`)

    expect(res.status).toBe(204)
    const mine = await as(token).get('/api/holdings')
    const theirs = await as(other.token).get('/api/holdings')
    const myTransactions = await as(token).get('/api/transactions')
    expect(mine.body.map((h: any) => h.asset.ticker)).toEqual(['ETH'])
    expect(theirs.body[0].quantity).toBe('5')
    expect(myTransactions.body).toHaveLength(1)
  })

  it('returns 404 for an asset the caller has never traded', async () => {
    const owner = await createUser()
    const { token } = await createUser()
    const btc = await buy(owner.token, 'BTC', 1)

    const res = await as(token).delete(`/api/holdings/${btc.body.asset.id}`)

    expect(res.status).toBe(404)
  })

  it('returns 400 for a malformed id', async () => {
    const { token } = await createUser()

    const res = await as(token).delete('/api/holdings/abc')

    expect(res.status).toBe(400)
  })
})
