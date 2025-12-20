import { body, validationResult } from 'express-validator'
import Reminder from '../models/Reminder.js'
import { asyncHandler, APIError } from '../middleware/errorHandler.js'

// Validation middleware
export const validateReminder = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('type')
    .isIn(['medication', 'household', 'appointment', 'other'])
    .withMessage('Invalid reminder type'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'specific_days', 'as_needed'])
    .withMessage('Invalid frequency'),
  body('dosage')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Dosage cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
]

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg)
    throw new APIError(`Validation failed: ${errorMessages.join(', ')}`, 400)
  }
}

// Get all reminders for user
export const getReminders = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { type, status, todayStatus } = req.query

  const reminders = await Reminder.getUserReminders(userId, {
    type,
    status,
    todayStatus
  })

  res.json({
    message: 'Reminders retrieved successfully',
    reminders,
    count: reminders.length
  })
})

// Get single reminder
export const getReminder = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const reminder = await Reminder.findOne({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  res.json({
    message: 'Reminder retrieved successfully',
    reminder
  })
})

// Create new reminder
export const createReminder = asyncHandler(async (req, res) => {
  checkValidation(req)
  
  const userId = req.user._id
  const {
    title,
    type,
    description,
    time,
    frequency,
    days,
    dosage,
    medicationName,
    startDate,
    endDate,
    notificationsEnabled,
    reminderMinutesBefore
  } = req.body

  const reminder = new Reminder({
    userId,
    title,
    type,
    description,
    time,
    frequency: frequency || 'daily',
    days: days || [],
    dosage,
    medicationName,
    startDate: startDate || new Date(),
    endDate,
    notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true,
    reminderMinutesBefore: reminderMinutesBefore || 15,
    status: 'active',
    todayStatus: 'pending'
  })

  await reminder.save()

  res.status(201).json({
    message: 'Reminder created successfully',
    reminder
  })
})

// Update reminder
export const updateReminder = asyncHandler(async (req, res) => {
  checkValidation(req)
  
  const { id } = req.params
  const userId = req.user._id

  const reminder = await Reminder.findOne({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  const {
    title,
    type,
    description,
    time,
    frequency,
    days,
    dosage,
    medicationName,
    startDate,
    endDate,
    status,
    notificationsEnabled,
    reminderMinutesBefore
  } = req.body

  // Update fields if provided
  if (title !== undefined) reminder.title = title
  if (type !== undefined) reminder.type = type
  if (description !== undefined) reminder.description = description
  if (time !== undefined) reminder.time = time
  if (frequency !== undefined) reminder.frequency = frequency
  if (days !== undefined) reminder.days = days
  if (dosage !== undefined) reminder.dosage = dosage
  if (medicationName !== undefined) reminder.medicationName = medicationName
  if (startDate !== undefined) reminder.startDate = startDate
  if (endDate !== undefined) reminder.endDate = endDate
  if (status !== undefined) reminder.status = status
  if (notificationsEnabled !== undefined) reminder.notificationsEnabled = notificationsEnabled
  if (reminderMinutesBefore !== undefined) reminder.reminderMinutesBefore = reminderMinutesBefore

  await reminder.save()

  res.json({
    message: 'Reminder updated successfully',
    reminder
  })
})

// Delete reminder
export const deleteReminder = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const reminder = await Reminder.findOneAndDelete({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  res.json({
    message: 'Reminder deleted successfully'
  })
})

// Mark reminder as completed
export const markAsCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const { notes } = req.body

  const reminder = await Reminder.findOne({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  await reminder.markAsCompleted(notes)

  res.json({
    message: 'Reminder marked as completed',
    reminder
  })
})

// Mark reminder as skipped
export const markAsSkipped = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  const { notes } = req.body

  const reminder = await Reminder.findOne({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  await reminder.markAsSkipped(notes)

  res.json({
    message: 'Reminder marked as skipped',
    reminder
  })
})

// Reset reminder status for today
export const resetTodayStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id

  const reminder = await Reminder.findOne({ _id: id, userId })

  if (!reminder) {
    throw new APIError('Reminder not found', 404)
  }

  await reminder.resetTodayStatus()

  res.json({
    message: 'Reminder status reset',
    reminder
  })
})

// Get reminder statistics
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const stats = await Reminder.getUserStats(userId)
  
  // Get total counts
  const totalActive = await Reminder.countDocuments({ userId, status: 'active' })
  const totalCompleted = await Reminder.countDocuments({ userId, todayStatus: 'completed' })
  const totalPending = await Reminder.countDocuments({ userId, todayStatus: 'pending', status: 'active' })
  const totalMedications = await Reminder.countDocuments({ userId, type: 'medication', status: 'active' })

  res.json({
    message: 'Statistics retrieved successfully',
    stats: {
      totalActive,
      totalCompleted,
      totalPending,
      totalMedications,
      breakdown: stats
    }
  })
})

// Batch update - reset all daily statuses (can be called by cron job)
export const resetAllDailyStatuses = asyncHandler(async (req, res) => {
  await Reminder.resetDailyStatus()

  res.json({
    message: 'All daily statuses reset successfully'
  })
})
