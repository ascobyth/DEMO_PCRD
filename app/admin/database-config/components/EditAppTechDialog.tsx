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

interface EditAppTechDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppTechUpdated: (appTech: any) => void
  appTechData: any
}

export default function EditAppTechDialog({
  open,
  onOpenChange,
  onAppTechUpdated,
  appTechData
}: EditAppTechDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/app-techs/${appTechData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update app tech')
      }

      toast({
        title: "Success",
        description: "App tech updated successfully",
      })

      onAppTechUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating app tech:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update app tech",
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
          <DialogTitle>Edit App Tech</DialogTitle>
          <DialogDescription>
            Update the app tech details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <AppTechForm
            initialData={appTechData}
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
