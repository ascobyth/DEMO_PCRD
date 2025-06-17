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
import PlantReactorForm from "./PlantReactorForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditPlantReactorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlantReactorUpdated: (plantReactor: any) => void
  plantReactorData: any
}

export default function EditPlantReactorDialog({
  open,
  onOpenChange,
  onPlantReactorUpdated,
  plantReactorData
}: EditPlantReactorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/plant-reactors/${plantReactorData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plant reactor')
      }

      toast({
        title: "Success",
        description: "Plant reactor updated successfully",
      })

      onPlantReactorUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating plant reactor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update plant reactor",
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
          <DialogTitle>Edit Plant Reactor</DialogTitle>
          <DialogDescription>
            Update the plant reactor details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <PlantReactorForm
            initialData={plantReactorData}
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
