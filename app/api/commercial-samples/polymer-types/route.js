import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

const SampleCommercial = require('@/models/SampleCommercial');

export async function GET() {
  try {
    await dbConnect();
    
    // Get all distinct polymer types from SampleCommercial collection
    const polymerTypes = await SampleCommercial.distinct('polymerType');
    
    // Filter out null/undefined values and sort
    const validPolymerTypes = polymerTypes
      .filter(type => type && type.trim() !== '')
      .sort();
    
    // Return as options format for Select component
    const options = validPolymerTypes.map(type => ({
      value: type,
      label: type
    }));
    
    return NextResponse.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching polymer types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch polymer types' },
      { status: 500 }
    );
  }
}