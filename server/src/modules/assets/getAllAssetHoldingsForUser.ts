import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { User } from '../../entities/index'
import { handleError } from '../../utils/errorHandlingUtils'

// function to get all asset holdings for user
export async function getAllAssetHoldingsForUser(req: Request, res: Response) {
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
    const { statusCode, message } = await handleError(error as Error)
    return res.status(statusCode).json({ message })
  }
}
