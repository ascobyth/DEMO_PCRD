import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const Complaint = mongoose.models.Complaint || require('@/models/Complaint');
const Notification = mongoose.models.Notification || require('@/models/Notification');

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const requestNumber = searchParams.get('requestNumber');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const complainantEmail = searchParams.get('complainantEmail');
    
    // Build query
    const query = {};
    
    if (requestNumber) {
      query.requestNumber = requestNumber;
    }
    if (status) {
      query.status = status;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (complainantEmail) {
      query.complainantEmail = complainantEmail;
    }
    
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({
      success: true,
      data: complaints,
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Generate complaint ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const complaintId = `COMP-${timestamp}-${random}`;
    
    // Create complaint
    const complaintData = {
      ...body,
      complaintId,
      status: 'open',
      history: [{
        action: 'created',
        description: 'Complaint created',
        performedBy: body.createdBy,
        performedByName: body.createdByName,
        timestamp: new Date()
      }]
    };
    
    const newComplaint = await Complaint.create(complaintData);
    
    // Create notification for high/critical complaints
    if (body.severity === 'high' || body.severity === 'critical') {
      try {
        await Notification.create({
          notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: 'lab_manager',
          userEmail: 'lab_manager@example.com',
          title: `${body.severity.toUpperCase()} Priority Complaint`,
          message: `A ${body.severity} priority complaint has been filed for request ${body.requestNumber}`,
          type: 'complaint',
          priority: 'urgent',
          relatedEntity: 'complaint',
          relatedEntityId: newComplaint._id.toString(),
          requestNumber: body.requestNumber,
          actionUrl: `/complaints/${complaintId}`,
          actionText: 'View Complaint',
          changedBy: body.createdBy,
          changedByEmail: body.createdBy
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newComplaint,
      message: 'Complaint submitted successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create complaint' },
      { status: 500 }
    );
  }
}