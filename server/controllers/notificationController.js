import PushSubscription from '../models/PushSubscription.js'
import webpush from '../config/webpush.js'

// Subscribe to push notifications
export const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body
    const userId = req.user._id

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' })
    }

    // Get device info
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      platform: req.body.platform || 'unknown'
    }

    // Save or update subscription
    await PushSubscription.findOneAndUpdate(
      { userId, endpoint: subscription.endpoint },
      { 
        userId, 
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        deviceInfo,
        lastUsed: new Date()
      },
      { upsert: true, new: true }
    )

    console.log('Push subscription saved for user:', userId)

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to push notifications' 
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    res.status(500).json({ error: 'Failed to subscribe to notifications' })
  }
}

// Unsubscribe from push notifications
export const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body
    const userId = req.user._id

    await PushSubscription.deleteOne({ userId, endpoint })

    res.json({ 
      success: true, 
      message: 'Successfully unsubscribed from push notifications' 
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    res.status(500).json({ error: 'Failed to unsubscribe' })
  }
}

// Get all subscriptions for a user
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id
    const subscriptions = await PushSubscription.find({ userId })
    
    res.json({ subscriptions: subscriptions.length })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    res.status(500).json({ error: 'Failed to get subscriptions' })
  }
}

// Send push notification to specific user
export const sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ userId })

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId)
      return
    }

    const notificationPayload = JSON.stringify(payload)

    const notifications = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          notificationPayload
        )
        
        // Update last used timestamp
        await sub.updateLastUsed()
        
        return { success: true, endpoint: sub.endpoint }
      } catch (error) {
        console.error('Push notification error for endpoint:', sub.endpoint, error)
        
        // Remove invalid subscriptions (expired or unsubscribed)
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removing invalid subscription:', sub.endpoint)
          await PushSubscription.findByIdAndDelete(sub._id)
        }
        
        return { success: false, endpoint: sub.endpoint, error: error.message }
      }
    })

    const results = await Promise.all(notifications)
    const successCount = results.filter(r => r.success).length
    
    console.log(`Sent ${successCount}/${subscriptions.length} push notifications to user:`, userId)
    
    return results
  } catch (error) {
    console.error('Send push notification error:', error)
    throw error
  }
}

// Test notification endpoint
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user._id

    const payload = {
      title: '🔔 Test Notification',
      body: 'Push notifications are working! You will receive reminder notifications at scheduled times.',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/reminders',
        dateOfArrival: Date.now()
      }
    }

    await sendPushNotification(userId, payload)

    res.json({ 
      success: true, 
      message: 'Test notification sent successfully' 
    })
  } catch (error) {
    console.error('Send test notification error:', error)
    res.status(500).json({ error: 'Failed to send test notification' })
  }
}

export default {
  subscribePush,
  unsubscribePush,
  getUserSubscriptions,
  sendPushNotification,
  sendTestNotification
}
