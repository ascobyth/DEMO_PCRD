const fs = require('fs');
const path = require('path');

// Path to the ER page file
const filePath = path.join(__dirname, 'app', 'request', 'new', 'er', 'page.tsx');

fs.readFile(filePath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Find the section with the useState declarations at the beginning of the component
  const componentStart = content.indexOf('export default function EquipmentReservationPage()');
  const stateDeclarationsEnd = content.indexOf('fundingSource: "io",', componentStart) + 'fundingSource: "io",'.length;
  
  // Find the submit function and state declarations at the end
  const submitFunctionStart = content.indexOf('  // Handle form submission');
  const submitFunctionEnd = content.indexOf('  }', submitFunctionStart + 500) + 3;
  
  if (submitFunctionStart === -1 || stateDeclarationsEnd === -1) {
    console.error('Could not find the required sections in the file');
    return;
  }
  
  // Extract the submit function and state declarations
  const submitFunction = content.substring(submitFunctionStart, submitFunctionEnd);
  
  // Remove the function from its current position
  const contentWithoutFunction = content.substring(0, submitFunctionStart) + content.substring(submitFunctionEnd);
  
  // Insert the function right after the initial state declarations
  const newContent = 
    contentWithoutFunction.substring(0, stateDeclarationsEnd) + 
    '\n\n' + 
    submitFunction + 
    '\n' + 
    contentWithoutFunction.substring(stateDeclarationsEnd);
  
  // Write the modified content back to the file
  fs.writeFile(filePath, newContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully moved the submit function to the correct position in', filePath);
  });
});
