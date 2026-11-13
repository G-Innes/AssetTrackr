import { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Express 4 does not catch rejected promises. Wrapping a handler forwards any
 * failure to the error middleware, so a request can never be left hanging.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}
