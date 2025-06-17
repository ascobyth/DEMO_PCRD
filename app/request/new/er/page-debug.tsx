"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"

export default function EquipmentReservationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>Equipment Reservation Page - Debug Version</div>
    </DashboardLayout>
  )
}