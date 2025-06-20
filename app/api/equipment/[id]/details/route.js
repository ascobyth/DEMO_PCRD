import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import ErList from '@/models/ErList';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    // Find ER request by request number
    const erRequest = await ErList.findOne({ requestNumber: id }).lean();
    
    if (!erRequest) {
      return NextResponse.json(
        { success: false, error: 'ER request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      request: erRequest
    });
  } catch (error) {
    console.error('Error fetching ER request details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}