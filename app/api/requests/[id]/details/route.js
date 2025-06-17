import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import RequestList from "@/models/RequestList"
import TestingSampleList from "@/models/TestingSampleList"

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Find the request by requestNumber
    const requestData = await RequestList.findOne({ requestNumber: id })
    
    if (!requestData) {
      return NextResponse.json({
        success: false,
        error: "Request not found"
      }, { status: 404 })
    }
    
    // Find all samples for this request
    const samples = await TestingSampleList.find({ 
      requestId: requestData._id 
    }).populate([
      'equipmentId',
      'methodId',
      'capabilityId'
    ])
    
    // Transform the data for the frontend
    const responseData = {
      _id: requestData._id,
      requestNumber: requestData.requestNumber,
      requestTitle: requestData.requestTitle,
      requestStatus: requestData.requestStatus,
      priority: requestData.priority,
      useIoNumber: requestData.useIoNumber,
      ioNumber: requestData.ioNumber,
      ioCostCenter: requestData.ioCostCenter,
      requesterCostCenter: requestData.requesterCostCenter,
      requesterEmail: requestData.requesterEmail,
      jsonSampleList: requestData.jsonSampleList,
      jsonTestingList: requestData.jsonTestingList,
      createdAt: requestData.createdAt,
      updatedAt: requestData.updatedAt,
      samples: samples.map(sample => ({
        _id: sample._id,
        testingListId: sample.testingListId,
        sampleId: sample.sampleId,
        sampleName: sample.sampleName,
        sampleDescription: sample.sampleDescription,
        sampleQuantity: sample.sampleQuantity,
        sampleStatus: sample.sampleStatus,
        equipmentId: sample.equipmentId,
        methodId: sample.methodId,
        capabilityId: sample.capabilityId,
        targetCompletion: sample.targetCompletion,
        testingProgress: sample.testingProgress
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    console.error("API Error - Get request details:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch request details"
    }, { status: 500 })
  }
}