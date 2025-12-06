import express from 'express'
import {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount
} from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// GET /api/user/me
router.get('/me', getProfile)

// PUT /api/user/profile
router.put('/profile', updateProfile)

// PUT /api/user/password
router.put('/password', changePassword)

// DELETE /api/user/account
router.delete('/account', deactivateAccount)

export default router