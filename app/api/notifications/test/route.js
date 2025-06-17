import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

const { Notification } = require('@/models');

// POST /api/notifications/test - Create test notifications
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userEmail = 'admin@admin.com' } = body;
    
    // Create a few test notifications
    const testNotifications = [
      {
        userId: userEmail,
        userEmail: userEmail,
        title: 'Request Status Updated: NTR-2024-001',
        message: 'Request NTR-2024-001 status changed from "Pending Receive" to "In Progress" by Laboratory Staff',
        type: 'status_change',
        priority: 'medium',
        relatedEntity: 'request',
        relatedEntityId: 'NTR-2024-001',
        requestNumber: 'NTR-2024-001',
        previousStatus: 'Pending Receive',
        newStatus: 'In Progress',
        changedBy: 'Laboratory Staff',
        changedByEmail: 'lab@admin.com',
        actionUrl: '/request-management?search=NTR-2024-001',
        actionText: 'View Details'
      },
      {
        userId: userEmail,
        userEmail: userEmail,
        title: 'Sample Received: NTR-2024-002',
        message: 'Sample SAMPLE-001 for request NTR-2024-002 has been received and testing can begin',
        type: 'status_change',
        priority: 'high',
        relatedEntity: 'sample',
        relatedEntityId: 'SAMPLE-001',
        requestNumber: 'NTR-2024-002',
        sampleId: 'SAMPLE-001',
        previousStatus: 'Pending Receive',
        newStatus: 'In Progress',
        changedBy: 'Laboratory Staff',
        changedByEmail: 'lab@admin.com',
        actionUrl: '/request-management?tab=testing&search=NTR-2024-002',
        actionText: 'View Sample'
      },
      {
        userId: userEmail,
        userEmail: userEmail,
        title: 'Urgent Request Deadline Approaching',
        message: 'Urgent request NTR-2024-003 is due in 2 days. Please ensure timely completion.',
        type: 'deadline',
        priority: 'urgent',
        relatedEntity: 'request',
        relatedEntityId: 'NTR-2024-003',
        requestNumber: 'NTR-2024-003',
        actionUrl: '/request-management?search=NTR-2024-003',
        actionText: 'View Request',
        metadata: {
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilDue: 2,
          isOverdue: false
        }
      },
      {
        userId: userEmail,
        userEmail: userEmail,
        title: 'New Assignment: Testing Sample Analysis',
        message: 'You have been assigned to handle sample analysis for request NTR-2024-004 by Project Manager',
        type: 'assignment',
        priority: 'medium',
        relatedEntity: 'request',
        relatedEntityId: 'NTR-2024-004',
        requestNumber: 'NTR-2024-004',
        changedBy: 'Project Manager',
        changedByEmail: 'pm@admin.com',
        actionUrl: '/request-management?search=NTR-2024-004',
        actionText: 'View Assignment'
      },
      {
        userId: userEmail,
        userEmail: userEmail,
        title: 'System Maintenance Notice',
        message: 'The laboratory management system will undergo maintenance on Sunday from 2:00 AM to 4:00 AM. Please plan accordingly.',
        type: 'system_update',
        priority: 'low',
        relatedEntity: 'system',
        actionUrl: '/dashboard',
        actionText: 'View Dashboard'
      }
    ];
    
    const createdNotifications = [];
    for (const notifData of testNotifications) {
      try {
        const notification = await Notification.create(notifData);
        createdNotifications.push(notification);
      } catch (err) {
        console.error('Error creating test notification:', err);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        created: createdNotifications.length,
        notifications: createdNotifications
      }
    });
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test notifications'
    }, { status: 500 });
  }
}