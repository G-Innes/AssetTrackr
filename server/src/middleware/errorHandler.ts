import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/errors'
import logger from '../utils/logger'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` })
}

// Express recognises error middleware by its four arguments.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ message: err.message, details: err.details })
  }

  // body-parser reports malformed or oversized JSON with its own status
  const status = (err as { status?: number })?.status
  if (status === 400 || status === 413) {
    return res.status(status).json({ message: 'Invalid request body' })
  }

  // Anything else is a bug or an outage: log it in full, tell the client nothing.
  logger.error(
    { err, method: req.method, url: req.originalUrl },
    'Unhandled error'
  )
  return res.status(500).json({ message: 'Something went wrong' })
}
