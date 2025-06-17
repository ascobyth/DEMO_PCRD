import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import PlantReactor from '@/models/PlantReactor';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const plantReactor = await PlantReactor.findById(id)
      .populate({
        path: 'commercialSamples',
        select: 'gradeName application polymerType isActive'
      });
    
    if (!plantReactor) {
      return NextResponse.json(
        { success: false, error: 'Plant reactor not found' },
        { status: 404 }
      );
    }
    
    // Process plantReactor data to ensure proper format
    const plantReactorObj = plantReactor.toObject();
    
    // Convert virtual 'commercialSamples' to regular field for the frontend
    if (plantReactor.commercialSamples && Array.isArray(plantReactor.commercialSamples)) {
      plantReactorObj.commercialSamples = plantReactor.commercialSamples.map(sample => ({
        id: sample._id,
        gradeName: sample.gradeName,
        application: sample.application,
        polymerType: sample.polymerType,
        isActive: sample.isActive
      }));
    } else {
      plantReactorObj.commercialSamples = [];
    }
    
    return NextResponse.json({ success: true, data: plantReactorObj }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plant reactor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plant reactor' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const plantReactor = await PlantReactor.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'commercialSamples',
      select: 'gradeName application polymerType isActive'
    });
    
    if (!plantReactor) {
      return NextResponse.json(
        { success: false, error: 'Plant reactor not found' },
        { status: 404 }
      );
    }
    
    // Process plantReactor data to ensure proper format
    const plantReactorObj = plantReactor.toObject();
    
    // Convert virtual 'commercialSamples' to regular field for the frontend
    if (plantReactor.commercialSamples && Array.isArray(plantReactor.commercialSamples)) {
      plantReactorObj.commercialSamples = plantReactor.commercialSamples.map(sample => ({
        id: sample._id,
        gradeName: sample.gradeName,
        application: sample.application,
        polymerType: sample.polymerType,
        isActive: sample.isActive
      }));
    } else {
      plantReactorObj.commercialSamples = [];
    }
    
    return NextResponse.json({ success: true, data: plantReactorObj }, { status: 200 });
  } catch (error) {
    console.error('Error updating plant reactor:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update plant reactor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const plantReactor = await PlantReactor.findByIdAndDelete(id);
    
    if (!plantReactor) {
      return NextResponse.json(
        { success: false, error: 'Plant reactor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting plant reactor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plant reactor' },
      { status: 500 }
    );
  }
}
