import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { TestingSample } from "@/models";
import TestingSampleList from "@/models/TestingSampleList";

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required" },
        { status: 400 }
      );
    }
    
    // Find all samples for this request from TestingSampleList
    const samples = await TestingSampleList.find({ requestNumber: requestId })
      .sort({ createdAt: 1 })
      .lean();
    
    if (!samples || samples.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Transform the data to the expected format
    const formattedSamples = samples.map(sample => ({
      id: sample._id.toString(),
      sampleId: sample.sampleId || sample.testingListId || "Unknown ID",
      name: sample.sampleName || "Unknown Sample",
      status: sample.sampleStatus || "Pending Receive",
      description: sample.remark || sample.testingRemark || "",
      receivedDate: sample.receiveDate ? new Date(sample.receiveDate).toLocaleDateString() : "",
      testingStartDate: sample.operationCompleteDate ? new Date(sample.operationCompleteDate).toLocaleDateString() : "",
      testingCompletedDate: sample.requestCompleteDate ? new Date(sample.requestCompleteDate).toLocaleDateString() : "",
      assignedTo: sample.receiveBy || "Unassigned",
      testMethod: sample.methodCode || "Not specified",
      request_number: sample.requestNumber
    }));
    
    console.log(`Found ${formattedSamples.length} samples for request ${requestId}`);
    
    return NextResponse.json({
      success: true,
      data: formattedSamples
    });
  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch samples" },
      { status: 500 }
    );
  }
}

// Update a sample status
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { sampleId, status, note } = body;
    
    if (!sampleId || !status) {
      return NextResponse.json(
        { success: false, error: "Sample ID and status are required" },
        { status: 400 }
      );
    }
    
    // Find the sample in TestingSampleList
    const sample = await TestingSampleList.findById(sampleId);
    
    if (!sample) {
      return NextResponse.json(
        { success: false, error: "Sample not found" },
        { status: 404 }
      );
    }
    
    // Update status fields based on new status
    const statusUpdate = {
      sampleStatus: status,
      ...(note && { remark: note }),
      updatedAt: new Date()
    };
    
    // Update date fields based on status
    if (status === "Received") {
      statusUpdate.receiveDate = new Date();
      statusUpdate.receiveBy = "System"; // Ideally should come from authenticated user
    } else if (status === "In Testing") {
      statusUpdate.operationCompleteDate = new Date();
      statusUpdate.operationCompleteBy = "System";
    } else if (status === "Testing Completed") {
      statusUpdate.entryResultDate = new Date();
      statusUpdate.entryResultBy = "System";
    } else if (status === "Verified") {
      statusUpdate.requestCompleteDate = new Date();
      statusUpdate.requestCompleteBy = "System";
    }
    
    const updatedSample = await TestingSampleList.findByIdAndUpdate(
      sampleId,
      { $set: statusUpdate },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedSample
    });
  } catch (error) {
    console.error("Error updating sample:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update sample" },
      { status: 500 }
    );
  }
}

