/* eslint-disable no-console */
import pino from 'pino'
import createApp from './app'
import { createDatabase } from './database'

const logger = pino()

// Initialize database and start server if this file is executed directly
if (require.main === module) {
  logger.info('Starting the application as standalone server...')

  createDatabase()
    .then(() => {
      logger.info('Database connection established successfully.')
      const app = createApp()

      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
      app.listen(port, '0.0.0.0', () => {
        logger.info(`Server is running at port: ${port}`)
      })
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error)
      process.exit(1) // Application exits on failure
    })
}

// Export the createApp function for serverless environments
export default createApp
