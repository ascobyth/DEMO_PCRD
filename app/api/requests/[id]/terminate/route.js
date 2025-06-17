import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');
const Notification = mongoose.models.Notification || require('@/models/Notification');

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    
    const { reason, terminateDate } = body;
    
    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Termination reason is required' },
        { status: 400 }
      );
    }
    
    // Find the request - try by MongoDB ID first, then by request number
    let requestDoc;
    
    // Check if it's a valid MongoDB ObjectId (24 character hex string)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      requestDoc = await RequestList.findById(id);
    }
    
    // If not found by ID or not a valid ObjectId, try by request number
    if (!requestDoc) {
      requestDoc = await RequestList.findOne({ requestNumber: id });
    }
    
    if (!requestDoc) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Check if request is in Pending Receive status
    if (requestDoc.requestStatus !== 'Pending Receive') {
      return NextResponse.json(
        { success: false, error: 'Only requests with Pending Receive status can be terminated' },
        { status: 400 }
      );
    }
    
    // Update request status to terminated (lowercase to match enum)
    requestDoc.requestStatus = 'terminated';
    requestDoc.terminateDate = terminateDate || new Date();
    requestDoc.terminationReason = reason;
    await requestDoc.save();
    
    // Update TestingSampleList items
    // Only update items with "Pending Receive" status to "Terminated"
    // Keep "In Progress" and "Completed" items as they are
    const updateResult = await TestingSampleList.updateMany(
      {
        requestNumber: requestDoc.requestNumber,
        status: 'Pending Receive'
      },
      {
        $set: {
          status: 'terminated',
          terminateDate: terminateDate || new Date(),
          terminationReason: reason
        }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} testing samples to Terminated status`);
    
    // Get counts of different statuses for notification
    const statusCounts = await TestingSampleList.aggregate([
      { $match: { requestNumber: requestDoc.requestNumber } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const counts = {
      terminated: 0,
      inProgress: 0,
      completed: 0
    };
    
    statusCounts.forEach(item => {
      if (item._id === 'terminated') counts.terminated = item.count;
      else if (item._id === 'in-progress') counts.inProgress = item.count;
      else if (item._id === 'completed') counts.completed = item.count;
    });
    
    // Create notification
    try {
      await Notification.create({
        notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: requestDoc.requesterEmail,
        userEmail: requestDoc.requesterEmail,
        title: 'Request Terminated',
        message: `Your request ${requestDoc.requestNumber} has been terminated. ${counts.inProgress + counts.completed} tests will still be charged.`,
        type: 'status_change',
        priority: 'high',
        relatedEntity: 'request',
        relatedEntityId: requestDoc._id.toString(),
        requestNumber: requestDoc.requestNumber,
        previousStatus: 'Pending Receive',
        newStatus: 'terminated',
        metadata: {
          reason,
          terminatedSamples: counts.terminated,
          chargeableSamples: counts.inProgress + counts.completed
        }
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        request: requestDoc,
        samplesUpdated: updateResult.modifiedCount,
        statusCounts: counts
      },
      message: 'Request terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to terminate request' },
      { status: 500 }
    );
  }
}