import express from 'express'
import bodyParser from 'body-parser'
import { createConnection, getConnection } from 'typeorm'
import request from 'supertest'
import testConfig from '../../../tests/testConfig'
import cleanTestDatabase from '../../../tests/cleanTestDatabase'
import seedTestDatabase from '../../../tests/seedTestDatabase'
import UserAuthController from './userAuthController'

jest.mock('jsonwebtoken', () => ({
  sign: () => 'mockToken',
}))

describe('UserAuthController', () => {
  const mockSave = jest.fn((user) => {
    console.log('mockSave called with', user)
    return Promise.resolve(user)
  })
  let app: express.Express

  beforeAll(async () => {
    await createConnection(testConfig)
  })

  beforeEach(async () => {
    await cleanTestDatabase()
    await seedTestDatabase()

    app = express()
    app.use(bodyParser.json())
    app.post('/', UserAuthController.signup)
    app.post('/login', UserAuthController.login)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await getConnection().close()
    await cleanTestDatabase()
  })

  // tests for signup functionality
  describe('signup', () => {
    it('should create a new user and return a JWT', async () => {
      mockSave.mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
      })

      const res = await request(app).post('/').send({
        username: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
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
      const res = await request(app).post('/').send({
        username: 'Test User',
        email: 'invalid-email',
        password: 'password',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toMatch(/Invalid email format/i)
    })

    it('should require a password with at least 8 characters', async () => {
      const res = await request(app).post('/').send({
        username: 'Test User',
        email: 'user2@domain.com',
        password: 'pas.123',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toMatch(
        /Password must be at least 8 characters/i
      )
    })

    it('should store email in lowercase and trim whitespace', async () => {
      console.log('mockSave about to be called')
      mockSave.mockImplementation((user) => {
        console.log('mockSave called with', user)
        // Ensure the email is stored in lowercase and whitespace is trimmed
        expect(user.email).toBe('testuser2@example.com')
        return Promise.resolve(user)
      })

      const res = await request(app).post('/').send({
        username: 'Test User 2',
        email: '  TESTUSER2@EXAMPLE.COM  ',
        password: 'password',
      })
      expect(res.body).toEqual({
        id: 2,
        username: 'Test User 2',
        email: 'testuser2@example.com',
        token: 'mockToken',
      })
    })
  })

  // Tests for login functionality
  describe('login', () => {
    it('should login a user and return a JWT', async () => {
      mockSave.mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
      })

      const res = await request(app).post('/login').send({
        usernameOrEmail: 'testuser@example.com',
        password: 'password',
      })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
        token: 'mockToken',
      })
    })

    it('should throw an error for non-existent user', async () => {
      const res = await request(app).post('/login').send({
        usernameOrEmail: 'nonexisting@user.com',
        password: 'password',
      })

      expect(res.body).toHaveProperty('message', 'Invalid username or email')
    })

    it('should throw an error for incorrect password', async () => {
      const res = await request(app).post('/login').send({
        usernameOrEmail: 'testuser@example.com',
        password: 'wrongpassword',
      })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('message', 'Invalid password')
    })

    it('should throw an error for a short password', async () => {
      const res = await request(app).post('/login').send({
        usernameOrEmail: 'testuser@example.com',
        password: 'short',
      })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty(
        'message',
        'Password must be at least 8 characters'
      )
    })

    it('should allow logging in with different email case', async () => {
      const res = await request(app).post('/login').send({
        usernameOrEmail: 'TESTUSER@EXAMPLE.COM',
        password: 'password',
      })

      expect(res.body.token).toBeDefined()
    })

    it('should allow logging in with surrounding white space', async () => {
      const res = await request(app).post('/login').send({
        usernameOrEmail: ' testuser@example.com ',
        password: 'password',
      })
      expect(res.body).toHaveProperty('token')
    })
  })
})
