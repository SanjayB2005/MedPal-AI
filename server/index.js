
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
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

// Connect to MongoDB (non-blocking for Vercel)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err)
  // Don't exit the process, let it continue for health checks
})

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://med-pal-ai-ww4y.vercel.app',
  'https://med-pal-ai.vercel.app'
]

// Add CLIENT_URL from environment if it exists
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL)
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true)
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))

// Trust proxy - required for Vercel and other proxies
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use(limiter)

// AI endpoint specific rate limiting (stricter)
const aiLimiter = rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: {
    error: 'Too many AI requests, please wait a moment before trying again.'
  }
})

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
app.use(morgan('combined'))

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
app.use('/api/ai', aiLimiter, aiRoutes)
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