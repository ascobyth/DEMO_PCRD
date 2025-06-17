import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const Notification = mongoose.models.Notification || require('@/models/Notification');

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    
    const {
      isApproved,
      approvedBy,
      approvedByName,
      approvalNotes,
      approvedDate
    } = body;
    
    // Find and update the request
    const updatedRequest = await RequestList.findByIdAndUpdate(
      id,
      {
        isApproved,
        approvedBy,
        approvedByName,
        approvalNotes,
        approvedDate: approvedDate || new Date()
      },
      { new: true }
    );
    
    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Create notification for the requester
    try {
      await Notification.create({
        notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: updatedRequest.requesterEmail,
        userEmail: updatedRequest.requesterEmail,
        title: `Request ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your request ${updatedRequest.requestNumber} has been ${isApproved ? 'approved' : 'rejected'} by ${approvedByName}`,
        type: 'approval',
        priority: 'high',
        relatedEntity: 'request',
        relatedEntityId: updatedRequest._id.toString(),
        requestNumber: updatedRequest.requestNumber,
        actionUrl: `/requests/${updatedRequest.requestNumber}`,
        actionText: 'View Request',
        changedBy: approvedBy,
        changedByEmail: approvedBy,
        metadata: {
          approvalNotes,
          isApproved
        }
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request ${isApproved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating request approval:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update approval status' },
      { status: 500 }
    );
  }
}