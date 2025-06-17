import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { TestingSampleList } from "@/models";
import { mongoose } from "@/lib/db";
const Capability = require("@/models/Capability");

// GET endpoint to retrieve all testing samples with filters
export async function GET(request: Request) {
  try {
    // Try to connect to database, but handle connection failures gracefully
    try {
      await dbConnect();
    } catch (dbError) {
      console.warn('Database connection failed:', dbError.message);
      // Return empty array when database is not accessible
      return NextResponse.json({ 
        success: true, 
        data: [],
        total: 0,
        message: 'Database not accessible, returning empty data'
      }, { status: 200 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const capability = searchParams.get("capability");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const requestNumber = searchParams.get("requestNumber");
    
    // If requesting specific request's samples (from dialog), get all samples without pagination
    const actualLimit = requestNumber ? 1000 : limit;
    const skip = requestNumber ? 0 : (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Request number filter - if specified, only return samples for this request
    if (requestNumber) {
      filter.requestNumber = requestNumber;
    }
    
    // Status filter
    if (status && status !== "all") {
      // Map frontend status values to database status values
      let dbStatus = status;
      if (status === "pending receive sample") {
        dbStatus = "Pending Receive";
      } else if (status === "in-progress") {
        dbStatus = "in-progress";
      } else if (status === "completed") {
        dbStatus = "completed";
      } else if (status === "rejected") {
        dbStatus = "rejected";
      } else if (status === "terminated") {
        dbStatus = "terminated";
      }
      filter.sampleStatus = dbStatus;
    }
    
    // Capability filter
    if (capability && capability !== "all") {
      // Check if it's a predefined category ID
      const predefinedCategories: { [key: string]: string } = {
        "rheology": "Rheology",
        "microstructure": "Microstructure", 
        "smallmolecule": "Small Molecule",
        "mesostructure": "Mesostructure & Imaging"
      };
      
      if (predefinedCategories[capability]) {
        filter.capabilityName = predefinedCategories[capability];
      } else {
        // Try to find the capability by MongoDB ObjectId
        try {
          const capabilityDoc = await Capability.findById(capability);
          if (capabilityDoc) {
            filter.capabilityName = capabilityDoc.capabilityName;
          }
        } catch (e) {
          // Invalid ObjectId, try to match by name
          filter.capabilityName = capability;
        }
      }
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { requestNumber: { $regex: search, $options: 'i' } },
        { sampleId: { $regex: search, $options: 'i' } },
        { sampleName: { $regex: search, $options: 'i' } },
        { methodCode: { $regex: search, $options: 'i' } },
        { equipmentName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch testing samples
    const testingSamples = await TestingSampleList.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(actualLimit)
      .lean();
      
    // Get total count for pagination
    const totalCount = await TestingSampleList.countDocuments(filter);
    
    // Get unique request numbers
    const uniqueRequestNumbers = [...new Set(testingSamples.map(sample => sample.requestNumber))];
    
    // Fetch request details for requester names
    const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
    const requests = await RequestList.find({ 
      requestNumber: { $in: uniqueRequestNumbers } 
    }).select('requestNumber requesterName requestType').lean();
    
    // Create a map for easy lookup
    const requestMap = new Map(requests.map(req => [req.requestNumber, req]));
    
    // Transform the data to match the expected format
    const transformedSamples = testingSamples.map(sample => {
      const requestInfo = requestMap.get(sample.requestNumber);
      return {
        testingListId: sample.testingListId,
        requestNumber: sample.requestNumber,
        requestType: requestInfo?.requestType || 'NTR',
        requesterName: requestInfo?.requesterName || 'Unknown',
        sampleId: sample.sampleId,
        sampleName: sample.sampleName,
        fullSampleName: sample.fullSampleName, // Add fullSampleName for repeat information
        remark: sample.remark,
        methodCode: sample.methodCode,
        testingRemark: sample.testingRemark, // Add testingRemark for additional requirements
        equipmentName: sample.equipmentName,
        capabilityName: sample.capabilityName,
        priority: sample.priority || 'normal', // Add priority field
        sampleStatus: sample.sampleStatus,
      receiveDate: sample.receiveDate,
      dueDate: sample.dueDate,
      submitDate: sample.submitDate,
      testingCost: sample.testingCost,
      receiveBy: sample.receiveBy,
      operationCompleteBy: sample.operationCompleteBy,
      entryResultBy: sample.entryResultBy,
      operationCompleteDate: sample.operationCompleteDate,
      entryResultDate: sample.entryResultDate,
      createdAt: sample.createdAt,
      updatedAt: sample.updatedAt,
      attachedFiles: sample.attachedFiles || [], // Include attachedFiles array
      // Legacy fields for backward compatibility
      attachedFileName: sample.attachedFileName,
      attachedFileId: sample.attachedFileId,
      attachedFilePath: sample.attachedFilePath,
      attachedFileSize: sample.attachedFileSize,
      attachedFileType: sample.attachedFileType,
      attachedFileDate: sample.attachedFileDate,
      // Planning fields
      firstDueDate: sample.firstDueDate,
      actualDueDate: sample.actualDueDate,
      plannedStartTime: sample.plannedStartTime,
      plannedEndTime: sample.plannedEndTime,
      plannedBy: sample.plannedBy,
      plannedByEmail: sample.plannedByEmail,
      plannedAt: sample.plannedAt,
      firstPlannedAt: sample.firstPlannedAt
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedSamples,
      pagination: {
        total: totalCount,
        page,
        limit: actualLimit,
        pages: Math.ceil(totalCount / actualLimit),
      }
    });
  } catch (error) {
    console.error("Error fetching testing samples:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testing samples" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a testing sample's status
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { testingListId, status, note, receiveDate, operationCompleteDate, operationCompleteBy, entryResultDate, entryResultBy } = body;
    
    if (!testingListId || !status) {
      return NextResponse.json(
        { success: false, error: "Testing list ID and status are required" },
        { status: 400 }
      );
    }
    
    // Map frontend status to database status
    let dbStatus = status;
    if (status === "pending receive sample") {
      dbStatus = "Pending Receive";
    } else if (status === "in-progress") {
      dbStatus = "in-progress";
    } else if (status === "Pending Entry Results") {
      dbStatus = "Pending Entry Results";
    } else if (status === "completed") {
      dbStatus = "completed";
    } else if (status === "rejected") {
      dbStatus = "rejected";
    } else if (status === "terminated") {
      dbStatus = "terminated";
    }

    const updateData: any = {
      sampleStatus: dbStatus,
      ...(note && { testingRemark: note }),
      updatedAt: new Date()
    };
    
    // If receiving the sample, update the receive date
    if (receiveDate && dbStatus === "in-progress") {
      updateData.receiveDate = new Date(receiveDate);
      updateData.receiveBy = "Current User"; // In a real app, get from auth context
    }
    
    // If completing operation, update operation complete date and user
    if (operationCompleteDate && dbStatus === "Pending Entry Results") {
      updateData.operationCompleteDate = new Date(operationCompleteDate);
      updateData.operationCompleteBy = operationCompleteBy || "Current User";
    }
    
    // If entering results, update entry result date and user
    if (entryResultDate && dbStatus === "completed") {
      updateData.entryResultDate = new Date(entryResultDate);
      updateData.entryResultBy = entryResultBy || "Current User";
    }

    const updatedSample = await TestingSampleList.findOneAndUpdate(
      { testingListId },
      updateData,
      { new: true }
    );
    
    if (!updatedSample) {
      return NextResponse.json(
        { success: false, error: "Testing sample not found" },
        { status: 404 }
      );
    }
    
    // Check if all samples for this request are now in-progress or beyond
    const requestNumber = updatedSample.requestNumber;
    const allSamples = await TestingSampleList.find({ requestNumber });
    const allReceived = allSamples.every(
      sample => sample.sampleStatus !== "Pending Receive" && sample.sampleStatus !== "submitted"
    );
    
    if (allReceived && dbStatus === "in-progress") {
      // Import RequestList model
      const { RequestList } = require("@/models");
      
      // Update the request status to in-progress
      await RequestList.findOneAndUpdate(
        { requestNumber },
        { 
          requestStatus: "in-progress",
          updatedAt: new Date()
        }
      );
      
      console.log(`All samples received for request ${requestNumber}, updated request status to in-progress`);
    }
    
    return NextResponse.json({
      success: true,
      data: updatedSample,
      allReceived
    });
  } catch (error) {
    console.error("Error updating testing sample:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testing sample" },
      { status: 500 }
    );
  }
}