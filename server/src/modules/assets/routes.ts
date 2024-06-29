import { Router } from 'express'
import assetController from './assetsController'

const router = Router({ mergeParams: true })

// Routes for the assets module
router.post('/', assetController.createAssetHoldingsForUser)
router.get('/', assetController.getAllAssetHoldingsForUser)
router.delete('/:assetId', assetController.deleteAssetHoldingsForUser)

export default router
