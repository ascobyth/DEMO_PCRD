import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

const SampleCommercial = require('@/models/SampleCommercial');

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const gradeName = searchParams.get('gradeName');
    
    if (!gradeName) {
      return NextResponse.json(
        { success: false, error: 'Grade name is required' },
        { status: 400 }
      );
    }
    
    // Find the commercial sample by grade name
    const sample = await SampleCommercial.findOne({ 
      gradeName: gradeName,
      isActive: { $ne: false }
    });
    
    if (!sample) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }
    
    // Return the polymer type and other relevant details
    return NextResponse.json({
      success: true,
      data: {
        polymerType: sample.polymerType || '',
        application: sample.application || '',
        properties: sample.properties || []
      }
    });
  } catch (error) {
    console.error('Error fetching grade details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grade details' },
      { status: 500 }
    );
  }
}