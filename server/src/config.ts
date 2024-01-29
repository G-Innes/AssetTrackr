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
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: isTestEnvironment
    ? process.env.TEST_DB_DATABASE
    : process.env.DB_DATABASE,
  entities: [path.join(__dirname, '/entities/*.ts')],
  synchronize: true,
  auth: {
    passwordCost: 10,
    jwtSecret: 'secret-sauce',
    jwtExpiresIn: '1d',
  },
}

export default config
