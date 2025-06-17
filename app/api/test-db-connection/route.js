import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models directly
const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');
const Capability = mongoose.models.Capability || require('@/models/Capability');

/**
 * API route handler for testing database connection
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log('Connected to MongoDB successfully');

    // Test fetching capabilities
    const capabilities = await Capability.find({}).limit(5);
    console.log(`Found ${capabilities.length} capabilities`);

    // Test fetching requests
    const requests = await RequestList.find({}).limit(5);
    console.log(`Found ${requests.length} requests`);

    // Test fetching testing samples
    const testingSamples = await TestingSampleList.find({}).limit(5);
    console.log(`Found ${testingSamples.length} testing samples`);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        capabilities: capabilities.map(cap => ({
          id: cap._id.toString(),
          name: cap.capabilityName,
          shortName: cap.shortName,
          reqRunNo: cap.reqRunNo
        })),
        requests: requests.map(req => ({
          id: req._id.toString(),
          requestNumber: req.requestNumber,
          requestTitle: req.requestTitle,
          requestStatus: req.requestStatus
        })),
        testingSamples: testingSamples.map(sample => ({
          id: sample._id.toString(),
          requestNumber: sample.requestNumber,
          sampleName: sample.sampleName,
          sampleStatus: sample.sampleStatus
        }))
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error testing database connection:', error);

    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test database connection',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
