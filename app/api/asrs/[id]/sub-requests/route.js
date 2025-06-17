import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import RequestList from '@/models/RequestList';
import ErList from '@/models/ErList';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id: asrId } = params;
    
    if (!asrId) {
      return NextResponse.json(
        { success: false, error: 'ASR ID is required' },
        { status: 400 }
      );
    }

    // Fetch NTR requests linked to this ASR
    const ntrRequests = await RequestList.find({ 
      asrId: asrId,
      isAsrRequest: true 
    }).sort({ createdAt: -1 });

    // Fetch ER requests linked to this ASR
    const erRequests = await ErList.find({ 
      asrId: asrId,
      isAsrRequest: true 
    }).sort({ createdAt: -1 });

    // Format NTR requests
    const formattedNtrRequests = ntrRequests.map(req => ({
      id: req._id,
      type: 'NTR',
      requestNumber: req.requestNumber,
      requestTitle: req.requestTitle,
      status: req.requestStatus,
      priority: req.priority,
      requesterName: req.requesterName,
      requesterEmail: req.requesterEmail,
      submissionDate: req.createdAt,
      datapool: req.datapool,
      samples: req.jsonSampleList ? JSON.parse(req.jsonSampleList) : [],
      testMethods: req.jsonTestingList ? JSON.parse(req.jsonTestingList) : []
    }));

    // Format ER requests
    const formattedErRequests = erRequests.map(req => ({
      id: req._id,
      type: 'ER',
      requestNumber: req.requestNumber,
      requestTitle: req.requestTitle,
      status: req.requestStatus,
      priority: req.priority,
      requesterName: req.requesterName,
      requesterEmail: req.requesterEmail,
      submissionDate: req.createdAt,
      equipment: req.jsonEquipmentList ? JSON.parse(req.jsonEquipmentList) : []
    }));

    // Combine and sort by submission date
    const allSubRequests = [...formattedNtrRequests, ...formattedErRequests]
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

    return NextResponse.json({
      success: true,
      data: {
        subRequests: allSubRequests,
        summary: {
          totalRequests: allSubRequests.length,
          ntrCount: formattedNtrRequests.length,
          erCount: formattedErRequests.length,
          statusCounts: {
            draft: allSubRequests.filter(r => r.status === 'draft').length,
            'Pending Receive': allSubRequests.filter(r => r.status === 'Pending Receive').length,
            'in-progress': allSubRequests.filter(r => r.status === 'in-progress').length,
            completed: allSubRequests.filter(r => r.status === 'completed').length,
            rejected: allSubRequests.filter(r => r.status === 'rejected').length,
            terminated: allSubRequests.filter(r => r.status === 'terminated').length,
            cancelled: allSubRequests.filter(r => r.status === 'cancelled').length
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sub-requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}