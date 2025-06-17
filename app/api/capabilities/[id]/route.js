import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Capability from '@/models/Capability';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    // Get the ID from params (Next.js 13+ way)
    const id = params.id;
    console.log('Fetching capability with ID:', id);

    const capability = await Capability.findById(id)
      .populate({
        path: 'capHeadGroup',
        select: 'name username email position department division'
      })
      .populate('locationId');

    if (!capability) {
      console.log('Capability not found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      );
    }

    console.log('Found capability:', {
      id: capability._id,
      name: capability.capabilityName,
      locationId: capability.locationId ?
        (typeof capability.locationId === 'object' ?
          {
            _id: capability.locationId._id,
            name: capability.locationId.sublocation || capability.locationId.locationId
          } :
          capability.locationId
        ) :
        null
    });

    return NextResponse.json({ success: true, data: capability }, { status: 200 });
  } catch (error) {
    console.error('Error fetching capability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch capability' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const id = params.id;
    const body = await request.json();

    console.log('Updating capability with ID:', id);
    console.log('Update data received:', body);

    // Log the locationId specifically
    if (body.locationId !== undefined) {
      console.log('LocationId in update request:', body.locationId);
      console.log('LocationId type:', typeof body.locationId);
    }

    // Find the capability first to log the before state
    const existingCapability = await Capability.findById(id);
    if (existingCapability) {
      console.log('Existing capability before update:', {
        id: existingCapability._id,
        name: existingCapability.capabilityName,
        locationId: existingCapability.locationId ?
          (typeof existingCapability.locationId === 'object' ?
            {
              _id: existingCapability.locationId._id,
              name: existingCapability.locationId.sublocation || existingCapability.locationId.locationId
            } :
            existingCapability.locationId
          ) :
          null
      });
    }

    const capability = await Capability.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!capability) {
      console.log('Capability not found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      );
    }

    // Fetch the updated capability with populated fields
    const updatedCapability = await Capability.findById(id)
      .populate({
        path: 'capHeadGroup',
        select: 'name username email position department division'
      })
      .populate('locationId');

    console.log('Updated capability:', {
      id: capability._id,
      name: capability.capabilityName,
      locationId: capability.locationId ?
        (typeof capability.locationId === 'object' ?
          {
            _id: capability.locationId._id,
            name: capability.locationId.sublocation || capability.locationId.locationId
          } :
          capability.locationId
        ) :
        null
    });

    return NextResponse.json({ success: true, data: updatedCapability }, { status: 200 });
  } catch (error) {
    console.error('Error updating capability:', error);

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
        { success: false, error: 'A capability with that name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update capability' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const id = params.id;
    console.log('Deleting capability with ID:', id);

    const capability = await Capability.findByIdAndDelete(id);

    if (!capability) {
      console.log('Capability not found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      );
    }

    console.log('Deleted capability:', {
      id: capability._id,
      name: capability.capabilityName
    });

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting capability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete capability' },
      { status: 500 }
    );
  }
}
