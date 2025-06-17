import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

const { Notification } = require('@/models');

// POST /api/notifications/create - Create notifications with helper methods
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { type, ...data } = body;
    
    let notification;
    
    switch (type) {
      case 'status_change':
        notification = await Notification.createStatusChangeNotification(data);
        break;
        
      case 'assignment':
        notification = await Notification.createAssignmentNotification(data);
        break;
        
      case 'deadline':
        notification = await Notification.createDeadlineNotification(data);
        break;
        
      case 'bulk_status_change':
        // Handle multiple users for the same status change
        const { userList, ...statusData } = data;
        if (!userList || !Array.isArray(userList)) {
          return NextResponse.json({
            success: false,
            error: 'userList array is required for bulk notifications'
          }, { status: 400 });
        }
        
        const notifications = [];
        for (const user of userList) {
          try {
            const notif = await Notification.createStatusChangeNotification({
              ...statusData,
              userId: user.userId || user.id,
              userEmail: user.userEmail || user.email
            });
            notifications.push(notif);
          } catch (err) {
            console.error(`Failed to create notification for user ${user.userId || user.id}:`, err);
          }
        }
        
        return NextResponse.json({
          success: true,
          data: {
            created: notifications.length,
            notifications
          }
        });
        
      default:
        // Generic notification creation
        const {
          userId,
          userEmail,
          title,
          message,
          priority = 'medium',
          relatedEntity,
          relatedEntityId,
          requestNumber,
          sampleId,
          actionUrl,
          actionText,
          metadata = {}
        } = data;
        
        if (!userId || !userEmail || !title || !message) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: userId, userEmail, title, message'
          }, { status: 400 });
        }
        
        notification = await Notification.create({
          userId,
          userEmail,
          title,
          message,
          type: type || 'info',
          priority,
          relatedEntity,
          relatedEntityId,
          requestNumber,
          sampleId,
          actionUrl,
          actionText,
          metadata
        });
        break;
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create notification'
    }, { status: 500 });
  }
}