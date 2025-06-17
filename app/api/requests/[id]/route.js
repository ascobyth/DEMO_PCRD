import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';
import { RequestList, ErList, TestingSampleList } from '@/models';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Try to find by requestNumber first (for evaluation API)
    let requestData = await RequestList.findOne({ requestNumber: id });

    // If not found, try by _id
    if (!requestData) {
      requestData = await RequestList.findById(id);
    }

    // If still not found, try in ErList by requestNumber
    if (!requestData) {
      requestData = await ErList.findOne({ requestNumber: id });
    }

    // If still not found, try in ErList by _id
    if (!requestData) {
      requestData = await ErList.findById(id);
    }

    if (!requestData) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: requestData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  console.log('PUT request received');
  
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');
    
    // Check if MongoDB is actually connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection not ready. State:', mongoose.connection.readyState);
      return NextResponse.json({
        success: false,
        error: 'Database connection not available',
        details: 'MongoDB connection state: ' + mongoose.connection.readyState
      }, { status: 503 });
    }

    const { id } = await params;
    console.log('Request ID:', id);
    
    const body = await request.json();
    console.log('API received request update data:', {
      hasTitle: !!body.requestTitle,
      hasSamples: !!body.samples,
      hasTestMethods: !!body.testMethods,
      samplesCount: body.samples ? body.samples.length : 0,
      testMethodsCount: body.testMethods ? body.testMethods.length : 0
    });

    // Check if this is an NTR request update (has samples and testMethods)
    const isNtrUpdate = body.samples && body.testMethods;

    if (isNtrUpdate) {
      // Handle NTR request update without transaction (for standalone MongoDB)
      try {
        // Find the existing request by request number
        const existingRequest = await RequestList.findOne({ requestNumber: id });

        if (!existingRequest) {
          return NextResponse.json(
            { success: false, error: 'Request not found' },
            { status: 404 }
          );
        }

        console.log('Found existing request:', existingRequest._id);

        // Update the main request entry
        const updateData = {
          requestTitle: body.requestTitle,
          useIoNumber: body.useIONumber === 'yes',
          ioCostCenter: body.ioNumber,
          requesterCostCenter: body.costCenter,
          priority: body.priority,
          urgentType: body.urgentType,
          urgencyReason: body.urgencyReason,
          jsonSampleList: JSON.stringify(body.samples),
          jsonTestingList: JSON.stringify(body.testMethods),
          updatedAt: new Date(),
        };

        console.log('Update data being saved:', updateData);
        console.log('Updating request with requestNumber:', id);

        const updateResult = await RequestList.updateOne(
          { requestNumber: id },
          { $set: updateData }
        );

        console.log('Update result:', updateResult);

        // Delete existing testing sample entries for this request
        console.log('Deleting existing TestingSampleList entries for requestId:', existingRequest._id);
        const deleteResult = await TestingSampleList.deleteMany(
          { requestId: existingRequest._id }
        );
        console.log('Deleted', deleteResult.deletedCount, 'existing testing sample entries');

        // Create new testing sample entries for each sample and test method combination
        const testingSampleEntries = [];

        // Only process active (non-deleted) methods
        const activeMethods = body.testMethods.filter(method => !method.isDeleted);
        console.log('Processing active methods:', activeMethods.length);

        for (const method of activeMethods) {
          console.log('Processing method:', method.name, 'with samples:', method.samples);
          for (const sampleName of method.samples) {
            // Find the corresponding sample object
            const sample = body.samples.find(s =>
              (s.name === sampleName) || (s.generatedName === sampleName)
            );

            if (sample) {
              // Generate unique IDs for required fields
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substr(2, 9);
              const sampleId = `${id}-${sample.generatedName || sample.name}-${method.id || method.methodCode}-${timestamp}`;
              const testingListId = `TL-${timestamp}-${randomId}`;
              const testingId = `T-${timestamp}-${randomId}`;

              const testingSampleData = {
                // Required fields
                requestId: existingRequest._id, // Reference to the RequestList document
                requestNumber: id,
                sampleId: sampleId,
                sampleName: sample.generatedName || sample.name,
                testingListId: testingListId,
                testingId: testingId,
                sampleStatus: 'Pending Receive',

                // Method information
                methodCode: method.methodCode || method.id,
                methodId: method.methodId || method.id, // If available
                testingRemark: method.remarks || '',
                testingCost: (method.price || 0).toString(),

                // Capability information
                capabilityId: method.capabilityId || null,
                capabilityName: method.capabilityName || method.category || 'Unknown',

                // Sample details
                remark: sample.remark || '',

                // Request type
                requestType: 'NTR',

                // Dates
                submitDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              testingSampleEntries.push(testingSampleData);
            }
          }
        }

        // Create all testing sample entries at once
        console.log('Creating', testingSampleEntries.length, 'new testing sample entries');
        if (testingSampleEntries.length > 0) {
          const createdEntries = await TestingSampleList.insertMany(testingSampleEntries);
          console.log('Created', createdEntries.length, 'testing sample entries');
        }

        return NextResponse.json({
          success: true,
          data: {
            requestNumber: id,
            message: 'Request updated successfully',
            updatedFields: updateResult.modifiedCount,
            deletedSamples: deleteResult.deletedCount,
            createdSamples: testingSampleEntries.length
          }
        }, { status: 200 });
      } catch (error) {
        console.error('Error during NTR update:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Return a more informative error response
        return NextResponse.json({
          success: false,
          error: `Update failed: ${error.message}`,
          details: error.name
        }, { status: 500 });
      }
    } else {
      // Handle simple request update (for ER requests or basic updates)
      const isErRequest = body.requestNumber && body.requestNumber.includes('-ER-');
      const Model = isErRequest ? ErList : RequestList;

      const updatedRequest = await Model.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
      });

      if (!updatedRequest) {
        return NextResponse.json(
          { success: false, error: 'Request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updatedRequest }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating request:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);

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

    // Handle model compilation errors
    if (error.message && error.message.includes('Schema hasn\'t been registered')) {
      return NextResponse.json(
        { success: false, error: 'Database schema error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    console.log('DELETE request received for ID:', id);

    // First, find the request to get the request number
    let requestToDelete;
    
    // Check if id is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    
    if (isValidObjectId) {
      // Try to find by _id first
      requestToDelete = await RequestList.findById(id);
      if (!requestToDelete) {
        requestToDelete = await ErList.findById(id);
      }
    }
    
    // If not found by _id, try by requestNumber
    if (!requestToDelete) {
      requestToDelete = await RequestList.findOne({ requestNumber: id });
      if (!requestToDelete) {
        requestToDelete = await ErList.findOne({ requestNumber: id });
      }
    }

    if (!requestToDelete) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Get the request number and ID
    const requestNumber = requestToDelete.requestNumber;
    const requestId = requestToDelete._id;

    console.log(`Deleting request ${requestNumber} with ID ${requestId}`);

    // Delete all associated testing samples
    let deletedSamples = { deletedCount: 0 };
    try {
      // Delete by requestNumber
      const deleteByNumber = await TestingSampleList.deleteMany({ requestNumber: requestNumber });
      deletedSamples.deletedCount += deleteByNumber.deletedCount;
      
      // Also try to delete by requestId
      const deleteById = await TestingSampleList.deleteMany({ requestId: requestId });
      deletedSamples.deletedCount += deleteById.deletedCount;
    } catch (sampleError) {
      console.error('Error deleting testing samples:', sampleError);
      // Continue with request deletion even if sample deletion fails
    }

    console.log(`Deleted ${deletedSamples.deletedCount} testing samples`);

    // Now delete the request itself
    try {
      // Determine which collection the request came from
      let deleteResult;
      
      // Try to delete from RequestList first
      deleteResult = await RequestList.findOneAndDelete({ 
        $or: [
          { _id: requestId },
          { requestNumber: requestNumber }
        ]
      });
      
      // If not found in RequestList, try ErList
      if (!deleteResult) {
        deleteResult = await ErList.findOneAndDelete({ 
          $or: [
            { _id: requestId },
            { requestNumber: requestNumber }
          ]
        });
      }
      
      if (!deleteResult) {
        throw new Error('Request not found during deletion');
      }
      
      console.log('Successfully deleted request:', deleteResult.requestNumber);
    } catch (deleteError) {
      console.error('Error during request deletion:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Request ${requestNumber} and ${deletedSamples.deletedCount} associated testing samples have been deleted`,
      deletedSamplesCount: deletedSamples.deletedCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting request:', error);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete request',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}
