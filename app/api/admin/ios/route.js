import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Io from '@/models/Io';

export async function GET() {
  try {
    await dbConnect();
    const ios = await Io.find({})
      .sort({ ioNo: 1 });

    // Return the data in the format expected by the NTR page
    return NextResponse.json(ios);
  } catch (error) {
    console.error('Error fetching IOs:', error);
    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}
