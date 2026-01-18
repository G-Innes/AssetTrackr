import { Router } from 'express'
import transactionsController from './transactionsController'
import { authenticateToken, authorizeUser } from '../../middleware/auth'

const router = Router({ mergeParams: true })

// All transaction routes require authentication and user ownership
router.use(authenticateToken, authorizeUser)

router.get('/', transactionsController.getAllTransactionsForUser)
router.get('/:assetId', transactionsController.getAllTransactionsForAsset)
router.get('/type/:type', transactionsController.getTransactionsByType)

export default router
