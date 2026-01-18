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

export async function loginUser(usernameOrEmail: string, password: string) {
  // Convert to lowercase and trim whitespace
  const normalizedUsernameOrEmail = usernameOrEmail
    ? usernameOrEmail.toLowerCase().trim()
    : ''

  // Look up the user by username or email
  const user = await getRepository(User)
    .createQueryBuilder('user')
    .where(
      'LOWER(user.username) = :usernameOrEmail OR LOWER(user.email) = :usernameOrEmail',
      { usernameOrEmail: normalizedUsernameOrEmail }
    )
    .getOne()
  // If the user is not found, throw an error
  // Use generic message to prevent account enumeration
  if (!user) {
    throw new Error('Invalid credentials')
  }

  // Check if the password is valid
  const validPassword = await bcrypt.compare(password, user.password)

  // If the password is not valid, throw an error
  // Use same generic message to prevent account enumeration
  if (!validPassword) {
    throw new Error('Invalid credentials')
  }

  // Generate a JWT token for the user
  const token = await generateToken(user)

  // Return the user's id, username, email, and token
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  }
}
