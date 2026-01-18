import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: number
  }
}

// Middleware to verify JWT token and attach user to request
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, config.auth!.jwtSecret) as {
      user: { id: number }
    }
    req.user = decoded.user
    return next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// Middleware to verify user owns the resource they're accessing
export function authorizeUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const requestedUserId = Number(req.params.userId)
  const authenticatedUserId = req.user?.id

  if (!authenticatedUserId) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ message: 'Access denied' })
  }

  return next()
}
