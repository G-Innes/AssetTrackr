import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { User } from '../../entities/user'
import { Asset } from '../../entities/asset'
import { UserAssets } from '../../entities/userAssets'

// Error handling function
async function handleError(error: any, res: Response) {
  console.log('Error in handleError:', error)
  console.log('Response in handleError:', res)
  if (error instanceof EntityNotFoundError) {
    return res.status(404).json({
      message: error.message,
      error,
    })
  }

  return res.status(500).json({
    message: 'Something went wrong',
    error,
  })
}

export default {
  // function to create new asset holdings for user
  async createAssetHoldingsForUser(req: Request, res: Response) {
    const {
      userId,
      assetId,
      quantity,
      name,
      ticker,
      current_price: currentPrice,
    } = req.body

    // Check for invalid input
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' })
    }
    try {
      const userRepository = getRepository(User)
      const assetRepository = getRepository(Asset)
      const userAssetsRepository = getRepository(UserAssets)

      const user = await userRepository.findOne({ where: { id: userId } })

      let asset = await assetRepository.findOne({ where: { id: assetId } })

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }

      // If asset does not exist, create a new one
      if (!asset) {
        asset = assetRepository.create({
          id: assetId,
          name,
          ticker,
          current_price: currentPrice,
        })
        await assetRepository.save(asset)
      }

      let userAsset = await userAssetsRepository.findOne({
        where: { user, asset },
      })

      // If userAsset does not exist, create a new one
      if (!userAsset) {
        userAsset = new UserAssets()
        userAsset.user = user
        userAsset.asset = asset
        userAsset.quantity = quantity
        await userAssetsRepository.save(userAsset)
      } else {
        // If userAsset does exist, update the quantity
        userAsset.quantity = Number(userAsset.quantity) + Number(quantity)
        await userAssetsRepository.save(userAsset)
      }

      await userRepository.save(user)
      await assetRepository.save(asset)

      // Reload the userAsset with user and asset relations
      userAsset = await userAssetsRepository.findOne({
        where: { id: userAsset?.id },
        relations: ['user', 'asset'],
      })

      if (userAsset && userAsset.user && userAsset.asset) {
        return res.status(201).json({
          userId: userAsset.user.id,
          assetId: userAsset.asset.id,
          quantity: userAsset.quantity,
        })
        // eslint-disable-next-line no-else-return
      } else {
        throw new Error('UserAsset is missing user or asset')
      }
    } catch (error: any) {
      // Database errors
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
      return handleError(error, res)
    }
  },

  // function to get all asset holdings for user
  async getAllAssetHoldingsForUser(req: Request, res: Response) {
    console.log('Request:', req)
    console.log('Response:', res)
    try {
      const userId = Number(req.params.userId)
      console.log('userId:', userId)
      console.log(req.params)

      const userRepository = getRepository(User)
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['userAssets', 'userAssets.asset'],
      })

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }

      const userAssets = user.userAssets
        ? user.userAssets.map((userAsset) => ({
            id: userAsset.id,
            quantity: userAsset.quantity,
            assetId: userAsset.asset.id,
            userId,
            name: userAsset.asset.name,
            ticker: userAsset.asset.ticker,
          }))
        : []

      return res.json(userAssets)
    } catch (error) {
      // Database errors
      console.error('Error before handleError:', error)
      return handleError(error, res)
    }
  },

  // function to update asset holdings for user
  async updateAssetHoldingsForUser(req: Request, res: Response) {
    try {
      const { userId, assetId, quantity } = req.body

      const userRepository = getRepository(User)
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['userAssets', 'userAssets.asset'],
      })

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }

      const foundUserAsset = (user.userAssets || []).find(
        (userAsset) => userAsset.asset.id === assetId
      )

      if (!foundUserAsset) {
        throw new EntityNotFoundError(
          Asset,
          `Asset not found with id: ${assetId}`
        )
      }

      foundUserAsset.quantity = quantity
      await userRepository.save(user)

      return res.json({ userId, assetId, quantity })
    } catch (error) {
      // Database errors
      console.error(error)
      return handleError(error, res)
    }
  },
  // function to delete asset holdings for user
  async deleteAssetHoldingsForUser(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId)
      const assetId = Number(req.params.assetId)

      const userRepository = getRepository(User)
      const userAssetsRepository = getRepository(UserAssets)
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['userAssets', 'userAssets.asset'],
      })

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }

      const userAssetToDelete = (user.userAssets || []).find(
        (userAsset) => userAsset.asset.id === assetId
      )

      if (!userAssetToDelete) {
        throw new EntityNotFoundError(
          Asset,
          `Asset not found with id: ${assetId}`
        )
      }
      // Use the injected userAssetsRepository
      await userAssetsRepository.remove(userAssetToDelete)

      return res.status(204).send()
    } catch (error) {
      // Database errors
      console.error(error)
      return handleError(error, res)
    }
  },
}
