import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import PlantReactor from '@/models/PlantReactor';

export async function GET() {
  try {
    await dbConnect();
    const plantReactors = await PlantReactor.find({})
      .populate({
        path: 'commercialSamples',
        select: 'gradeName application polymerType isActive'
      })
      .sort({ reactorPlantName: 1 });
    
    // Process plantReactors data to ensure proper format
    const processedPlantReactors = plantReactors.map(plantReactor => {
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
      
      return plantReactorObj;
    });
    
    return NextResponse.json({ success: true, data: processedPlantReactors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plant reactors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plant reactors' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Create a new plant reactor
    const plantReactor = await PlantReactor.create(body);
    
    return NextResponse.json({ success: true, data: plantReactor }, { status: 201 });
  } catch (error) {
    console.error('Error creating plant reactor:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create plant reactor' },
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
      const result = await PlantReactor.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} plant reactors` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting plant reactors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plant reactors' },
      { status: 500 }
    );
  }
}
