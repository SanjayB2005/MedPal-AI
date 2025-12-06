import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import { 
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, setAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState('general')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const tabs = [
    { id: 'general', name: 'General', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // This would call a profile update API
      // For now, we'll simulate success
      console.log('Updating profile:', formData)
      setIsEditing(false)
      // Update user in store if needed
    } catch (error) {
      setErrors({ submit: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'New passwords do not match' })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // This would call a password update API
      console.log('Updating password')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password updated successfully!')
    } catch (error) {
      setErrors({ password: 'Failed to update password. Please check your current password.' })
    } finally {
      setIsLoading(false)
    }
  }

  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Profile Information</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl">
            <UserCircleIcon className="h-12 w-12 text-neutral-400" />
            <div>
              <h4 className="font-medium text-neutral-900">{user?.name}</h4>
              <p className="text-sm text-neutral-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-neutral-200 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <EnvelopeIcon className="h-5 w-5 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">Email</span>
              </div>
              <p className="text-neutral-900">{user?.email}</p>
            </div>
            
            <div className="p-4 border border-neutral-200 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <UserCircleIcon className="h-5 w-5 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">Member Since</span>
              </div>
              <p className="text-neutral-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Security Settings</h3>
      
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="input-field"
            required
          />
        </div>

        {errors.password && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{errors.password}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )

  const PreferencesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Preferences</h3>
      
      <div className="space-y-4">
        <div className="p-4 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Email Notifications</h4>
              <p className="text-sm text-neutral-600">Receive updates about new features</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
        
        <div className="p-4 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Safety Reminders</h4>
              <p className="text-sm text-neutral-600">Always show safety warnings</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
        
        <div className="p-4 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-neutral-900">Professional Recommendations</h4>
              <p className="text-sm text-neutral-600">Show professional service suggestions</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile