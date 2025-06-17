# Direct approach to fix the handleSubmitER reference error

$filePath = "G:\smr\git clone\pcrdrequestsystem_cluade_code\app\request\new\er\page.tsx"
$content = Get-Content -Path $filePath -Raw

# Get the submit button code pattern
$submitButtonPattern = '<Button onClick={handleSubmitER} disabled={isSubmitting}>'
$submitButtonPos = $content.IndexOf($submitButtonPattern)

# Check if we find the button pattern
if ($submitButtonPos -eq -1) {
    Write-Host "Could not find the submit button pattern in the file"
    exit 1
}

# Get a section of the content around the submit button
$contextStart = [Math]::Max(0, $submitButtonPos - 500)
$contextLength = 1000
$context = $content.Substring($contextStart, [Math]::Min($contextLength, $content.Length - $contextStart))

# Output the context for debugging
Write-Host "Context around submit button:"
Write-Host $context

# Find the handleSubmitER function declaration
$handleSubmitPattern = '// Handle form submission'
$handleSubmitPos = $content.IndexOf($handleSubmitPattern)

if ($handleSubmitPos -eq -1) {
    Write-Host "Could not find the handleSubmitER function declaration"
    exit 1
}

# Extract the entire function definition and related state variables
$functionEndPos = $content.IndexOf("}", $handleSubmitPos + 500) + 1
$functionCode = $content.Substring($handleSubmitPos, $functionEndPos - $handleSubmitPos)

Write-Host "Function code to move:"
Write-Host $functionCode

# Find a position to insert the function (right after the component start and initial state declarations)
$componentStart = $content.IndexOf("export default function EquipmentReservationPage()")
$insertPos = $content.IndexOf("fundingSource: \"io\",", $componentStart)
$insertPos = $content.IndexOf(",", $insertPos) + 1

# Move the function to the component start
$newContent = $content.Substring(0, $insertPos) + `
              "`n`n  // State for form submission`n  const [isSubmitting, setIsSubmitting] = useState(false)`n  const [submitError, setSubmitError] = useState(null)`n`n  const handleSubmitER = async () => {`n    setIsSubmitting(true)`n    setSubmitError(null)`n    `n    try {`n      // Format the data according to your API needs`n      const requestData = {`n        requestTitle: formData.projectName,`n        useIONumber: formData.fundingSource === 'io' ? 'yes' : 'no',`n        ioNumber: formData.ioNumber || '',`n        costCenter: formData.costCenter || '',`n        priority: formData.priority || 'normal',`n        urgentType: formData.priority === 'urgent' ? formData.urgentType : '',`n        urgencyReason: formData.priority === 'urgent' ? formData.urgencyReason : '',`n        requester: {`n          name: formData.requesterName || '',`n          email: formData.requesterEmail || '',`n        },`n        equipment: formData.equipment || [],`n        reservationStartDate: formData.startDate,`n        reservationEndDate: formData.endDate,`n        notes: formData.additionalNotes || '',`n      }`n      `n      // Send the data to the API endpoint`n      const response = await fetch('/api/requests/submit-er', {`n        method: 'POST',`n        headers: {`n          'Content-Type': 'application/json',`n        },`n        body: JSON.stringify(requestData),`n      })`n      `n      const result = await response.json()`n      `n      if (!result.success) {`n        throw new Error(result.error || 'Failed to submit ER request')`n      }`n      `n      // Navigate to the confirmation page with the request data`n      router.push(`/request/new/er/confirmation?requestNumber=${result.data.requestNumber}`)`n    } catch (error) {`n      console.error('Error submitting ER request:', error)`n      setSubmitError(error.message || 'An error occurred while submitting your request')`n      toast({`n        title: \"Submission Error\",`n        description: error.message || 'An error occurred while submitting your request',`n        variant: \"destructive\",`n      })`n    } finally {`n      setIsSubmitting(false)`n    }`n  }`n`n" + `
              $content.Substring($insertPos)

# Remove the original function code
$functionStartPos = $content.IndexOf("  // Handle form submission")
$functionEndPos = $content.IndexOf("}", $functionStartPos + 500) + 1
$newContent = $newContent.Replace($content.Substring($functionStartPos, $functionEndPos - $functionStartPos), "")

# Output the new content for debugging
$snippetStart = [Math]::Max(0, $insertPos - 100)
$snippetLength = 300
$snippet = $newContent.Substring($snippetStart, [Math]::Min($snippetLength, $newContent.Length - $snippetStart))
Write-Host "New content snippet:"
Write-Host $snippet

# Write the modified content back to file
Set-Content -Path $filePath -Value $newContent
Write-Host "Successfully updated the file with the function moved to the correct position"
