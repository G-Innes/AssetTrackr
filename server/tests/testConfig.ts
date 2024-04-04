import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';
import { User, Asset, UserAssets, Transaction } from '../src/entities';

dotenv.config();

// Config for the test database
const testConfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    entities: [User, Asset, UserAssets, Transaction],
    synchronize: true,
};

export default testConfig;