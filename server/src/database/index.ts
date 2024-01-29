import { createConnection, Connection } from 'typeorm'
import config from '../config'

export async function createDatabase(): Promise<Connection> {
  const connection = await createConnection(config)
  await connection.synchronize()
  return connection
}
