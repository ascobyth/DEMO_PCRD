import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Location from '@/models/Location';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const location = await Location.findById(id);

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: location }, { status: 200 });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    const location = await Location.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: location }, { status: 200 });
  } catch (error) {
    console.error('Error updating location:', error);

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
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
