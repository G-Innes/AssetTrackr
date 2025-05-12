// src/stores/user.ts
import { defineStore } from 'pinia'
import { login as apiLogin, logout, signup, getUserProfile } from '../services/apiService'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  // Load user from localStorage on initialization
  const initUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user data', e)
        localStorage.removeItem('user')
      }
    }
  }

  // Fetch current user profile
  const fetchUser = async () => {
    try {
      const userData = await getUserProfile()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Login user
  const loginUser = async (usernameOrEmail: string, password: string) => {
    try {
      // Call the API service with the correct payload structure
      const response = await apiLogin({ usernameOrEmail, password })

      if (response.data && response.data.token) {
        // Store token in localStorage is handled by apiLogin
        // Now fetch user data
        await fetchUser()
        return { success: true }
      }
      return { success: false, message: 'Login failed: Invalid credentials' }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      }
    }
  }

  // Logout user
  const logoutUser = () => {
    logout()
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Navigation will be handled in the component that calls this method
  }

  // Register new user
  const registerUser = async (userData) => {
    try {
      const response = await signup(userData)
      return { success: true, data: response }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      }
    }
  }

  // Initialize user on store creation
  initUser()

  return {
    user,
    isAuthenticated,
    fetchUser,
    login: loginUser,
    logout: logoutUser,
    signup: registerUser,
  }
})

export { signup }
