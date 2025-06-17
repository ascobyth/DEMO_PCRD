import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models - ensure they're loaded properly
const ErList = require('@/models/ErList');
const TestingERList = require('@/models/TestingERList');
const Capability = require('@/models/Capability');
const TestingMethod = require('@/models/TestingMethod');

// Helper function to generate ER request number
async function generateERRequestNumber(capabilityShortName) {
  const currentDate = new Date();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear().toString().slice(-2);
  
  // Format: SHORTNAME-ER-MMYY-XXXX (e.g., IM-ER-0616-0002)
  const prefix = `${capabilityShortName}-ER-${month}${year}`;
  
  // Find the latest request with this prefix
  const latestRequest = await ErList.findOne({
    requestNumber: { $regex: `^${prefix}-` }
  }).sort({ requestNumber: -1 });

  let runNumber;
  if (latestRequest) {
    const lastNumber = parseInt(latestRequest.requestNumber.split('-').pop());
    runNumber = (lastNumber + 1).toString().padStart(4, '0');
  } else {
    runNumber = '0001';
  }

  return `${prefix}-${runNumber}`;
}

export async function POST(request) {
  try {
    console.log('ER submission API called');
    await connectToDatabase();
    console.log('Database connected');
    
    // Verify models are loaded
    console.log('ErList model:', !!ErList);
    console.log('TestingMethod model:', !!TestingMethod);

    const body = await request.json();
    console.log('API received ER submission data:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.selectedMethod) {
      throw new Error('No testing method selected');
    }

    // Get the testing method details using mongoose models
    console.log('Looking up testing method:', body.selectedMethod);
    let testingMethod;
    try {
      testingMethod = await TestingMethod.findById(body.selectedMethod);
    } catch (err) {
      console.error('Error finding testing method:', err);
      throw new Error(`Invalid testing method ID: ${body.selectedMethod}`);
    }
    
    if (!testingMethod) {
      console.error('Testing method not found for ID:', body.selectedMethod);
      throw new Error(`Testing method not found for ID: ${body.selectedMethod}`);
    }
    console.log('Found testing method:', testingMethod.testingName);

    // Get capability details
    let capability;
    if (testingMethod.capabilityId) {
      console.log('Looking up capability:', testingMethod.capabilityId);
      try {
        capability = await Capability.findById(testingMethod.capabilityId);
      } catch (err) {
        console.warn('Error finding capability:', err);
      }
      
      if (!capability) {
        console.warn('Capability not found for ID:', testingMethod.capabilityId);
      }
    }
    
    const capabilityShortName = capability?.shortName || 'PCRD';
    console.log('Using capability short name:', capabilityShortName);

    try {
      // Temporarily disable transactions for debugging
      const createdRequests = [];
      
      // Generate a single request number for all samples
      const requestNumber = await generateERRequestNumber(capabilityShortName);

      // Create the main request entry for ErList with all samples
      const requestData = {
        requestNumber,
        requestStatus: 'submitted',
        requestTitle: body.requestTitle,
        useIoNumber: body.useIONumber === 'yes',
        ioCostCenter: body.ioNumber,
        requesterCostCenter: body.costCenter,
        priority: body.priority || 'normal',
        urgentType: body.priority === 'urgent' ? body.urgencyType : '',
        urgencyReason: body.priority === 'urgent' ? body.urgencyReason : '',
        requesterName: body.requester?.name || body.onBehalfOfName || '',
        requesterEmail: body.requester?.email || body.onBehalfOfEmail || '',
        jsonEquipmentList: JSON.stringify([{
          id: testingMethod._id,
          methodCode: testingMethod.methodCode,
          testingName: testingMethod.testingName,
          price: testingMethod.price,
          capabilityId: testingMethod.capabilityId,
          capabilityName: capability?.capabilityName || '',
          equipmentName: testingMethod.equipmentName,
          samples: body.samples.map(s => s.generatedName),
          reservationSchedule: body.reservationSchedule
        }]),
        isOnBehalf: body.isOnBehalf || false,
        onBehalfOfName: body.onBehalfOfName || '',
        onBehalfOfEmail: body.onBehalfOfEmail || '',
        onBehalfOfCostCenter: body.onBehalfOfCostCenter || '',
        notes: body.specialRequirements || '',
        // ASR project reference
        asrId: body.asrId || null,
        isAsrRequest: body.isAsrRequest || false
      };

      const newRequest = await ErList.create(requestData);
      const requestId = newRequest._id;

        // Store reservation schedule for later use
        const reservationSchedule = body.reservationSchedule || {};
        
        // Create TestingERList entries for each time slot reservation
        if (reservationSchedule && Object.keys(reservationSchedule).length > 0) {
          console.log('Processing reservation schedule:', JSON.stringify(reservationSchedule, null, 2));
          
          for (const [date, dateData] of Object.entries(reservationSchedule)) {
            // dateData should have a timeSlots array
            const timeSlots = dateData.timeSlots || [];
            
            for (const slot of timeSlots) {
              console.log('Processing slot:', slot);
              
              // slot object should have: { id, time, start, end }
              const startTime = slot.start;
              const endTime = slot.end;
              const slotNumber = slot.id;
              
              if (startTime && endTime) {
                // Create start and end datetime objects
                const reservationDate = new Date(date);
                const [startHour, startMin] = startTime.split(':').map(Number);
                const [endHour, endMin] = endTime.split(':').map(Number);
                
                const reservationStartTime = new Date(reservationDate);
                reservationStartTime.setHours(startHour, startMin, 0, 0);
                
                const reservationEndTime = new Date(reservationDate);
                reservationEndTime.setHours(endHour, endMin, 0, 0);
                
                // Calculate duration in minutes
                const reservationDuration = (reservationEndTime - reservationStartTime) / (1000 * 60);
                
                // Create TestingERList entry
                const erListEntry = {
                  testingSampleId: requestId, // Using request ID as placeholder since we don't have testing sample
                  requestId: requestId,
                  requestNumber: requestNumber,
                  equipmentId: testingMethod._id,
                  equipmentName: testingMethod.equipmentName || testingMethod.testingName,
                  reservationStartTime,
                  reservationEndTime,
                  reservationDuration,
                  slotNumber,
                  reservationStatus: 'scheduled',
                  reservedBy: body.requester?.name || body.onBehalfOfName || '',
                  remarks: `${testingMethod.testingName} - ${body.samples.map(s => s.generatedName).join(', ')}`
                };
                
                try {
                  await TestingERList.create(erListEntry);
                  console.log(`Created TestingERList entry for ${date} ${slot.time}`);
                } catch (err) {
                  console.error('Error creating TestingERList entry:', err);
                  // Continue with other slots even if one fails
                }
              }
            }
          }
        }

      // Create the single request object for response
      const createdRequest = {
        requestId: requestId.toString(),
        requestNumber,
        capability: capability?.capabilityName || '',
        capabilityShortName,
        equipmentName: testingMethod.equipmentName || '',
        methods: [{
          id: testingMethod._id,
          name: testingMethod.testingName,
          code: testingMethod.methodCode,
          samples: body.samples.map(s => s.generatedName)
        }],
        estimatedCompletion: calculateEstimatedCompletion(body.reservationSchedule),
        capabilityInfo: {
          address: capability?.address || 'PCRD Laboratory',
          contactPerson: capability?.contactPerson || 'Lab Administrator',
          contactEmail: capability?.contactEmail || 'lab@pcrd.com',
          contactPhone: capability?.contactPhone || '123-456-7890'
        }
      };

      // Successfully created the request

      return NextResponse.json({
        success: true,
        message: 'ER request submitted successfully',
        data: {
          requests: [createdRequest],
          requestNumbers: [requestNumber]
        }
      });

    } catch (error) {
      // Re-throw to be caught by outer try-catch
      throw error;
    }

  } catch (error) {
    console.error('Error submitting ER request:', error);
    console.error('Error stack:', error.stack);
    
    // Log specific details for debugging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit ER request',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

function calculateEstimatedCompletion(reservationSchedule) {
  if (!reservationSchedule || Object.keys(reservationSchedule).length === 0) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
  // Find the latest reserved date
  const dates = Object.keys(reservationSchedule).sort();
  const lastDate = dates[dates.length - 1];
  
  // Add 2 days for analysis after the last reservation
  const estimatedDate = new Date(lastDate);
  estimatedDate.setDate(estimatedDate.getDate() + 2);
  
  return estimatedDate.toISOString().split('T')[0];
}