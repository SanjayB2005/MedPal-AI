import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  SparklesIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const Header = ({ showAuth = true, showNavigation = false }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/dashboard':
        return 'Dashboard'
      case '/history':
        return 'Conversation History'
      case '/categories':
        return 'Help Categories'
      case '/profile':
        return 'Profile Settings'
      default:
        return 'AI Home Assistant'
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Med Pal
                </h1>
                {user && location.pathname !== '/' && (
                  <p className="text-xs text-gray-500">{getPageTitle()}</p>
                )}
              </div>
            </Link>
          </div>

          {/* Center - Navigation (if enabled) */}
          {showNavigation && user && (
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-4' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/history" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/history' 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-4' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                History
              </Link>
              <Link 
                to="/categories" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/categories' 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-4' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Categories
              </Link>
            </nav>
          )}

          {/* Right side - User menu or auth buttons */}
          {showAuth && (
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <BellIcon className="h-5 w-5" />
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <div className="h-8 w-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </button>

                    {/* Dropdown menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3" />
                          Preferences
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}

export default Header