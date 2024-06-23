import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { handleError } from '../../utils/errorHandlingUtils'
import {
  Transaction,
  User,
  Asset,
} from '../../entities/index'

export async function getAllTransactionsForAsset(req: Request, res: Response) {
    try {
      const { userId, assetId } = req.params;
      const userRepository = getRepository(User);
      const assetRepository = getRepository(Asset);
      const transactionRepository = getRepository(Transaction);
  
      // Convert userId to a number
      const userIdNumber = Number(userId);

      const user = await userRepository.findOne({ where: { id: userIdNumber } });
      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`);
      }
  
      // Convert userId to a number
      const assetIdNumber = Number(assetId);

      const asset = await assetRepository.findOne({ where: { id: assetIdNumber } });
      if (!asset) {
        throw new EntityNotFoundError(Asset, `Asset not found with id: ${assetId}`);
      }
  
      const transactions = await transactionRepository.find({ where: { user, assetId: assetIdNumber } });
      return res.status(200).json(transactions);
    } catch (error) {
      const { statusCode, message } = await handleError(error as Error);
      return res.status(statusCode).json({ message });
    }
  }