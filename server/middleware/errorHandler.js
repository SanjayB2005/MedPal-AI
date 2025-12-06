export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }))

    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]

    return res.status(409).json({
      error: 'Duplicate Entry',
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
      field: field
    })
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Invalid resource ID format'
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Authentication failed'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Please log in again'
    })
  }

  // Express validation errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    })
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'File size exceeds the allowed limit'
    })
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    })
  }

  // Custom API errors
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      error: err.name || 'API Error',
      message: err.message
    })
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'Database connection failed. Please try again later.'
    })
  }

  // Gemini API errors
  if (err.message?.includes('quota') || err.message?.includes('429')) {
    return res.status(503).json({
      error: 'AI Service Unavailable',
      message: 'AI service is temporarily busy. Please try again in a moment.'
    })
  }

  // Default server error
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment 
      ? err.message 
      : 'An unexpected error occurred. Please try again later.',
    ...(isDevelopment && { stack: err.stack })
  })
}

// Custom error class for operational errors
export class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}