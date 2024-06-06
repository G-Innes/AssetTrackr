import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import { appRouter } from './modules'

export default function createApp() {
  const app = express(
  )

  // Determine the frontend URL based on the environment
  const frontendURL = process.env.NODE_ENV === 'production' 
    ? 'https:/assettracker.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com'
    : 'http://localhost:3000';

    console.log('Frontend URL:', frontendURL);

// Enable CORS middleware with custom options
  app.use(cors({
    origin: 'https:/assettracker.enrpm9tib5nri.eu-central-1.cs.amazonlightsail.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // Allow cookies and credentials
  }));

  app.use(express.json())

  app.get('/health', (_, res) => {
    res.status(200).send('OK')
  })

  // Routes imported from /module/index.ts
  app.use('/api', appRouter)

  // Handle OPTIONS requests explicitly
  app.options('*', cors());

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(`Error occurred while processing request: ${err.message}`);
    console.log(`Request Method: ${req.method} | Request URL: ${req.originalUrl}`)
    res.setHeader('Access-Control-Allow-Origin', frontendURL);
    console.error(err.stack)
    res.status(500).send('Something went wrong')
    next(err)
  })

  return app
}
