// Simple test to check API endpoints with timeout handling
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 5000 // 5 second timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('=== Testing API Endpoints ===\n');
  
  try {
    // Test capabilities endpoint
    console.log('1. Testing /api/capabilities:');
    try {
      const capResult = await makeRequest('/api/capabilities');
      console.log(`Status: ${capResult.status}`);
      
      if (capResult.data.success && capResult.data.data) {
        const capabilities = capResult.data.data;
        console.log(`Capabilities count: ${capabilities.length}`);
        console.log('\nCapabilities:');
        capabilities.forEach(cap => {
          console.log(`- ${cap.capabilityName} (${cap.shortName}) - ID: ${cap._id}`);
        });
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    
    // Test test-methods endpoint
    console.log('\n\n2. Testing /api/test-methods:');
    try {
      const methodResult = await makeRequest('/api/test-methods');
      console.log(`Status: ${methodResult.status}`);
      
      if (methodResult.data.success && methodResult.data.data) {
        const methods = methodResult.data.data;
        console.log(`Methods count: ${methods.length}`);
        
        // Check for ER methods
        const erMethods = methods.filter(m => m.serviceType && m.serviceType.includes('ER'));
        console.log(`\nMethods with "ER" service type: ${erMethods.length}`);
        
        if (erMethods.length > 0) {
          console.log('\nER Methods:');
          erMethods.forEach(m => {
            console.log(`- ${m.testingName}`);
            console.log(`  Code: ${m.methodCode || m.methodcode}`);
            console.log(`  Service Type: ${JSON.stringify(m.serviceType)}`);
            console.log(`  Capability: ${m.capabilityId}`);
          });
        }
        
        // Show sample method structure
        if (methods.length > 0) {
          console.log('\n\nSample method from API (first method):');
          console.log(JSON.stringify(methods[0], null, 2));
        }
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the test
testEndpoints();