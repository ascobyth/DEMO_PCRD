import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import ErList from '@/models/ErList';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    const { approvedSlots, updateStatus, equipmentList } = body;
    
    // Find ER request
    const erRequest = await ErList.findOne({ requestNumber: id });
    
    if (!erRequest) {
      return NextResponse.json(
        { success: false, error: 'ER request not found' },
        { status: 404 }
      );
    }
    
    // Update equipment list with approved slots
    const updatedEquipmentList = JSON.stringify(equipmentList);
    
    const updateData = {
      jsonEquipmentList: updatedEquipmentList,
      updatedAt: new Date()
    };
    
    // Update status if all slots are approved
    if (updateStatus) {
      updateData.requestStatus = 'in-progress';
    }
    
    // Update the ER request
    const updatedRequest = await ErList.findOneAndUpdate(
      { requestNumber: id },
      updateData,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Successfully approved ${approvedSlots.length} time slot(s)`
    });
  } catch (error) {
    console.error('Error approving slots:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}