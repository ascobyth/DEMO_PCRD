import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

const AsrList = mongoose.models.AsrList || require('@/models/AsrList');
const Capability = mongoose.models.Capability || require('@/models/Capability');

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    console.log('Received ASR submission data:', body);

    // Predeclare ASR number to avoid reference errors in case generation fails
    let asrNumber = '';

    // First check if we have an explicit shortName provided
    const capabilityShortName = body.capabilityShortName;
    const capabilityName = body.capabilityName;
    let capabilityId = body.capabilityId || null;
    let capabilityDoc = null;

    // Log relevant capability info for debugging
    console.log('Capability info from request:', {
      capabilityShortName,
      capabilityName,
      capabilityId
    });

    // If we have a shortName, use that first
    if (capabilityShortName) {
      console.log('Looking up capability with shortName:', capabilityShortName);
      capabilityDoc = await Capability.findOne({ 
        shortName: { $regex: new RegExp('^' + capabilityShortName + '$', 'i') } 
      });
      
      if (capabilityDoc) {
        console.log('Found capability by shortName:', capabilityDoc.shortName);
      } else {
        console.log('No capability found with shortName:', capabilityShortName);
        // Try to create a new capability with the provided information if capabilityName is available
        if (capabilityName) {
          try {
            console.log('Creating new capability with shortName:', capabilityShortName, 'and name:', capabilityName);
            capabilityDoc = await Capability.create({
              capabilityName: capabilityName,
              shortName: capabilityShortName.toUpperCase(),
              reqRunNo: 1,
              reqAsrRunNo: "1"
            });
            console.log('Created new capability:', capabilityDoc);
          } catch (createError) {
            console.error('Error creating new capability:', createError);
          }
        }
      }
    }

    // If we didn't find by shortName but have a capabilityId, try that
    if (!capabilityDoc && capabilityId) {
      // Log the capability ID for debugging
      console.log('Looking up capability with ID or name:', capabilityId);

      if (typeof capabilityId === 'string' && !mongoose.Types.ObjectId.isValid(capabilityId)) {
        // Try to find by shortName or capabilityName
        // First, convert common capability strings to their shortName equivalents
        const capabilityMapping = {
          'rheology': 'RHE',
          'microstructure': 'MIC',
          'small-molecule': 'SMO',
          'mesostructure': 'MES'
        };
        
        // Get the shortName if it's in our mapping, otherwise use the original
        const shortNameToFind = capabilityMapping[capabilityId.toLowerCase()] || capabilityId;
        
        capabilityDoc = await Capability.findOne({
          $or: [
            { shortName: shortNameToFind },
            { shortName: shortNameToFind.toUpperCase() },
            { capabilityName: capabilityId },
            { capabilityName: { $regex: new RegExp(capabilityId, 'i') } }
          ]
        });
        
        // Log the lookup result
        console.log('Capability lookup by name result:', capabilityDoc ? 'Found' : 'Not Found');
        if (capabilityDoc) {
          console.log('Found capability:', capabilityDoc.shortName, capabilityDoc.capabilityName);
        }
      } else if (mongoose.Types.ObjectId.isValid(capabilityId)) {
        // Try to find by ID
        capabilityDoc = await Capability.findById(capabilityId);
        console.log('Capability lookup by ID result:', capabilityDoc ? 'Found' : 'Not Found');
      }
    }
    
    // If capability still not found, try to create a new one with sensible defaults
    if (!capabilityDoc && capabilityShortName) {
      try {
        const shortName = capabilityShortName.toUpperCase();
        const name = capabilityName || `${shortName} Capability`;
        
        console.log('Creating capability with shortName:', shortName, 'and name:', name);
        capabilityDoc = await Capability.create({
          capabilityName: name,
          shortName: shortName,
          reqRunNo: 1,
          reqAsrRunNo: "1"
        });
        console.log('Created new capability:', capabilityDoc);
      } catch (createError) {
        console.error('Error creating new capability:', createError);
      }
    }

    // If capability not found, create a default ASR number with UNK prefix
    if (!capabilityDoc) {
      console.log('No capability found, using default UNK prefix');
      
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      const seq = 1; // Start with 1 for unknown capability
      asrNumber = `UNK-A-${mm}${yy}-${seq.toString().padStart(5, '0')}`;
    } else {
      // Use the found capability to generate ASR number
      capabilityId = capabilityDoc._id;
      
      // Check current reqAsrRunNo value and handle initialization if needed
      let currentRunNo = capabilityDoc.reqAsrRunNo;
      console.log('Current reqAsrRunNo:', currentRunNo);

      let nextRunNo;
      if (!currentRunNo || currentRunNo === '') {
        // Initialize to 1 if not set
        nextRunNo = 1;
      } else {
        // Parse and increment
        try {
          nextRunNo = parseInt(currentRunNo, 10) + 1;
          if (isNaN(nextRunNo)) {
            console.warn('Invalid reqAsrRunNo value, resetting to 1');
            nextRunNo = 1;
          }
        } catch (e) {
          console.error('Error parsing reqAsrRunNo:', e);
          nextRunNo = 1;
        }
      }
      
      // Format date components for the ASR number
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      
      // Format the sequence number with padding
      const seqPadded = nextRunNo.toString().padStart(5, '0');
      
      // Get the shortName (use uppercase for consistency)
      const shortName = capabilityDoc.shortName ? capabilityDoc.shortName.toUpperCase() : 'UNK';
      
      // Generate the ASR number with RE-A format
      asrNumber = `${shortName}-A-${mm}${yy}-${seqPadded}`;
      console.log('Generated ASR number:', asrNumber);

      // Update the reqAsrRunNo field in the capability document
      console.log('Updating reqAsrRunNo from', currentRunNo, 'to', nextRunNo);
      capabilityDoc.reqAsrRunNo = nextRunNo.toString();
      
      // Save the updated capability document
      try {
        await capabilityDoc.save();
        console.log('Successfully updated reqAsrRunNo for capability:', shortName);
      } catch (saveError) {
        console.error('Error updating reqAsrRunNo:', saveError);
        // Continue with request creation even if updating the run number fails
      }
    }



    const asrData = {
      asrNumber,
      asrName: body.asrName || body.requestTitle || 'ASR Project',
      asrType: body.asrType || 'project',
      asrStatus: 'submitted', // Changed from 'Pending Receive' to valid enum value
      asrDetail: body.asrDetail || body.testObjective || '',
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,
      asrRequireDate: body.asrRequireDate || body.desiredCompletionDate ? new Date(body.asrRequireDate || body.desiredCompletionDate) : null,
      asrMethodology: body.asrMethodology || '',
      capabilityId: capabilityDoc ? capabilityDoc._id : null,
      asrSampleList: JSON.stringify(body.asrSampleList || []),
      asrOwnerName: body.asrOwnerName || '',
      asrOwnerEmail: body.asrOwnerEmail || '',
      useIoNumber: body.useIoNumber || false,
      ioCostCenter: body.ioCostCenter || body.ioNumber || '',
      requesterCostCenter: body.requesterCostCenter || '',
      isOnBehalf: body.isOnBehalf === true || body.isOnBehalf === 'true' || false,
      onBehalfInformation: body.onBehalfInformation || {
        name: body.onBehalfOfName || '',
        email: body.onBehalfOfEmail || '',
        costCenter: body.onBehalfOfCostCenter || ''
      },
      asrPpcMemberList: JSON.stringify(body.asrPpcMemberList || []),
      // New fields from updated model
      problemSource: body.problemSource || '',
      expectedResults: body.expectedResults || '',
      businessImpact: body.businessImpact || '',
      priority: body.priority || 'normal',
      // Only set urgencyType if priority is urgent and urgencyType is provided
      ...(body.priority === 'urgent' && body.urgencyType ? { urgencyType: body.urgencyType } : {}),
      urgencyReason: body.urgencyReason || '',
      approver: body.approver || '',
      urgentMemoPath: body.urgentMemo || '',
      additionalNotes: body.additionalNotes || body.additionalRequirements || '',
      attachmentPaths: body.attachments ? body.attachments.map(file => file.name) : []
    };

    console.log('Creating ASR with data:', asrData);
    
    const newAsr = await AsrList.create(asrData);
    console.log('ASR created successfully with ID:', newAsr._id);

    return NextResponse.json({ success: true, data: { asrNumber, asrId: newAsr._id.toString() } }, { status: 201 });
  } catch (error) {
    console.error('Error submitting ASR:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation error: ' + validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An ASR with that number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit ASR' },
      { status: 500 }
    );
  }
}
