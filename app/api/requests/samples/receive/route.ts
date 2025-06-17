import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { TestingSample } from "@/models";
import RequestList from "@/models/RequestList";
import TestingSampleList from "@/models/TestingSampleList";
import mongoose from "mongoose";

export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { requestId, samples, receiveAll } = body;
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required" },
        { status: 400 }
      );
    }
    
    // Find the request to update
    const requestData = await RequestList.findOne({ requestNumber: requestId });
    
    if (!requestData) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }
    
    let updatedSamples = [];
    let totalSamplesCount = 0;
    let receivedSamplesCount = 0;
    
    // Find all samples for this request to count them
    const allSamples = await TestingSampleList.find({ requestNumber: requestId });
    totalSamplesCount = allSamples.length;
    
    console.log(`Found ${totalSamplesCount} samples for request ${requestId}`);
    
    // Case 1: Receive all samples at once
    if (receiveAll) {
      // Update all samples to "Received" status
      const updateResult = await TestingSampleList.updateMany(
        { requestNumber: requestId, sampleStatus: { $ne: "Received" } },
        { 
          $set: { 
            sampleStatus: "Received",
            receiveDate: new Date(),
            receiveBy: "System", // Ideally should be from auth
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} samples to Received`);
      
      updatedSamples = await TestingSampleList.find({ 
        requestNumber: requestId, 
        sampleStatus: "Received" 
      });
      
      receivedSamplesCount = updatedSamples.length;
      
      // Update the request status to in-progress immediately
      await RequestList.findOneAndUpdate(
        { requestNumber: requestId },
        { 
          $set: { 
            requestStatus: "in-progress",
            receiveDate: new Date(),
            updatedAt: new Date()
          } 
        }
      );
    } 
    // Case 2: Receive specific samples
    else if (samples && Array.isArray(samples) && samples.length > 0) {
      console.log(`Updating ${samples.length} specific samples`);
      
      // Update only the selected samples
      const updatePromises = samples.map(sampleId => 
        TestingSampleList.findByIdAndUpdate(
          sampleId,
          {
            sampleStatus: "Received",
            receiveDate: new Date(),
            receiveBy: "System", // Ideally should be from auth
            updatedAt: new Date()
          },
          { new: true }
        )
      );
      
      updatedSamples = await Promise.all(updatePromises);
      
      // Count samples that have been received
      const receivedSamples = await TestingSampleList.find({
        requestNumber: requestId,
        sampleStatus: { $in: ["Received", "In Queue", "In Testing", "Testing Completed", "Result Analysis", "Verified"] }
      });
      
      receivedSamplesCount = receivedSamples.length;
      
      // Update the request status if all samples have been received
      if (receivedSamplesCount >= totalSamplesCount) {
        await RequestList.findOneAndUpdate(
          { requestNumber: requestId },
          { 
            $set: { 
              requestStatus: "in-progress",
              receiveDate: new Date(),
              updatedAt: new Date()
            } 
          }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "No samples specified to receive" },
        { status: 400 }
      );
    }
    
    // Status is now updated - just check if all samples have been received
    const requestStatusUpdated = receivedSamplesCount >= totalSamplesCount;
    
    return NextResponse.json({
      success: true,
      data: {
        updatedSamples,
        totalSamplesCount,
        receivedSamplesCount,
        requestStatus: requestStatusUpdated ? "in-progress" : "Pending Receive Sample",
        allSamplesReceived: receivedSamplesCount >= totalSamplesCount
      }
    });
  } catch (error) {
    console.error("Error receiving samples:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to receive samples" },
      { status: 500 }
    );
  }
}
