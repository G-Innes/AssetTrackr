import pino from 'pino'
import config from '../config'

const logger = pino({
  level: config.isTest ? 'silent' : 'info',
  // Never let credentials reach the logs, whatever gets passed in.
  redact: ['req.headers.authorization', 'password', '*.password'],
})

export default logger
