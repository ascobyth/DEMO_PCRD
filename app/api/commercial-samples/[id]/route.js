import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import SampleCommercial from '@/models/SampleCommercial';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const sample = await SampleCommercial.findById(id)
      .populate({
        path: 'appTechId',
        select: 'appTech shortText appTechType isActive'
      })
      .populate({
        path: 'plantReactorId',
        select: 'reactorPlantName isActive'
      });
    
    if (!sample) {
      return NextResponse.json(
        { success: false, error: 'Commercial sample not found' },
        { status: 404 }
      );
    }
    
    // Process sample data to ensure proper format
    const sampleObj = sample.toObject();
    
    // Format appTech data if populated
    if (sampleObj.appTechId) {
      sampleObj.appTech = {
        id: sampleObj.appTechId._id,
        name: sampleObj.appTechId.appTech,
        shortText: sampleObj.appTechId.shortText,
        type: sampleObj.appTechId.appTechType,
        isActive: sampleObj.appTechId.isActive
      };
    }
    
    // Format plantReactor data if populated
    if (sampleObj.plantReactorId) {
      sampleObj.plantReactor = {
        id: sampleObj.plantReactorId._id,
        name: sampleObj.plantReactorId.reactorPlantName,
        isActive: sampleObj.plantReactorId.isActive
      };
    }
    
    return NextResponse.json({ success: true, data: sampleObj }, { status: 200 });
  } catch (error) {
    console.error('Error fetching commercial sample:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commercial sample' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const sample = await SampleCommercial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'appTechId',
      select: 'appTech shortText appTechType isActive'
    }).populate({
      path: 'plantReactorId',
      select: 'reactorPlantName isActive'
    });
    
    if (!sample) {
      return NextResponse.json(
        { success: false, error: 'Commercial sample not found' },
        { status: 404 }
      );
    }
    
    // Process sample data to ensure proper format
    const sampleObj = sample.toObject();
    
    // Format appTech data if populated
    if (sampleObj.appTechId) {
      sampleObj.appTech = {
        id: sampleObj.appTechId._id,
        name: sampleObj.appTechId.appTech,
        shortText: sampleObj.appTechId.shortText,
        type: sampleObj.appTechId.appTechType,
        isActive: sampleObj.appTechId.isActive
      };
    }
    
    // Format plantReactor data if populated
    if (sampleObj.plantReactorId) {
      sampleObj.plantReactor = {
        id: sampleObj.plantReactorId._id,
        name: sampleObj.plantReactorId.reactorPlantName,
        isActive: sampleObj.plantReactorId.isActive
      };
    }
    
    return NextResponse.json({ success: true, data: sampleObj }, { status: 200 });
  } catch (error) {
    console.error('Error updating commercial sample:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update commercial sample' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const sample = await SampleCommercial.findByIdAndDelete(id);
    
    if (!sample) {
      return NextResponse.json(
        { success: false, error: 'Commercial sample not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting commercial sample:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commercial sample' },
      { status: 500 }
    );
  }
}
