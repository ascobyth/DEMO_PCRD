import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Equipment from '@/models/Equipment';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Process equipment data to ensure image paths are strings
    const eqObj = equipment.toObject();

    // Process equipment image
    if (eqObj.equipmentImage) {
      // Check if it's a Binary object (from MongoDB)
      if (typeof eqObj.equipmentImage === 'object') {
        if (eqObj.equipmentImage.buffer && eqObj.equipmentImage.subType === 0) {
          try {
            // Try to convert Binary to string
            const binaryString = eqObj.equipmentImage.toString();
            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              eqObj.equipmentImage = binaryString;
              console.log('API: Decoded Binary equipmentImage to path:', binaryString);
            } else {
              try {
                // Try to decode from base64 if it might be encoded
                const decoded = Buffer.from(binaryString, 'base64').toString();
                if (decoded.startsWith('/uploads/')) {
                  eqObj.equipmentImage = decoded;
                  console.log('API: Decoded base64 equipmentImage to path:', decoded);
                } else {
                  eqObj.equipmentImage = '';
                  console.log('API: Could not decode Binary equipmentImage to valid path');
                }
              } catch (decodeError) {
                eqObj.equipmentImage = '';
                console.log('API: Failed to decode Binary equipmentImage:', decodeError);
              }
            }
          } catch (error) {
            eqObj.equipmentImage = '';
            console.log('API: Error processing Binary equipmentImage:', error);
          }
        }
      } else if (typeof eqObj.equipmentImage === 'string') {
        // If it's a string but not a valid path, try to decode it
        if (!eqObj.equipmentImage.startsWith('/uploads/') && !eqObj.equipmentImage.startsWith('http')) {
          try {
            // Try to decode from base64 if it might be encoded
            const decoded = Buffer.from(eqObj.equipmentImage, 'base64').toString();
            if (decoded.startsWith('/uploads/')) {
              eqObj.equipmentImage = decoded;
              console.log('API: Decoded string equipmentImage to path:', decoded);
            }
          } catch (error) {
            console.log('API: Failed to decode string equipmentImage:', error);
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: eqObj }, { status: 200 });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    const equipment = await Equipment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: equipment }, { status: 200 });
  } catch (error) {
    console.error('Error updating equipment:', error);

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
        { success: false, error: 'Equipment with that code already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}
