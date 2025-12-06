import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      
      setAuth: (user, token) => {
        set({ user, token })
        // Set token in axios defaults for subsequent requests
        if (token) {
          localStorage.setItem('auth-token', token)
        }
      },
      
      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem('auth-token')
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Initialize auth state from localStorage on app start
      initializeAuth: () => {
        const token = localStorage.getItem('auth-token')
        if (token) {
          // Verify token with backend and get user info
          // This will be implemented when we connect to the backend
          console.log('Token found, verifying...', token)
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
)

export { useAuthStore }