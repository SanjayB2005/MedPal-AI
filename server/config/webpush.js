import webpush from 'web-push'
import dotenv from 'dotenv'

dotenv.config()

// VAPID details for web push notifications
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@medpal.com'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export default webpush
