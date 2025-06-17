"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/components/auth-provider"

export default function EquipmentReservationPage() {
  const { user, isLoading: authLoading } = useAuth()
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>Equipment Reservation Page</div>
    </DashboardLayout>
  )
}