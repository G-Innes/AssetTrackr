import express from 'express'
import bodyParser from 'body-parser'
import { createConnection, getConnection } from 'typeorm'
import request from 'supertest'
import testConfig from '../../../tests/testConfig'
import cleanTestDatabase from '../../../tests/cleanTestDatabase'
import seedTestDatabase from '../../../tests/seedTestDatabase'
import userController from './userController'

let mockDelete = jest.fn()
let mockFindOne: jest.Mock

const mockSave = jest.fn((user) => {
  console.log('mockSave called with', user)
  return Promise.resolve(user)
})
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: () => ({
    save: mockSave,
    findOne: () => mockFindOne(),
    delete: mockDelete,
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(() =>
        Promise.resolve({
          id: 1,
          username: 'Test User',
          email: 'testuser@example.com',
          password: 'password',
        })
      ),
    })),
  }),
}))

describe('UserController', () => {
  let app: express.Express

  beforeAll(async () => {
    await createConnection(testConfig)
  })

  beforeEach(async () => {
    await cleanTestDatabase()
    await seedTestDatabase()

    app = express()
    app.use(bodyParser.json())
    app.get('/user/:userId', userController.getUserProfile)
    app.put('/user/:userId', userController.updateUserProfile)
    app.delete('/user/:userId', userController.deleteUser)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await getConnection().close()
    await cleanTestDatabase()
  })

  // Tests for get profile functionality
  describe('getUserProfile', () => {
    it('should return the user profile', async () => {
      mockFindOne = jest.fn().mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
      })

      const res = await request(app).get('/user/1')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
      })
    })

    it('should return 404 when user not found', async () => {
      mockFindOne = jest.fn().mockResolvedValue(undefined)

      const res = await request(app).get('/user/1')

      expect(res.status).toBe(404)
      expect(res.body.error.message).toContain('User not found')
    })
  })

  // Tests for update profile functionality
  describe('updateUserProfile', () => {
    it('should update the user profile', async () => {
      mockFindOne = jest.fn().mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
      })

      const res = await request(app).put('/user/1').send({
        username: 'Updated User',
        email: 'updateduser@example.com',
      })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 1,
        username: 'Updated User',
        email: 'updateduser@example.com',
      })
    })

    it('should return 404 when user not found', async () => {
      mockFindOne = jest.fn().mockResolvedValue(undefined)

      const res = await request(app).put('/user/1').send({
        username: 'Updated User',
        email: 'updateduser@example.com',
      })

      expect(res.status).toBe(404)
      expect(res.body.error.message).toContain('User not found')
    })
  })

  // Tests for delete profile functionality
  describe('deleteUser', () => {
    it('should delete the user', async () => {
      mockFindOne = jest.fn().mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'testuser@example.com',
      })
      mockDelete = jest.fn().mockResolvedValue({ affected: 1 })

      const res = await request(app).delete('/user/1')

      expect(res.status).toBe(204)
    })

    it('should return 404 when user not found', async () => {
      mockFindOne = jest.fn().mockResolvedValue(undefined)
      mockDelete = jest.fn().mockResolvedValue({ affected: 0 })

      const res = await request(app).delete('/user/1')

      expect(res.status).toBe(404)
      expect(res.body.error.message).toContain('User not found')
    })
  })
})
