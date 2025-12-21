import { useState, useEffect } from 'react'
import { reminderAPI } from '../services/api'
import { 
  BellIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  BeakerIcon,
  HomeIcon,
  CalendarIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  sendTestNotification,
  isNotificationSupported
} from '../utils/notifications'

const Reminders = () => {
  const [reminders, setReminders] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [checkingNotifications, setCheckingNotifications] = useState(true)
  const [stats, setStats] = useState({
    totalActive: 0,
    totalCompleted: 0,
    totalPending: 0
  })
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'medication',
    description: '',
    time: '',
    frequency: 'daily',
    days: [],
    dosage: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const reminderTypes = [
    { id: 'medication', name: '💊 Medication', color: 'blue', icon: BeakerIcon },
    { id: 'household', name: '🏠 Household Task', color: 'green', icon: HomeIcon },
    { id: 'appointment', name: '📅 Appointment', color: 'purple', icon: CalendarIcon },
    { id: 'other', name: '🔔 Other', color: 'gray', icon: BellIcon }
  ]

  const frequencies = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'specific_days', name: 'Specific Days' },
    { id: 'as_needed', name: 'As Needed' }
  ]

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Fetch reminders from backend
  const fetchReminders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await reminderAPI.getReminders({
        type: filterType !== 'all' ? filterType : undefined,
        todayStatus: filterStatus !== 'all' ? filterStatus : undefined
      })
      setReminders(response.reminders || [])
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError('Failed to load reminders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await reminderAPI.getStats()
      setStats(response.stats || {})
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  // Load reminders on mount and when filters change
  useEffect(() => {
    fetchReminders()
    fetchStats()
    checkNotificationStatus()
  }, [filterType, filterStatus])

  // Check notification status
  const checkNotificationStatus = async () => {
    try {
      setCheckingNotifications(true)
      
      // Check if notifications are supported
      if (!isNotificationSupported()) {
        setNotificationsEnabled(false)
        setCheckingNotifications(false)
        return
      }
      
      // Check if already subscribed
      const isSubscribed = await isSubscribedToPushNotifications()
      setNotificationsEnabled(isSubscribed)
    } catch (error) {
      console.error('Failed to check notification status:', error)
      setNotificationsEnabled(false)
    } finally {
      setCheckingNotifications(false)
    }
  }

  // Enable notifications
  const handleEnableNotifications = async () => {
    setCheckingNotifications(true)
    
    try {
      // Add overall timeout for the entire process
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out after 30 seconds')), 30000)
      )
      
      const subscribePromise = subscribeToPushNotifications()
      const result = await Promise.race([subscribePromise, timeout])
      
      if (result.success) {
        setNotificationsEnabled(true)
        alert('✅ ' + result.message)
      } else {
        alert('❌ ' + result.message)
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      
      if (error.message.includes('timed out')) {
        alert('❌ Request timed out. Please check your internet connection and try again.')
      } else {
        alert('❌ Failed to enable notifications. Please try again.')
      }
    } finally {
      setCheckingNotifications(false)
    }
  }

  // Disable notifications
  const handleDisableNotifications = async () => {
    try {
      await unsubscribeFromPushNotifications()
      setNotificationsEnabled(false)
      alert('Notifications disabled')
    } catch (error) {
      console.error('Failed to disable notifications:', error)
      alert('Failed to disable notifications')
    }
  }

  // Send test notification
  const handleTestNotification = async () => {
    try {
      await sendTestNotification()
      alert('✅ Test notification sent! Check your notifications.')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      alert('❌ Failed to send test notification')
    }
  }

  const handleAddReminder = async () => {
    if (!formData.title || !formData.time) {
      setError('Please fill in all required fields')
      return
    }

    try {
      await reminderAPI.createReminder(formData)
      await fetchReminders()
      await fetchStats()
      resetForm()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error creating reminder:', err)
      setError('Failed to create reminder. Please try again.')
    }
  }

  const handleUpdateReminder = async () => {
    if (!formData.title || !formData.time) {
      setError('Please fill in all required fields')
      return
    }

    try {
      await reminderAPI.updateReminder(editingReminder._id, formData)
      await fetchReminders()
      resetForm()
      setShowAddModal(false)
      setEditingReminder(null)
    } catch (err) {
      console.error('Error updating reminder:', err)
      setError('Failed to update reminder. Please try again.')
    }
  }

  const handleDeleteReminder = async (id) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderAPI.deleteReminder(id)
        await fetchReminders()
        await fetchStats()
      } catch (err) {
        console.error('Error deleting reminder:', err)
        setError('Failed to delete reminder. Please try again.')
      }
    }
  }

  const handleMarkAsTaken = async (id) => {
    try {
      await reminderAPI.markAsCompleted(id)
      await fetchReminders()
      await fetchStats()
    } catch (err) {
      console.error('Error marking as completed:', err)
      setError('Failed to mark as completed. Please try again.')
    }
  }

  const handleSkipToday = async (id) => {
    try {
      await reminderAPI.markAsSkipped(id)
      await fetchReminders()
      await fetchStats()
    } catch (err) {
      console.error('Error skipping reminder:', err)
      setError('Failed to skip reminder. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'medication',
      description: '',
      time: '',
      frequency: 'daily',
      days: [],
      dosage: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })
  }

  const openEditModal = (reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      type: reminder.type,
      description: reminder.description || '',
      time: reminder.time,
      frequency: reminder.frequency,
      days: reminder.days || [],
      dosage: reminder.dosage || '',
      startDate: reminder.startDate ? new Date(reminder.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: reminder.endDate ? new Date(reminder.endDate).toISOString().split('T')[0] : ''
    })
    setShowAddModal(true)
  }

  const getTypeColor = (type) => {
    const typeObj = reminderTypes.find(t => t.id === type)
    return typeObj?.color || 'gray'
  }

  const getTypeIcon = (type) => {
    const typeObj = reminderTypes.find(t => t.id === type)
    return typeObj?.icon || BellIcon
  }

  const filteredReminders = reminders
  const todayReminders = filteredReminders.filter(r => r.todayStatus === 'pending')
  const completedReminders = filteredReminders.filter(r => r.todayStatus === 'completed')

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
              <BellSolidIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
              <p className="text-gray-600 mt-1">Manage your medication and task reminders</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditingReminder(null)
              setShowAddModal(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Reminder
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="card bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Active</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalActive || 0}</p>
              </div>
              <BellSolidIcon className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <div className="card bg-linear-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed Today</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalCompleted || 0}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-400" />
            </div>
          </div>
          <div className="card bg-linear-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Today</p>
                <p className="text-3xl font-bold text-orange-900">{stats.totalPending || 0}</p>
              </div>
              <ClockIcon className="h-12 w-12 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {isNotificationSupported() && (
        <div className={`mb-6 p-4 rounded-xl border ${
          notificationsEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellAlertIcon className={`h-6 w-6 ${
                notificationsEnabled ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-semibold ${
                  notificationsEnabled ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {notificationsEnabled 
                    ? '✅ Notifications Enabled' 
                    : '🔔 Enable Push Notifications'}
                </h3>
                <p className={`text-sm ${
                  notificationsEnabled ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {notificationsEnabled 
                    ? 'You will receive reminders at scheduled times, even when the app is closed.' 
                    : 'Get notified when it\'s time to take your medications or complete tasks.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {notificationsEnabled ? (
                <button
                  onClick={handleDisableNotifications}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={handleEnableNotifications}
                  disabled={checkingNotifications}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingNotifications ? 'Checking...' : 'Enable Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field"
        >
          <option value="all">All Types</option>
          {reminderTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Reminders List */}
      {todayReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-orange-500" />
            Pending Today
          </h2>
          <div className="space-y-3">
            {todayReminders.map(reminder => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onMarkAsTaken={handleMarkAsTaken}
                onSkip={handleSkipToday}
                onEdit={openEditModal}
                onDelete={handleDeleteReminder}
                getTypeColor={getTypeColor}
                getTypeIcon={getTypeIcon}
              />
            ))}
          </div>
        </div>
      )}

      {completedReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            Completed Today
          </h2>
          <div className="space-y-3">
            {completedReminders.map(reminder => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onMarkAsTaken={handleMarkAsTaken}
                onSkip={handleSkipToday}
                onEdit={openEditModal}
                onDelete={handleDeleteReminder}
                getTypeColor={getTypeColor}
                getTypeIcon={getTypeIcon}
                isCompleted
              />
            ))}
          </div>
        </div>
      )}

      {filteredReminders.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reminders yet</h3>
          <p className="text-gray-500 mb-6">Create your first reminder to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Reminder
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddReminderModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => {
            setShowAddModal(false)
            setEditingReminder(null)
            resetForm()
          }}
          onSave={editingReminder ? handleUpdateReminder : handleAddReminder}
          reminderTypes={reminderTypes}
          frequencies={frequencies}
          daysOfWeek={daysOfWeek}
          isEditing={!!editingReminder}
        />
      )}
    </div>
  )
}

// Reminder Card Component
const ReminderCard = ({ reminder, onMarkAsTaken, onSkip, onEdit, onDelete, getTypeColor, getTypeIcon, isCompleted }) => {
  const TypeIcon = getTypeIcon(reminder.type)
  const color = getTypeColor(reminder.type)
  
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 bg-blue-50 text-blue-700 border-blue-200',
    green: 'from-green-500 to-emerald-500 bg-green-50 text-green-700 border-green-200',
    purple: 'from-purple-500 to-indigo-500 bg-purple-50 text-purple-700 border-purple-200',
    gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className={`card border-2 ${isCompleted ? 'opacity-60' : ''} ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-linear-to-br ${colorClasses[color].split(' ')[0]} text-white shadow-md shrink-0`}>
          <TypeIcon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {reminder.title}
                {isCompleted && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
              </h3>
              {reminder.description && <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>}
            </div>
            <div className="flex gap-2 ml-4">
              {!isCompleted && (
                <>
                  <button
                    onClick={() => onEdit(reminder)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(reminder._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span className="font-medium">{reminder.time}</span>
            </div>
            {reminder.dosage && (
              <div className="flex items-center gap-1">
                <BeakerIcon className="h-4 w-4" />
                <span>{reminder.dosage}</span>
              </div>
            )}
            <div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
              {reminder.frequency}
            </div>
          </div>

          {!isCompleted && (
            <div className="flex gap-2">
              <button
                onClick={() => onMarkAsTaken(reminder._id)}
                className="btn-primary text-sm py-2 inline-flex items-center gap-1"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Mark as Taken
              </button>
              <button
                onClick={() => onSkip(reminder._id)}
                className="btn-secondary text-sm py-2"
              >
                Skip Today
              </button>
            </div>
          )}

          {isCompleted && reminder.lastCompletedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Taken at {new Date(reminder.lastCompletedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Add/Edit Reminder Modal
const AddReminderModal = ({ formData, setFormData, onClose, onSave, reminderTypes, frequencies, daysOfWeek, isEditing }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity  bg-opacity-45" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Reminder' : 'Add New Reminder'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Take Blood Pressure Medication"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {reminderTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="input-field"
                >
                  {frequencies.map(freq => (
                    <option key={freq.id} value={freq.id}>{freq.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dosage (for medication) */}
            {formData.type === 'medication' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 1 tablet (50mg)"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Additional notes or instructions..."
              />
            </div>

            {/* Specific Days (if frequency is specific_days) */}
            {formData.frequency === 'specific_days' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
                <div className="flex gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = formData.days.includes(day)
                          ? formData.days.filter(d => d !== day)
                          : [...formData.days, day]
                        setFormData({ ...formData, days })
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.days.includes(day)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button onClick={onSave} className="btn-primary flex-1">
              {isEditing ? 'Update Reminder' : 'Add Reminder'}
            </button>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reminders
