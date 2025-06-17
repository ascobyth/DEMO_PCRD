import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

const { Notification } = require('@/models');

// GET /api/notifications - Fetch notifications for a user
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = parseInt(searchParams.get('skip')) || 0;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = userEmail;
    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;
    query.isArchived = false; // Don't show archived notifications by default
    
    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
      ...(userId ? { userId } : { userEmail }),
      isRead: false,
      isArchived: false
    });
    
    // Get total count
    const totalCount = await Notification.countDocuments({
      ...(userId ? { userId } : { userEmail }),
      isArchived: false
    });
    
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount,
        hasMore: (skip + limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      userId,
      userEmail,
      title,
      message,
      type = 'info',
      priority = 'medium',
      relatedEntity,
      relatedEntityId,
      requestNumber,
      sampleId,
      actionUrl,
      actionText,
      previousStatus,
      newStatus,
      changedBy,
      changedByEmail,
      metadata = {}
    } = body;
    
    // Validation
    if (!userId || !userEmail || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, userEmail, title, message'
      }, { status: 400 });
    }
    
    // Generate notification ID if not provided
    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create notification
    const notification = await Notification.create({
      notificationId,
      userId,
      userEmail,
      title,
      message,
      type,
      priority,
      relatedEntity,
      relatedEntityId,
      requestNumber,
      sampleId,
      actionUrl,
      actionText,
      previousStatus,
      newStatus,
      changedBy,
      changedByEmail,
      metadata
    });
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}

// PATCH /api/notifications - Bulk update notifications (mark as read, archive, etc.)
export async function PATCH(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      userId, 
      userEmail, 
      action, // 'markAsRead', 'markAllAsRead', 'archive', 'archiveAll'
      notificationIds = [] 
    } = body;
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    let updateQuery = {};
    let updateData = {};
    
    // Build base query
    if (userId) updateQuery.userId = userId;
    if (userEmail) updateQuery.userEmail = userEmail;
    
    switch (action) {
      case 'markAsRead':
        if (notificationIds.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Notification IDs required for markAsRead action'
          }, { status: 400 });
        }
        updateQuery._id = { $in: notificationIds };
        updateData = { isRead: true, readAt: new Date() };
        break;
        
      case 'markAllAsRead':
        updateQuery.isRead = false;
        updateData = { isRead: true, readAt: new Date() };
        break;
        
      case 'archive':
        if (notificationIds.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Notification IDs required for archive action'
          }, { status: 400 });
        }
        updateQuery._id = { $in: notificationIds };
        updateData = { isArchived: true, archivedAt: new Date() };
        break;
        
      case 'archiveAll':
        updateData = { isArchived: true, archivedAt: new Date() };
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Must be: markAsRead, markAllAsRead, archive, or archiveAll'
        }, { status: 400 });
    }
    
    const result = await Notification.updateMany(updateQuery, updateData);
    
    return NextResponse.json({
      success: true,
      data: {
        action,
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notifications'
    }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete notifications (permanent)
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    const notificationIds = searchParams.get('ids')?.split(',') || [];
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    if (notificationIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Notification IDs are required'
      }, { status: 400 });
    }
    
    // Build delete query
    const deleteQuery = {
      _id: { $in: notificationIds }
    };
    if (userId) deleteQuery.userId = userId;
    if (userEmail) deleteQuery.userEmail = userEmail;
    
    const result = await Notification.deleteMany(deleteQuery);
    
    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notifications'
    }, { status: 500 });
  }
}