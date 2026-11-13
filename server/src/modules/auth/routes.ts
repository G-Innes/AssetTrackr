import { RequestHandler, Router } from 'express'
import { parse } from '../../middleware/validate'
import { asyncHandler } from '../../utils/asyncHandler'
import { loginSchema, signupSchema } from './schemas'
import { login, signup } from './service'

export default function authRoutes(rateLimit: RequestHandler): Router {
  const router = Router()
  router.use(rateLimit)

  router.post(
    '/signup',
    asyncHandler(async (req, res) => {
      res.status(201).json(await signup(parse(signupSchema, req.body)))
    })
  )

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      res.json(await login(parse(loginSchema, req.body)))
    })
  )

  return router
}
