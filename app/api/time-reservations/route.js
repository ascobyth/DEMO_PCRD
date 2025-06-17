import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const equipmentName = searchParams.get('equipmentName');
    
    if (!equipmentName) {
      return NextResponse.json(
        { success: false, error: 'Equipment name is required' },
        { status: 400 }
      );
    }

    // Get database connection
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('timereservations');

    // Fetch reservations for the specified equipment
    const reservations = await collection.find({
      equipmentName: equipmentName,
      status: 'active'
    }).toArray();

    console.log(`Found ${reservations.length} reservations for equipment: ${equipmentName}`);

    return NextResponse.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error fetching time reservations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      equipmentId,
      equipmentName,
      startTime,
      endTime,
      reason,
      createdBy,
      createdByEmail
    } = body;

    // Validate required fields
    if (!equipmentName || !startTime || !endTime || !createdBy || !createdByEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get database connection
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('timereservations');

    // Check for conflicts
    const conflicts = await collection.find({
      equipmentName: equipmentName,
      status: 'active',
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    }).toArray();

    if (conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Time slot conflicts with existing reservation' },
        { status: 409 }
      );
    }

    // Create reservation
    const reservation = {
      equipmentId,
      equipmentName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason,
      createdBy,
      createdByEmail,
      status: 'active',
      reservationId: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(reservation);

    return NextResponse.json({
      success: true,
      data: { ...reservation, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating time reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create time reservation' },
      { status: 500 }
    );
  }
}