import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
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
    
    // Find all testing samples for this request
    const testingSamples = await TestingSampleList.find({ requestNumber: requestId })
      .sort({ createdAt: 1 })
      .lean();
    
    if (!testingSamples || testingSamples.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Group samples by method to avoid duplicates
    const methodsMap = new Map();
    
    testingSamples.forEach(sample => {
      if (!sample.methodId || !sample.methodCode) return;
      
      const methodId = sample.methodId.toString();
      
      if (!methodsMap.has(methodId)) {
        methodsMap.set(methodId, {
          id: methodId,
          methodCode: sample.methodCode,
          name: sample.methodName || sample.methodCode,
          capability: sample.capabilityName || "Unknown",
          capabilityId: sample.capabilityId ? sample.capabilityId.toString() : null,
          equipment: sample.equipmentName || "Not specified",
          equipmentId: sample.equipmentId ? sample.equipmentId.toString() : null,
          status: sample.sampleStatus || "Pending",
          samples: []
        });
      }
      
      // Add sample to the method's samples array if not already included
      const method = methodsMap.get(methodId);
      if (!method.samples.includes(sample.sampleId)) {
        method.samples.push(sample.sampleId);
      }
    });
    
    // Convert map to array
    const methods = Array.from(methodsMap.values());
    
    console.log(`Found ${methods.length} unique testing methods for request ${requestId}`);
    
    return NextResponse.json({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error("Error fetching testing methods:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testing methods" },
      { status: 500 }
    );
  }
}
