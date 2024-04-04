import { createConnection } from 'typeorm';
import config from '../src/config';

// Connect to the in-memory database
beforeAll(async () => {
 await createConnection(config);
});

// Close the database connection after all tests
afterAll(async () => {
 const connection = await createConnection(config);
 await connection.close();
});
