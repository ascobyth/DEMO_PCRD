// Script to verify if request updates are working
const fetch = require('node-fetch');

async function verifyUpdate() {
  const requestId = 'ME-N-0525-00002'; // Replace with your actual request ID
  const apiUrl = `http://localhost:3000/api/requests/${requestId}/details`;
  
  try {
    console.log(`Fetching request details for: ${requestId}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\nRequest Details:');
      console.log('- Request Number:', data.data.requestNumber);
      console.log('- Title:', data.data.requestTitle);
      console.log('- Status:', data.data.requestStatus);
      console.log('- Priority:', data.data.priority);
      console.log('- Updated At:', data.data.updatedAt);
      console.log('- Number of samples:', data.data.samples?.length || 0);
      
      // Check the JSON fields
      if (data.data.jsonSampleList) {
        try {
          const samples = JSON.parse(data.data.jsonSampleList);
          console.log('- Samples in JSON:', samples.length);
        } catch (e) {
          console.log('- Could not parse jsonSampleList');
        }
      }
      
      if (data.data.jsonTestingList) {
        try {
          const methods = JSON.parse(data.data.jsonTestingList);
          console.log('- Test methods in JSON:', methods.length);
        } catch (e) {
          console.log('- Could not parse jsonTestingList');
        }
      }
    } else {
      console.error('API returned error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. The development server is running (npm run dev)');
    console.log('2. MongoDB is accessible');
    console.log('3. The request ID exists in the database');
  }
}

// Run the verification
verifyUpdate();