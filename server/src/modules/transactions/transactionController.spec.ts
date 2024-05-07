import express from 'express'
import bodyParser from 'body-parser'
import request from 'supertest'
import { getConnection } from 'typeorm'
import {
  createTestUser,
  createTestAsset,
  createTestTransaction
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
    it('Should get all transactions for user',
    async () => {
        const user = await createTestUser()
        const asset = await createTestAsset()
        await createTestTransaction(user, asset, TransactionType.BUY)
        
        const response = await request(app).get(`/user/${user.id}/transactions`);

        expect(response.status).toBe(201)
        expect(response.body).toHaveLength(1)
    })
})
})