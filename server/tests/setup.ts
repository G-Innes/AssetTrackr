import { dataSource, initDatabase } from '../src/database/dataSource'

// Each spec file connects once and applies the real migrations, so the tests
// run against exactly the schema production gets.
beforeAll(async () => {
  await initDatabase()
})

beforeEach(async () => {
  await dataSource.query(
    'TRUNCATE "transaction", "asset", "user" RESTART IDENTITY CASCADE'
  )
})

afterAll(async () => {
  await dataSource.destroy()
})
