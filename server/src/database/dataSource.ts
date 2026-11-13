import 'reflect-metadata'
import { DataSource } from 'typeorm'
import config from '../config'
import { Asset, Transaction, User } from '../entities'
import { LegacyBaseline1700000000000 } from './migrations/1700000000000-LegacyBaseline'
import { TransactionLedger1763000000000 } from './migrations/1763000000000-TransactionLedger'
import { DemoAccounts1763100000000 } from './migrations/1763100000000-DemoAccounts'

export const dataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  ssl: config.database.ssl,
  entities: [User, Asset, Transaction],
  // Listed explicitly (rather than by glob) so they survive bundling.
  migrations: [
    LegacyBaseline1700000000000,
    TransactionLedger1763000000000,
    DemoAccounts1763100000000,
  ],
  // The schema is only ever changed by migrations.
  synchronize: false,
})

/** Connects and brings the schema up to date. */
export async function initDatabase(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
  }
  await dataSource.runMigrations({ transaction: 'each' })
  return dataSource
}
