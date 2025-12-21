import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'

// Import routes
import authRoutes from '../routes/auth.js'
import userRoutes from '../routes/user.js'
import aiRoutes from '../routes/ai.js'
import historyRoutes from '../routes/history.js'
import reminderRoutes from '../routes/reminders.js'
import medicalRecordRoutes from '../routes/medicalRecords.js'
import notificationRoutes from '../routes/notifications.js'
import { connectDB } from '../utils/database.js'
import { errorHandler } from '../middleware/errorHandler.js'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()

// CORS - Allow everything
app.use(cors())

// Basic middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB once
let isConnected = false
async function ensureDbConnection() {
  if (!isConnected && process.env.MONGODB_URI) {
    try {
      await connectDB()
      isConnected = true
    } catch (err) {
      console.error('MongoDB connection error:', err)
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
  res.json({ message: 'MedPal AI API', status: 'running' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/medical-records', medicalRecordRoutes)
app.use('/api/notifications', notificationRoutes)

// Error handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

// Serverless handler
export default async function handler(req, res) {
  await ensureDbConnection()
  return app(req, res)
}
