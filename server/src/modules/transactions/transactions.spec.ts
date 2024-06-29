import express from 'express'
import bodyParser from 'body-parser'
import request from 'supertest'
import { getConnection } from 'typeorm'
import {
  createTestUser,
  createTestAsset,
  createTestTransaction,
} from '../../utils/testUtils'
import { appRouter } from '../index'
import { TransactionType } from '../../entities'

describe('transactionController', () => {
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

  describe('getAllTransactionsForUser', () => {
    it('Should get all transactions for user', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestTransaction(
        user,
        asset,
        asset.assetId,
        TransactionType.BUY
      )

      const response = await request(app).get(`/user/${user.id}/transactions`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
    })

    it('should return empty array if user has no transactions', async () => {
      const user = await createTestUser()

      const response = await request(app).get(`/user/${user.id}/transactions`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })

    it('should return 404 if user is not found', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestTransaction(
        user,
        asset,
        asset.assetId,
        TransactionType.BUY
      )

      const nonExistentUserId = user.id + 1
      const response = await request(app).get(
        `/user/${nonExistentUserId}/transactions`
      )

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message', `User not found`)
    })
  })

  describe('getAllTransactionsForAsset', () => {
    it('should return all transactions for a specific asset', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestTransaction(
        user,
        asset,
        asset.assetId,
        TransactionType.BUY
      )

      const response = await request(app).get(
        `/user/${user.id}/transactions/${asset.id}`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
    })

    it('should return empty array if asset has no transactions', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()

      const response = await request(app).get(
        `/user/${user.id}/transactions/${asset.id}`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })

    it('should return 404 if user is not found', async () => {
      const nonExistentUserId = 9999
      const asset = await createTestAsset()
      // Using a dummy user ID, no need to create transaction
      const response = await request(app).get(
        `/user/${nonExistentUserId}/transactions/${asset.id}`
      )

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message', 'User not found')
    })

    it('should return 404 if asset is not found', async () => {
      const user = await createTestUser()
      const nonExistentAssetId = 9999

      const response = await request(app).get(
        `/user/${user.id}/transactions/${nonExistentAssetId}`
      )

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message', 'Asset not found')
    })
  })

  describe('getTransactionsByType', () => {
    it('should return all transactions of a specific type for a specific user', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestTransaction(
        user,
        asset,
        asset.assetId,
        TransactionType.BUY
      )

      const response = await request(app).get(
        `/user/${user.id}/transactions/type/buy`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      const allTransactionsAreBuy = response.body.every(
        (transaction: any) =>
          transaction.transactionType === TransactionType.BUY
      )
      expect(allTransactionsAreBuy).toBe(true)
    })

    it('should return empty array if user has no transactions of the specified type', async () => {
      const user = await createTestUser()

      const response = await request(app).get(
        `/user/${user.id}/transactions/type/buy`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(0)
    })

    it('should return 404 if user is not found', async () => {
      const nonExistentUserId = 9999

      const response = await request(app).get(
        `/user/${nonExistentUserId}/transactions/type/buy`
      )

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message', 'User not found')
    })

    it('should return 400 if invalid transaction type is provided', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestTransaction(
        user,
        asset,
        asset.assetId,
        TransactionType.BUY
      )

      const response = await request(app).get(
        `/user/${user.id}/transactions/type/invalidType`
      )

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty(
        'message',
        'Invalid transaction type: invalidType'
      )
    })
  })
})
