import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Check database connection
    let dbStatus = 'disconnected';
    let dbError = null;
    
    try {
      await dbConnect();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (error) {
      dbError = error.message;
    }

    return NextResponse.json({
      success: true,
      status: {
        database: dbStatus,
        dbError: dbError,
        mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}