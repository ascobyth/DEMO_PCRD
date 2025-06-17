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
import AppTechForm from "./AppTechForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddAppTechDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppTechAdded: (appTech: any) => void
}

export default function AddAppTechDialog({
  open,
  onOpenChange,
  onAppTechAdded
}: AddAppTechDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/app-techs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add app tech')
      }

      toast({
        title: "Success",
        description: "App tech added successfully",
      })

      onAppTechAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding app tech:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add app tech",
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
          <DialogTitle>Add New App Tech</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new app tech to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <AppTechForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
