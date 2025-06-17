// Comprehensive test script to debug and fix the update request issue
const http = require('http');
const https = require('https');

// Configuration
const CONFIG = {
  host: 'localhost',
  port: 3000,
  requestId: 'ME-N-0525-00002' // Change this to your actual request ID
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: body
        };
        
        // Try to parse JSON
        try {
          response.data = JSON.parse(body);
        } catch (e) {
          response.data = body;
        }
        
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code,
        syscall: error.syscall
      });
    });
    
    // Set timeout
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      const jsonData = JSON.stringify(data);
      req.setHeader('Content-Length', Buffer.byteLength(jsonData));
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Test functions
async function testConnection() {
  console.log('1. Testing basic connection...');
  
  try {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: '/api/test-update',
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    console.log('   ✅ Connection successful');
    console.log('   Response:', response.data);
    return true;
  } catch (error) {
    console.log('   ❌ Connection failed:', error);
    return false;
  }
}

async function getRequestDetails() {
  console.log('\n2. Fetching current request details...');
  
  try {
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/api/requests/${CONFIG.requestId}/details`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Request found');
      console.log('   Title:', response.data.data.requestTitle);
      console.log('   Status:', response.data.data.requestStatus);
      return response.data.data;
    } else {
      console.log('   ❌ Request not found');
      console.log('   Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Error fetching request:', error);
    return null;
  }
}

async function testSimplePut() {
  console.log('\n3. Testing simple PUT endpoint...');
  
  try {
    const testData = {
      test: 'data',
      timestamp: new Date().toISOString()
    };
    
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: '/api/test-put',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const response = await makeRequest(options, testData);
    
    if (response.status === 200) {
      console.log('   ✅ Simple PUT works');
      console.log('   Response:', response.data);
      return true;
    } else {
      console.log('   ❌ Simple PUT failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error in simple PUT:', error);
    return false;
  }
}

async function testUpdateRequest(requestData) {
  console.log('\n4. Testing actual request update...');
  
  if (!requestData) {
    console.log('   ⚠️  No request data available, using minimal test data');
  }
  
  const updateData = {
    requestTitle: `Updated Title - ${new Date().toLocaleString()}`,
    requestStatus: "Pending Receive",
    useIONumber: "yes",
    ioNumber: requestData?.ioCostCenter || "100060001234",
    costCenter: requestData?.requesterCostCenter || "COST123",
    priority: requestData?.priority || "normal",
    urgentType: requestData?.urgentType || "",
    urgencyReason: requestData?.urgencyReason || "",
    samples: requestData?.samples || [{
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
    const options = {
      hostname: CONFIG.host,
      port: CONFIG.port,
      path: `/api/requests/${CONFIG.requestId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    console.log('   Sending update...');
    const response = await makeRequest(options, updateData);
    
    if (response.status === 200 && response.data.success) {
      console.log('   ✅ Update successful');
      console.log('   Response:', response.data);
      return true;
    } else {
      console.log('   ❌ Update failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      
      // If error, try to understand why
      if (response.data.error) {
        console.log('\n   Error details:', response.data.error);
        
        // Common issues
        if (response.data.error.includes('not found')) {
          console.log('   💡 Suggestion: Check if the request ID exists in the database');
        } else if (response.data.error.includes('validation')) {
          console.log('   💡 Suggestion: Check the data format and required fields');
        } else if (response.data.error.includes('Schema')) {
          console.log('   💡 Suggestion: Check if all models are properly loaded');
        }
      }
      
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error updating request:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Suggestion: Make sure the development server is running (npm run dev)');
    } else if (error.message.includes('timeout')) {
      console.log('   💡 Suggestion: The request is taking too long, check server logs');
    }
    
    return false;
  }
}

async function verifyUpdate() {
  console.log('\n5. Verifying the update...');
  
  const updatedData = await getRequestDetails();
  if (updatedData) {
    console.log('   New title:', updatedData.requestTitle);
    console.log('   Updated at:', updatedData.updatedAt);
    
    if (updatedData.requestTitle.includes('Updated Title')) {
      console.log('   ✅ Update verified successfully!');
      return true;
    } else {
      console.log('   ❌ Title was not updated');
      return false;
    }
  }
  
  return false;
}

// Main test flow
async function runTests() {
  console.log('=== UPDATE REQUEST DEBUG TEST ===');
  console.log(`Testing with request ID: ${CONFIG.requestId}`);
  console.log(`Server: http://${CONFIG.host}:${CONFIG.port}`);
  console.log('================================\n');
  
  // Test 1: Basic connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot connect to server. Please check:');
    console.log('   1. Is the development server running? (npm run dev)');
    console.log('   2. Is it running on port 3000?');
    console.log('   3. Are there any firewall issues?');
    return;
  }
  
  // Test 2: Get current request
  const currentData = await getRequestDetails();
  
  // Test 3: Simple PUT
  await testSimplePut();
  
  // Test 4: Actual update
  const updateSuccess = await testUpdateRequest(currentData);
  
  // Test 5: Verify if successful
  if (updateSuccess) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
    await verifyUpdate();
  }
  
  console.log('\n=== TEST COMPLETE ===');
  
  // Summary
  console.log('\nSummary:');
  if (updateSuccess) {
    console.log('✅ The update functionality is working correctly');
  } else {
    console.log('❌ The update is failing. Check the error messages above.');
    console.log('\nNext steps:');
    console.log('1. Check the server console for error logs');
    console.log('2. Verify the request ID exists in the database');
    console.log('3. Check if all required models are loaded');
    console.log('4. Ensure MongoDB is running and accessible');
  }
}

// Run the tests
runTests().catch(console.error);