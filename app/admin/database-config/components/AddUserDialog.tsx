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
import UserForm from "./UserForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserAdded: (user: any) => void
}

export default function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    console.log('AddUserDialog received form data:', formData);
    console.log('Capabilities in AddUserDialog:', formData.capabilities);

    try {
      // Create a copy of the form data to send to the API
      const dataToSend = { ...formData };

      // Ensure role is not empty and is a valid enum value
      if (!dataToSend.role || dataToSend.role === "") {
        dataToSend.role = "Requester"; // Default to Requester if empty
      }

      console.log('Data being sent to API:', dataToSend);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(dataToSend),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to add user: ${response.status}`);
        } catch (parseError) {
          // If can't parse as JSON, use the raw text
          throw new Error(`Failed to add user: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "User added successfully",
      })

      onUserAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
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
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new user to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
