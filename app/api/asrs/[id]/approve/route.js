import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const AsrList = mongoose.models.AsrList || require('@/models/AsrList');
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
    
    // Find and update the ASR
    const updatedAsr = await AsrList.findByIdAndUpdate(
      id,
      {
        isApproved,
        approvedBy,
        approvedByName,
        approvalNotes,
        managerApprovedDate: approvedDate || new Date()
      },
      { new: true }
    );
    
    if (!updatedAsr) {
      return NextResponse.json(
        { success: false, error: 'ASR not found' },
        { status: 404 }
      );
    }
    
    // Create notification for the requester
    try {
      await Notification.create({
        notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: updatedAsr.requesterEmail,
        userEmail: updatedAsr.requesterEmail,
        title: `ASR ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your ASR ${updatedAsr.asrNumber} has been ${isApproved ? 'approved' : 'rejected'} by ${approvedByName}`,
        type: 'approval',
        priority: 'high',
        relatedEntity: 'asr',
        relatedEntityId: updatedAsr._id.toString(),
        requestNumber: updatedAsr.asrNumber,
        actionUrl: `/requests/${updatedAsr.asrNumber}`,
        actionText: 'View ASR',
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
      data: updatedAsr,
      message: `ASR ${isApproved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating ASR approval:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update approval status' },
      { status: 500 }
    );
  }
}