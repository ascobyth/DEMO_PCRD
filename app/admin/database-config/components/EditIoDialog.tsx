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

interface EditIoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onIoUpdated: (io: any) => void
  ioData: any
}

export default function EditIoDialog({
  open,
  onOpenChange,
  onIoUpdated,
  ioData
}: EditIoDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/ios/${ioData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update IO')
      }

      toast({
        title: "Success",
        description: "IO updated successfully",
      })

      onIoUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating IO:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update IO",
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
          <DialogTitle>Edit IO</DialogTitle>
          <DialogDescription>
            Update the IO details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <IoForm
            initialData={ioData}
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
