import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/user/me')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/password', passwordData)
    return response.data
  }
}

// AI Assistant endpoints
export const aiAPI = {
  sendQuery: async (queryData) => {
    const response = await api.post('/ai/query', queryData)
    return response.data
  },

  sendQueryWithFile: async (queryText, file) => {
    const formData = new FormData()
    
    // Add query text if provided
    if (queryText) {
      formData.append('query', queryText)
    }
    
    // Add file if provided
    if (file) {
      formData.append('file', file)
    }
    
    // Use fetch instead of axios to avoid Content-Type issues with FormData
    const token = localStorage.getItem('auth-token')
    const response = await fetch(`${API_BASE_URL}/ai/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to process query')
    }
    
    return response.json()
  },

  getSuggestions: async (category) => {
    const response = await api.get(`/ai/suggestions/${category}`)
    return response.data
  },

  getPopularQueries: async (category) => {
    const response = await api.get('/ai/popular', {
      params: category ? { category } : {}
    })
    return response.data
  },

  healthCheck: async () => {
    const response = await api.get('/ai/health')
    return response.data
  }
}

// History endpoints
export const historyAPI = {
  getHistory: async (params = {}) => {
    const response = await api.get('/history', { params })
    return response.data
  },

  getHistoryItem: async (id) => {
    const response = await api.get(`/history/${id}`)
    return response.data
  },
  
  addFeedback: async (id, feedbackData) => {
    const response = await api.post(`/history/${id}/feedback`, feedbackData)
    return response.data
  },

  toggleFavorite: async (id) => {
    const response = await api.put(`/history/${id}/favorite`)
    return response.data
  },

  deleteHistoryItem: async (id) => {
    const response = await api.delete(`/history/${id}`)
    return response.data
  },

  getAnalytics: async (days = 30) => {
    const response = await api.get('/history/analytics', {
      params: { days }
    })
    return response.data
  },

  clearHistory: async () => {
    const response = await api.delete('/history', {
      data: { confirm: 'DELETE_ALL_HISTORY' }
    })
    return response.data
  }
}

// Reminder endpoints
export const reminderAPI = {
  getReminders: async (params = {}) => {
    const response = await api.get('/reminders', { params })
    return response.data
  },

  getReminder: async (id) => {
    const response = await api.get(`/reminders/${id}`)
    return response.data
  },

  createReminder: async (reminderData) => {
    const response = await api.post('/reminders', reminderData)
    return response.data
  },

  updateReminder: async (id, reminderData) => {
    const response = await api.put(`/reminders/${id}`, reminderData)
    return response.data
  },

  deleteReminder: async (id) => {
    const response = await api.delete(`/reminders/${id}`)
    return response.data
  },

  markAsCompleted: async (id, notes = '') => {
    const response = await api.post(`/reminders/${id}/complete`, { notes })
    return response.data
  },

  markAsSkipped: async (id, notes = '') => {
    const response = await api.post(`/reminders/${id}/skip`, { notes })
    return response.data
  },

  resetTodayStatus: async (id) => {
    const response = await api.post(`/reminders/${id}/reset`)
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/reminders/stats')
    return response.data
  }
}

// Medical Records endpoints
export const medicalRecordsAPI = {
  upload: async (formData) => {
    const response = await api.post('/medical-records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  getAll: async (params) => {
    const response = await api.get('/medical-records', { params })
    return response.data
  },
  
  getOne: async (id) => {
    const response = await api.get(`/medical-records/${id}`)
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/medical-records/${id}`, data)
    return response.data
  },
  
  toggleStar: async (id) => {
    const response = await api.patch(`/medical-records/${id}/star`)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/medical-records/${id}`)
    return response.data
  }
}

export default api