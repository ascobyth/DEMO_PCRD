import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const AsrList = mongoose.models.AsrList || require('@/models/AsrList');

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const isApproved = searchParams.get('isApproved');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const requesterEmail = searchParams.get('requesterEmail');
    
    // Build query
    const query = {};
    
    if (isApproved !== null) {
      if (isApproved === 'false') {
        // For false, we want records that are either false or don't have the field
        query.$or = [
          { isApproved: false },
          { isApproved: { $exists: false } }
        ];
      } else {
        query.isApproved = true;
      }
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (status) {
      query.asrStatus = status;
    }
    
    if (requesterEmail) {
      query.requesterEmail = requesterEmail;
    }
    
    console.log('ASR query:', JSON.stringify(query, null, 2));
    
    // Fetch ASRs with query
    const asrs = await AsrList.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    console.log(`Found ${asrs.length} ASRs`);
    
    return NextResponse.json({
      success: true,
      data: asrs,
      count: asrs.length
    });
  } catch (error) {
    console.error('Error fetching ASRs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ASRs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Generate ASR number
    const currentYear = new Date().getFullYear();
    const lastAsr = await AsrList.findOne({
      asrNumber: { $regex: `^ASR-${currentYear}-` }
    }).sort({ asrNumber: -1 });
    
    let nextNumber = 1;
    if (lastAsr) {
      const lastNumber = parseInt(lastAsr.asrNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const asrNumber = `ASR-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    
    // Create new ASR
    const newAsr = await AsrList.create({
      ...body,
      asrNumber,
      asrStatus: body.asrStatus || 'Pending Receive',
      isApproved: false
    });
    
    return NextResponse.json({
      success: true,
      data: newAsr,
      message: 'ASR created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating ASR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ASR' },
      { status: 500 }
    );
  }
}