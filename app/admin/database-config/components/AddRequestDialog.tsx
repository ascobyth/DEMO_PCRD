"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import RequestForm from "./RequestForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestAdded: (request: any) => void
}

export default function AddRequestDialog({
  open,
  onOpenChange,
  onRequestAdded
}: AddRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add request')
      }

      toast({
        title: "Success",
        description: "Request added successfully",
      })

      onRequestAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding request:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Request</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new request to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <RequestForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
