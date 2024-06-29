import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import {
  Transaction,
  TransactionType,
  UserAssets,
  Asset,
  User,
} from '../../entities/index'
import { handleError } from '../../utils/errorHandlingUtils'

// function to create new asset holdings for user
// If asset does not exist it creates it and logs transaction as a buy
// If asset exists and negative number is sent in request it logs transaction as sell
export async function createAssetHoldingsForUser(req: Request, res: Response) {
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
    let asset = await assetRepository.findOne({ where: { assetId } })

    if (!user) {
      throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
    }

    // If asset does not exist, create a new one
    if (!asset) {
      asset = assetRepository.create({
        assetId,
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
      transaction.assetId = assetId
      transaction.asset = asset
      transaction.quantity = Number(quantity) // Use the initial quantity
      transaction.price = currentPrice
      transaction.transactionType = TransactionType.BUY // Always log the first transaction as a BUY
      transaction.transaction_date = new Date()

      await transactionRepository.save(transaction)
    } else {
      // If userAsset does exist, update the quantity
      userAsset.quantity += quantity
      await userAssetsRepository.save(userAsset)

      // Determine the transaction type based on the quantity
      const transactionType =
        quantity > 0 ? TransactionType.BUY : TransactionType.SELL

      // Log the transaction with the appropriate type and quantity
      const transaction = new Transaction()
      transaction.user = user
      transaction.assetId = assetId
      transaction.asset = asset
      transaction.quantity = Math.abs(quantity)
      transaction.price = currentPrice
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
        current_price: asset.current_price,
      })
      // eslint-disable-next-line no-else-return
    } else {
      throw new Error('UserAsset is missing user or asset')
    }
  } catch (error: any) {
    // Database errors
    return handleError(error as Error)
  }
}
