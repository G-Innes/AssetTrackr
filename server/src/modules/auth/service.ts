import bcrypt from 'bcrypt'
import config from '../../config'
import { dataSource } from '../../database/dataSource'
import { User } from '../../entities'
import { signToken } from '../../middleware/auth'
import { unauthorized } from '../../utils/errors'
import {
  PublicUser,
  assertIdentityAvailable,
  rethrowUniqueViolation,
  toPublicUser,
} from '../users/service'
import { LoginInput, SignupInput } from './schemas'

export interface AuthResult {
  user: PublicUser
  token: string
}

const users = () => dataSource.getRepository(User)

// Compared against when the account does not exist, so that a login attempt
// takes the same time either way and reveals nothing about who has signed up.
const dummyHash = bcrypt.hashSync(
  'not-a-real-password',
  config.auth.passwordCost
)

export async function signup(input: SignupInput): Promise<AuthResult> {
  await assertIdentityAvailable(input)

  const passwordHash = await bcrypt.hash(
    input.password,
    config.auth.passwordCost
  )
  try {
    const user = await users().save(
      users().create({
        username: input.username,
        email: input.email,
        passwordHash,
      })
    )
    return { user: toPublicUser(user), token: signToken(user.id) }
  } catch (error) {
    return rethrowUniqueViolation(error)
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await users()
    .createQueryBuilder('user')
    .addSelect('user.passwordHash')
    .where('lower(user.username) = :id OR lower(user.email) = :id', {
      id: input.usernameOrEmail,
    })
    .getOne()

  const passwordMatches = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? dummyHash
  )
  // One message for both failures: never reveal which part was wrong.
  if (!user || !passwordMatches) throw unauthorized('Invalid credentials')

  return { user: toPublicUser(user), token: signToken(user.id) }
}
