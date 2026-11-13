import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import config from './config'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/routes'
import marketRoutes from './modules/market/routes'
import portfolioRoutes from './modules/portfolio/routes'
import transactionsRoutes from './modules/transactions/routes'
import usersRoutes from './modules/users/routes'
import logger from './utils/logger'

interface AppOptions {
  /** Max signup/login attempts per IP per 15 minutes. `false` disables it. */
  authAttemptLimit?: number | false
}

export default function createApp({
  authAttemptLimit = config.isTest ? false : 20,
}: AppOptions = {}) {
  const app = express()

  // Hosted behind one reverse proxy (Render); needed for correct client IPs.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet())
  app.use(
    cors({
      // Requests without an Origin header (curl, health checks) are not
      // cross-origin browser requests and need no CORS headers.
      origin: config.clientOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  app.use(express.json({ limit: '10kb' }))

  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.info(
        { method: req.method, url: req.originalUrl, status: res.statusCode },
        'request'
      )
    })
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  // Slows down password guessing and signup spam.
  const authRateLimit =
    authAttemptLimit === false
      ? express.Router()
      : rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: authAttemptLimit,
          standardHeaders: 'draft-7',
          legacyHeaders: false,
          message: {
            message: 'Too many attempts. Please try again in a few minutes.',
          },
        })

  app.use('/api/auth', authRoutes(authRateLimit))
  app.use('/api/me', usersRoutes)
  app.use('/api/portfolio', portfolioRoutes)
  app.use('/api/market', marketRoutes)
  app.use('/api/transactions', transactionsRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
