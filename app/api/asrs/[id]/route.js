import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models
const AsrList = mongoose.models.AsrList || require('@/models/AsrList');
const Capability = mongoose.models.Capability || require('@/models/Capability');
const User = mongoose.models.User ? mongoose.models.User : require('@/models/User').User;

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ASR ID is required' },
        { status: 400 }
      );
    }
    
    // Log the ID we're looking up for debugging
    console.log('Looking up ASR with ID:', id);
    
    // Try to find by MongoDB ID first
    let asr;
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      try {
        asr = await AsrList.findById(id);
        console.log('Search by MongoDB ID result:', asr ? 'Found' : 'Not found');
      } catch (e) {
        console.error('Error finding ASR by ID:', e);
      }
    }
    
    // If not found by ID, try to find by ASR number
    if (!asr) {
      try {
        asr = await AsrList.findOne({ asrNumber: id });
        console.log('Search by ASR number result:', asr ? 'Found' : 'Not found');
      } catch (e) {
        console.error('Error finding ASR by number:', e);
      }
    }
    
    // If still not found, try a case-insensitive search 
    if (!asr) {
      try {
        asr = await AsrList.findOne({ 
          asrNumber: { $regex: new RegExp('^' + id + '$', 'i') } 
        });
        console.log('Search by case-insensitive ASR number result:', asr ? 'Found' : 'Not found');
      } catch (e) {
        console.error('Error in case-insensitive search:', e);
      }
    }
    
    if (!asr) {
      return NextResponse.json(
        { success: false, error: 'ASR not found' },
        { status: 404 }
      );
    }
    
    // Fetch additional data
    let capabilityData = null;
    if (asr.capabilityId) {
      try {
        capabilityData = await Capability.findById(asr.capabilityId);
      } catch (e) {
        console.error('Error finding capability:', e);
      }
    }
    
    // Try to find experts for this capability
    let experts = [];
    if (capabilityData) {
      try {
        // Find users with this capability in their capabilities array
        experts = await User.find({
          capabilities: asr.capabilityId,
          role: { $in: ['EngineerResearcher', 'SeniorEngineerSeniorResearcher'] }
        })
        .select('name email position department')
        .limit(3);
      } catch (e) {
        console.error('Error finding experts:', e);
      }
    }
    
    // Parse the sample list from JSON string
    let samples = [];
    try {
      if (asr.asrSampleList) {
        samples = JSON.parse(asr.asrSampleList);
      }
    } catch (e) {
      console.error('Error parsing sample list:', e);
    }
    
    // Format the response - Include all fields for the view/edit dialog
    const response = {
      asrId: asr._id.toString(),
      asrNumber: asr.asrNumber,
      asrName: asr.asrName,
      asrType: asr.asrType,
      asrStatus: asr.asrStatus,
      asrDetail: asr.asrDetail,
      requesterName: asr.requesterName,
      requesterEmail: asr.requesterEmail,
      requesterCostCenter: asr.requesterCostCenter,
      submissionDate: asr.createdAt,
      asrRequireDate: asr.asrRequireDate,
      capability: capabilityData ? {
        id: capabilityData._id.toString(),
        name: capabilityData.capabilityName,
        shortName: capabilityData.shortName
      } : null,
      capabilityId: asr.capabilityId,
      samples,
      experts: experts.map(expert => ({
        name: expert.name,
        email: expert.email,
        position: expert.position || 'Researcher',
        department: expert.department || 'PCRD'
      })),
      // Include all fields that can be edited
      priority: asr.priority || 'normal',
      useIoNumber: asr.useIoNumber,
      ioCostCenter: asr.ioCostCenter,
      problemSource: asr.problemSource,
      expectedResults: asr.expectedResults,
      businessImpact: asr.businessImpact,
      urgencyType: asr.urgencyType,
      urgencyReason: asr.urgencyReason,
      approver: asr.approver,
      additionalNotes: asr.additionalNotes,
      // Management fields
      asrMethodology: asr.asrMethodology,
      asrOwnerName: asr.asrOwnerName,
      asrOwnerEmail: asr.asrOwnerEmail,
      asrPpcMemberList: asr.asrPpcMemberList,
      asrLink: asr.asrLink,
      // Timeline fields
      asrEstCompletedDate: asr.asrEstCompletedDate,
      sampleReceiveDate: asr.sampleReceiveDate,
      approveDate: asr.approveDate,
      completedDate: asr.completedDate,
      addMemberDate: asr.addMemberDate
    };
    
    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving ASR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve ASR details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();
    
    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ASR ID is required' },
        { status: 400 }
      );
    }
    
    // Find the ASR
    let asr;
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      asr = await AsrList.findById(id);
    }
    
    if (!asr) {
      asr = await AsrList.findOne({ asrNumber: id });
    }
    
    if (!asr) {
      return NextResponse.json(
        { success: false, error: 'ASR not found' },
        { status: 404 }
      );
    }
    
    // Update only the fields that are provided and are editable
    // Removed: asrOwnerName, asrOwnerEmail, asrStatus (now read-only)
    const editableFields = [
      'asrMethodology',
      'asrEstCompletedDate',
      'asrLink',
      'asrPpcMemberList',
      'completedDate',
      'approveDate',
      'sampleReceiveDate',
      'addMemberDate'
    ];
    
    const updateData = {};
    editableFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });
    
    // Update the ASR
    const updatedAsr = await AsrList.findByIdAndUpdate(
      asr._id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: updatedAsr,
      message: 'ASR updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating ASR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ASR' },
      { status: 500 }
    );
  }
}
