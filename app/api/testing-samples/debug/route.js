import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
const TestingSampleList = require('@/models/TestingSampleList');

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const requestNumber = searchParams.get('requestNumber');
    
    if (!requestNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request number is required' 
      }, { status: 400 });
    }
    
    // Get all testing samples for this request
    const samples = await TestingSampleList.find({ requestNumber }).lean();
    
    // Group by status
    const statusGroups = samples.reduce((acc, sample) => {
      const status = sample.sampleStatus || 'No Status';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push({
        testingListId: sample.testingListId,
        sampleName: sample.sampleName,
        methodCode: sample.methodCode,
        sampleStatus: sample.sampleStatus,
        fullSampleName: sample.fullSampleName,
        testingRemark: sample.testingRemark,
        attachedFileName: sample.attachedFileName,
        attachedFileId: sample.attachedFileId
      });
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      requestNumber,
      totalSamples: samples.length,
      statusGroups,
      samples: samples.map(s => ({
        testingListId: s.testingListId,
        sampleName: s.sampleName,
        sampleStatus: s.sampleStatus,
        methodCode: s.methodCode,
        fullSampleName: s.fullSampleName,
        testingRemark: s.testingRemark,
        attachedFileName: s.attachedFileName,
        attachedFileId: s.attachedFileId,
        operationCompleteDate: s.operationCompleteDate,
        entryResultDate: s.entryResultDate
      }))
    });
  } catch (error) {
    console.error('Error debugging testing samples:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}