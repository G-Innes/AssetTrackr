import createApp from './app'
import config from './config'
import { initDatabase } from './database/dataSource'
import logger from './utils/logger'

async function main() {
  await initDatabase()
  logger.info('Database connected and migrations applied')

  createApp().listen(config.port, '0.0.0.0', () => {
    logger.info(`Server listening on port ${config.port}`)
  })
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start')
  process.exit(1)
})
