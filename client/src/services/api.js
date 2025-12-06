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

export default api