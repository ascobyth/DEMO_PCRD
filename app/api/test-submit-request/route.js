import { NextResponse } from 'next/server';

/**
 * API route handler for testing the submit-request API
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function GET() {
  try {
    // Create a test request payload
    const testPayload = {
      requestTitle: 'Test Request',
      requestStatus: 'submitted',
      useIONumber: 'yes',
      ioNumber: '0900011560',
      costCenter: '010001560',
      priority: 'normal',
      urgentType: '',
      urgencyReason: '',
      approver: null,
      urgentMemo: null,
      requester: { name: 'Test User', email: 'test@example.com', department: 'Test Department' },
      samples: [
        {
          category: 'commercial',
          grade: 'Test Grade',
          lot: '123',
          sampleIdentity: 'TEST',
          type: 'Test Type',
          form: 'Test Form',
          generatedName: 'Test-Grade-123-TEST',
          id: 'sample-test-123',
          sampleId: 'sample-test-123',
          name: 'Test-Grade-123-TEST',
          remark: 'Test remark'
        }
      ],
      testMethods: [
        {
          id: '6813fa50bb6366b09633fea7', // This should be a valid method ID in your database
          name: 'Test Method',
          description: 'Test description',
          methodCode: 'TEST-001',
          category: 'Test Category',
          capabilityId: '6810d1c35aec8fb1ec887b4b', // This should be a valid capability ID in your database
          capabilityName: 'Rheology',
          price: 100,
          turnaround: 7,
          sampleAmount: 10,
          unit: 'g',
          keyResult: 'Test key result',
          workingHour: 8,
          images: {},
          selected: true,
          samples: ['Test-Grade-123-TEST'],
          instances: [],
          requirements: '',
          isSmartAssistant: false,
          methodId: '6813fa50bb6366b09633fea7',
          remarks: 'Test remarks',
          testingRemark: 'Test testing remark'
        }
      ],
      isOnBehalf: false,
      isAsrRequest: false,
      isTechsprint: false,
      submissionDate: new Date().toISOString()
    };

    // Call the submit-request API
    console.log('Calling submit-request API with test payload');
    const response = await fetch('http://localhost:3001/api/requests/submit-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    // Get the response data
    const responseData = await response.json();

    // Return the response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: responseData
    }, { status: response.ok ? 200 : 500 });
  } catch (error) {
    console.error('Error testing submit-request API:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test submit-request API',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
