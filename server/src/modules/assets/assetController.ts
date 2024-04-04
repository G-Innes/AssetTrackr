import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import {
  Transaction,
  TransactionType,
  UserAssets,
  Asset,
  User,
} from '../../entities/index'

// Error handling function
async function handleError(error: any, res: Response) {
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
  // If asset does not exist it creates it and logs transaction as a buy
  // If asset exists and negative number is sent in request it logs transaction as sell
  async createAssetHoldingsForUser(req: Request, res: Response) {
    const {
      userId,
      assetId,
      quantity: quantityString,
      name,
      ticker,
      current_price: currentPriceString,
    } = req.body

    // Explicitly convert quantity to a number
    const quantity = Number(quantityString)


    const currentPrice = Number(currentPriceString)
    console.log('Converted Current Price:', currentPrice)
    // validation checks on quantity and currentPrice
    if (Number.isNaN(quantity) || Number.isNaN(currentPrice)) {
      return res.status(400).json({ message: 'Invalid numeric value' })
    }

    // Check for invalid input
    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ message: 'Invalid quantity' })
    }
    try {
      const userRepository = getRepository(User)
      const assetRepository = getRepository(Asset)
      const userAssetsRepository = getRepository(UserAssets)
      const transactionRepository = getRepository(Transaction)

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

        // Log the first transaction as a BUY
        const transaction = new Transaction()
        transaction.user = user
        transaction.asset = asset
        transaction.quantity = Number(quantity) // Use the initial quantity
        transaction.price = asset.current_price
        transaction.transactionType = TransactionType.BUY // Always log the first transaction as a BUY
        transaction.transaction_date = new Date()
        console.log('first transaction logged quantity:', quantity)

        await transactionRepository.save(transaction)
      } else {
        // If userAsset does exist, update the quantity
        // If the new quantity is positive, add it to the existing quantity
        // If the new quantity is negative, subtract it from the existing quantity
        // Store the previous quantity before updating it
        const previousQuantity = Number(userAsset.quantity)
        // Update the quantity based on the new quantity value
        userAsset.quantity += Number(quantity)
        await userAssetsRepository.save(userAsset)

        // Calculate the quantity difference
        const quantityDifference =
          Number(userAsset.quantity) - Number(previousQuantity)

        // Determine the transaction type based on the quantity difference
        let transactionType =
          quantityDifference > 0 ? TransactionType.BUY : TransactionType.SELL

        // If this is the first transaction for the asset, explicitly set the transaction type to BUY
        if (quantityDifference === Number(userAsset.quantity)) {
          transactionType = TransactionType.BUY
        }

        // Log the transaction with the appropriate type and quantity
        const transaction = new Transaction()
        transaction.user = user
        transaction.asset = asset
        transaction.quantity = Math.abs(quantityDifference)
        transaction.price = asset.current_price
        transaction.transactionType = transactionType
        transaction.transaction_date = new Date()
        await transactionRepository.save(transaction)
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
      return handleError(error, res)
    }
  },

  // function to get all asset holdings for user
  async getAllAssetHoldingsForUser(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId)

      // Validate that userId is a valid integer
      if (Number.isNaN(userId) || !Number.isInteger(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' })
      }

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

      await userAssetsRepository.remove(userAssetToDelete)

      return res.status(204).send()
    } catch (error) {
      return handleError(error, res)
    }
  },
}
