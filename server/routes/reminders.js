import express from 'express'
import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  markAsCompleted,
  markAsSkipped,
  resetTodayStatus,
  getStats,
  validateReminder
} from '../controllers/reminderController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// GET /api/reminders - Get all reminders
router.get('/', getReminders)

// GET /api/reminders/stats - Get statistics
router.get('/stats', getStats)

// GET /api/reminders/:id - Get single reminder
router.get('/:id', getReminder)

// POST /api/reminders - Create new reminder
router.post('/', validateReminder, createReminder)

// PUT /api/reminders/:id - Update reminder
router.put('/:id', validateReminder, updateReminder)

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', deleteReminder)

// POST /api/reminders/:id/complete - Mark as completed
router.post('/:id/complete', markAsCompleted)

// POST /api/reminders/:id/skip - Mark as skipped
router.post('/:id/skip', markAsSkipped)

// POST /api/reminders/:id/reset - Reset today's status
router.post('/:id/reset', resetTodayStatus)

export default router
