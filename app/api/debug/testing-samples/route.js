import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models directly
const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');

/**
 * Debug API to view TestingSampleList records
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const requestNumber = searchParams.get('requestNumber');

    let query = {};
    if (requestNumber) {
      query.requestNumber = requestNumber;
    }

    const testingSamples = await TestingSampleList.find(query)
      .sort({ submitDate: -1 })
      .limit(50)
      .lean();

    console.log(`Found ${testingSamples.length} testing samples`);
    
    // Log details for each sample
    testingSamples.forEach((sample, index) => {
      console.log(`Sample ${index + 1}:`, {
        requestNumber: sample.requestNumber,
        sampleName: sample.sampleName,
        fullSampleName: sample.fullSampleName,
        methodCode: sample.methodCode,
        testingRemark: sample.testingRemark,
        capabilityName: sample.capabilityName
      });
    });

    return NextResponse.json({
      success: true,
      count: testingSamples.length,
      data: testingSamples.map(sample => ({
        _id: sample._id,
        requestNumber: sample.requestNumber,
        sampleName: sample.sampleName,
        fullSampleName: sample.fullSampleName,
        methodCode: sample.methodCode,
        testingRemark: sample.testingRemark,
        capabilityName: sample.capabilityName,
        sampleStatus: sample.sampleStatus,
        submitDate: sample.submitDate
      }))
    });

  } catch (error) {
    console.error('Error fetching testing samples:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}