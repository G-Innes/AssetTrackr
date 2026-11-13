import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import { dataSource } from '../database/dataSource'
import { User } from '../entities'
import { asyncHandler } from '../utils/asyncHandler'
import { unauthorized } from '../utils/errors'

declare module 'express-serve-static-core' {
  interface Request {
    // Set by `requireAuth`; only read it in routes behind that middleware.
    userId: number
  }
}

export function signToken(userId: number): string {
  return jwt.sign({}, config.auth.jwtSecret, {
    subject: String(userId),
    expiresIn: config.auth.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  })
}

/**
 * Identifies the caller from their bearer token. The user id is taken from
 * the verified token and nowhere else - never from the URL or request body -
 * so one user cannot act on another user's data.
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ')
    if (scheme !== 'Bearer' || !token) throw unauthorized()

    let userId: number
    try {
      const payload = jwt.verify(token, config.auth.jwtSecret)
      userId = Number(typeof payload === 'string' ? NaN : payload.sub)
    } catch {
      throw unauthorized('Invalid or expired token')
    }
    if (!Number.isInteger(userId))
      throw unauthorized('Invalid or expired token')

    // A token outlives a deleted account; make sure the user still exists.
    const exists = await dataSource
      .getRepository(User)
      .exist({ where: { id: userId } })
    if (!exists) throw unauthorized('Invalid or expired token')

    req.userId = userId
    next()
  }
)
