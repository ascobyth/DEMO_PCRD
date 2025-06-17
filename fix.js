const fs = require('fs');
const path = require('path');

// Fix the router.push statement in the ER page
const filePath = path.join(__dirname, 'app', 'request', 'new', 'er', 'page.tsx');

fs.readFile(filePath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Find the incorrect line
  const errorLine = "router.push(/request/new/er/confirmation?requestNumber=\\)";
  const errorLineIndex = content.indexOf(errorLine);
  
  if (errorLineIndex === -1) {
    console.error('Could not find the error line in the file');
    return;
  }

  // Replace with the correct template string format
  const correctedLine = "router.push(`/request/new/er/confirmation?requestNumber=${result.data.requestNumber}`)";
  const newContent = content.replace(errorLine, correctedLine);

  // Write the modified content back to the file
  fs.writeFile(filePath, newContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully fixed the router.push line in', filePath);
  });
});
