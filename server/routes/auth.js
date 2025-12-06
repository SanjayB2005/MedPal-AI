import express from 'express'
import {
  register,
  login,
  validateRegister,
  validateLogin
} from '../controllers/authController.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', validateRegister, register)

// POST /api/auth/login
router.post('/login', validateLogin, login)

export default router