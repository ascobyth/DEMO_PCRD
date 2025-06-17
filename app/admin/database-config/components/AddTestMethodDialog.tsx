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
import TestMethodForm from "./TestMethodForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddTestMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTestMethodAdded: (testMethod: any) => void
}

export default function AddTestMethodDialog({
  open,
  onOpenChange,
  onTestMethodAdded
}: AddTestMethodDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      // Log the image data for debugging
      console.log('Image data in add:', {
        descriptionImg: formData.descriptionImg,
        keyResultImg: formData.keyResultImg
      });

      // Create a clean copy of the form data for submission
      const submissionData = { ...formData };

      // Ensure image fields are properly handled
      if (submissionData.descriptionImg === null || !submissionData.descriptionImg) {
        // If null, undefined, or empty string, set to null
        submissionData.descriptionImg = null;
      }

      if (submissionData.keyResultImg === null || !submissionData.keyResultImg) {
        // If null, undefined, or empty string, set to null
        submissionData.keyResultImg = null;
      }

      console.log('Sending test method data to API:', submissionData)

      const response = await fetch('/api/test-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      console.log('API response status:', response.status)

      let data;
      try {
        // Get the response data as JSON
        data = await response.json()
        console.log('API response data:', data)
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Failed to parse server response. Please try again.');
      }

      if (!response.ok) {
        console.error('API response not OK:', response.status, data);
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          error: data?.error,
          message: data?.message,
          details: data?.details,
          fullData: data
        });
        throw new Error(data?.error || `Failed to add test method (${response.status})`)
      }

      toast({
        title: "Success",
        description: "Test method added successfully",
      })

      onTestMethodAdded(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding test method:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add test method",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1100px] lg:max-w-[1200px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Test Method</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new test method to the system.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          <TestMethodForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
