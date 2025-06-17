import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

const ErList = mongoose.models.ErList || require('@/models/ErList');

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const erRequestId = searchParams.get('erRequestId');

    if (!erRequestId) {
      return NextResponse.json(
        { success: false, error: 'erRequestId query param is required' },
        { status: 400 }
      );
    }

    let query = {};
    try {
      const objectId = new mongoose.Types.ObjectId(erRequestId);
      query = { _id: objectId };
    } catch (err) {
      query = { requestNumber: erRequestId };
    }

    const erData = await ErList.findOne(query).lean();

    if (!erData) {
      return NextResponse.json(
        { success: false, error: 'ER request not found' },
        { status: 404 }
      );
    }

    const formatted = {
      id: erData._id.toString(),
      requestNumber: erData.requestNumber,
      reservationStartDate: erData.reservationStartDate,
      reservationEndDate: erData.reservationEndDate,
      jsonEquipmentList: erData.jsonEquipmentList,
      notes: erData.notes
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching ER details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ER details' },
      { status: 500 }
    );
  }
}
