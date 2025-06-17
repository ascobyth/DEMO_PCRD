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
import SampleCommercialForm from "./SampleCommercialForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditSampleCommercialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSampleUpdated: (sample: any) => void
  sampleData: any
}

export default function EditSampleCommercialDialog({
  open,
  onOpenChange,
  onSampleUpdated,
  sampleData
}: EditSampleCommercialDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/commercial-samples/${sampleData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update commercial sample')
      }

      toast({
        title: "Success",
        description: "Commercial sample updated successfully",
      })

      onSampleUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating commercial sample:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update commercial sample",
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
          <DialogTitle>Edit Commercial Sample</DialogTitle>
          <DialogDescription>
            Update the commercial sample details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <SampleCommercialForm
            initialData={sampleData}
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
