import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { TestingSampleList } from "@/models";

// GET endpoint to check if all samples for a request are received
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const requestNumber = searchParams.get("requestNumber");
    
    if (!requestNumber) {
      return NextResponse.json(
        { success: false, error: "Request number is required" },
        { status: 400 }
      );
    }
    
    // Get all samples for this request
    const allSamples = await TestingSampleList.find({ requestNumber });
    
    if (allSamples.length === 0) {
      return NextResponse.json({
        success: true,
        allReceived: false,
        totalSamples: 0,
        receivedSamples: 0,
        message: "No samples found for this request"
      });
    }
    
    // Check if all samples are received (not in "Pending Receive" or "submitted" status)
    const receivedSamples = allSamples.filter(
      sample => sample.sampleStatus !== "Pending Receive" && sample.sampleStatus !== "submitted"
    );
    
    const allReceived = receivedSamples.length === allSamples.length;
    
    return NextResponse.json({
      success: true,
      allReceived,
      totalSamples: allSamples.length,
      receivedSamples: receivedSamples.length,
      pendingSamples: allSamples.length - receivedSamples.length
    });
  } catch (error) {
    console.error("Error checking sample status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check sample status" },
      { status: 500 }
    );
  }
}