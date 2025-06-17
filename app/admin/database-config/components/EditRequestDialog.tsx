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

interface EditRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestUpdated: (request: any) => void
  requestData: any
}

export default function EditRequestDialog({
  open,
  onOpenChange,
  onRequestUpdated,
  requestData
}: EditRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/requests/${requestData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update request')
      }

      toast({
        title: "Success",
        description: "Request updated successfully",
      })

      onRequestUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
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
          <DialogTitle>Edit Request</DialogTitle>
          <DialogDescription>
            Update the request details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <RequestForm
            initialData={requestData}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            isEditing={true}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
