import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

const SampleSet = require('@/models/SampleSet');

// GET - Fetch sample sets for a user
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const requesterEmail = searchParams.get('requesterEmail');
    const ioNumber = searchParams.get('ioNumber');
    
    if (!requesterEmail) {
      return NextResponse.json(
        { success: false, error: 'Requester email is required' },
        { status: 400 }
      );
    }
    
    // Build query to find sample sets that:
    // 1. Belong to the user, OR
    // 2. Share the same IO number (if IO number is provided)
    let query = { isActive: true };
    
    if (ioNumber && ioNumber !== '') {
      // User can see their own sample sets AND sample sets with the same IO number
      query.$or = [
        { requesterEmail: requesterEmail.toLowerCase() },
        { ioNumber: ioNumber }
      ];
    } else {
      // User can only see their own sample sets
      query.requesterEmail = requesterEmail.toLowerCase();
    }
    
    const sampleSets = await SampleSet.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Parse the JSON strings and format the response
    const formattedSampleSets = sampleSets.map(set => ({
      _id: set._id,
      sampleSetName: set.sampleSetName,
      requesterName: set.requesterName,
      requesterEmail: set.requesterEmail,
      ioNumber: set.ioNumber || 'No IO',
      sampleCount: set.sampleCount,
      description: set.description,
      samples: JSON.parse(set.samplesJson || '[]'),
      isOwner: set.requesterEmail === requesterEmail.toLowerCase(),
      createdAt: set.createdAt,
      updatedAt: set.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedSampleSets
    });
  } catch (error) {
    console.error('Error fetching sample sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample sets' },
      { status: 500 }
    );
  }
}

// POST - Create a new sample set
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      sampleSetName,
      requesterName,
      requesterEmail,
      ioNumber,
      samples,
      description
    } = body;
    
    // Validate required fields
    if (!sampleSetName || !requesterName || !requesterEmail || !samples) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if sample set name already exists for this user
    const existingSet = await SampleSet.findOne({
      sampleSetName: sampleSetName,
      requesterEmail: requesterEmail.toLowerCase()
    });
    
    if (existingSet) {
      return NextResponse.json(
        { success: false, error: 'A sample set with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new sample set
    const newSampleSet = new SampleSet({
      sampleSetName,
      requesterName,
      requesterEmail: requesterEmail.toLowerCase(),
      ioNumber: ioNumber || '',
      samplesJson: JSON.stringify(samples),
      sampleCount: samples.length,
      description: description || ''
    });
    
    await newSampleSet.save();
    
    return NextResponse.json({
      success: true,
      data: {
        _id: newSampleSet._id,
        sampleSetName: newSampleSet.sampleSetName,
        sampleCount: newSampleSet.sampleCount
      },
      message: 'Sample set saved successfully'
    });
  } catch (error) {
    console.error('Error saving sample set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save sample set' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sample set
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const requesterEmail = searchParams.get('requesterEmail');
    
    if (!id || !requesterEmail) {
      return NextResponse.json(
        { success: false, error: 'Sample set ID and requester email are required' },
        { status: 400 }
      );
    }
    
    // Only allow users to delete their own sample sets
    const result = await SampleSet.findOneAndUpdate(
      { 
        _id: id, 
        requesterEmail: requesterEmail.toLowerCase() 
      },
      { isActive: false },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Sample set not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sample set deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sample set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sample set' },
      { status: 500 }
    );
  }
}