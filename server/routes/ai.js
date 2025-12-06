import express from 'express'
import {
  processQuery,
  getSuggestions,
  getPopularQueries,
  healthCheck,
  validateQuery
} from '../controllers/aiController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Health check endpoint (public)
router.get('/health', healthCheck)

// Get suggestions by category (public)
router.get('/suggestions/:category', getSuggestions)

// Get popular queries (public)
router.get('/popular', getPopularQueries)

// All query endpoints require authentication
router.use(authenticateToken)

// POST /api/ai/query (requires authentication)
router.post('/query', validateQuery, processQuery)

export default router