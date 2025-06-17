import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email (case insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true  // Only active users can login
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check password (in real app, you should hash passwords)
    // For now, we'll do simple string comparison
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Login successful - return user data without password
    const userData = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      position: user.position,
      division: user.division,
      department: user.department,
      role: user.role,
      capabilities: user.capabilities,
      approvers: user.approvers,
      onBehalfAccess: user.onBehalfAccess,
      isActive: user.isActive
    };
    
    return NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Login successful' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}