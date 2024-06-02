import { Router } from 'express';
import userRoutes from './user/routes';
import assetRoutes from './assets/routes';
import transactionRoutes from './transactions/routes';

export const appRouter = Router();

// Use the imported route files to define routes
appRouter.use('/user', userRoutes);
appRouter.use('/user/:userId/assets', assetRoutes);
appRouter.use('/user/:userId/transactions', transactionRoutes);

export type AppRouter = typeof appRouter;
