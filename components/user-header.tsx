"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogOut, Menu } from "lucide-react"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"

interface UserHeaderProps {
  user?: {
    name?: string
    email?: string
    id?: string
    department?: string
  }
  onLogout?: () => void
  onMenuClick?: () => void
  showMenuButton?: boolean
  isCollapsed?: boolean
  className?: string
}

export function UserHeader({ 
  user, 
  onLogout, 
  onMenuClick, 
  showMenuButton = false,
  isCollapsed = false,
  className = ""
}: UserHeaderProps) {
  return (
    <header className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 px-4 sm:px-6 text-white shadow-md ${className}`}>
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden text-white hover:bg-white/20 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        )}
        <Link href="/dashboard" className="flex items-center gap-3 py-1 hover:opacity-90 transition-opacity">
          <div className="relative h-9 w-9 shadow-lg">
            <div className="absolute inset-0 rounded-full bg-white opacity-90" />
            <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-blue-600 to-green-500" />
            <div className="absolute inset-[4px] rounded-full bg-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="font-bold text-lg tracking-tight">PCRD Smart Request</div>
              <div className="text-xs text-white/80">Polymer Testing Management</div>
            </div>
          )}
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-full py-1 px-3 backdrop-blur-sm">
          <div className="rounded-full bg-white/90 p-1 shadow-sm">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name || "User"}</div>
            <div className="text-xs text-white/80">{user?.email || "user@example.com"}</div>
          </div>
        </div>
        {onLogout && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 hover:text-white rounded-full"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        )}
      </div>
    </header>
  )
}

// User info card component for dashboard or other pages
interface UserInfoCardProps {
  user?: {
    name?: string
    email?: string
    id?: string
    department?: string
    role?: string
  }
  score?: number
  loadingScore?: boolean
  className?: string
}

export function UserInfoCard({ 
  user, 
  score = 0, 
  loadingScore = false,
  className = ""
}: UserInfoCardProps) {
  return (
    <div className={`bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 rounded-lg p-6 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/90 p-3 shadow-md">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name || "User"}!</h2>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-white/90">Email: {user?.email || "user@example.com"}</p>
              {user?.department && (
                <p className="text-sm text-white/90">Department: {user.department}</p>
              )}
              {user?.id && (
                <p className="text-sm text-white/90">User ID: {user.id}</p>
              )}
              {user?.role && (
                <p className="text-sm text-white/90">Role: {user.role}</p>
              )}
            </div>
          </div>
        </div>
        {score !== undefined && (
          <div className="text-right">
            <p className="text-sm text-white/80">Evaluation Score</p>
            <p className="text-3xl font-bold">
              {loadingScore ? (
                <span className="text-lg">Loading...</span>
              ) : (
                <>{score} <span className="text-lg font-normal">evaluations</span></>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}