import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { handleError } from '../../utils/errorHandlingUtils'
import { Transaction, User } from '../../entities/index'

export async function getAllTransactionsForUser(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const userRepository = getRepository(User)
    const transactionRepository = getRepository(Transaction)

    const userIdNumber = Number(userId)

    const user = await userRepository.findOne({ where: { id: userIdNumber } })

    if (!user) {
      throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
    }

    const transactions = await transactionRepository.find({ where: { user } })

    return res.status(200).json(transactions)
  } catch (error) {
    const { statusCode, message } = await handleError(error as Error)
    return res.status(statusCode).json({ message })
  }
}
