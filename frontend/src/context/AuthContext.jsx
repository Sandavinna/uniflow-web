import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL
axios.defaults.timeout = 10000 // 10 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Axios interceptor to add token from sessionStorage on each request
// This allows each tab to have its own session
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(sessionStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      // Silently fail if backend is not available or token is invalid
      console.warn('Could not fetch user:', error.message)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token: newToken, ...userData } = response.data
      setToken(newToken)
      setUser(userData)
      sessionStorage.setItem('token', newToken)
      sessionStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (userData) => {
    try {
      console.log('=== REGISTRATION REQUEST ===')
      console.log('Request data:', JSON.stringify(userData, null, 2))
      console.log('Role being sent:', userData.role)
      console.log('============================')
      
      const response = await axios.post('/api/auth/register', userData)
      console.log('=== REGISTRATION RESPONSE ===')
      console.log('Response data:', JSON.stringify(response.data, null, 2))
      console.log('Has token?', !!response.data.token)
      console.log('Token value:', response.data.token ? '[TOKEN PRESENT]' : '[NO TOKEN]')
      console.log('Registration status:', response.data.registrationStatus)
      console.log('Role in response:', response.data.role)
      console.log('============================')
      
      const { token: newToken, registrationStatus, message, role: responseRole, ...user } = response.data
      
      // Check if this is a staff role that should be pending
      const staffRoles = ['lecturer', 'medical_staff', 'canteen_staff', 'hostel_admin'];
      const isStaffRole = staffRoles.includes(responseRole);
      
      console.log(`🔍 Role check: "${responseRole}", Is staff: ${isStaffRole}, Has token: ${!!newToken}, Status: "${registrationStatus}"`);
      console.log(`🔍 Staff roles array:`, staffRoles);
      console.log(`🔍 Role match check:`, staffRoles.map(r => `${r} === "${responseRole}"? ${r === responseRole}`));
      
      // CRITICAL: Staff roles should NEVER get a token, regardless of what backend returns
      // Check role FIRST before anything else - check both request and response role
      const requestRole = userData.role;
      const isRequestStaffRole = staffRoles.includes(requestRole);
      const isResponseStaffRole = staffRoles.includes(responseRole);
      
      if (isRequestStaffRole || isResponseStaffRole) {
        console.log('🚫🚫🚫 STAFF ROLE DETECTED - Registration is PENDING - NO TOKEN WILL BE SET')
        console.log(`Request role: "${requestRole}", Response role: "${responseRole}"`)
        console.log(`Is request staff? ${isRequestStaffRole}, Is response staff? ${isResponseStaffRole}`)
        // Even if backend accidentally returned a token, we ignore it for staff roles
        return { 
          success: true, 
          pending: true,
          message: message || 'Registration successful! Your account is pending admin approval.'
        }
      }
      
      // For non-staff roles, check if we have a token
      if (!newToken || registrationStatus === 'pending') {
        console.log('❌ No token or pending status - Registration is PENDING')
        return { 
          success: true, 
          pending: true,
          message: message || 'Registration successful! Your account is pending admin approval.'
        }
      }
      
      // Only set token and user if we have a token AND it's not a staff role AND status is not pending
      if (newToken && registrationStatus !== 'pending') {
        console.log('✅ Registration approved - setting token and user')
        setToken(newToken)
        setUser(user)
        sessionStorage.setItem('token', newToken)
        sessionStorage.setItem('user', JSON.stringify(user))
        return { success: true, pending: false }
      }
      
      // Fallback: treat as pending
      console.log('⚠️ Fallback: treating as pending')
      return { 
        success: true, 
        pending: true,
        message: message || 'Registration successful! Your account is pending admin approval.'
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

