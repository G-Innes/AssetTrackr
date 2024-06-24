/* eslint-disable no-console */
import pino from 'pino'
import createApp from './app'
import { createDatabase } from './database'

const logger = pino()

logger.info('Starting the application...');

console.log('Attempting to create database connection...');
createDatabase()
  .then(() => {
    logger.info('Database connection established successfully.');
    const app = createApp()

    const port = 3000
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server is running at port: ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error)
    process.exit(1) // Application exits on failure
  })