// Format date for display
export const formatDate = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  const now = new Date()
  const diffMs = now - dateObj
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    const hours = Math.floor(diffHours)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    const days = Math.floor(diffDays)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  } else {
    return dateObj.toLocaleDateString()
  }
}

// Format date for inputs
export const formatDateForInput = (date) => {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toISOString().split('T')[0]
}

// Format datetime for display
export const formatDateTime = (date) => {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleString()
}

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const cloned = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// Check if object is empty
export const isEmpty = (obj) => {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return !obj
}

// Remove empty fields from object
export const removeEmptyFields = (obj) => {
  const cleaned = {}
  for (let key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Generate color based on string
export const stringToColor = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 60%)`
}

// Parse query parameters
export const parseQueryParams = (search) => {
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

// Build query string
export const buildQueryString = (params) => {
  const filtered = removeEmptyFields(params)
  return new URLSearchParams(filtered).toString()
}

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const top = element.offsetTop - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (err) {
      textArea.remove()
      return false
    }
  }
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (err) {
      console.error('Error reading from localStorage:', err)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error('Error writing to localStorage:', err)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (err) {
      console.error('Error removing from localStorage:', err)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (err) {
      console.error('Error clearing localStorage:', err)
      return false
    }
  }
}