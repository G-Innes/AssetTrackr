import express from 'express'
import bodyParser from 'body-parser'
import request from 'supertest'
import { getConnection, getRepository } from 'typeorm'
import { Asset } from '../../entities'
import {
  createTestUser,
  createTestAsset,
  createTestUserAsset,
} from '../../utils/testUtils'
import { appRouter } from '../index'

describe('assetController', () => {
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

  describe('createAssetHoldingsForUser', () => {
    it('should create asset holdings for a user', async () => {
      const user = await createTestUser()
      let asset = await getRepository(Asset).findOne({ where: { id: 1 } })

      // check asset exists
      if (!asset) {
        await createTestAsset() // Create the asset if it doesn't exist

        asset = await getRepository(Asset).findOne({ where: { id: 1 } })
      }

      const quantity = 10

      const response = await request(app).post(`/user/${user.id}/assets`).send({
        userId: user.id,
        assetId: asset!.id,
        quantity,
        name: 'Test Asset',
        ticker: 'TST',
        current_price: asset!.current_price,
        price: 100,
      })

      // convert quantity to number
      const responseBody = response.body
      responseBody.quantity = Number(responseBody.quantity)

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        userId: user.id,
        current_price: '100',
        assetId: asset!.id,
        quantity: 10,
      })
    })

    it('should return 400 for invalid quantity', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()

      const response = await request(app).post(`/user/${user.id}/assets`).send({
        userId: user.id,
        assetId: asset.id,
        quantity: 'not a number',
        name: 'Test Asset',
        ticker: 'TST',
        current_price: 100,
        price: 100,
      })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Invalid numeric value')
    })
  })

  it('should return 400 for invalid current price', async () => {
    const user = await createTestUser()
    const asset = await createTestAsset()

    const response = await request(app).post(`/user/${user.id}/assets`).send({
      userId: user.id,
      assetId: asset.id,
      quantity: 10,
      name: 'Test Asset',
      ticker: 'TST',
      current_price: 'not a number',
      price: 100,
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid numeric value')
  })

  describe('getAllAssetHoldingsForUser', () => {
    it('should get all asset holdings for a user', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      const userAsset = await createTestUserAsset(user, asset, 10)

      const response = await request(app).get(`/user/${user.id}/assets/`)

      // Convert quantity to number for each item in the response body
      response.body.forEach((item: any) => {
        // eslint-disable-next-line no-param-reassign
        item.quantity = Number(item.quantity)
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        {
          id: expect.any(Number),
          quantity: userAsset.quantity,
          assetId: asset.id,
          userId: user.id,
          name: asset.name,
          ticker: asset.ticker,
        },
      ])
    })

    it('should return an empty array if the user has no asset holdings', async () => {
      const user = await createTestUser()

      const response = await request(app).get(`/user/${user.id}/assets`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return 404 when user not found', async () => {
      const response = await request(app).get('/user/9999/assets')

      expect(response.status).toBe(404)
      expect(response.body.message).toContain('User not found')
    })
  })

  it('should update quantity with a positive number and log a buy transaction', async () => {
    const user = await createTestUser()
    const asset = await createTestAsset()
    await createTestUserAsset(user, asset, 10)

    const response = await request(app).post(`/user/${user.id}/assets`).send({
      userId: user.id,
      assetId: asset.assetId,
      quantity: 5,
      name: asset.name,
      ticker: asset.ticker,
      current_price: 100,
      price: 100,
    })

    expect(response.status).toBe(201)
    expect(response.body.quantity).toBe(15)
  })

  it('should update quantity with a negative number and log a sell transaction', async () => {
    const user = await createTestUser()
    const asset = await createTestAsset()
    await createTestUserAsset(user, asset, 10)
    const response = await request(app).post(`/user/${user.id}/assets`).send({
      userId: user.id,
      assetId: asset.assetId,
      quantity: -5,
      name: asset.name,
      ticker: asset.ticker,
      current_price: 100,
      price: 100,
    })
    expect(response.status).toBe(201)
    expect(response.body.quantity).toBe(5)
  })

  it('Should return 400 for selling more assets than owned', async () => {
    const user = await createTestUser()
    const asset = await createTestAsset()
    await createTestUserAsset(user, asset, 10)

    const response = await request(app).post(`/user/${user.id}/assets`).send({
      userId: user.id,
      assetId: asset.id,
      quantity: -15,
      name: asset.name,
      ticker: asset.ticker,
      current_price: 100,
      price: 100,
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Insufficient asset quantity for sale')
  })

  // it('should delete the asset when quantity is 0', async () => {
  //   const user = await createTestUser()
  //   const asset = await createTestAsset()
  //   await createTestUserAsset(user, asset, 10)

  //   const response = await request(app).post(`/user/${user.id}/assets`).send({
  //     userId: user.id,
  //     assetId: asset.id,
  //     quantity: -10,
  //     name: asset.name,
  //     ticker: asset.ticker,
  //     current_price: 100,
  //     price: 100,
  //   })

  //   expect(response.status).toBe(201)
  //   expect(response.body.quantity).toBe(0)
  // })

  describe('deleteAssetHoldingsForUser', () => {
    it('should delete asset holdings for a user', async () => {
      const user = await createTestUser()
      const asset = await createTestAsset()
      await createTestUserAsset(user, asset, 10)

      const response = await request(app).delete(
        `/user/${user.id}/assets/${asset.id}`
      )

      expect(response.status).toBe(204)
      // Verify that the asset is deleted from the database
      const updatedAsset = await getRepository(Asset).findOne({
        where: { id: asset.id },
      })
      expect(updatedAsset?.userAssets).toBeUndefined()
    })

    // it('should return 404 if user is not found', async () => {
    //   const user = await createTestUser();
    //   const asset = await createTestAsset();
    //   await createTestUserAsset(user, asset, 10);

    //   const invalidUserId = user.id + 1; // Assuming this ID does not exist

    //   const response = await request(app).delete(
    //     `/user/${invalidUserId}/assets/${asset.id}`
    //   );

    //   expect(response.status).toBe(404);
    //   expect(response.body.message).toContain(`User not found with id: ${invalidUserId}`);
    // });
  })
})
