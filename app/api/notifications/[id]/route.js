import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

const { Notification } = require('@/models');

// GET /api/notifications/[id] - Get a specific notification
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    // Build query to ensure user can only access their own notifications
    const query = { _id: id };
    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = userEmail;
    
    const notification = await Notification.findOne(query);
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notification'
    }, { status: 500 });
  }
}

// PATCH /api/notifications/[id] - Update a specific notification
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    const { userId, userEmail, action, ...updateData } = body;
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    // Build query to ensure user can only update their own notifications
    const query = { _id: id };
    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = userEmail;
    
    let updates = {};
    
    // Handle predefined actions
    if (action === 'markAsRead') {
      updates = { isRead: true, readAt: new Date() };
    } else if (action === 'markAsUnread') {
      updates = { isRead: false, readAt: null };
    } else if (action === 'archive') {
      updates = { isArchived: true, archivedAt: new Date() };
    } else if (action === 'unarchive') {
      updates = { isArchived: false, archivedAt: null };
    } else {
      // Allow manual field updates
      const allowedFields = ['isRead', 'isArchived', 'metadata'];
      updates = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });
      
      // Set timestamps for read/archive actions
      if (updates.isRead === true && !updates.readAt) {
        updates.readAt = new Date();
      } else if (updates.isRead === false) {
        updates.readAt = null;
      }
      
      if (updates.isArchived === true && !updates.archivedAt) {
        updates.archivedAt = new Date();
      } else if (updates.isArchived === false) {
        updates.archivedAt = null;
      }
    }
    
    const notification = await Notification.findOneAndUpdate(
      query,
      updates,
      { new: true }
    );
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification'
    }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');
    
    if (!userId && !userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User ID or email is required'
      }, { status: 400 });
    }
    
    // Build query to ensure user can only delete their own notifications
    const query = { _id: id };
    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = userEmail;
    
    const notification = await Notification.findOneAndDelete(query);
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: { deletedId: id }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification'
    }, { status: 500 });
  }
}