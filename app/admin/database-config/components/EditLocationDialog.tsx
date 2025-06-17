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
import LocationForm from "./LocationForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationUpdated: (location: any) => void
  locationData: any
}

export default function EditLocationDialog({
  open,
  onOpenChange,
  onLocationUpdated,
  locationData
}: EditLocationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/locations/${locationData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update location')
      }

      toast({
        title: "Success",
        description: "Location updated successfully",
      })

      onLocationUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating location:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update location",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>
            Update the location details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <LocationForm
            initialData={locationData}
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
