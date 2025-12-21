import express from 'express'
import { 
  subscribePush, 
  unsubscribePush, 
  getUserSubscriptions,
  sendTestNotification
} from '../controllers/notificationController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Subscribe to push notifications
router.post('/subscribe', subscribePush)

// Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribePush)

// Get user's subscriptions
router.get('/subscriptions', getUserSubscriptions)

// Send test notification
router.post('/test', sendTestNotification)

export default router
