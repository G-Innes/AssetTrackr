import 'dotenv/config'
import path from 'path'
import { ConnectionOptions } from 'typeorm'

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

// Database connection details
const config: MyConnectionOptions = {
  type: 'postgres',
  host: isTestEnvironment ? process.env.TEST_DB_HOST : process.env.DB_HOST,
  port: Number(
    isTestEnvironment ? process.env.TEST_DB_PORT : process.env.DB_PORT
  ),
  username: isTestEnvironment
    ? process.env.TEST_DB_USERNAME
    : process.env.DB_USERNAME,
  password: isTestEnvironment
    ? process.env.TEST_DB_PASSWORD
    : process.env.DB_PASSWORD,
  database: isTestEnvironment
    ? process.env.TEST_DB_DATABASE
    : process.env.DB_DATABASE,
  entities: [path.join(__dirname, '/entities/*.ts')],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,  // for self-signed certificates
  },
  auth: {
    passwordCost: 10,
    jwtSecret: 'secret-sauce',
    jwtExpiresIn: '1d',
  },
}

export default config
