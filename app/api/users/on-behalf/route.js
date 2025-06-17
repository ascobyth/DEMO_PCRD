import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import mongoose from 'mongoose';

/**
 * API endpoint to fetch users that the current user can create requests on behalf of
 *
 * This endpoint returns users who have the current user in their onBehalfAccess array
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Get the current user's email from the query parameter
    const { searchParams } = new URL(request.url);
    const currentUserEmail = searchParams.get('email');

    if (!currentUserEmail) {
      return NextResponse.json(
        { success: false, error: 'Current user email is required' },
        { status: 400 }
      );
    }

    // First, find the current user to get their ID
    const currentUser = await User.findOne({ email: currentUserEmail });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Current user not found' },
        { status: 404 }
      );
    }

    // The API endpoint is being called to find users that the current user can create requests on behalf of.
    // However, based on the database structure, we need to reverse the logic:
    // We need to find users whose IDs are in the current user's onBehalfAccess array.

    console.log('Current user:', {
      _id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role,
      onBehalfAccess: currentUser.onBehalfAccess
    });

    // Check if the current user has onBehalfAccess array
    if (!currentUser.onBehalfAccess || !Array.isArray(currentUser.onBehalfAccess) || currentUser.onBehalfAccess.length === 0) {
      console.log('Current user has no onBehalfAccess array or it is empty');
      // For admin users, return all users except themselves
      if (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') {
        const users = await User.find({ _id: { $ne: currentUser._id } }).select('_id name email costCenter');
        return NextResponse.json({
          success: true,
          data: users,
          message: 'Admin user: returning all users'
        }, { status: 200 });
      }
      return NextResponse.json({
        success: true,
        data: [],
        message: 'User has no onBehalfAccess entries'
      }, { status: 200 });
    }

    // Convert all IDs to strings for consistent comparison
    const onBehalfIds = currentUser.onBehalfAccess.map(id =>
      typeof id === 'string' ? id :
      id._id ? id._id.toString() :
      id.toString()
    );

    console.log('Looking for users with these IDs:', onBehalfIds);

    // Find users whose IDs are in the current user's onBehalfAccess array
    const users = await User.find({
      $or: [
        { _id: { $in: onBehalfIds } },
        { _id: { $in: onBehalfIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (e) {
            console.log('Error converting ID:', id, e.message);
            return id;
          }
        })}}
      ]
    }).select('_id name email costCenter');

    console.log(`Found ${users.length} users who can be represented by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      data: users,
      debug: {
        currentUserId: currentUser._id,
        currentUserRole: currentUser.role,
        onBehalfIds: onBehalfIds,
        foundUsers: users.map(u => ({ id: u._id, name: u.name }))
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching on-behalf users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch on-behalf users' },
      { status: 500 }
    );
  }
}
