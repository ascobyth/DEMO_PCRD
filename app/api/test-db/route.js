import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error connecting to database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to database',
        errorMessage: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
