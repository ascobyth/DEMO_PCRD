import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

// Import models
const TestingERList = require('@/models/TestingERList');
const TestingMethod = require('@/models/TestingMethod');

/**
 * API route to fetch booked time slots for equipment
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response with booked slots data
 */
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get('methodId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!methodId) {
      return NextResponse.json(
        { success: false, error: 'Method ID is required' },
        { status: 400 }
      );
    }
    
    // Get the testing method to find the equipment
    const testingMethod = await TestingMethod.findById(methodId).lean();
    if (!testingMethod) {
      return NextResponse.json(
        { success: false, error: 'Testing method not found' },
        { status: 404 }
      );
    }
    
    // Build query for TestingERList
    const query = {
      equipmentId: methodId,
      reservationStatus: { $in: ['scheduled', 'in-progress'] } // Only active reservations
    };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.reservationStartTime = {};
      if (startDate) {
        query.reservationStartTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.reservationStartTime.$lte = endDateTime;
      }
    }
    
    console.log('Fetching booked slots with query:', query);
    
    // Find all booked slots for this equipment
    const bookedSlots = await TestingERList.find(query).lean();
    
    console.log(`Found ${bookedSlots.length} booked slots`);
    
    // Group booked slots by date
    const bookedSlotsByDate = {};
    
    bookedSlots.forEach(slot => {
      const date = new Date(slot.reservationStartTime).toISOString().split('T')[0];
      
      if (!bookedSlotsByDate[date]) {
        bookedSlotsByDate[date] = [];
      }
      
      // Extract time from the reservation
      const startTime = new Date(slot.reservationStartTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const endTime = new Date(slot.reservationEndTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      bookedSlotsByDate[date].push({
        slotNumber: slot.slotNumber,
        startTime,
        endTime,
        timeRange: `${startTime} - ${endTime}`,
        requestNumber: slot.requestNumber,
        reservedBy: slot.reservedBy,
        status: slot.reservationStatus
      });
    });
    
    // Also return availability summary for each date
    const availabilitySummary = {};
    
    // Define standard time slots (adjust as needed)
    const standardSlots = [
      { id: 1, time: '09:00 - 10:00', start: '09:00', end: '10:00' },
      { id: 2, time: '10:00 - 11:00', start: '10:00', end: '11:00' },
      { id: 3, time: '11:00 - 12:00', start: '11:00', end: '12:00' },
      { id: 4, time: '13:00 - 14:00', start: '13:00', end: '14:00' },
      { id: 5, time: '14:00 - 15:00', start: '14:00', end: '15:00' },
      { id: 6, time: '15:00 - 16:00', start: '15:00', end: '16:00' },
      { id: 7, time: '16:00 - 17:00', start: '16:00', end: '17:00' }
    ];
    
    // Calculate availability for each date in the range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const bookedOnDate = bookedSlotsByDate[dateStr] || [];
        
        // Check which slots are available
        const availableSlots = standardSlots.filter(slot => {
          return !bookedOnDate.some(booked => 
            booked.startTime === slot.start || booked.timeRange === slot.time
          );
        });
        
        availabilitySummary[dateStr] = {
          totalSlots: standardSlots.length,
          bookedSlots: bookedOnDate.length,
          availableSlots: availableSlots.length,
          isFullyBooked: availableSlots.length === 0,
          hasAvailability: availableSlots.length > 0
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        bookedSlots: bookedSlotsByDate,
        availabilitySummary,
        equipmentName: testingMethod.equipmentName || testingMethod.testingName,
        methodName: testingMethod.testingName
      }
    });
    
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booked slots',
        details: error.message
      },
      { status: 500 }
    );
  }
}