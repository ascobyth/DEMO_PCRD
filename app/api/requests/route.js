import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Use the RequestList model instead of Request
const RequestList = mongoose.models.RequestList || require('@/models/RequestList');

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const requesterEmail = searchParams.get('requesterEmail');
    const priority = searchParams.get('priority');
    const isApproved = searchParams.get('isApproved');
    const status = searchParams.get('status');
    
    // Build query based on parameters
    let query = {};
    const conditions = [];
    
    if (requesterEmail) {
      query.requesterEmail = requesterEmail;
    }
    if (priority) {
      query.priority = priority;
    }
    if (status) {
      query.status = status;
    }
    
    // Handle isApproved - for false, include records without the field
    if (isApproved !== null) {
      if (isApproved === 'false') {
        // Build an AND query with OR for approval status
        const andConditions = [];
        
        // Add other conditions
        if (requesterEmail) andConditions.push({ requesterEmail });
        if (priority) andConditions.push({ priority });
        if (status) andConditions.push({ status });
        
        // Add approval condition
        andConditions.push({
          $or: [
            { isApproved: false },
            { isApproved: { $exists: false } }
          ]
        });
        
        query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0] || {};
      } else {
        query.isApproved = true;
      }
    }
    
    console.log('Request query:', JSON.stringify(query, null, 2));
    
    const requests = await RequestList.find(query)
      .sort({ requestNumber: 1 });
    
    console.log(`Found ${requests.length} requests`);

    const response = NextResponse.json({ success: true, data: requests }, { status: 200 });
    
    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    console.log('API received request data:', body);

    // Create a new request
    const newRequest = await RequestList.create(body);
    console.log('Created request:', newRequest);

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);

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
        { success: false, error: 'A request with that number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
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
      const result = await RequestList.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} requests` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete requests' },
      { status: 500 }
    );
  }
}
