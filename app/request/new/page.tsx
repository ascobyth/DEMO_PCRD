"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import RequestTypeCard from "@/components/request-type-card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function NewRequestPage() {
  // Clear all request data when this page loads
  useEffect(() => {
    // Clear all request-related data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem("ntrFormData");
      localStorage.removeItem("ntrFormData_persistent");
      localStorage.removeItem("ntrSamples");
      localStorage.removeItem("ntrTestMethods");
      localStorage.removeItem("smartAssistantRecommendations");

      // Also clear ASR and ER data for completeness
      localStorage.removeItem("asrFormData");
      localStorage.removeItem("asrSamples");
      localStorage.removeItem("erFormData");
      localStorage.removeItem("erSamples");

      console.log("Cleared all request data from localStorage on request type selection page");
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Request</h1>
          <p className="text-muted-foreground">Select the type of request you want to create</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <RequestTypeCard
            title="Normal Test Request (NTR)"
            description="Request standard polymer testing methods with predefined parameters and workflows."
            icon="beaker"
            href="/request/new/ntr"
            color="blue"
          />
          <RequestTypeCard
            title="Analysis Solution Request (ASR)"
            description="Request custom analysis solutions for complex polymer characterization problems."
            icon="flask"
            href="/request/new/asr"
            color="green"
          />
          <RequestTypeCard
            title="Equipment Reservation (ER)"
            description="Reserve laboratory equipment for self-service testing and experiments."
            icon="microscope"
            href="/request/new/er"
            color="purple"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

