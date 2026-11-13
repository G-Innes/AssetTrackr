import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Postgres connection string, e.g. postgres://user:pass@host:5432/db
  DATABASE_URL: z.string().min(1).optional(),
  // Used instead of DATABASE_URL when NODE_ENV=test, so tests can never
  // touch a real database by accident.
  TEST_DATABASE_URL: z.string().min(1).optional(),
  // Managed Postgres (Neon, Render) requires TLS; local Postgres usually has none.
  DATABASE_SSL: z.enum(['true', 'false']).optional(),

  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // Comma separated list of origins allowed to call the API from a browser.
  CLIENT_ORIGIN: z
    .string()
    .default(
      'http://localhost:5173,http://localhost:4173,https://asset-trackr-client.vercel.app'
    ),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Invalid environment configuration - ${problems}`)
}

const env = parsed.data
const isProduction = env.NODE_ENV === 'production'
const isTest = env.NODE_ENV === 'test'

// Before DATABASE_URL existed the app read discrete PROD_DB_* / DEV_DB_* /
// TEST_DB_* variables. They are still honoured so an existing deployment
// keeps working until its environment is updated.
function legacyDatabaseUrl(): string | undefined {
  let prefix = 'DEV'
  if (isProduction) prefix = 'PROD'
  if (isTest) prefix = 'TEST'

  const host = process.env[`${prefix}_DB_HOST`]
  const database = process.env[`${prefix}_DB_DATABASE`]
  if (!host || !database) return undefined

  const port = process.env[`${prefix}_DB_PORT`] || '5432'
  const username = encodeURIComponent(
    process.env[`${prefix}_DB_USERNAME`] ?? ''
  )
  const password = encodeURIComponent(
    process.env[`${prefix}_DB_PASSWORD`] ?? ''
  )
  return `postgres://${username}:${password}@${host}:${port}/${database}`
}

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message)
  return value
}

const databaseUrl = required(
  (isTest ? env.TEST_DATABASE_URL : env.DATABASE_URL) ?? legacyDatabaseUrl(),
  isTest
    ? 'TEST_DATABASE_URL is required to run the tests'
    : 'DATABASE_URL is required'
)

const jwtSecret = isProduction
  ? required(
      env.JWT_SECRET,
      'JWT_SECRET (32+ characters) is required in production'
    )
  : (env.JWT_SECRET ?? 'development-only-secret-do-not-use-in-production')

const config = {
  env: env.NODE_ENV,
  isProduction,
  isTest,
  port: env.PORT,
  database: {
    url: databaseUrl,
    ssl: env.DATABASE_SSL ? env.DATABASE_SSL === 'true' : isProduction,
  },
  auth: {
    // bcrypt work factor; kept low in tests so the suite stays fast
    passwordCost: isTest ? 4 : 12,
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },
  clientOrigins: env.CLIENT_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}

export default config
