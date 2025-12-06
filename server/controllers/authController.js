import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import { asyncHandler, APIError } from '../middleware/errorHandler.js'

// Validation middleware
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
]

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new APIError('Validation failed', 400)
  }
}

// Register new user
export const register = asyncHandler(async (req, res) => {
  console.log('Register endpoint hit with body:', req.body)
  
  checkValidation(req)
  
  const { name, email, password } = req.body
  
  console.log('Validation passed, checking for existing user...')

  // Check if user already exists
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    console.log('User already exists:', email)
    throw new APIError('Email already registered', 409)
  }

  console.log('Creating new user...')
  // Create new user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: password
  })

  console.log('Saving user...')
  await user.save()
  console.log('User saved successfully')

  // Generate token
  const token = generateToken(user._id)
  console.log('Token generated')

  // Update last login
  await user.updateLastLogin()
  console.log('Last login updated')

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: user.toJSON()
  })
})

// Login user
export const login = asyncHandler(async (req, res) => {
  checkValidation(req)
  
  const { email, password } = req.body

  // Find user and include password for comparison
  const user = await User.findByEmail(email)
  if (!user) {
    throw new APIError('Invalid email or password', 401)
  }

  // Check if account is active
  if (!user.isActive) {
    throw new APIError('Account has been deactivated', 401)
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new APIError('Invalid email or password', 401)
  }

  // Generate token
  const token = generateToken(user._id)

  // Update last login
  await user.updateLastLogin()

  res.json({
    message: 'Login successful',
    token,
    user: user.toJSON()
  })
})

// Get current user profile
export const getProfile = asyncHandler(async (req, res) => {
  // User is already attached to req by auth middleware
  res.json({
    message: 'Profile retrieved successfully',
    user: req.user.toJSON()
  })
})

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body
  const user = req.user

  // Update fields if provided
  if (name !== undefined) {
    if (!name.trim() || name.trim().length < 2) {
      throw new APIError('Name must be at least 2 characters long', 400)
    }
    user.name = name.trim()
  }

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences }
  }

  await user.save()

  res.json({
    message: 'Profile updated successfully',
    user: user.toJSON()
  })
})

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = req.user

  if (!currentPassword || !newPassword) {
    throw new APIError('Current password and new password are required', 400)
  }

  if (newPassword.length < 6) {
    throw new APIError('New password must be at least 6 characters long', 400)
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword)
  if (!isCurrentPasswordValid) {
    throw new APIError('Current password is incorrect', 400)
  }

  // Update password
  user.passwordHash = newPassword
  await user.save()

  res.json({
    message: 'Password changed successfully'
  })
})

// Deactivate account
export const deactivateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body
  const user = req.user

  if (!password) {
    throw new APIError('Password confirmation is required', 400)
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new APIError('Password is incorrect', 400)
  }

  // Deactivate account
  user.isActive = false
  await user.save()

  res.json({
    message: 'Account deactivated successfully'
  })
})