"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, Loader2 } from "lucide-react"

interface TerminateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  requestNumber: string
  onTerminated?: () => void
}

export function TerminateRequestDialog({
  open,
  onOpenChange,
  requestId,
  requestNumber,
  onTerminated
}: TerminateRequestDialogProps) {
  const [isTerminating, setIsTerminating] = useState(false)
  const [terminationReason, setTerminationReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const handleTerminate = async () => {
    if (!confirmed) {
      toast({
        title: "Please confirm",
        description: "You must check the confirmation box to proceed",
        variant: "destructive"
      })
      return
    }

    if (!terminationReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for termination",
        variant: "destructive"
      })
      return
    }

    setIsTerminating(true)

    try {
      const response = await fetch(`/api/requests/${requestId}/terminate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: terminationReason,
          terminateDate: new Date().toISOString()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Request Terminated",
          description: `Request ${requestNumber} has been terminated successfully`
        })
        
        // Reset form
        setTerminationReason("")
        setConfirmed(false)
        
        onOpenChange(false)
        if (onTerminated) {
          onTerminated()
        }
      } else {
        throw new Error(result.error || "Failed to terminate request")
      }
    } catch (error) {
      console.error("Error terminating request:", error)
      toast({
        title: "Error",
        description: "Failed to terminate request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsTerminating(false)
    }
  }

  const handleClose = () => {
    if (!isTerminating) {
      setTerminationReason("")
      setConfirmed(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Terminate Request
          </DialogTitle>
          <DialogDescription>
            Terminate request {requestNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>By terminating this request:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>All pending samples will be cancelled</li>
                <li>Testing that has already been performed will still be charged</li>
                <li>In-progress and completed tests will retain their status</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination *</Label>
            <Textarea
              id="reason"
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value)}
              placeholder="Please provide a reason for terminating this request..."
              className="min-h-[100px]"
              disabled={isTerminating}
            />
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 rounded border-gray-300"
              disabled={isTerminating}
            />
            <Label htmlFor="confirm" className="font-normal text-sm">
              I understand that completed testing will still be charged and this action cannot be undone
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isTerminating}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTerminate}
            disabled={isTerminating || !confirmed || !terminationReason.trim()}
          >
            {isTerminating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Terminating...
              </>
            ) : (
              "Terminate Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}