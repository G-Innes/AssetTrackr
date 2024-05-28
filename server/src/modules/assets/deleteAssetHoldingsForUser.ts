import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import {
  UserAssets,
  Asset,
  User,
} from '../../entities/index'
import { handleError } from '../../utils/errorHandlingUtils'

// function to delete asset holdings for user
export async function deleteAssetHoldingsForUser(req: Request, res: Response) {
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
    return handleError(error as Error)
  }
}