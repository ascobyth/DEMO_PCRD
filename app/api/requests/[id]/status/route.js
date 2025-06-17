import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { RequestList, ErList } from '@/models';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { requestStatus, completeDate } = body;

    if (!requestStatus) {
      return NextResponse.json(
        { success: false, error: 'Request status is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData = {
      requestStatus,
      updatedAt: new Date()
    };

    // Add complete date if status is completed
    if (requestStatus === 'completed' && completeDate) {
      updateData.completeDate = new Date(completeDate);
    }

    // Try to update in RequestList first
    let updatedRequest = await RequestList.findOneAndUpdate(
      { 
        $or: [
          { _id: id },
          { requestNumber: id }
        ]
      },
      updateData,
      { new: true }
    );

    // If not found in RequestList, try ErList
    if (!updatedRequest) {
      updatedRequest = await ErList.findOneAndUpdate(
        { 
          $or: [
            { _id: id },
            { requestNumber: id }
          ]
        },
        updateData,
        { new: true }
      );
    }

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request status updated to ${requestStatus}`
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update request status' },
      { status: 500 }
    );
  }
}