import express from 'express'
import bodyParser from 'body-parser'
import { getConnection } from 'typeorm'
import request from 'supertest'
import { createTestUser } from '../../../utils/testUtils'
import { appRouter } from '../../index'

jest.mock('jsonwebtoken', () => ({
  sign: () => 'mockToken',
}))

describe('UserAuthController', () => {
  let app: express.Express

  beforeAll(async () => {
    await getConnection()
  })

  beforeEach(async () => {
    await getConnection().synchronize(true)
    app = express()
    app.use(bodyParser.json())
    app.use(appRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await getConnection().close()
  })

  // tests for signup functionality
  describe('signup', () => {
    it('should create a new user and return a JWT', async () => {
      const res = await request(app).post('/user').send({
        username: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
        confirmPassword: 'password',
      })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
        token: 'mockToken',
      })
    })

    it('should require a valid email', async () => {
      const res = await request(app).post('/user').send({
        username: 'Test User',
        email: 'invalid-email',
        password: 'password',
        confirmPassword: 'password',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toMatch(/Invalid email format/i)
    })

    it('should require a password with at least 8 characters', async () => {
      const res = await request(app).post('/user').send({
        username: 'Test User',
        email: 'user2@domain.com',
        password: 'pas.123',
        confirmPassword: 'pas.123',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toMatch(
        /Password must be at least 8 characters/i
      )
    })

    it('Passwords should match', async () => {
      const res = await request(app).post('/user').send({
        username: 'Test User',
        email: 'user2@domain.com',
        password: 'pas.123',
        confirmPassword: 'pas.1234',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toMatch(
        /Passwords should match/i
      )
    })

    it('should store email in lowercase and trim whitespace', async () => {
      const res = await request(app).post('/user').send({
        username: 'Test User',
        email: '  TESTUSER2@EXAMPLE.COM  ',
        password: 'password',
        confirmPassword: 'password',
      })
      expect(res.body).toEqual({
        id: 1,
        username: 'Test User',
        email: 'testuser2@example.com',
        token: 'mockToken',
      })
    })

    it('should require username, email, and password for signup', async () => {
      const res = await request(app).post('/user').send({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty(
        'message',
        'Username, email, and password & confirmation are required'
      )
    })

    it('should not allow duplicate emails', async () => {
      const user = await createTestUser()

      const res = await request(app).post('/user').send({
        username: 'Test User 2',
        email: user.email,
        password: 'password',
        confirmPassword: 'password',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Email already in use')
    })
  })
})