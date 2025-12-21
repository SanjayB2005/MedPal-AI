import api from '../services/api'

// Check if browser supports notifications
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// Check current notification permission
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'not-supported'
  return Notification.permission
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission denied')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

// Convert base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  try {
    console.log('Starting subscription process...')
    
    // Request permission first (with timeout)
    const permissionTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Permission request timed out')), 10000)
    )
    
    const permissionPromise = requestNotificationPermission()
    const hasPermission = await Promise.race([permissionPromise, permissionTimeout])
    
    if (!hasPermission) {
      return { success: false, message: 'Please allow notifications in your browser to enable this feature.' }
    }

    console.log('Permission granted, registering service worker...')

    // Register service worker with timeout
    const swTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Service worker registration timed out')), 10000)
    )

    let registration = await navigator.serviceWorker.getRegistration()
    
    if (!registration) {
      const registerPromise = navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      registration = await Promise.race([registerPromise, swTimeout])
      console.log('Service Worker registered')
    }

    console.log('Waiting for service worker to be ready...')
    
    // Wait for service worker with timeout
    const readyTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
    )
    await Promise.race([navigator.serviceWorker.ready, readyTimeout])

    console.log('Getting subscription...')

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription()

    // If no subscription exists, create one
    if (!subscription) {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      
      if (!vapidPublicKey) {
        return { success: false, message: 'Notification service not configured properly.' }
      }

      console.log('Creating new push subscription...')

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      const subscribeTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Push subscription timed out')), 15000)
      )

      const subscribePromise = registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      subscription = await Promise.race([subscribePromise, subscribeTimeout])
      console.log('Push subscription created')
    }

    console.log('Sending subscription to server...')

    // Send subscription to server with timeout
    const subscriptionData = {
      subscription: subscription.toJSON(),
      platform: navigator.platform || 'unknown'
    }

    const apiTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Server request timed out')), 10000)
    )

    const apiPromise = api.post('/notifications/subscribe', subscriptionData)
    await Promise.race([apiPromise, apiTimeout])
    
    console.log('Successfully subscribed to push notifications')
    return { success: true, message: 'Notifications enabled successfully!' }
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return { success: false, message: 'Request timed out. Please check your internet connection and try again.' }
    }
    
    return { success: false, message: error.message || 'Failed to enable notifications.' }
  }
}

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    
    if (!registration) {
      console.log('No service worker registration found')
      return true
    }

    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await api.post('/notifications/unsubscribe', {
        endpoint: subscription.endpoint
      })
      
      await subscription.unsubscribe()
      console.log('Unsubscribed from push notifications')
    }
    
    return true
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    throw error
  }
}

// Check if user is subscribed
export const isSubscribedToPushNotifications = async () => {
  try {
    if (!isNotificationSupported()) return false
    if (Notification.permission !== 'granted') return false

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve(false), 5000)
    )

    const checkPromise = (async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return false

      const subscription = await registration.pushManager.getSubscription()
      return !!subscription
    })()

    return await Promise.race([checkPromise, timeoutPromise])
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    return false
  }
}

// Send test notification
export const sendTestNotification = async () => {
  try {
    await api.post('/notifications/test')
    return true
  } catch (error) {
    console.error('Failed to send test notification:', error)
    throw error
  }
}

export default {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  sendTestNotification
}
