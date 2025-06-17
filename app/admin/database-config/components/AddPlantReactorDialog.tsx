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

interface AddPlantReactorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlantReactorAdded: (plantReactor: any) => void
}

export default function AddPlantReactorDialog({
  open,
  onOpenChange,
  onPlantReactorAdded
}: AddPlantReactorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/plant-reactors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add plant reactor')
      }

      toast({
        title: "Success",
        description: "Plant reactor added successfully",
      })

      onPlantReactorAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding plant reactor:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add plant reactor",
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
          <DialogTitle>Add New Plant Reactor</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new plant reactor to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <PlantReactorForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
