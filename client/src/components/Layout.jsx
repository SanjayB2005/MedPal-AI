import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  HomeIcon, 
  BellIcon, 
  UserIcon, 
  ClockIcon,
  FolderIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      description: 'Chat with AI assistant'
    },
    { 
      name: 'Reminders', 
      href: '/reminders', 
      icon: BellIcon,
      description: 'Medication & task reminders'
    },
    { 
      name: 'History', 
      href: '/history', 
      icon: ClockIcon,
      description: 'View past conversations'
    },
    { 
      name: 'Medical Records', 
      href: '/medical-records', 
      icon: FolderIcon,
      description: 'Store and manage medical files'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserIcon,
      description: 'Manage your account'
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Home Assistant</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Enhanced Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16">
        <div className="flex flex-col flex-1 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">          
          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center p-4 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-4 transition-all ${
                    active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className={`text-xs mt-1 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
          
          <div className="flex-shrink-0 border-t border-gray-200/50 p-6">
            <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <button
                  onClick={logout}
                  className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header for all pages */}
        <Header showAuth={true} showNavigation={false} />
        
        {/* Enhanced Top bar for mobile */}
        <div className="flex items-center h-12 px-6 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-700">Navigation</h2>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto lg:pl-72">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout