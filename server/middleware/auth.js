import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authentication token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash')
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been deactivated'
      })
    }

    // Add user to request object
    req.user = user
    next()

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again'
      })
    }

    console.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error'
    })
  }
}

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token',
        message: 'Refresh token is required'
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found'
      })
    }

    // Generate new access token
    const newToken = generateToken(user._id)
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: user.toJSON()
    })

  } catch (error) {
    return res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Please log in again'
    })
  }
}