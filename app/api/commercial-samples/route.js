import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import SampleCommercial from '@/models/SampleCommercial';

export async function GET() {
  try {
    await dbConnect();
    const samples = await SampleCommercial.find({})
      .populate({
        path: 'appTechId',
        select: 'appTech shortText appTechType isActive'
      })
      .populate({
        path: 'plantReactorId',
        select: 'reactorPlantName isActive'
      })
      .sort({ gradeName: 1 });
    
    // Process samples data to ensure proper format
    const processedSamples = samples.map(sample => {
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
      
      return sampleObj;
    });
    
    return NextResponse.json({ success: true, data: processedSamples }, { status: 200 });
  } catch (error) {
    console.error('Error fetching commercial samples:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commercial samples' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Create a new commercial sample
    const sample = await SampleCommercial.create(body);
    
    // Populate the related data
    await sample.populate([
      {
        path: 'appTechId',
        select: 'appTech shortText appTechType isActive'
      },
      {
        path: 'plantReactorId',
        select: 'reactorPlantName isActive'
      }
    ]);
    
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
    
    return NextResponse.json({ success: true, data: sampleObj }, { status: 201 });
  } catch (error) {
    console.error('Error creating commercial sample:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create commercial sample' },
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
      const result = await SampleCommercial.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} commercial samples` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting commercial samples:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete commercial samples' },
      { status: 500 }
    );
  }
}
