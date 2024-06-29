import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { handleError } from '../../utils/errorHandlingUtils'
import { Transaction, User, TransactionType } from '../../entities/index'

export async function getTransactionsByType(req: Request, res: Response) {
  try {
    const { userId, type } = req.params
    const userRepository = getRepository(User)
    const transactionRepository = getRepository(Transaction)

    const userIdNumber = Number(userId)

    const user = await userRepository.findOne({ where: { id: userIdNumber } })
    if (!user) {
      throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
    }

    // Validate the 'type' parameter
    const transactionTypeKey =
      type.toUpperCase() as keyof typeof TransactionType
    if (!(transactionTypeKey in TransactionType)) {
      // console.log('Invalid transaction type: ', type)
      throw new Error(`Invalid transaction type: ${type}`)
    }

    const transactionType = TransactionType[transactionTypeKey]

    const transactions = await transactionRepository.find({
      where: { user, transactionType },
    })

    return res.status(200).json(transactions)
  } catch (error) {
    console.error('Error in getTransactionsByType:', error)
    const { statusCode, message } = await handleError(error as Error)
    console.log(
      'Error handled with status:',
      statusCode,
      'and message:',
      message
    )
    return res.status(statusCode).json({ message })
  }
}
