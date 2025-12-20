import express from 'express'
import {
  processQuery,
  getSuggestions,
  getPopularQueries,
  healthCheck,
  validateQuery
} from '../controllers/aiController.js'
import { authenticateToken } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Health check endpoint (public)
router.get('/health', healthCheck)

// Get suggestions by category (public)
router.get('/suggestions/:category', getSuggestions)

// Get popular queries (public)
router.get('/popular', getPopularQueries)

// POST /api/ai/query - requires authentication to save history
// Accepts optional file upload (image or PDF)
router.post('/query', authenticateToken, upload.single('file'), validateQuery, processQuery)

// All other endpoints require authentication
router.use(authenticateToken)

export default router