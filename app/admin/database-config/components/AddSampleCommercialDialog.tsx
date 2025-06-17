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

interface AddSampleCommercialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSampleAdded: (sample: any) => void
}

export default function AddSampleCommercialDialog({
  open,
  onOpenChange,
  onSampleAdded
}: AddSampleCommercialDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/commercial-samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add commercial sample')
      }

      toast({
        title: "Success",
        description: "Commercial sample added successfully",
      })

      onSampleAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding commercial sample:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add commercial sample",
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
          <DialogTitle>Add New Commercial Sample</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new commercial sample to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <SampleCommercialForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
