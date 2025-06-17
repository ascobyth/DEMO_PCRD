import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models
const ErList = require('@/models/ErList');
const TestingERList = require('@/models/TestingERList');
const Capability = require('@/models/Capability');
const TestingMethod = require('@/models/TestingMethod');

/**
 * API route handler for fetching ER request details including time slot reservations
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function GET(request) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the request numbers from the query parameters
    const { searchParams } = new URL(request.url);
    const requestNumbersParam = searchParams.get('requestNumbers');

    if (!requestNumbersParam) {
      return NextResponse.json(
        { success: false, error: 'Request numbers are required' },
        { status: 400 }
      );
    }

    // Parse the request numbers
    let requestNumbers;
    try {
      requestNumbers = JSON.parse(requestNumbersParam);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request numbers format' },
        { status: 400 }
      );
    }

    // If requestNumbers is an object, extract the values
    if (typeof requestNumbers === 'object' && !Array.isArray(requestNumbers)) {
      requestNumbers = Object.values(requestNumbers);
    }

    // Ensure requestNumbers is an array
    if (!Array.isArray(requestNumbers)) {
      requestNumbers = [requestNumbers];
    }

    console.log('Fetching ER details for requests:', requestNumbers);

    // Find all ER requests in the database
    const erRequests = await ErList.find({ requestNumber: { $in: requestNumbers } }).lean();

    if (erRequests.length === 0) {
      console.log('No ER requests found in database for:', requestNumbers);
      return NextResponse.json(
        { success: false, error: 'No ER requests found' },
        { status: 404 }
      );
    }

    // Find all TestingERList entries for these requests
    const testingEREntries = await TestingERList.find({
      requestNumber: { $in: requestNumbers }
    }).lean();

    console.log(`Found ${testingEREntries.length} TestingERList entries`);

    // Group TestingERList entries by request number
    const testingERByRequest = {};
    testingEREntries.forEach(entry => {
      if (!testingERByRequest[entry.requestNumber]) {
        testingERByRequest[entry.requestNumber] = [];
      }
      testingERByRequest[entry.requestNumber].push(entry);
    });

    // Process each ER request
    const processedRequests = await Promise.all(erRequests.map(async (erRequest) => {
      // Parse JSON equipment list
      let equipmentList = [];
      try {
        equipmentList = JSON.parse(erRequest.jsonEquipmentList || '[]');
      } catch (err) {
        console.error('Error parsing jsonEquipmentList:', err);
      }

      // Get capability information
      let capabilityInfo = null;
      if (equipmentList.length > 0 && equipmentList[0].capabilityId) {
        try {
          const capability = await Capability.findById(equipmentList[0].capabilityId).lean();
          if (capability) {
            capabilityInfo = {
              name: capability.capabilityName,
              shortName: capability.shortName,
              address: capability.address || 'PCRD Laboratory',
              contactPerson: capability.contactPerson || 'Lab Administrator',
              contactEmail: capability.contactEmail || 'lab@pcrd.com',
              contactPhone: capability.contactPhone || '123-456-7890'
            };
          }
        } catch (err) {
          console.error('Error fetching capability:', err);
        }
      }

      // Get testing method information
      let methodInfo = null;
      if (equipmentList.length > 0 && equipmentList[0].id) {
        try {
          const method = await TestingMethod.findById(equipmentList[0].id).lean();
          if (method) {
            methodInfo = {
              name: method.testingName,
              code: method.methodCode,
              equipmentName: method.equipmentName,
              price: method.price
            };
          }
        } catch (err) {
          console.error('Error fetching testing method:', err);
        }
      }

      // Get TestingERList entries for this request
      const reservations = testingERByRequest[erRequest.requestNumber] || [];
      
      // Sort reservations by date and time
      reservations.sort((a, b) => {
        return new Date(a.reservationStartTime) - new Date(b.reservationStartTime);
      });

      // Group reservations by date
      const reservationsByDate = {};
      reservations.forEach(reservation => {
        const date = new Date(reservation.reservationStartTime).toISOString().split('T')[0];
        if (!reservationsByDate[date]) {
          reservationsByDate[date] = [];
        }
        reservationsByDate[date].push({
          slotNumber: reservation.slotNumber,
          startTime: new Date(reservation.reservationStartTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          endTime: new Date(reservation.reservationEndTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          duration: reservation.reservationDuration,
          status: reservation.reservationStatus,
          remarks: reservation.remarks
        });
      });

      return {
        requestId: erRequest._id.toString(),
        requestNumber: erRequest.requestNumber,
        requestTitle: erRequest.requestTitle,
        requestStatus: erRequest.requestStatus,
        priority: erRequest.priority,
        submissionDate: erRequest.createdAt ? new Date(erRequest.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        requester: {
          name: erRequest.requesterName,
          email: erRequest.requesterEmail,
          costCenter: erRequest.requesterCostCenter
        },
        capability: capabilityInfo,
        method: methodInfo,
        equipment: equipmentList[0] || {},
        reservations: reservationsByDate,
        totalReservations: reservations.length,
        notes: erRequest.notes || ''
      };
    }));

    return NextResponse.json({ 
      success: true, 
      data: processedRequests 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching ER request details:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ER request details',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}