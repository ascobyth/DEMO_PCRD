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
import IoForm from "./IoForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddIoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onIoAdded: (io: any) => void
}

export default function AddIoDialog({
  open,
  onOpenChange,
  onIoAdded
}: AddIoDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/ios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add IO')
      }

      toast({
        title: "Success",
        description: "IO added successfully",
      })

      onIoAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding IO:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add IO",
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
          <DialogTitle>Add New IO</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new IO to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <IoForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
