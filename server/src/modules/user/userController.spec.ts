import express from 'express'
import bodyParser from 'body-parser'
import { getConnection } from 'typeorm'
import request from 'supertest'
import { createTestUser } from '../../utils/testUtils'
import { appRouter } from '../index'

describe('UserController', () => {
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

  // Tests for get profile functionality
  describe('getUserProfile', () => {
    it('should return the user profile', async () => {
      const user = await createTestUser()

      const res = await request(app).get('/user/user/1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 1,
        username: user.username,
        email: user.email,
        password: user.password,
      })
    })

    it('should return 404 when user not found', async () => {
      await createTestUser()

      const res = await request(app).get('/user/user/2')

      expect(res.status).toBe(404)
    })
  })

  // Tests for update profile functionality
  describe('updateUserProfile', () => {
    it('should update the user profile', async () => {
      const user = await createTestUser()

      const res = await request(app).put('/user/user/1').send({
        username: 'Updated User',
        email: 'updateduser@example.com',
      })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: user.id,
        username: 'Updated User',
        email: 'updateduser@example.com',
        password: user.password,
      })
    })

    it('should return 404 when user not found', async () => {
      await createTestUser()

      const res = await request(app).put('/user/user/3').send({
        username: 'Updated User',
        email: 'updateduser@example.com',
      })

      expect(res.status).toBe(404)
    })
  })

  // Tests for delete profile functionality
  describe('deleteUser', () => {
    it('should delete the user', async () => {
      await createTestUser()

      const res = await request(app).delete('/user/user/1')

      expect(res.status).toBe(204)
    })

    it('should return 404 when user not found', async () => {
      await createTestUser()

      const res = await request(app).delete('/user/user/2')

      expect(res.status).toBe(404)
    })
  })
})
