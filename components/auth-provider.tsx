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

      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        // Map the user data to our expected format
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: mapDbRoleToUserRole(data.user.role),
          department: data.user.department || data.user.division || 'Unknown Department',
        }

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

  // Helper function to map database roles to simplified roles
  const mapDbRoleToUserRole = (dbRole: string): "user" | "admin" | "lab_manager" => {
    const roleMapping: { [key: string]: "user" | "admin" | "lab_manager" } = {
      'SuperAdmin': 'admin',
      'Admin': 'admin',
      'ATCManager': 'lab_manager',
      'RequesterManager': 'lab_manager',
      'Requester': 'user',
      'EngineerResearcher': 'user',
      'SeniorEngineerSeniorResearcher': 'user',
      'Technician': 'lab_manager',
      'TechnicianAssistant': 'lab_manager'
    }
    
    return roleMapping[dbRole] || 'user'
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pcrd_user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

