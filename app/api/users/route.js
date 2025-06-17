import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Fetch specific user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, user }, { status: 200 });
    } else {
      // Fetch all users
      const users = await User.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: users }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('API received user data:', body);
    console.log('Capabilities in API:', body.capabilities);
    console.log('Approvers in API:', body.approvers);
    console.log('Approvers type:', Array.isArray(body.approvers) ? 'Array' : typeof body.approvers);

    // Create a new user
    const user = await User.create(body);
    console.log('Created user:', user);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A user with that email or username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const dropAll = searchParams.get('dropAll') === 'true';
    
    if (dropAll) {
      // Delete all records
      const result = await User.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} users` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete users' },
      { status: 500 }
    );
  }
}
