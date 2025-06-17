import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });

    // Return the data in the format expected by the NTR page
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}
