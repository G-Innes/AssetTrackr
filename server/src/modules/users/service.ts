import { QueryFailedError } from 'typeorm'
import { dataSource } from '../../database/dataSource'
import { User } from '../../entities'
import { conflict, notFound } from '../../utils/errors'

export interface PublicUser {
  id: number
  username: string
  email: string
  isDemo: boolean
  createdAt: Date
}

/** The only shape of a user that is ever sent to a client. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isDemo: user.isDemo,
    createdAt: user.createdAt,
  }
}

const users = () => dataSource.getRepository(User)

/** Throws a 409 if another account already uses the username or email. */
export async function assertIdentityAvailable(
  identity: { username?: string; email?: string },
  exceptUserId?: number
) {
  const { username, email } = identity
  if (!username && !email) return

  const query = users().createQueryBuilder('user')
  if (username) {
    query.orWhere('lower(user.username) = lower(:username)', { username })
  }
  if (email) query.orWhere('lower(user.email) = lower(:email)', { email })

  const taken = (await query.getMany()).filter((u) => u.id !== exceptUserId)
  if (
    username &&
    taken.some((u) => u.username.toLowerCase() === username.toLowerCase())
  ) {
    throw conflict('Username already in use')
  }
  if (taken.length) throw conflict('Email already in use')
}

/**
 * Two requests can pass the availability check at the same moment; the
 * database's unique indexes are the real guard. Turn that failure into a 409.
 */
export function rethrowUniqueViolation(error: unknown): never {
  const driverError = (error as QueryFailedError & { driverError?: any })
    ?.driverError
  if (error instanceof QueryFailedError && driverError?.code === '23505') {
    throw conflict(
      String(driverError.constraint ?? driverError.detail).includes('email')
        ? 'Email already in use'
        : 'Username already in use'
    )
  }
  throw error
}

export async function getUser(userId: number): Promise<PublicUser> {
  const user = await users().findOne({ where: { id: userId } })
  if (!user) throw notFound('User not found')
  return toPublicUser(user)
}

export async function updateUser(
  userId: number,
  changes: { username?: string; email?: string }
): Promise<PublicUser> {
  await assertIdentityAvailable(changes, userId)
  try {
    await users().update({ id: userId }, changes)
  } catch (error) {
    rethrowUniqueViolation(error)
  }
  return getUser(userId)
}

/** Deletes the account; the user's transactions go with it (FK cascade). */
export async function deleteUser(userId: number): Promise<void> {
  await users().delete({ id: userId })
}
