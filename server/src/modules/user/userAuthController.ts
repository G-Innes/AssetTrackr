import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getRepository } from 'typeorm'
import { z } from 'zod'
import config from '../../config'
import { handleError } from '../../utils/errorHandlingUtils'
import { User, UserInsert, userInsertSchema } from '../../entities/user'

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

export default {
  // function to create a new user
  async signup(req: Request, res: Response) {
    try {
      // Destructure username, email, and password from request body
      const { username, email, password } = req.body

      // Ensure username, email, and password are defined
      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'Username, email, and password are required',
        })
      }

      // Validate the user input
      const userInsert: Partial<UserInsert> = userInsertSchema
        .omit({ transactions: true, userAssets: true }) // Omit transactions and userAssets from the schema as user will not have access to these yet
        .partial() // Make all properties optional to allow for partial updates
        .parse(req.body)

      // Hash the password
      const hash = await bcrypt.hash(
        userInsert.password!,
        config.auth!.passwordCost
      )

      // Check for duplicate emails
      const existingUser = await getRepository(User).findOne({
        where: { email: email.toLowerCase().trim() },
      })
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use',
        })
      }

      // Save the new user to the database
      const user = await getRepository(User).save({
        ...userInsert,
        transactions: [],
        userAssets: [],
        password: hash,
      })

      // Generate a JWT token for the user
      const token = await generateToken(user)

      // Return a 201 status code with the user's id, username, email, and token
      return res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      })
    } catch (error) {
      // If an error occurs, Ensure it's an instance of Error
      if (error instanceof Error) {
        // If it is, handle the error and return the status code and message
        const { statusCode, message } = await handleError(error)
        return res.status(statusCode).json({ message })
      }
      // Handle the case where error is not an instance of Error
      return res.status(500).json({ message: 'An unexpected error occurred' })
    }
  },

  // function to login a user
  async login(req: Request, res: Response) {
    // schema for the login data
    const loginSchema = z.object({
      usernameOrEmail: z.string().min(1),
      password: z.string().min(8),
    })
    // type for login data
    type LoginData = z.infer<typeof loginSchema>
    try {
      // Parse the request body into the login data
      const loginData: LoginData = loginSchema.parse(req.body)

      // Destructure usernameOrEmail and password from the login data
      let { usernameOrEmail } = loginData
      const { password } = loginData

      // Convert to lowercase and trim whitespace
      usernameOrEmail = usernameOrEmail.toLowerCase().trim()

      console.log('login req.body:', req.body)

      // Look up the user by username or email
      const user = await getRepository(User)
        .createQueryBuilder('user')
        .where(
          'LOWER(user.username) = :usernameOrEmail OR LOWER(user.email) = :usernameOrEmail',
          { usernameOrEmail }
        )
        .getOne()
      console.log('login user:', user)

      // If the user is not found, return a 400 status and message
      if (!user) {
        return res.status(400).json({
          message: 'Invalid username or email',
        })
      }
      // Check if the password is valid
      const validPassword = await bcrypt.compare(password!, user.password)

      if (!validPassword) {
        return res.status(401).json({
          code: 'Unauthorized',
          message: 'Invalid password',
        })
      }
      try {
        // Generate a JWT token for the user
        const token = await generateToken(user)

        // Return the user's id, username, email, and token
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          token,
        })
      } catch (error) {
        console.log('Error generating token:', error)
        // If an error occurs while generating the token, log the error and return a 500 status code
        return res.status(500).json({
          message: 'An error occurred while generating the token',
        })
      }
    } catch (error) {
      console.log('login error:', error)

      if (error instanceof Error) {
        const { statusCode, message } = await handleError(error)
        return res.status(statusCode).json({ message })
      }
      // Handle the case where error is not an instance of Error
      return res.status(500).json({ message: 'An unexpected error occurred' })
    }
  },
}
