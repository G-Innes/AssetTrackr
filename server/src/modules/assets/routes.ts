import { Router } from 'express'
import assetController from './assetsController'
import { authenticateToken, authorizeUser } from '../../middleware/auth'

const router = Router({ mergeParams: true })

// All asset routes require authentication and user ownership
router.use(authenticateToken, authorizeUser)

router.post('/', assetController.createAssetHoldingsForUser)
router.get('/', assetController.getAllAssetHoldingsForUser)
router.delete('/:assetId', assetController.deleteAssetHoldingsForUser)

export default router
