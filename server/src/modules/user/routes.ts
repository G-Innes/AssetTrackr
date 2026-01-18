import { Router } from 'express'
import signupController from './signup/index'
import loginController from './login/index'
import userController from './userController'
import { authenticateToken, authorizeUser } from '../../middleware/auth'

const router = Router()

// Public routes (no auth required)
router.post('/', signupController.signup)
router.post('/login', loginController.login)

// Protected routes (require auth + user ownership)
router.get(
  '/user/:userId',
  authenticateToken,
  authorizeUser,
  userController.getUserProfile
)
router.put(
  '/user/:userId',
  authenticateToken,
  authorizeUser,
  userController.updateUserProfile
)
router.delete(
  '/user/:userId',
  authenticateToken,
  authorizeUser,
  userController.deleteUser
)

export default router
