import jwt from 'jsonwebtoken'
import request from 'supertest'
import { dataSource } from '../../database/dataSource'
import { app, as, buy, createUser } from '../../../tests/helpers'

describe('authentication', () => {
  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/me')

    expect(res.status).toBe(401)
  })

  it('rejects a token signed with a different secret', async () => {
    const { user } = await createUser()
    const forged = jwt.sign({}, 'some-other-secret', {
      subject: String(user.id),
    })

    const res = await as(forged).get('/api/me')

    expect(res.status).toBe(401)
  })

  it('rejects an expired token', async () => {
    const { user } = await createUser()
    const config = (await import('../../config')).default
    const expired = jwt.sign({}, config.auth.jwtSecret, {
      subject: String(user.id),
      expiresIn: -10,
    })

    const res = await as(expired).get('/api/me')

    expect(res.status).toBe(401)
  })

  it('rejects the token of an account that has been deleted', async () => {
    const { token } = await createUser()
    await as(token).delete('/api/me')

    const res = await as(token).get('/api/me')

    expect(res.status).toBe(401)
  })
})

describe('GET /api/me', () => {
  it('returns the profile without the password hash', async () => {
    const { user, token } = await createUser()

    const res = await as(token).get('/api/me')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: expect.any(String),
    })
  })
})

describe('PATCH /api/me', () => {
  it('updates the username and email', async () => {
    const { token } = await createUser()

    const res = await as(token).patch('/api/me', {
      username: 'renamed',
      email: 'Renamed@Example.com',
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      username: 'renamed',
      email: 'renamed@example.com',
    })
  })

  it('lets a user change the letter case of their own username', async () => {
    const { token } = await createUser({ username: 'alice' })

    const res = await as(token).patch('/api/me', { username: 'Alice' })

    expect(res.status).toBe(200)
    expect(res.body.username).toBe('Alice')
  })

  it("refuses another user's username or email", async () => {
    const other = await createUser()
    const { token } = await createUser()

    const username = await as(token).patch('/api/me', {
      username: other.user.username.toUpperCase(),
    })
    const email = await as(token).patch('/api/me', { email: other.user.email })

    expect(username.status).toBe(409)
    expect(email.status).toBe(409)
  })

  it('rejects invalid or empty updates', async () => {
    const { token } = await createUser()

    const invalid = await as(token).patch('/api/me', { email: 'nope' })
    const empty = await as(token).patch('/api/me', {})

    expect(invalid.status).toBe(400)
    expect(empty.status).toBe(400)
  })
})

describe('DELETE /api/me', () => {
  it('deletes the account together with its transactions', async () => {
    const { token } = await createUser()
    const bystander = await createUser()
    await buy(token, 'BTC', 1)
    await buy(bystander.token, 'BTC', 2)

    const res = await as(token).delete('/api/me')

    expect(res.status).toBe(204)
    const users = await dataSource.query('SELECT id FROM "user"')
    const transactions = await dataSource.query(
      'SELECT user_id FROM "transaction"'
    )
    expect(users).toEqual([{ id: bystander.user.id }])
    expect(transactions).toEqual([{ user_id: bystander.user.id }])
  })
})
