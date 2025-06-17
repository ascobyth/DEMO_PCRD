# PowerShell script to add the submit function to the ER page

$filePath = "G:\smr\git clone\pcrdrequestsystem_cluade_code\app\request\new\er\page.tsx"
$content = Get-Content -Path $filePath -Raw

# Find the position where we need to replace the submit button
$submitButtonStart = $content.IndexOf('<Button onClick={() => router.push("/request/new/er/confirmation")}>Submit Reservation</Button>')
$submitButtonEnd = $submitButtonStart + '<Button onClick={() => router.push("/request/new/er/confirmation")}>Submit Reservation</Button>'.Length

if ($submitButtonStart -ge 0) {
    # Add the submit function before the final closing brace
    $lastBracePosition = $content.LastIndexOf('}')
    
    # Create the submit function
    $submitFunction = @"

  // Handle form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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
        equipment: formData.equipment || [],
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
      router.push(`/request/new/er/confirmation?requestNumber=\${result.data.requestNumber}`)
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

"@

    # Replace the submit button
    $newSubmitButton = '<Button onClick={handleSubmitER} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Reservation"}
                </Button>'
    
    # Insert the submit function and replace the button
    $newContent = $content.Substring(0, $lastBracePosition) + $submitFunction + $content.Substring($lastBracePosition)
    $newContent = $newContent.Substring(0, $submitButtonStart) + $newSubmitButton + $newContent.Substring($submitButtonEnd)
    
    # Write the modified content back to the file
    Set-Content -Path $filePath -Value $newContent
    
    Write-Output "Successfully added submit function to $filePath"
} else {
    Write-Output "Could not find submit button in $filePath"
}
