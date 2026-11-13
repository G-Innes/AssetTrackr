import { dataSource, initDatabase } from '../src/database/dataSource'
import { setMarketDataProvider } from '../src/modules/market/service'
import { fakeMarket, fakeProvider } from './fakeMarket'

// Each spec file connects once and applies the real migrations, so the tests
// run against exactly the schema production gets.
beforeAll(async () => {
  await initDatabase()
})

beforeEach(async () => {
  await dataSource.query(
    'TRUNCATE "transaction", "asset", "user" RESTART IDENTITY CASCADE'
  )
  // A fresh fake market per test; this also empties the price cache.
  fakeMarket.reset()
  setMarketDataProvider(fakeProvider)
})

afterAll(async () => {
  await dataSource.destroy()
})
