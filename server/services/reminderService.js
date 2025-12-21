import cron from 'node-cron'
import Reminder from '../models/Reminder.js'
import { sendPushNotification } from '../controllers/notificationController.js'

// Check and send reminders every minute
export const startReminderCron = () => {
  // Run every minute: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      await checkAndSendReminders()
    } catch (error) {
      console.error('Reminder cron error:', error)
    }
  })

  console.log('✅ Reminder cron job started (checking every minute)')
}

// Check reminders and send notifications
export const checkAndSendReminders = async () => {
  try {
    const now = new Date()
    const currentHour = now.getHours().toString().padStart(2, '0')
    const currentMinute = now.getMinutes().toString().padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    // console.log(`Checking reminders at ${currentTime} on ${currentDay}`)

    // Find all active reminders for current time
    const reminders = await Reminder.find({
      status: 'active',
      time: currentTime,
      todayStatus: { $ne: 'completed' }
    }).populate('userId')

    if (reminders.length === 0) {
      return
    }

    console.log(`Found ${reminders.length} reminders to send at ${currentTime}`)

    for (const reminder of reminders) {
      try {
        // Check if reminder should fire on this day
        if (reminder.frequency === 'daily') {
          // Send notification for daily reminders
          await sendReminderNotification(reminder)
        } else if (reminder.frequency === 'specific_days' && reminder.days?.includes(currentDay)) {
          // Send notification if today is in the specific days
          await sendReminderNotification(reminder)
        }
      } catch (error) {
        console.error(`Error sending reminder ${reminder._id}:`, error)
      }
    }
  } catch (error) {
    console.error('Check reminders error:', error)
  }
}

// Send reminder notification
const sendReminderNotification = async (reminder) => {
  try {
    const user = reminder.userId
    
    if (!user) {
      console.error('User not found for reminder:', reminder._id)
      return
    }

    // Prepare notification payload
    const isMedication = reminder.type === 'medication'
    const payload = {
      title: isMedication ? '💊 Medication Reminder' : '📋 Task Reminder',
      body: isMedication 
        ? `Time to take ${reminder.name} (${reminder.dosage || 'as prescribed'})`
        : reminder.name,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200, 100, 200],
      data: {
        reminderId: reminder._id.toString(),
        url: '/reminders',
        timestamp: Date.now(),
        type: reminder.type,
        name: reminder.name
      },
      actions: [
        { 
          action: 'mark-complete', 
          title: isMedication ? 'Mark as Taken' : 'Mark Complete'
        },
        { 
          action: 'snooze', 
          title: 'Snooze 10 min' 
        }
      ],
      requireInteraction: true, // Keep notification until user interacts
      tag: `reminder-${reminder._id}` // Prevent duplicate notifications
    }

    // Send push notification
    await sendPushNotification(user._id, payload)

    console.log(`✅ Sent notification for reminder: ${reminder.name} to user: ${user.username}`)
  } catch (error) {
    console.error('Send reminder notification error:', error)
  }
}

export default {
  startReminderCron,
  checkAndSendReminders
}
