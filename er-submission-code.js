// Add these imports near the top of the file if not present already
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

// Add these state variables in the component function
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)

// Add this function to handle the form submission
const handleSubmitER = async () => {
  setIsSubmitting(true)
  setSubmitError(null)
  
  try {
    // Format the data according to your API needs
    const requestData = {
      requestTitle: formData.projectName,
      useIONumber: formData.fundingSource === 'io' ? 'yes' : 'no',
      ioNumber: formData.ioNumber || '',
      costCenter: formData.costCenter || '',
      priority: formData.priority || 'normal',
      urgentType: formData.priority === 'urgent' ? formData.urgentType : '',
      urgencyReason: formData.priority === 'urgent' ? formData.urgencyReason : '',
      requester: {
        name: formData.requesterName || '',
        email: formData.requesterEmail || '',
      },
      equipment: formData.equipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        startTime: eq.startTime,
        endTime: eq.endTime,
        duration: eq.duration,
        remarks: eq.remarks,
        isDeleted: eq.isDeleted || false,
      })),
      reservationStartDate: formData.startDate,
      reservationEndDate: formData.endDate,
      notes: formData.additionalNotes || '',
    }
    
    // Send the data to the API endpoint
    const response = await fetch('/api/requests/submit-er', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit ER request')
    }
    
    // Navigate to the confirmation page with the request data
    router.push(`/request/new/er/confirmation?requestNumber=${result.data.requestNumber}`)
  } catch (error) {
    console.error('Error submitting ER request:', error)
    setSubmitError(error.message || 'An error occurred while submitting your request')
    toast({
      title: "Submission Error",
      description: error.message || 'An error occurred while submitting your request',
      variant: "destructive",
    })
  } finally {
    setIsSubmitting(false)
  }
}

// Replace the Submit button with:
// <Button onClick={handleSubmitER} disabled={isSubmitting}>
//   {isSubmitting ? "Submitting..." : "Submit Reservation"}
// </Button>
