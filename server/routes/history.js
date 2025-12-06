import express from 'express'
import {
  getHistory,
  getHistoryItem,
  toggleFavorite,
  addFeedback,
  deleteHistoryItem,
  getAnalytics,
  clearHistory,
  validateFeedback,
  validateHistoryQuery
} from '../controllers/historyController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// GET /api/history
router.get('/', validateHistoryQuery, getHistory)

// GET /api/history/analytics
router.get('/analytics', getAnalytics)

// GET /api/history/:id
router.get('/:id', getHistoryItem)

// POST /api/history/:id/feedback
router.post('/:id/feedback', validateFeedback, addFeedback)

// PUT /api/history/:id/favorite
router.put('/:id/favorite', toggleFavorite)

// DELETE /api/history/:id
router.delete('/:id', deleteHistoryItem)

// DELETE /api/history (clear all)
router.delete('/', clearHistory)

export default router