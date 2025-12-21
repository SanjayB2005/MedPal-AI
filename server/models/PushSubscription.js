import mongoose from 'mongoose'

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient lookups
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 })

// Update lastUsed timestamp on each successful notification
pushSubscriptionSchema.methods.updateLastUsed = async function() {
  this.lastUsed = new Date()
  return this.save()
}

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema)

export default PushSubscription
