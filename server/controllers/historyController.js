import { body, query, validationResult } from 'express-validator'
import History from '../models/History.js'
import { asyncHandler, APIError } from '../middleware/errorHandler.js'

// Validation middleware
export const validateFeedback = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('helpful')
    .optional()
    .isBoolean()
    .withMessage('Helpful must be a boolean'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
]

export const validateHistoryQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['pharmacy', 'cooking', 'electrical', 'household', 'general', 'all'])
    .withMessage('Invalid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
]

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg)
    throw new APIError(`Validation failed: ${errorMessages.join(', ')}`, 400)
  }
}

// Get user's query history
export const getHistory = asyncHandler(async (req, res) => {
  checkValidation(req)
  
  const userId = req.user._id
  console.log('Getting history for user:', userId)
  
  const {
    page = 1,
    limit = 20,
    category,
    favorite,
    search
  } = req.query

  console.log('History query params:', { page, limit, category, favorite, search })

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    favorite: favorite === 'true',
    search
  }

  // Remove undefined values
  Object.keys(options).forEach(key => 
    options[key] === undefined && delete options[key]
  )

  console.log('Processed options:', options)

  const history = await History.findUserHistory(userId, options)
  console.log('Found history entries:', history.length)
  
  // Get total count for pagination
  let countQuery = { userId }
  if (category && category !== 'all') countQuery.category = category
  if (favorite === 'true') countQuery.isBookmarked = true
  if (search) countQuery.$text = { $search: search }
  
  const total = await History.countDocuments(countQuery)
  console.log('Total history count:', total)

  res.json({
    message: 'History retrieved successfully',
    history,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total_items: total,
      total_pages: Math.ceil(total / limit),
      has_next_page: page * limit < total,
      has_prev_page: page > 1
    }
  })
})

// Get specific history item
export const getHistoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const historyItem = await History.findOne({ 
    _id: id, 
    userId 
  }).populate('userId', 'name email')

  if (!historyItem) {
    throw new APIError('History item not found', 404)
  }

  res.json({
    message: 'History item retrieved successfully',
    item: historyItem
  })
})

// Toggle favorite status
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const historyItem = await History.findOne({ _id: id, userId })

  if (!historyItem) {
    throw new APIError('History item not found', 404)
  }

  await historyItem.toggleFavorite()

  res.json({
    message: `History item ${historyItem.favorite ? 'added to' : 'removed from'} favorites`,
    favorite: historyItem.favorite
  })
})

// Add feedback to history item
export const addFeedback = asyncHandler(async (req, res) => {
  checkValidation(req)
  
  const { id } = req.params
  const { rating, helpful, comment } = req.body
  const userId = req.user._id

  const historyItem = await History.findOne({ _id: id, userId })

  if (!historyItem) {
    throw new APIError('History item not found', 404)
  }

  const feedbackData = {}
  if (rating !== undefined) feedbackData.rating = rating
  if (helpful !== undefined) feedbackData.helpful = helpful
  if (comment !== undefined) feedbackData.comment = comment

  await historyItem.addFeedback(feedbackData)

  res.json({
    message: 'Feedback added successfully',
    feedback: historyItem.feedback
  })
})

// Delete history item
export const deleteHistoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const historyItem = await History.findOneAndDelete({ _id: id, userId })

  if (!historyItem) {
    throw new APIError('History item not found', 404)
  }

  res.json({
    message: 'History item deleted successfully'
  })
})

// Get user analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { days = 30 } = req.query

  const analytics = await History.getAnalytics(userId, parseInt(days))

  // Get total queries count
  const totalQueries = await History.countDocuments({ userId })

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentActivity = await History.countDocuments({
    userId,
    createdAt: { $gte: sevenDaysAgo }
  })

  // Get favorites count
  const favoritesCount = await History.countDocuments({
    userId,
    favorite: true
  })

  res.json({
    message: 'Analytics retrieved successfully',
    analytics: {
      total_queries: totalQueries,
      recent_activity: recentActivity,
      favorites_count: favoritesCount,
      category_breakdown: analytics,
      period_days: parseInt(days)
    }
  })
})

// Clear all history (with confirmation)
export const clearHistory = asyncHandler(async (req, res) => {
  const { confirm } = req.body
  const userId = req.user._id

  if (!confirm || confirm !== 'DELETE_ALL_HISTORY') {
    throw new APIError('Confirmation required. Set confirm to "DELETE_ALL_HISTORY"', 400)
  }

  const result = await History.deleteMany({ userId })

  res.json({
    message: 'History cleared successfully',
    deleted_count: result.deletedCount
  })
})