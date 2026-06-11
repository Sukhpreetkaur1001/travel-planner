import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.get('/auth/me')
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (err) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/signup', { name, email, password })
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      setIsAuthenticated(true)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { email, password })
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      setIsAuthenticated(true)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (profileData) => {
    try {
      setError(null)
      const response = await api.put('/auth/profile', profileData)
      setUser(response.data)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed')
      return false
    }
  }

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isActivePlan = (profile) => {
    if (!profile || !profile.plan || profile.plan === 'none') return false
    if (!profile.planExpiry) return false
    const expiry = new Date(profile.planExpiry)
    return expiry > new Date()
  }

  const hasActivePlan = isActivePlan(user)
  const trialExpired = user?.plan === 'trial' && user?.planExpiry && new Date(user.planExpiry) <= new Date()
  const canUseTrial = user ? !user.trialUsed : true

  const selectPlan = async (plan) => {
    try {
      setError(null)
      const response = await api.put('/auth/plan', { plan })
      // response returns plan, planStart, planExpiry and trialUsed
      const updated = {
        ...user,
        plan: response.data.plan,
        planStart: response.data.planStart,
        planExpiry: response.data.planExpiry,
        trialUsed: response.data.trialUsed
      }
      setUser(updated)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Plan update failed')
      return false
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    hasActivePlan,
    trialExpired,
    canUseTrial,
    error,
    register,
    login,
    logout,
    updateProfile,
    selectPlan,
    refreshUser: checkAuth,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
