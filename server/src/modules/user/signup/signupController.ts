import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getRepository } from 'typeorm'
import { z } from 'zod'
import config from '../../../config'
import { handleError } from '../../../utils/errorHandlingUtils'
import { User, UserInsert, userInsertSchema } from '../../../entities/user'

// Schema for the JWT token payload
const tokenPayloadSchema = z.object({
  user: z.object({
    id: z.number(),
  }),
})
// Type for the JWT token payload
type TokenPayload = z.infer<typeof tokenPayloadSchema>

// Function to generate a JWT token for a user
async function generateToken(user: User) {
  // Parse the user's id into the token payload
  const tokenPayload: TokenPayload = tokenPayloadSchema.parse({
    user: { id: user.id },
  })
  // Sign the token with the JWT secret and set the expiration time
  const token = jwt.sign(tokenPayload, config.auth!.jwtSecret, {
    expiresIn: config.auth!.jwtExpiresIn,
  })

  return token
}

export async function signup(req: Request, res: Response) {
  try {
    // Destructure username, email, and password from request body
    const { email, userName, password, confirmPassword } = req.body

    console.log('Signup request received:', {
      email,
      userName,
      hasPassword: !!password,
      hasConfirmPassword: !!confirmPassword,
    })

    // Ensure username, email, and password are defined
    if (!email || !userName || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'Username, email, and password & confirmation are required',
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords should match',
      })
    }

    // Validate the user input
    try {
      const userInsert: Partial<UserInsert> = userInsertSchema
        .omit({ transactions: true, userAssets: true }) // Omit transactions and userAssets from the schema as user will not have access to these yet
        .partial() // Make all properties optional to allow for partial updates
        .parse(req.body)

      console.log('User validation passed')

      // Hash the password
      const hash = await bcrypt.hash(
        userInsert.password!,
        config.auth!.passwordCost
      )

      // Check for duplicate emails
      console.log('Checking for duplicate email...')
      const existingUser = await getRepository(User).findOne({
        where: { email: email.toLowerCase().trim() },
      })
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use',
        })
      }

      console.log('Saving new user...')
      // Save the new user to the database
      const user = await getRepository(User).save({
        ...userInsert,
        username: userName,
        transactions: [],
        userAssets: [],
        password: hash,
      })

      console.log('User saved, generating token...')
      // Generate a JWT token for the user
      const token = await generateToken(user)

      console.log('User registration successful')
      // Return a 201 status code with the user's id, username, email, and token
      return res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      })
    } catch (validationError) {
      console.error('Validation error:', validationError)
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validationError.errors,
        })
      }
      throw validationError
    }
  } catch (error) {
    console.error('Signup error:', error)

    // If an error occurs, Ensure it's an instance of Error
    if (error instanceof Error) {
      // If it is, handle the error and return the status code and message
      const { statusCode, message } = await handleError(error)
      return res.status(statusCode).json({ message })
    }
    // Handle the case where error is not an instance of Error
    return res.status(500).json({ message: 'An unexpected error occurred' })
  }
}
