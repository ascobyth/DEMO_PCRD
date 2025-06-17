import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Location from '@/models/Location';

export async function GET() {
  try {
    await dbConnect();
    const locations = await Location.find({})
      .sort({ sublocation: 1 });

    return NextResponse.json({ success: true, data: locations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Create a new location
    const location = await Location.create(body);

    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);

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
        { success: false, error: 'A location with that ID already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
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
      const result = await Location.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} locations` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete locations' },
      { status: 500 }
    );
  }
}
