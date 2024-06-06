import { createConnection, Connection } from 'typeorm'
import config from '../config'

export async function createDatabase(): Promise<Connection> {
  try {
    console.log('Attempting to establish database connection...');
    const connection = await createConnection(config)
    console.log('Database connection established successfully.');
    await connection.synchronize()
    console.log('Database schema synchronized.');
    return connection
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}
