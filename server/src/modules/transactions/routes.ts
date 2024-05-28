import { Router } from 'express';
import transactionsController from './transactionsController';

const router = Router({ mergeParams: true });

// Routes for the transactions module
router.get('/', transactionsController.getAllTransactionsForUser);
router.get('/:assetId', transactionsController.getAllTransactionsForAsset);
router.get('/type/:type', transactionsController.getTransactionsByType);

export default router;
