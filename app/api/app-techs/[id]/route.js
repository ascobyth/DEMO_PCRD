import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AppTech from '@/models/AppTech';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const appTech = await AppTech.findById(id)
      .populate({
        path: 'commercialSamples',
        select: 'gradeName application polymerType isActive'
      });
    
    if (!appTech) {
      return NextResponse.json(
        { success: false, error: 'App tech not found' },
        { status: 404 }
      );
    }
    
    // Process appTech data to ensure proper format
    const appTechObj = appTech.toObject();
    
    // Convert virtual 'commercialSamples' to regular field for the frontend
    if (appTech.commercialSamples && Array.isArray(appTech.commercialSamples)) {
      appTechObj.commercialSamples = appTech.commercialSamples.map(sample => ({
        id: sample._id,
        gradeName: sample.gradeName,
        application: sample.application,
        polymerType: sample.polymerType,
        isActive: sample.isActive
      }));
    } else {
      appTechObj.commercialSamples = [];
    }
    
    return NextResponse.json({ success: true, data: appTechObj }, { status: 200 });
  } catch (error) {
    console.error('Error fetching app tech:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch app tech' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const appTech = await AppTech.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'commercialSamples',
      select: 'gradeName application polymerType isActive'
    });
    
    if (!appTech) {
      return NextResponse.json(
        { success: false, error: 'App tech not found' },
        { status: 404 }
      );
    }
    
    // Process appTech data to ensure proper format
    const appTechObj = appTech.toObject();
    
    // Convert virtual 'commercialSamples' to regular field for the frontend
    if (appTech.commercialSamples && Array.isArray(appTech.commercialSamples)) {
      appTechObj.commercialSamples = appTech.commercialSamples.map(sample => ({
        id: sample._id,
        gradeName: sample.gradeName,
        application: sample.application,
        polymerType: sample.polymerType,
        isActive: sample.isActive
      }));
    } else {
      appTechObj.commercialSamples = [];
    }
    
    return NextResponse.json({ success: true, data: appTechObj }, { status: 200 });
  } catch (error) {
    console.error('Error updating app tech:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update app tech' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const appTech = await AppTech.findByIdAndDelete(id);
    
    if (!appTech) {
      return NextResponse.json(
        { success: false, error: 'App tech not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting app tech:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete app tech' },
      { status: 500 }
    );
  }
}
