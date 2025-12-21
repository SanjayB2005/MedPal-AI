/* eslint-disable no-restricted-globals */
// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  if (!event.data) {
    console.log('Push event has no data')
    return
  }

  try {
    const data = event.data.json()
    console.log('Push data:', data)
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'default',
      renotify: true
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  } catch (error) {
    console.error('Error handling push notification:', error)
  }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const clickedAction = event.action
  const notificationData = event.notification.data

  if (clickedAction === 'mark-complete') {
    // Mark reminder as completed
    event.waitUntil(
      fetch('/api/reminders/' + notificationData.reminderId + '/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (notificationData.token || '')
        }
      }).catch(err => console.error('Failed to mark complete:', err))
    )
  } else if (clickedAction === 'snooze') {
    // Snooze for 10 minutes
    setTimeout(() => {
      self.registration.showNotification(event.notification.title, {
        body: event.notification.body + ' (Snoozed)',
        icon: event.notification.icon,
        badge: event.notification.badge,
        data: notificationData
      })
    }, 10 * 60 * 1000)
  } else {
    // Open app
    const urlToOpen = notificationData.url || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there's already a window open
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i]
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus()
            }
          }
          
          // If not, open a new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
})
