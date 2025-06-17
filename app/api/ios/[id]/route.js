import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Io from '@/models/Io';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const io = await Io.findById(id);

    if (!io) {
      return NextResponse.json(
        { success: false, error: 'IO not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: io }, { status: 200 });
  } catch (error) {
    console.error('Error fetching IO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IO' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    const io = await Io.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!io) {
      return NextResponse.json(
        { success: false, error: 'IO not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: io }, { status: 200 });
  } catch (error) {
    console.error('Error updating IO:', error);

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
      { success: false, error: 'Failed to update IO' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const io = await Io.findByIdAndDelete(id);

    if (!io) {
      return NextResponse.json(
        { success: false, error: 'IO not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting IO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete IO' },
      { status: 500 }
    );
  }
}
