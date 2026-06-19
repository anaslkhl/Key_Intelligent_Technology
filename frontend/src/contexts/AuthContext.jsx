import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient, { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api/client'
import { AuthContext } from './auth'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY))
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [isInitializing, setIsInitializing] = useState(Boolean(token))

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setToken(null)
    setUser(null)
    setIsInitializing(false)
  }, [])

  useEffect(() => {
    window.addEventListener('kit:unauthorized', clearAuth)
    return () => window.removeEventListener('kit:unauthorized', clearAuth)
  }, [clearAuth])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    let active = true

    apiClient.get('/me')
      .then((response) => {
        if (!active) return
        const freshUser = response.data.data
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser))
        setUser(freshUser)
      })
      .catch(() => {
        if (active) clearAuth()
      })
      .finally(() => {
        if (active) setIsInitializing(false)
      })

    return () => {
      active = false
    }
  }, [clearAuth, token])

  const login = useCallback(async (email, password) => {
    const response = await apiClient.post('/login', { email, password })
    const authData = response.data.data

    localStorage.setItem(AUTH_TOKEN_KEY, authData.token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user))
    setToken(authData.token)
    setUser(authData.user)
    setIsInitializing(false)

    return authData.user
  }, [])

  const register = useCallback(async (userData) => {
    const response = await apiClient.post('/register', userData)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        await apiClient.post('/logout')
      }
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isInitializing,
      isAuthenticated: Boolean(token && user),
    }),
    [isInitializing, login, logout, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
