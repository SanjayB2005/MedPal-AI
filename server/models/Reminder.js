import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['medication', 'household', 'appointment', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'specific_days', 'as_needed'],
    default: 'daily'
  },
  days: [{
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }],
  // Medical-specific fields
  dosage: {
    type: String,
    trim: true,
    maxlength: [100, 'Dosage cannot exceed 100 characters']
  },
  medicationName: {
    type: String,
    trim: true,
    maxlength: [200, 'Medication name cannot exceed 200 characters']
  },
  // Date range
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  // Daily completion tracking
  completionHistory: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'skipped', 'missed'],
      required: true
    },
    completedAt: {
      type: Date
    },
    notes: String
  }],
  // Quick access to today's status
  todayStatus: {
    type: String,
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending'
  },
  lastCompletedAt: {
    type: Date
  },
  // Notification settings
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  reminderMinutesBefore: {
    type: Number,
    default: 15,
    min: 0,
    max: 1440 // Max 24 hours
  }
}, {
  timestamps: true
})

// Compound indexes for efficient queries
reminderSchema.index({ userId: 1, type: 1, status: 1 })
reminderSchema.index({ userId: 1, todayStatus: 1 })
reminderSchema.index({ userId: 1, createdAt: -1 })

// Reset todayStatus at midnight (can be called by cron job)
reminderSchema.statics.resetDailyStatus = async function() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  await this.updateMany(
    { 
      status: 'active',
      $or: [
        { lastCompletedAt: { $lt: startOfDay } },
        { lastCompletedAt: null }
      ]
    },
    { todayStatus: 'pending' }
  )
}

// Instance method to mark as completed
reminderSchema.methods.markAsCompleted = async function(notes = '') {
  const now = new Date()
  
  this.todayStatus = 'completed'
  this.lastCompletedAt = now
  
  this.completionHistory.push({
    date: now,
    status: 'completed',
    completedAt: now,
    notes
  })
  
  return await this.save()
}

// Instance method to mark as skipped
reminderSchema.methods.markAsSkipped = async function(notes = '') {
  const now = new Date()
  
  this.todayStatus = 'skipped'
  
  this.completionHistory.push({
    date: now,
    status: 'skipped',
    notes
  })
  
  return await this.save()
}

// Instance method to reset today's status
reminderSchema.methods.resetTodayStatus = async function() {
  this.todayStatus = 'pending'
  return await this.save()
}

// Static method to get user's reminders
reminderSchema.statics.getUserReminders = async function(userId, options = {}) {
  const {
    type = null,
    status = null,
    todayStatus = null,
    limit = 100,
    sortBy = 'time',
    sortOrder = 1
  } = options

  const query = { userId, status: { $ne: 'cancelled' } }
  
  if (type && type !== 'all') {
    query.type = type
  }
  
  if (status && status !== 'all') {
    query.status = status
  }
  
  if (todayStatus && todayStatus !== 'all') {
    query.todayStatus = todayStatus
  }

  return await this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .populate('userId', 'name email')
}

// Static method to get statistics
reminderSchema.statics.getUserStats = async function(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$todayStatus', 'completed'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$todayStatus', 'pending'] }, 1, 0]
          }
        },
        skipped: {
          $sum: {
            $cond: [{ $eq: ['$todayStatus', 'skipped'] }, 1, 0]
          }
        }
      }
    }
  ])

  // Get adherence rate (last 7 days)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const adherenceData = await this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        status: 'active',
        type: 'medication'
      } 
    },
    { $unwind: '$completionHistory' },
    {
      $match: {
        'completionHistory.date': { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: '$completionHistory.status',
        count: { $sum: 1 }
      }
    }
  ])

  return {
    byType: stats,
    adherence: adherenceData
  }
}

const Reminder = mongoose.model('Reminder', reminderSchema)

export default Reminder
