// Category definitions
export const CATEGORIES = {
  PHARMACY: {
    id: 'pharmacy',
    name: 'Pharmacy & Health',
    icon: '💊',
    description: 'Medication information, drug interactions, and health advice',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  COOKING: {
    id: 'cooking',
    name: 'Cooking & Kitchen',
    icon: '👨‍🍳',
    description: 'Recipes, cooking tips, food safety, and kitchen techniques',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  ELECTRICAL: {
    id: 'electrical',
    name: 'Electrical & Electronics',
    icon: '⚡',
    description: 'Electrical repairs, safety tips, and troubleshooting',
    color: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  PLUMBING: {
    id: 'plumbing',
    name: 'Plumbing & Water',
    icon: '🔧',
    description: 'Plumbing repairs, water issues, and maintenance tips',
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-blue-700'
  },
  CLEANING: {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    icon: '🧹',
    description: 'Cleaning tips, stain removal, and home maintenance',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  },
  GARDENING: {
    id: 'gardening',
    name: 'Gardening & Plants',
    icon: '🌱',
    description: 'Plant care, gardening tips, and pest control',
    color: 'bg-green-600',
    gradient: 'from-green-600 to-green-700'
  },
  PEST_CONTROL: {
    id: 'pest-control',
    name: 'Pest Control',
    icon: '🐛',
    description: 'Natural pest control methods and prevention',
    color: 'bg-red-500',
    gradient: 'from-red-500 to-red-600'
  },
  GENERAL: {
    id: 'general',
    name: 'General Help',
    icon: '❓',
    description: 'General household questions and advice',
    color: 'bg-gray-500',
    gradient: 'from-gray-500 to-gray-600'
  }
}

// Convert object to array for easier iteration
export const CATEGORY_LIST = Object.values(CATEGORIES)

// Navigation items
export const NAVIGATION = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Categories', href: '/categories', icon: '📂' },
  { name: 'History', href: '/history', icon: '📋' },
  { name: 'Profile', href: '/profile', icon: '👤' }
]

// Message types
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error'
}

// Priority levels for suggestions
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/
}

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue',
  INVALID_CREDENTIALS: 'Invalid email or password'
}

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully! Welcome to HomeHelp AI.',
  LOGIN_SUCCESS: 'Welcome back!',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
  ITEM_FAVORITED: 'Added to favorites',
  ITEM_UNFAVORITED: 'Removed from favorites',
  HISTORY_CLEARED: 'History cleared successfully'
}

// Default values
export const DEFAULTS = {
  PAGINATION_LIMIT: 20,
  QUERY_TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
  ANALYTICS_DAYS: 30
}

// Feature flags
export const FEATURES = {
  VOICE_INPUT: false,
  DARK_MODE: true,
  ANALYTICS: true,
  NOTIFICATIONS: false,
  EXPORT_HISTORY: true
}