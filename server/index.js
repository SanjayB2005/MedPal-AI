
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import { connectDB } from './utils/database.js'
import { errorHandler } from './middleware/errorHandler.js'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import aiRoutes from './routes/ai.js'
import historyRoutes from './routes/history.js'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// Updated: December 6, 2025 - Fixed CORS and rate limiter for Vercel

// Connect to MongoDB (non-blocking for Vercel)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err)
  // Don't exit the process, let it continue for health checks
})

// Simple CORS - Allow everything
app.use(cors())

// Basic middleware
app.use(compression())

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Home Assistant API is running',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/history', historyRoutes)

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  })
})

// Global error handler
app.use(errorHandler)

// Start server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000
  const server = app.listen(PORT, () => {
    console.log(`🚀 AI Home Assistant server running on port ${PORT}`)
    console.log(`🏠 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    server.close(() => {
      console.log('Process terminated')
    })
  })

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...')
    server.close(() => {
      console.log('Process terminated')
    })
  })
}

// Export for Vercel
export default app