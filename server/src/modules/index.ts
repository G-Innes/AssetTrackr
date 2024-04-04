import { Router } from 'express'
import userController from './user/userController'
import assetController from './assets/assetController'
import userAuthController from './user/userAuthController'
// import transactionController from './transactions/transactionController'

export const appRouter = Router()

const user = Router()
const asset = Router({ mergeParams: true }) // Preserve the req.params values from the parent router

// Routes for the user module
user.post('/', userAuthController.signup)
user.post('/login', userAuthController.login)
user.get('/user/:userId', userController.getUserProfile)
user.put('/user/:userId', userController.updateUserProfile)
user.delete('/user/:userId', userController.deleteUser)

// Routes for the assets module
asset.post('/', assetController.createAssetHoldingsForUser)
asset.get('/', assetController.getAllAssetHoldingsForUser)
asset.delete('/:assetId', assetController.deleteAssetHoldingsForUser)

appRouter.use('/user', user).use('/user/:userId/assets', asset)

export type AppRouter = typeof appRouter
