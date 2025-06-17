import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { TestingSampleList } from '@/models';
const Notification = require('@/models/Notification');
const RequestList = require('@/models/RequestList');

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { requestNumber, testingSampleIds, receiveAll } = body;

    if (!requestNumber) {
      return NextResponse.json({
        success: false,
        error: 'Request number is required'
      }, { status: 400 });
    }

    let updatedSamples;
    let filter: any = { requestNumber };

    if (receiveAll) {
      // Receive all testing samples for this request that are pending
      filter.sampleStatus = { $in: ['Pending Receive', 'draft', 'submitted'] };
      updatedSamples = await TestingSampleList.updateMany(
        filter,
        {
          $set: {
            sampleStatus: 'In Progress',
            receiveDate: new Date()
          }
        }
      );
    } else if (testingSampleIds && testingSampleIds.length > 0) {
      // Receive specific testing samples - only update the selected testing list items
      updatedSamples = await TestingSampleList.updateMany(
        {
          testingListId: { $in: testingSampleIds },
          sampleStatus: { $in: ['Pending Receive', 'draft', 'submitted'] }
        },
        {
          $set: {
            sampleStatus: 'In Progress',
            receiveDate: new Date()
          }
        }
      );
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either testingSampleIds or receiveAll must be provided'
      }, { status: 400 });
    }

    // Get updated counts
    const totalSamples = await TestingSampleList.countDocuments({ requestNumber });
    const receivedSamples = await TestingSampleList.countDocuments({
      requestNumber,
      sampleStatus: { $in: ['In Progress', 'Completed', 'Received'] }
    });

    const allSamplesReceived = receivedSamples === totalSamples;

    // Create notification for sample status change
    try {
      // Get the request details to notify the requester
      const requestDetails = await RequestList.findOne({ requestNumber });
      
      if (requestDetails && updatedSamples.modifiedCount > 0) {
        const sampleText = updatedSamples.modifiedCount === 1 ? 'sample' : 'samples';
        
        await Notification.createStatusChangeNotification({
          userId: requestDetails.requesterEmail || 'system',
          userEmail: requestDetails.requesterEmail || 'admin@admin.com',
          requestNumber: requestNumber,
          sampleId: receiveAll ? 'multiple' : testingSampleIds?.[0],
          entityType: 'sample',
          entityId: requestNumber,
          previousStatus: 'Pending Receive',
          newStatus: 'In Progress',
          changedBy: 'Laboratory Staff',
          changedByEmail: 'lab@admin.com',
          priority: requestDetails.priority === 'urgent' ? 'urgent' : 'medium'
        });
        
        console.log(`Created notification for ${updatedSamples.modifiedCount} sample(s) received for request ${requestNumber}`);
      }
    } catch (notificationError) {
      console.error('Error creating sample notification:', notificationError);
      // Don't fail the sample update if notification creation fails
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedSamples.modifiedCount,
        totalSamplesCount: totalSamples,
        receivedSamplesCount: receivedSamples,
        allSamplesReceived
      }
    });

  } catch (error) {
    console.error('Error receiving testing samples:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to receive testing samples'
    }, { status: 500 });
  }
}