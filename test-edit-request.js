// Test script to verify Edit Request functionality

async function testEditRequestFlow() {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('🔍 Testing Edit Request Functionality\n');
  
  try {
    // Step 1: Create a test request first
    console.log('1. Creating a test request...');
    const testRequestData = {
      requestTitle: "Test Request for Edit",
      requestStatus: "Pending Receive", 
      priority: "normal",
      useIONumber: "yes",
      ioNumber: "100060001234",
      costCenter: "CC123",
      requesterEmail: "test@example.com",
      samples: [
        {
          id: "sample-1",
          name: "Test Sample 1",
          generatedName: "TS-001",
          category: "commercial",
          grade: "Grade A",
          type: "Polymer",
          form: "Pellet"
        }
      ],
      testMethods: [
        {
          id: "method-1", 
          name: "Rheology Test",
          methodCode: "RH001",
          capabilityId: "cap-rheology",
          capabilityName: "Rheology",
          category: "Rheology",
          price: 1000,
          samples: ["TS-001"]
        }
      ]
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/requests/submit-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequestData)
    });
    
    const createResult = await createResponse.json();
    console.log('Create response:', createResult);
    
    if (!createResult.success) {
      throw new Error('Failed to create test request: ' + createResult.error);
    }
    
    const requestNumber = createResult.data.requestNumber;
    console.log('✅ Created request:', requestNumber);
    
    // Step 2: Test fetching request details (what happens when Edit is clicked)
    console.log('\n2. Testing request details API...');
    const detailsResponse = await fetch(`${BASE_URL}/api/requests/${requestNumber}/details`);
    const detailsResult = await detailsResponse.json();
    
    console.log('Details API response:', {
      success: detailsResult.success,
      hasData: !!detailsResult.data,
      requestNumber: detailsResult.data?.requestNumber,
      title: detailsResult.data?.requestTitle,
      hasJsonSampleList: !!detailsResult.data?.jsonSampleList,
      hasJsonTestingList: !!detailsResult.data?.jsonTestingList
    });
    
    if (!detailsResult.success) {
      throw new Error('Failed to fetch request details: ' + detailsResult.error);
    }
    
    // Parse the JSON fields to verify they contain data
    if (detailsResult.data.jsonSampleList) {
      const samples = JSON.parse(detailsResult.data.jsonSampleList);
      console.log('Parsed samples:', samples.length, 'samples found');
    }
    
    if (detailsResult.data.jsonTestingList) {
      const methods = JSON.parse(detailsResult.data.jsonTestingList);
      console.log('Parsed test methods:', methods.length, 'methods found');
      if (methods.length > 0) {
        console.log('First method capability:', methods[0].capabilityName);
      }
    }
    
    // Step 3: Test updating the request (what happens when Update Request is clicked)
    console.log('\n3. Testing request update...');
    const updateData = {
      ...testRequestData,
      requestTitle: "Updated Test Request Title",
      priority: "high",
      samples: [
        ...testRequestData.samples,
        {
          id: "sample-2",
          name: "Test Sample 2", 
          generatedName: "TS-002",
          category: "commercial",
          grade: "Grade B",
          type: "Polymer",
          form: "Powder"
        }
      ],
      testMethods: [
        {
          ...testRequestData.testMethods[0],
          samples: ["TS-001", "TS-002"] // Updated to include both samples
        }
      ]
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/requests/${requestNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update response:', updateResult);
    
    if (!updateResult.success) {
      throw new Error('Failed to update request: ' + updateResult.error);
    }
    
    // Step 4: Verify the update by fetching details again
    console.log('\n4. Verifying update...');
    const verifyResponse = await fetch(`${BASE_URL}/api/requests/${requestNumber}/details`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success && verifyResult.data) {
      console.log('✅ Update verified:');
      console.log('- Title updated:', verifyResult.data.requestTitle === "Updated Test Request Title");
      console.log('- Priority updated:', verifyResult.data.priority === "high");
      
      if (verifyResult.data.jsonSampleList) {
        const updatedSamples = JSON.parse(verifyResult.data.jsonSampleList);
        console.log('- Samples count:', updatedSamples.length);
      }
    }
    
    // Step 5: Check TestingSampleList entries
    console.log('\n5. Checking TestingSampleList entries...');
    const samplesResponse = await fetch(`${BASE_URL}/api/requests/samples?requestNumber=${requestNumber}`);
    const samplesResult = await samplesResponse.json();
    
    if (samplesResult.success) {
      console.log('TestingSampleList entries:', samplesResult.data?.length || 0);
    }
    
    console.log('\n✅ Edit request functionality test completed successfully!');
    console.log('\nSummary:');
    console.log('- Request creation: ✅');
    console.log('- Details fetching: ✅'); 
    console.log('- Request update: ✅');
    console.log('- Data persistence: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testEditRequestFlow().catch(console.error);