import { createConnection } from 'typeorm'
import config from '../config'

async function resetDatabase() {
  const connection = await createConnection(config)

  // DROP ALL DATA from the database.
  await connection.dropDatabase()
  console.log('Database dropped successfully')

  // Create the database again
  await connection.synchronize()
  console.log('Database created successfully')

  await connection.close()
}

resetDatabase().catch(console.error)
