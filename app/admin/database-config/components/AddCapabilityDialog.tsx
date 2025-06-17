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
import CapabilityForm from "./CapabilityForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddCapabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapabilityAdded: (capability: any) => void
}

export default function AddCapabilityDialog({
  open,
  onOpenChange,
  onCapabilityAdded
}: AddCapabilityDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      // Ensure capHeadGroup is valid
      if (formData.capHeadGroup && formData.capHeadGroup !== "none") {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(formData.capHeadGroup);
        if (!isValidObjectId) {
          console.warn('Invalid ObjectId for capHeadGroup:', formData.capHeadGroup);
          formData.capHeadGroup = null;
        }
      } else if (formData.capHeadGroup === "none") {
        // Convert "none" to null for the database
        formData.capHeadGroup = null;
      }

      console.log('Sending capability data to API:', formData)

      const response = await fetch('/api/capabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('API response status:', response.status)

      let data;
      try {
        // Get the response data as JSON
        data = await response.json()
        console.log('API response data:', data)
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Failed to parse server response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Failed to add capability (${response.status})`)
      }

      toast({
        title: "Success",
        description: "Capability added successfully",
      })

      onCapabilityAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding capability:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add capability",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Capability</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new capability to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <CapabilityForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
