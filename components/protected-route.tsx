"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { hasPermission, type Permission } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: keyof Permission
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // Use replace to avoid navigation history issues
      router.replace("/login")
    }

    if (!isLoading && user && requiredPermission) {
      const hasRequiredPermission = hasPermission(user, requiredPermission)
      if (!hasRequiredPermission) {
        router.replace("/unauthorized")
      }
    }
  }, [user, isLoading, router, requiredPermission])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If not logged in or doesn't have permission, don't render children
  if (!user) {
    return null
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return null
  }

  // User is logged in and has required permission
  return <>{children}</>
}

