/* eslint-disable no-console */
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import { User, Transaction, Asset, UserAssets, PortfolioSummary, HistoricalData } from '../src/entities';
import testConfig from './testConfig';

dotenv.config();

export default async function seedTestDatabase() {

  try {
    if (!process.env.TEST_DB_DATABASE) {
        throw new Error('TEST_DB_DATABASE is not defined');
        }

      const connection = await createConnection(testConfig);

      const userRepository = connection.getRepository(User);
      const assetRepository = connection.getRepository(Asset);
      const userAssetsRepository = connection.getRepository(UserAssets);
      const transactionRepository = connection.getRepository(Transaction);
      const historicalDataRepository = connection.getRepository(HistoricalData);
      const portfolioSummaryRepository = connection.getRepository(PortfolioSummary);


    // Create and save a new user
    const user = new User();
    user.id = 1;
    user.username = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password';
    await userRepository.save(user);

    // Create and save a new asset
    const asset = new Asset();
    asset.id = 1;
    asset.name = 'Bitcoin';
    asset.ticker = 'BTC';
    asset.current_price = 100;
    await assetRepository.save(asset);

    // Create and save a new UserAssets
    const userAssets = new UserAssets();
    userAssets.user = user;
    userAssets.asset = asset;
    userAssets.quantity = 500;
    await userAssetsRepository.save(userAssets);

    // Create and save a new transaction
    const transaction = new Transaction();
    transaction.user = user;
    transaction.asset = asset;
    transaction.transaction_type = 'buy';
    transaction.quantity = 10;
    transaction.price = 100;
    transaction.transaction_date = new Date();
    await transactionRepository.save(transaction);

      // Create and save new historical data
      const historicalData = new HistoricalData();
      historicalData.asset = asset;
      historicalData.price = 100;
      historicalData.timestamp = new Date();
      await historicalDataRepository.save(historicalData);

      // Create and save a new portfolio summary
      const portfolioSummary = new PortfolioSummary();
      portfolioSummary.total_value = 1000;
      portfolioSummary.user = user;
      portfolioSummary.last_updated = new Date();
      await portfolioSummaryRepository.save(portfolioSummary);

      await connection.close();

      console.log('Database seeded successfully');
      } catch (error) {
        // console.error('Error seeding database:', error);
      } 
}

// seedTestDatabase().catch(console.error);