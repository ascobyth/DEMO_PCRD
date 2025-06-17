import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { mongoose } from "@/lib/db";

const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { schedules, plannedBy, plannedByEmail } = body;
    
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json(
        { success: false, error: "No schedules provided" },
        { status: 400 }
      );
    }
    
    const currentTime = new Date();
    const results = [];
    
    for (const schedule of schedules) {
      const { sampleId, startTime, endTime, clearSchedule } = schedule;
      
      if (!sampleId) {
        console.warn(`Skipping invalid schedule entry - no sampleId:`, schedule);
        continue;
      }
      
      // Check if this is a clear schedule request
      if (clearSchedule || (!startTime && !endTime)) {
        try {
          // Find the testing sample
          const sample = await TestingSampleList.findOne({ testingListId: sampleId });
          
          if (!sample) {
            console.warn(`Sample not found for clearing: ${sampleId}`);
            continue;
          }
          
          // Clear schedule data
          const updateData: any = {
            $unset: {
              plannedStartTime: "",
              plannedEndTime: "",
              actualDueDate: "",
              plannedBy: "",
              plannedByEmail: "",
              plannedAt: ""
            }
          };
          
          // Update the sample to clear schedule
          const updatedSample = await TestingSampleList.findByIdAndUpdate(
            sample._id,
            updateData,
            { new: true }
          );
          
          results.push({
            sampleId,
            success: true,
            cleared: true
          });
          
          continue; // Skip to next schedule entry
        } catch (error) {
          console.error(`Error clearing schedule for sample ${sampleId}:`, error);
          results.push({
            sampleId,
            success: false,
            error: error.message
          });
          continue;
        }
      }
      
      // Normal schedule update (not clearing)
      if (!startTime || !endTime) {
        console.warn(`Skipping invalid schedule entry - missing times:`, schedule);
        continue;
      }
      
      try {
        // Find the testing sample
        const sample = await TestingSampleList.findOne({ testingListId: sampleId });
        
        if (!sample) {
          console.warn(`Sample not found: ${sampleId}`);
          continue;
        }
        
        // Prepare update data
        const updateData: any = {
          plannedStartTime: new Date(startTime),
          plannedEndTime: new Date(endTime),
          actualDueDate: new Date(endTime), // Set actual due date to the end time
          plannedBy: plannedBy || 'System',
          plannedByEmail: plannedByEmail || '',
          plannedAt: currentTime,
        };
        
        // If this is the first time planning, set firstDueDate and firstPlannedAt
        if (!sample.firstDueDate) {
          updateData.firstDueDate = new Date(endTime);
          updateData.firstPlannedAt = currentTime;
        }
        
        // Update the sample
        const updatedSample = await TestingSampleList.findByIdAndUpdate(
          sample._id,
          { $set: updateData },
          { new: true }
        );
        
        results.push({
          sampleId,
          success: true,
          firstTime: !sample.firstDueDate
        });
      } catch (error) {
        console.error(`Error updating sample ${sampleId}:`, error);
        results.push({
          sampleId,
          success: false,
          error: error.message
        });
      }
    }
    
    // Count successes
    const successCount = results.filter(r => r.success).length;
    const firstTimeCount = results.filter(r => r.success && r.firstTime).length;
    const clearedCount = results.filter(r => r.success && r.cleared).length;
    
    // Build message
    let message = `Successfully updated ${successCount} samples`;
    const details = [];
    if (firstTimeCount > 0) {
      details.push(`${firstTimeCount} first-time planning`);
    }
    if (clearedCount > 0) {
      details.push(`${clearedCount} schedules cleared`);
    }
    if (details.length > 0) {
      message += ` (${details.join(', ')})`;
    }
    
    return NextResponse.json({
      success: true,
      message,
      results,
      totalProcessed: schedules.length,
      successCount,
      firstTimeCount,
      clearedCount
    });
    
  } catch (error) {
    console.error("Error saving schedules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save schedules" },
      { status: 500 }
    );
  }
}