"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, checkUserExists } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("pcrd_user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          
          // Try to refresh user data from database
          try {
            const refreshedUser = await checkUserExists(userData.email)
            if (refreshedUser) {
              setUser(refreshedUser)
              localStorage.setItem("pcrd_user", JSON.stringify(refreshedUser))
            } else {
              // If user not found in database, use stored data
              setUser(userData)
            }
          } catch (error) {
            console.error("Failed to refresh user data:", error)
            // Fallback to stored user data
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // In a real app, this would validate with your backend
      // For now, we'll use our mock function
      const user = await checkUserExists(email)

      if (user) {
        // In a real app, you would verify the password here
        setUser(user)
        localStorage.setItem("pcrd_user", JSON.stringify(user))
        
        // Ensure state is updated before returning
        await new Promise(resolve => setTimeout(resolve, 50))
        
        return true
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pcrd_user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

