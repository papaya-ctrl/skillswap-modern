import { useEffect, useState } from 'react'
import AuthContext from './authContext.js'
import * as authService from '../services/api/authService.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bootError, setBootError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadUser() {
      try {
        const currentUser = await authService.getMe()

        if (!isActive) {
          return
        }

        setUser(currentUser)
        setBootError(null)
      } catch (error) {
        if (!isActive) {
          return
        }

        if (error.status === 401) {
          setUser(null)
          setBootError(null)
        } else {
          setBootError(error)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isActive = false
    }
  }, [])

  async function register(payload) {
    return authService.register(payload)
  }

  async function login(payload) {
    const data = await authService.login(payload)

    setUser(data.user)

    return data
  }

  async function logout() {
    try {
      const data = await authService.logout()

      setUser(null)

      return data
    } catch (error) {
      if (error.status === 401) {
        setUser(null)
      }

      throw error
    }
  }

  const value = {
    bootError,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    register,
    user,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
