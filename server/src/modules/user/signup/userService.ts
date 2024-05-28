import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getRepository } from 'typeorm'
import { z } from 'zod'
import config from '../../../config'
import { User } from '../../../entities/user'

// Schema for the JWT token payload
const tokenPayloadSchema = z.object({
  user: z.object({
    id: z.number(),
  }),
})
// Type for the JWT token payload
type TokenPayload = z.infer<typeof tokenPayloadSchema>

// Define an interface that extends the User entity
interface UserWithToken extends User {
    token: string;
  }

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

export async function signupUser(data: any): Promise<UserWithToken> {
  // Validate the user input (if needed)
  // ...

  // Hash the password
  const hash = await bcrypt.hash(data.password, config.auth!.passwordCost)

  // Check for duplicate emails
  const existingUser = await getRepository(User).findOne({
    where: { email: data.email.toLowerCase().trim() },
  })
  if (existingUser) {
    throw new Error('Email already in use')
  }

  // Save the new user to the database
  const newUser = await getRepository(User).save({
    username: data.username,
    email: data.email.toLowerCase().trim(),
    password: hash,
  })

  // Generate a JWT token for the user
  const token = await generateToken(newUser)

  // Return a new object with token property
  return { ...newUser, token };
}
