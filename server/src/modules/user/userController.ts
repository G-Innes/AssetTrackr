import { Request, Response } from 'express'
import { getRepository, EntityNotFoundError } from 'typeorm'
import { User } from '../../entities/user'

// Error handling function
// If the error is an EntityNotFoundError, return a 404 status
// Otherwise, return a 500 status
async function handleError(error: any, res: Response) {
  console.log('Error:', error)

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
  // function to get user profile
  async getUserProfile(req: Request, res: Response) {
    // Extract user ID
    const userId = Number(req.params.userId)
    console.log('getUserProfile userId:', userId)

    try {
      // Fetch user from the database using user ID
      const user = await getRepository(User).findOne({ where: { id: userId } })
      console.log('getUserProfile user:', user)
      console.log('User ID:', userId)

      // Check if user exists
      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }
      // Return user data
      return res.json(user)
    } catch (error: any) {
      console.log('getUserProfile error:', error)

      return handleError(error, res)
    }
  },

  // function to update user profile
  async updateUserProfile(req: Request, res: Response) {
    // Extract user ID and new data from request body
    const userId = Number(req.params.userId)
    const { username, email } = req.body
    console.log('updateUserProfile userId:', userId)
    console.log('updateUserProfile req.body:', req.body)

    try {
      // Fetch user from the database using user ID
      const user = await getRepository(User).findOne({ where: { id: userId } })
      console.log('updateUserProfile user before update:', user)

      if (!user) {
        throw new EntityNotFoundError(User, `User not found with id: ${userId}`)
      }
      // Update user data and save to the database
      user.username = username
      user.email = email
      await getRepository(User).save(user)
      console.log('updateUserProfile user after update:', user)

      return res.json(user)
    } catch (error: any) {
      console.log('updateUserProfile error:', error)

      return handleError(error, res)
    }
  },

  // Function to delete a user profile
  async deleteUser(req: Request, res: Response) {
    const userId = Number(req.params.userId)
    console.log('deleteUser userId:', userId)

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
      console.log('deleteUser error:', error)

      return handleError(error, res)
    }
  },
}
