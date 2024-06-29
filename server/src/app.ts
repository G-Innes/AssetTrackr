import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import pino from 'pino'
import { appRouter } from './modules'

const logger = pino()

export default function createApp() {
  const app = express()

  // Define all possible frontend URLs
  const frontendURLs = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://assettrackr.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com',
  ]

  // Enable CORS middleware with custom options
  app.use(
    (req, res, next) => {
      next()
    },
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
      credentials: true, // Allow cookies and credentials
    })
  )

  app.use(express.json())

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
    res.setHeader('Access-Control-Allow-Origin', frontendURLs)
    logger.error(err.stack)
    res.status(500).send('Something went wrong')
    next(err)
  })

  return app
}
