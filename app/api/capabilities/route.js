import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Use the Capability model
const Capability = mongoose.models.Capability || require('@/models/Capability');

export async function GET() {
  try {
    await connectToDatabase();
    const capabilities = await Capability.find({});
    
    // Check if capabilities exist, if not, try to create default ones
    if (capabilities.length === 0) {
      console.log('No capabilities found. Redirecting to seed-capabilities endpoint...');
      
      // Call the seed-capabilities endpoint
      try {
        const seedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/seed-capabilities`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (seedResponse.ok) {
          const seedResult = await seedResponse.json();
          console.log('Successfully seeded capabilities');
          
          // Return the seeded capabilities
          return NextResponse.json({ 
            success: true, 
            data: seedResult.data,
            message: 'Default capabilities were created'
          }, { status: 200 });
        } else {
          console.error('Failed to seed capabilities');
        }
      } catch (seedError) {
        console.error('Error calling seed-capabilities endpoint:', seedError);
      }
      
      // Try fetching capabilities again in case seeding worked
      const newCapabilities = await Capability.find({});
      return NextResponse.json({ success: true, data: newCapabilities }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: capabilities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch capabilities' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const dropAll = searchParams.get('dropAll') === 'true';
    
    if (dropAll) {
      // Delete all records
      const result = await Capability.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} capabilities` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting capabilities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete capabilities' },
      { status: 500 }
    );
  }
}
