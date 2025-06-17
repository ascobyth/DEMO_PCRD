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

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: (user: any) => void
  userData: any
}

export default function EditUserDialog({ open, onOpenChange, onUserUpdated, userData }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    // Validate the data before sending to API
    const dataToSend = { ...formData };

    // Ensure role is not empty and is a valid enum value
    if (!dataToSend.role || dataToSend.role === "") {
      dataToSend.role = "Requester"; // Default to Requester if empty
    }

    console.log('Sending data to API:', dataToSend);
    console.log('Approvers in data to send:', dataToSend.approvers);
    console.log('Approvers type:', Array.isArray(dataToSend.approvers) ? 'Array' : typeof dataToSend.approvers);

    try {
      // Ensure we're using the MongoDB _id
      const userId = userData._id || userData.id;
      console.log('User ID for API call:', userId);
      console.log('User data:', userData);

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
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
          throw new Error(errorData.error || `Failed to update user: ${response.status}`);
        } catch (parseError) {
          // If can't parse as JSON, use the raw text
          throw new Error(`Failed to update user: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      onUserUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <UserForm
            initialData={userData}
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
