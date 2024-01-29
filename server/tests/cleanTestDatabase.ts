/* eslint-disable no-console */
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import testConfig from './testConfig';

dotenv.config();

export default async function cleanTestDatabase() {
  try{
    const connection = await createConnection(testConfig);

    try {
      // Delete all data from the tables
      await connection.synchronize(true);
      } finally {
          // Always close the connection
          await connection.close();
        }

      console.log('Database cleaned successfully');
      } catch (error) {
        // console.error('Error cleaning database:', error);
    }
}

// cleanTestDatabase().catch(console.error);