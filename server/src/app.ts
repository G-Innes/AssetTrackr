import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import pino from 'pino'
import { appRouter } from './modules'

const logger = pino()

export default function createApp() {
  const app = express()

  // Security headers
  app.use(helmet())

  // Define allowed frontend origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'https://asset-trackr-client.vercel.app',
    // Add any custom domains here
  ]

  // CORS configuration - only allow specific origins
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true)
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )

  app.use(express.json())

  // Add logging middleware to debug requests
  app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`)
    next()
  })

  // Handle OPTIONS requests explicitly
  app.options('*', cors())

  app.get('/api/health', (req, res) => {
    try {
      // Add any necessary health checks here
      logger.info('Health check passed')
      res.status(200).json({ status: 'ok' })
    } catch (error) {
      const typeError = error as Error
      logger.error('Health check failed', { error: typeError.message })
      res.status(500).json({ status: 'error', message: typeError.message })
    }
  })

  // Routes imported from /module/index.ts
  app.use('/api', appRouter)

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Log error details in development, sanitized in production
    if (process.env.NODE_ENV === 'production') {
      logger.error({ message: err.message, url: req.url, method: req.method })
    } else {
      logger.error(err.stack)
    }
    res.status(500).json({ message: 'Something went wrong' })
  })

  return app
}
