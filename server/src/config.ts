/* eslint-disable no-nested-ternary */
import 'dotenv/config'
import { ConnectionOptions } from 'typeorm'
import { User } from './entities/user'
import { Asset } from './entities/asset'
import { Transaction } from './entities/transaction'
import { UserAssets } from './entities/userAssets'

// Interface that represents authentication options
interface AuthOptions {
  passwordCost: number
  jwtSecret: string
  jwtExpiresIn: string
}

type MyConnectionOptions = ConnectionOptions & {
  auth?: AuthOptions
}

// Checks if the application is running in a test environment.
const isTestEnvironment = process.env.NODE_ENV === 'test'
const isProductionEnvironment = process.env.NODE_ENV === 'production'

// Database connection details
const baseConfig: Partial<MyConnectionOptions> = {
  type: 'postgres',
  host: isTestEnvironment
    ? process.env.TEST_DB_HOST
    : isProductionEnvironment
      ? process.env.PROD_DB_HOST
      : process.env.DEV_DB_HOST,
  port: Number(
    isTestEnvironment
      ? process.env.TEST_DB_PORT
      : isProductionEnvironment
        ? process.env.PROD_DB_PORT
        : process.env.DEV_DB_PORT
  ),
  username: isTestEnvironment
    ? process.env.TEST_DB_USERNAME
    : isProductionEnvironment
      ? process.env.PROD_DB_USERNAME
      : process.env.DEV_DB_USERNAME,
  password: isTestEnvironment
    ? process.env.TEST_DB_PASSWORD
    : isProductionEnvironment
      ? process.env.PROD_DB_PASSWORD
      : process.env.DEV_DB_PASSWORD,
  database: isTestEnvironment
    ? process.env.TEST_DB_DATABASE
    : isProductionEnvironment
      ? process.env.PROD_DB_DATABASE
      : process.env.DEV_DB_DATABASE,
  entities: [User, Asset, Transaction, UserAssets],
  synchronize: true,
  auth: {
    passwordCost: 10,
    jwtSecret: process.env.JWT_SECRET || (isProductionEnvironment
      ? (() => { throw new Error('JWT_SECRET environment variable is required in production') })()
      : 'dev-secret-do-not-use-in-prod'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
}

// Conditionally add SSL configuration for non-test environments
const config: MyConnectionOptions = {
  ...baseConfig,
  ssl: isProductionEnvironment
    ? { rejectUnauthorized: false }
    : isTestEnvironment
      ? false
      : { rejectUnauthorized: false },
} as MyConnectionOptions

// Logging database configuration
// console.log('Database Configuration:', config);

export default config
