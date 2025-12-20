import mongoose from 'mongoose'

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['pharmacy', 'cooking', 'electrical', 'household', 'general', 'other'],
    default: 'general'
  },
  userQuery: {
    type: String,
    required: [true, 'User query is required'],
    trim: true,
    maxlength: [1000, 'Query cannot exceed 1000 characters']
  },
  assistantSummary: {
    type: String,
    required: [true, 'Assistant summary is required'],
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },
  structuredResponse: {
    answer_text: {
      type: String,
      required: true
    },
    steps: [{
      type: String,
      maxlength: [500, 'Step cannot exceed 500 characters']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    safety_warnings: [{
      type: String,
      maxlength: [300, 'Warning cannot exceed 300 characters']
    }],
    suggest_professional: {
      type: Boolean,
      default: false
    },
    confidence_score: {
      type: Number,
      min: [0, 'Confidence score must be between 0 and 1'],
      max: [1, 'Confidence score must be between 0 and 1'],
      default: 0.5
    }
  },
  metadata: {
    responseTime: {
      type: Number, // in milliseconds
      default: 0
    },
    tokenCount: {
      type: Number,
      default: 0
    },
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash'
    }
  },
  feedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters'],
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true
})

// Compound indexes for efficient queries
historySchema.index({ userId: 1, createdAt: -1 })
historySchema.index({ userId: 1, category: 1, createdAt: -1 })
historySchema.index({ userId: 1, isBookmarked: 1, createdAt: -1 })
historySchema.index({ userId: 1, 'feedback.helpful': 1, createdAt: -1 })

// Text search index for user queries and assistant summaries
historySchema.index({ 
  userQuery: 'text', 
  assistantSummary: 'text',
  'structuredResponse.answer_text': 'text'
})

// Virtual for response quality score
historySchema.virtual('qualityScore').get(function() {
  let score = this.structuredResponse.confidence_score || 0
  
  if (this.feedback.helpful === true) {
    score += 0.2
  } else if (this.feedback.helpful === false) {
    score -= 0.2
  }
  
  if (this.feedback.rating) {
    score = (score + (this.feedback.rating / 5)) / 2
  }
  
  return Math.max(0, Math.min(1, score))
})

// Instance method to add feedback
historySchema.methods.addFeedback = async function(feedbackData) {
  this.feedback = {
    ...this.feedback,
    ...feedbackData,
    submittedAt: new Date()
  }
  return await this.save()
}

// Instance method to toggle favorite/bookmark
historySchema.methods.toggleFavorite = async function() {
  this.isBookmarked = !this.isBookmarked
  return await this.save()
}

// Static method to find user's recent history
historySchema.statics.findUserHistory = async function(userId, options = {}) {
  const {
    category = null,
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = -1,
    search = null,
    bookmarkedOnly = false
  } = options

  const query = { userId }
  
  if (category && category !== 'all') {
    query.category = category
  }
  
  if (bookmarkedOnly) {
    query.isBookmarked = true
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (page - 1) * limit

  return await this.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email')
}

// Static method to get user statistics
historySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$structuredResponse.confidence_score' },
        helpfulCount: {
          $sum: {
            $cond: [{ $eq: ['$feedback.helpful', true] }, 1, 0]
          }
        }
      }
    }
  ])

  const total = await this.countDocuments({ userId })
  const bookmarked = await this.countDocuments({ userId, isBookmarked: true })

  return {
    totalQueries: total,
    bookmarkedQueries: bookmarked,
    categoriesBreakdown: stats,
    lastQuery: await this.findOne({ userId }).sort({ createdAt: -1 })
  }
}

const History = mongoose.model('History', historySchema)

export default History