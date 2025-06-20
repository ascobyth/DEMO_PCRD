import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import all models
const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const AsrList = mongoose.models.AsrList || require('@/models/AsrList');
const ErList = mongoose.models.ErList || require('@/models/ErList');

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const requesterEmail = searchParams.get('requesterEmail');
    const type = searchParams.get('type'); // 'all', 'ntr', 'asr', 'er'
    
    let allRequests = [];
    
    // Helper function to transform ASR data to match request format
    const transformAsrToRequest = (asr) => ({
      _id: asr._id,
      requestNumber: asr.asrNumber,
      requestTitle: asr.asrName,
      requestStatus: asr.asrStatus,
      requestType: 'ASR',
      priority: asr.priority || 'normal',
      useIoNumber: asr.useIoNumber || false,
      ioNumber: asr.asrIoNumber || asr.ioCostCenter,
      ioCostCenter: asr.asrIoNumber || asr.ioCostCenter,
      requesterCostCenter: asr.requesterCostCenter,
      requesterEmail: asr.requesterEmail,
      requesterName: asr.requesterName,
      jsonSampleList: asr.asrSampleList || asr.jsonSampleList || '[]',
      jsonTestingList: asr.jsonTestingList || '[]',
      createdAt: asr.createdAt,
      updatedAt: asr.updatedAt,
      completeDate: asr.completedDate || asr.completeDate,
      terminateDate: asr.terminateDate,
      cancelDate: asr.cancelDate,
      isEvaluated: asr.isEvaluated || false,
      evaluationScore: asr.asrEvaluationScore || asr.evaluationScore,
      evaluationComment: asr.evaluationComment,
      evaluationDate: asr.evaluationDate,
      asrEvaluationData: asr.asrEvaluationData,
      capability: asr.asrCapability || 'ASR',
      // ASR-specific fields
      asrType: asr.asrType,
      asrOwnerName: asr.asrOwnerName,
      asrOwnerEmail: asr.asrOwnerEmail,
      problemSource: asr.problemSource,
      expectedResults: asr.expectedResults,
      businessImpact: asr.businessImpact,
      urgencyType: asr.urgencyType,
      urgencyReason: asr.urgencyReason,
      asrEstCompletedDate: asr.asrEstCompletedDate,
      asrMethodology: asr.asrMethodology,
      approver: asr.approver,
      asrRequireDate: asr.asrRequireDate
    });
    
    // Helper function to transform ER data to match request format
    const transformErToRequest = (er) => ({
      _id: er._id,
      requestNumber: er.requestNumber,
      requestTitle: er.requestTitle,
      requestStatus: er.requestStatus,
      requestType: 'ER',
      priority: er.priority || 'normal',
      useIoNumber: er.useIoNumber || false,
      ioNumber: er.ioCostCenter,
      ioCostCenter: er.ioCostCenter,
      requesterCostCenter: er.requesterCostCenter,
      requesterEmail: er.requesterEmail,
      requesterName: er.requesterName,
      jsonSampleList: er.jsonSampleList || '[]',
      jsonTestingList: er.jsonEquipmentList || '[]',
      createdAt: er.createdAt,
      updatedAt: er.updatedAt,
      completeDate: er.completeDate,
      terminateDate: er.terminateDate,
      cancelDate: er.cancelDate,
      isEvaluated: er.isEvaluated,
      evaluationScore: er.evaluationScore,
      evaluationComment: er.evaluationComment,
      evaluationDate: er.evaluationDate,
      capability: er.capability || 'Equipment'
    });
    
    // Build queries based on requester email
    const ntrQuery = requesterEmail ? { requesterEmail } : {};
    const asrQuery = requesterEmail ? { requesterEmail } : {};
    const erQuery = requesterEmail ? { requesterEmail } : {};
    
    // Fetch based on type filter
    if (!type || type === 'all') {
      // Fetch from all three models
      const [ntrRequests, asrRequests, erRequests] = await Promise.all([
        RequestList.find(ntrQuery).sort({ createdAt: -1 }),
        AsrList.find(asrQuery).sort({ createdAt: -1 }),
        ErList.find(erQuery).sort({ createdAt: -1 })
      ]);
      
      // Transform and combine all requests
      allRequests = [
        ...ntrRequests,
        ...asrRequests.map(transformAsrToRequest),
        ...erRequests.map(transformErToRequest)
      ];
    } else if (type === 'ntr') {
      // Fetch only from RequestList (NTR)
      const ntrRequests = await RequestList.find(ntrQuery).sort({ createdAt: -1 });
      allRequests = ntrRequests;
    } else if (type === 'asr') {
      // Fetch only from AsrList
      const asrRequests = await AsrList.find(asrQuery).sort({ createdAt: -1 });
      allRequests = asrRequests.map(transformAsrToRequest);
    } else if (type === 'er') {
      // Fetch only from ErList
      const erRequests = await ErList.find(erQuery).sort({ createdAt: -1 });
      allRequests = erRequests.map(transformErToRequest);
    }
    
    // Sort all requests by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`Found ${allRequests.length} requests of type: ${type || 'all'}`);
    
    const response = NextResponse.json({ success: true, data: allRequests }, { status: 200 });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}