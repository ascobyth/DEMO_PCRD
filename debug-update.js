// Debug script to trace the update flow
const http = require('http');

// Function to make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugUpdate() {
  const requestId = 'ME-N-0525-00002'; // Replace with your request ID
  const baseUrl = 'localhost';
  const port = 3000;
  
  console.log('=== UPDATE DEBUG TRACE ===\n');
  
  // Step 1: Get current request details
  console.log('1. Fetching current request details...');
  try {
    const getOptions = {
      hostname: baseUrl,
      port: port,
      path: `/api/requests/${requestId}/details`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const currentData = await makeRequest(getOptions);
    console.log('   Status:', currentData.status);
    
    if (currentData.status === 200 && currentData.data.success) {
      console.log('   Current Title:', currentData.data.data.requestTitle);
      console.log('   Last Updated:', currentData.data.data.updatedAt);
    } else {
      console.log('   Error:', currentData.data);
      return;
    }
  } catch (error) {
    console.error('   Failed to fetch:', error.message);
    return;
  }
  
  // Step 2: Attempt to update
  console.log('\n2. Attempting to update request...');
  const newTitle = `Updated Title - ${new Date().toLocaleString()}`;
  
  const updateData = {
    requestTitle: newTitle,
    requestStatus: "Pending Receive",
    useIONumber: "yes",
    ioNumber: "100060001234",
    costCenter: "COST123",
    priority: "normal",
    samples: [{
      id: "sample-1",
      sampleId: "sample-1",
      name: "Test Sample",
      generatedName: "Test Sample",
      category: "commercial",
      remark: ""
    }],
    testMethods: [{
      id: "method-1",
      methodId: "method-1",
      name: "Test Method",
      methodCode: "TM001",
      category: "Testing",
      price: 100,
      turnaround: 7,
      remarks: "",
      testingRemark: "",
      samples: ["Test Sample"]
    }]
  };
  
  try {
    const putOptions = {
      hostname: baseUrl,
      port: port,
      path: `/api/requests/${requestId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(updateData))
      }
    };
    
    console.log('   Sending update with new title:', newTitle);
    const updateResponse = await makeRequest(putOptions, updateData);
    console.log('   Update Status:', updateResponse.status);
    console.log('   Update Response:', updateResponse.data);
  } catch (error) {
    console.error('   Update failed:', error.message);
    return;
  }
  
  // Step 3: Verify the update
  console.log('\n3. Verifying update...');
  // Wait a bit for the update to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const verifyOptions = {
      hostname: baseUrl,
      port: port,
      path: `/api/requests/${requestId}/details`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const verifyData = await makeRequest(verifyOptions);
    
    if (verifyData.status === 200 && verifyData.data.success) {
      console.log('   New Title:', verifyData.data.data.requestTitle);
      console.log('   Updated At:', verifyData.data.data.updatedAt);
      
      if (verifyData.data.data.requestTitle === newTitle) {
        console.log('\n✅ UPDATE SUCCESSFUL!');
      } else {
        console.log('\n❌ UPDATE FAILED - Title not changed');
      }
    }
  } catch (error) {
    console.error('   Verification failed:', error.message);
  }
  
  console.log('\n=== END DEBUG TRACE ===');
}

// Run the debug
console.log('Starting debug...');
console.log('Make sure your development server is running on http://localhost:3000\n');

debugUpdate().catch(console.error);