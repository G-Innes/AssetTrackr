import logger from '../utils/logger'
import { initDatabase } from './dataSource'

// `npm run migrate` - applies pending migrations and exits. The server also
// does this on start-up, so this is mainly for running them ahead of a deploy.
initDatabase()
  .then(async (dataSource) => {
    logger.info('Migrations applied')
    await dataSource.destroy()
  })
  .catch((error) => {
    logger.fatal({ err: error }, 'Migration failed')
    process.exit(1)
  })
