import { Router } from 'express'
import signupController from './signup/index'
import loginController from './login/index'
import userController from './userController'

const router = Router()

// Routes for user signup
router.post('/', signupController.signup)

// Routes for user login
router.post('/login', loginController.login)

// Routes for user profile management
router.get('/user/:userId', userController.getUserProfile)
router.put('/user/:userId', userController.updateUserProfile)
router.delete('/user/:userId', userController.deleteUser)

export default router
