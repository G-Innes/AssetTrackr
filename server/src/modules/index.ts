import { Router } from 'express';
import userRoutes from './user/routes'; // Import user routes
import assetRoutes from './assets/routes'; // Import asset routes
import transactionRoutes from './transactions/routes'; // Import transaction routes

export const appRouter = Router();

// Use the imported route files to define routes
appRouter.use('/user', userRoutes);
appRouter.use('/user/:userId/assets', assetRoutes);
appRouter.use('/user/:userId/transactions', transactionRoutes);

export type AppRouter = typeof appRouter;
