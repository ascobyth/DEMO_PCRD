import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Io from '@/models/Io';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const ioNo = searchParams.get('ioNo');
    
    // Build query based on parameters
    let query = {};
    if (ioNo) {
      query.ioNo = ioNo;
    }
    
    const ios = await Io.find(query)
      .sort({ ioNo: 1 });

    return NextResponse.json({ success: true, data: ios }, { status: 200 });
  } catch (error) {
    console.error('Error fetching IOs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IOs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Create a new IO
    const io = await Io.create(body);

    return NextResponse.json({ success: true, data: io }, { status: 201 });
  } catch (error) {
    console.error('Error creating IO:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An IO with that number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create IO' },
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
      const result = await Io.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} IOs` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting IOs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete IOs' },
      { status: 500 }
    );
  }
}
