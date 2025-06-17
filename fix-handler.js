// Fix the handleSubmitER function issue
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'request', 'new', 'er', 'page.tsx');

// Read the file content
fs.readFile(filePath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Define the new function to be added near the top of the component
  const newFunction = `
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Handle form submission
  const handleSubmitER = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
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
      };
      
      // Send the data to the API endpoint
      const response = await fetch('/api/requests/submit-er', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit ER request');
      }
      
      // Navigate to the confirmation page with the request data
      router.push(\`/request/new/er/confirmation?requestNumber=\${result.data.requestNumber}\`);
    } catch (error) {
      console.error('Error submitting ER request:', error);
      setSubmitError(error.message || 'An error occurred while submitting your request');
      toast({
        title: "Submission Error",
        description: error.message || 'An error occurred while submitting your request',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
`;

  // Find the position to insert - after useState declarations
  const stateDeclarationsPos = content.indexOf('const [formData, setFormData] = useState({');
  const stateEndPos = content.indexOf('});', stateDeclarationsPos) + 3;
  
  if (stateDeclarationsPos === -1) {
    console.error('Could not find the state declarations');
    return;
  }

  // Clean up the old function if it exists
  let cleanedContent = content;
  const oldFunctionStart = content.indexOf('  // Handle form submission');
  if (oldFunctionStart !== -1) {
    const oldFunctionEnd = content.indexOf('  };', oldFunctionStart) + 4;
    if (oldFunctionEnd !== -1) {
      cleanedContent = content.substring(0, oldFunctionStart) + content.substring(oldFunctionEnd);
    }
  }

  // Insert the new function
  const newContent = 
    cleanedContent.substring(0, stateEndPos) + 
    newFunction +
    cleanedContent.substring(stateEndPos);

  // Write the updated content
  fs.writeFile(filePath, newContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully added handleSubmitER to the right position in', filePath);
  });
});
