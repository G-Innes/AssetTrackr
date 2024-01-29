import cors from 'cors'
import express, { Request, Response } from 'express'
import { appRouter } from './modules'

export default function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_, res) => {
    res.status(200).send('OK')
  })

  // Routes imported from /module/index.ts
  app.use(appRouter)

  // Error handling middleware
  app.use((err: any, req: Request, res: Response) => {
    console.error(err.stack)
    res.status(500).send('Something went wrong')
  })

  return app
}
