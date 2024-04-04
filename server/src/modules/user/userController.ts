import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { User } from '../../entities/user'
import { handleError } from '../../utils/errorHandlingUtils'

export default {
  // function to get user profile
  async getUserProfile(req: Request, res: Response) {
    try {
      // Extract user ID
      const userId = Number(req.params.userId)

      // Fetch user from the database using user ID
      const user = await getRepository(User).findOne({ where: { id: userId } })

      // Check if user exists
      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }
      // Return user data
      return res.json(user)
    } catch (error: any) {
      const { statusCode, message } = await handleError(error)
      return res.status(statusCode).json({ message })
    }
  },

  // function to update user profile
  async updateUserProfile(req: Request, res: Response) {
    // Extract user ID and new data from request body
    const userId = Number(req.params.userId)
    const { username, email } = req.body

    try {
      // Fetch user from the database using user ID
      const user = await getRepository(User).findOne({ where: { id: userId } })

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }
      // Update user data and save to the database
      user.username = username
      user.email = email
      await getRepository(User).save(user)

      return res.json(user)
    } catch (error: any) {
      const { statusCode, message } = await handleError(error)
      return res.status(statusCode).json({ message })
    }
  },

  // Function to delete a user profile
  async deleteUser(req: Request, res: Response) {
    const userId = Number(req.params.userId)

    try {
      // Delete user from the database using user ID
      const result = await getRepository(User).delete({ id: userId })
      console.log('deleteUser result:', result)

      // If no rows were affected, throw an error
      if (!result.affected) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }
      // 204 status to indicate successful deletion
      return res.status(204).send()
    } catch (error: any) {
      const { statusCode, message } = await handleError(error)
      return res.status(statusCode).json({ message })
    }
  },
}
