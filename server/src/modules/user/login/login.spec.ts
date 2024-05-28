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

  // Tests for login functionality
  describe('login', () => {
    it('should login a user and return a JWT', async () => {
      const user = await createTestUser()

      const res = await request(app).post('/user/login').send({
        usernameOrEmail: user.email,
        password: 'password',
      })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: user.id,
        username: user.username,
        email: user.email,
        token: 'mockToken',
      })
    })

    it('should throw an error for non-existent user', async () => {
      const res = await request(app).post('/user/login').send({
        usernameOrEmail: 'nonexisting@user.com',
        password: 'password',
      })

      expect(res.body).toHaveProperty('message', 'Invalid username or email')
    })

    it('should throw an error for incorrect password', async () => {
      const user = await createTestUser()

      const res = await request(app).post('/user/login').send({
        usernameOrEmail: user.email,
        password: 'wrongpassword',
      })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('message', 'Invalid password')
    })

    it('should allow logging in with different email case', async () => {
      const user = await createTestUser()

      const res = await request(app).post('/user/login').send({
        usernameOrEmail: user.email.toUpperCase(),
        password: 'password',
      })
      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
    })

    it('should allow logging in with surrounding white space', async () => {
      const user = await createTestUser()

      const res = await request(app)
        .post('/user/login')
        .send({
          usernameOrEmail: `  ${user.email}    `,
          password: 'password',
        })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
    })
  })
})
