import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
const { RequestList, ErList, TestingSample, TestingSampleList, Capability, AsrList, Notification } = require("@/models");

// GET endpoint to retrieve all requests with filters
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const capability = searchParams.get("capability");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    if (status && status !== "all") {
      // Map frontend status values to database status values
      let dbStatus = status;
      if (status === "pending receive sample") {
        dbStatus = "Pending Receive";
      } else if (status === "in-progress") {
        dbStatus = "in-progress";
      } else if (status === "completed") {
        dbStatus = "Completed";
      } else if (status === "rejected") {
        dbStatus = "Rejected";
      } else if (status === "terminated") {
        dbStatus = "terminated";
      }
      filter.requestStatus = dbStatus;
    }
    
    if (priority && priority !== "all") {
      filter.priority = priority;
    }
    
    // Note: Type filtering is handled by collection selection logic, not by database field
    // RequestList = NTR, AsrList = ASR, ErList = ER
    
    // Prepare search and capability filters separately to avoid conflicts
    const searchFilters = [];
    const capabilityFilters = [];
    
    // Handle search filter
    if (search) {
      searchFilters.push(
        { requestTitle: { $regex: search, $options: 'i' } },
        { requesterName: { $regex: search, $options: 'i' } },
        { requestNumber: { $regex: search, $options: 'i' } }
      );
    }
    
    // Handle capability filter
    if (capability && capability !== "all") {
      // Check if it's a predefined category ID (like "rheology", "microstructure")
      const predefinedCategories = {
        "rheology": "Rheology",
        "microstructure": "Microstructure", 
        "smallmolecule": "Small Molecule",
        "mesostructure": "Mesostructure & Imaging"
      };
      
      if (predefinedCategories[capability]) {
        // Filter by predefined category name
        const capabilityName = predefinedCategories[capability];
        capabilityFilters.push({ jsonTestingList: { $regex: `"capabilityName":"${capabilityName}"`, $options: 'i' } });
      } else {
        // Try to find the capability by MongoDB ObjectId
        try {
          const capabilityDoc = await Capability.findById(capability);
          if (capabilityDoc) {
            capabilityFilters.push(
              { jsonTestingList: { $regex: `"capabilityId":"${capability}"`, $options: 'i' } },
              { jsonTestingList: { $regex: `"capabilityName":"${capabilityDoc.capabilityName}"`, $options: 'i' } }
            );
          } else {
            // If not found by ID, try to match by name
            capabilityFilters.push({ jsonTestingList: { $regex: `"capabilityName":"${capability}"`, $options: 'i' } });
          }
        } catch (e) {
          // Invalid ObjectId, try to match by name
          capabilityFilters.push({ jsonTestingList: { $regex: `"capabilityName":"${capability}"`, $options: 'i' } });
        }
      }
    }
    
    // Combine search and capability filters
    if (searchFilters.length > 0 && capabilityFilters.length > 0) {
      // Both search and capability filters are active - need to combine them properly
      filter.$and = [
        { $or: searchFilters },
        { $or: capabilityFilters }
      ];
    } else if (searchFilters.length > 0) {
      // Only search filter is active
      filter.$or = searchFilters;
    } else if (capabilityFilters.length > 0) {
      // Only capability filter is active
      filter.$or = capabilityFilters;
    }
    
    // Fetch data from the appropriate collections based on request type
    let regularRequests = [];
    let asrRequests = [];
    let erRequests = [];
    
    // If type is "all" or "ntr", fetch from RequestList
    if (type === "all" || type === "ntr") {
      const regularFilter = { ...filter };
      
      regularRequests = await RequestList.find(regularFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      // Transform the data to match the expected format
      regularRequests = await Promise.all(regularRequests.map(async (req) => {
        // Parse capability from jsonTestingList
        let capability = "Unknown";
        try {
          if (req.jsonTestingList) {
            const testingList = JSON.parse(req.jsonTestingList);
            if (testingList && testingList.length > 0) {
              capability = testingList[0].capabilityName || "Unknown";
            }
          }
        } catch (e) {
          console.error("Error parsing jsonTestingList:", e);
        }

        // Map database status to frontend expected values
        let frontendStatus = req.requestStatus || "pending";
        if (req.requestStatus === "Pending Receive") {
          frontendStatus = "pending receive sample";
        } else if (req.requestStatus === "in-progress") {
          frontendStatus = "in-progress";
        } else if (req.requestStatus === "Completed") {
          frontendStatus = "completed";
        } else if (req.requestStatus === "Rejected") {
          frontendStatus = "rejected";
        } else if (req.requestStatus === "terminated") {
          frontendStatus = "terminated";
        }

        // Calculate progress based on testing samples
        let progress = 0;
        try {
          // Fetch testing samples for this request
          const testingSamples = await TestingSampleList.find({ 
            requestNumber: req.requestNumber 
          }).lean();

          if (testingSamples && testingSamples.length > 0) {
            // Filter out rejected and terminated samples
            const validSamples = testingSamples.filter(sample => 
              sample.sampleStatus !== 'Rejected' && 
              sample.sampleStatus !== 'terminated'
            );

            if (validSamples.length > 0) {
              // Count completed samples
              const completedSamples = validSamples.filter(sample => 
                sample.sampleStatus === 'completed' || 
                sample.sampleStatus === 'Completed'
              );

              // Calculate percentage
              progress = Math.round((completedSamples.length / validSamples.length) * 100);
            }
          }
        } catch (e) {
          console.error("Error calculating progress for request:", req.requestNumber, e);
        }

        return {
          id: req.requestNumber,
          title: req.requestTitle || "Untitled Request",
          type: "NTR", // All requests in request_lists are NTR requests
          capability: capability,
          status: frontendStatus,
          priority: req.priority || "medium",
          requester: req.requesterName || "Unknown",
          requestDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Unknown",
          dueDate: req.due_date ? new Date(req.due_date).toLocaleDateString() : "",
          assignedTo: req.assigned_to || "Unassigned",
          progress: progress,
          samples: req.sample_count || 0,
          department: req.department || "Unknown",
          description: req.description || "No description",
        };
      }));
    }
    
    // If type is "all" or "asr", fetch from AsrList
    if (type === "all" || type === "asr") {
      // Build ASR-specific filter
      const asrFilter: any = {};
      
      // Handle status filter for ASR
      if (status && status !== "all") {
        let dbStatus = status;
        if (status === "pending receive sample") {
          dbStatus = "submitted"; // ASR uses "submitted" instead of "Pending Receive"
        } else if (status === "in-progress") {
          dbStatus = "in-progress";
        } else if (status === "completed") {
          dbStatus = "completed";
        } else if (status === "rejected") {
          dbStatus = "rejected";
        } else if (status === "terminated") {
          dbStatus = "terminated";
        }
        asrFilter.asrStatus = dbStatus;
      }
      
      // Handle priority filter for ASR (if it exists)
      if (priority && priority !== "all") {
        asrFilter.priority = priority;
      }
      
      // Handle capability filter for ASR
      if (capability && capability !== "all") {
        const predefinedCategories = {
          "rheology": "Rheology",
          "microstructure": "Microstructure", 
          "smallmolecule": "Small Molecule",
          "mesostructure": "Mesostructure & Imaging"
        };
        
        if (predefinedCategories[capability]) {
          // Find capability by name and use its ObjectId
          const capabilityDoc = await Capability.findOne({ capabilityName: predefinedCategories[capability] });
          if (capabilityDoc) {
            asrFilter.capabilityId = capabilityDoc._id;
          }
        } else {
          // Try to use capability directly as ObjectId
          try {
            asrFilter.capabilityId = capability;
          } catch (e) {
            // Invalid ObjectId, skip this filter
          }
        }
      }
      
      // Handle search filter for ASR
      if (search) {
        asrFilter.$or = [
          { asrName: { $regex: search, $options: 'i' } },
          { requesterName: { $regex: search, $options: 'i' } },
          { asrNumber: { $regex: search, $options: 'i' } },
        ];
      }
      
      asrRequests = await AsrList.find(asrFilter)
        .populate('capabilityId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      // Transform ASR data to match the expected format
      asrRequests = asrRequests.map(req => {
        // Map ASR status to frontend expected values
        let frontendStatus = req.asrStatus || "pending";
        if (req.asrStatus === "submitted") {
          frontendStatus = "pending receive sample";
        } else if (req.asrStatus === "in-progress") {
          frontendStatus = "in-progress";
        } else if (req.asrStatus === "completed") {
          frontendStatus = "completed";
        } else if (req.asrStatus === "rejected") {
          frontendStatus = "rejected";
        } else if (req.asrStatus === "terminated") {
          frontendStatus = "terminated";
        }

        return {
          id: req.asrNumber,
          title: req.asrName || "Untitled ASR",
          type: "ASR",
          capability: req.capabilityId?.capabilityName || req.capabilityId?.name || "Unknown", // Default for null capability
          status: frontendStatus,
          priority: req.priority || "normal",
          requester: req.requesterName || "Unknown",
          requestDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Unknown",
          dueDate: req.asrRequireDate ? new Date(req.asrRequireDate).toLocaleDateString() : "",
          assignedTo: req.asrOwnerName || "Unassigned",
          progress: frontendStatus === "completed" ? 100 : frontendStatus === "in-progress" ? 50 : 10,
          samples: 0, // ASR doesn't track individual samples the same way
          department: req.requesterCostCenter || "Unknown",
          description: req.asrDetail || "No description",
        };
      });
    }
    
    // If type is "all" or "er", fetch from ErList
    if (type === "all" || type === "er") {
      // Create a specific filter for ER requests, excluding the type field
      const erFilter: any = {};
      
      // Copy relevant filters, excluding type since ErList doesn't have a type field
      if (status && status !== "all") {
        let dbStatus = status;
        if (status === "pending receive sample") {
          dbStatus = "submitted";
        } else if (status === "in-progress") {
          dbStatus = "in-progress";
        } else if (status === "completed") {
          dbStatus = "completed";
        } else if (status === "rejected") {
          dbStatus = "rejected";
        } else if (status === "terminated") {
          dbStatus = "terminated";
        }
        erFilter.requestStatus = dbStatus;
      }
      
      if (priority && priority !== "all") {
        erFilter.priority = priority;
      }
      
      // Add search filters for ER
      if (search) {
        erFilter.$or = [
          { requestTitle: { $regex: search, $options: 'i' } },
          { requesterName: { $regex: search, $options: 'i' } },
          { requestNumber: { $regex: search, $options: 'i' } }
        ];
      }
      
      erRequests = await ErList.find(erFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      // Transform the data to match the expected format
      erRequests = erRequests.map(req => {
        // Map database status to frontend expected values for ER
        let frontendStatus = req.requestStatus || "pending";
        if (req.requestStatus === "submitted") {
          frontendStatus = "pending receive sample";
        } else if (req.requestStatus === "in-progress") {
          frontendStatus = "in-progress";
        } else if (req.requestStatus === "completed") {
          frontendStatus = "completed";
        } else if (req.requestStatus === "rejected") {
          frontendStatus = "rejected";
        } else if (req.requestStatus === "terminated") {
          frontendStatus = "terminated";
        }

        // Parse equipment list to get equipment names
        let equipmentName = "Unknown Equipment";
        let capability = "Unknown";
        try {
          if (req.jsonEquipmentList) {
            const equipmentList = JSON.parse(req.jsonEquipmentList);
            if (equipmentList && equipmentList.length > 0) {
              equipmentName = equipmentList.map(eq => eq.equipmentName).join(", ");
              // Try to get capability from first equipment
              if (equipmentList[0].capability) {
                capability = equipmentList[0].capability;
              }
            }
          }
        } catch (e) {
          console.error("Error parsing jsonEquipmentList:", e);
        }

        return {
          id: req.requestNumber,
          title: req.requestTitle || `${equipmentName} Reservation`,
          type: "ER",
          capability: capability,
          status: frontendStatus,
          priority: req.priority || "normal",
          requester: req.requesterName || "Unknown",
          requestDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Unknown",
          dueDate: req.reservationStartDate ? new Date(req.reservationStartDate).toLocaleDateString() : "",
          assignedTo: req.supportStaff || "Unassigned",
          progress: frontendStatus === "completed" ? 100 : frontendStatus === "in-progress" ? 50 : 0,
          samples: 0, // ER requests don't have samples
          department: req.requesterCostCenter || "Unknown",
          description: req.notes || "No description",
          equipment: equipmentName,
        };
      });
    }
    
    // Combine and sort the results
    const combinedRequests = [...regularRequests, ...asrRequests, ...erRequests]
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    
    // Get total count for pagination (using filtered data)
    let totalRegularCount = 0;
    let totalAsrCount = 0;
    let totalErCount = 0;
    
    if (type === "all" || type === "ntr") {
      // Create proper filter for RequestList (excluding type field)
      const regularFilter: any = {};
      if (status && status !== "all") {
        let dbStatus = status;
        if (status === "pending receive sample") {
          dbStatus = "Pending Receive";
        } else if (status === "in-progress") {
          dbStatus = "in-progress";
        } else if (status === "completed") {
          dbStatus = "Completed";
        } else if (status === "rejected") {
          dbStatus = "Rejected";
        } else if (status === "terminated") {
          dbStatus = "terminated";
        }
        regularFilter.requestStatus = dbStatus;
      }
      if (priority && priority !== "all") {
        regularFilter.priority = priority;
      }
      totalRegularCount = await RequestList.countDocuments(regularFilter);
    }
    
    if (type === "all" || type === "asr") {
      // Create proper filter for AsrList
      const asrCountFilter: any = {};
      if (status && status !== "all") {
        let dbStatus = status;
        if (status === "pending receive sample") {
          dbStatus = "submitted";
        } else if (status === "in-progress") {
          dbStatus = "in-progress";
        } else if (status === "completed") {
          dbStatus = "completed";
        } else if (status === "rejected") {
          dbStatus = "rejected";
        } else if (status === "terminated") {
          dbStatus = "terminated";
        }
        asrCountFilter.asrStatus = dbStatus;
      }
      if (priority && priority !== "all") {
        asrCountFilter.priority = priority;
      }
      totalAsrCount = await AsrList.countDocuments(asrCountFilter);
    }
    
    if (type === "all" || type === "er") {
      // Create proper filter for ErList
      const erCountFilter: any = {};
      if (status && status !== "all") {
        let dbStatus = status;
        if (status === "pending receive sample") {
          dbStatus = "submitted";
        } else if (status === "in-progress") {
          dbStatus = "in-progress";
        } else if (status === "completed") {
          dbStatus = "completed";
        } else if (status === "rejected") {
          dbStatus = "rejected";
        } else if (status === "terminated") {
          dbStatus = "terminated";
        }
        erCountFilter.requestStatus = dbStatus;
      }
      if (priority && priority !== "all") {
        erCountFilter.priority = priority;
      }
      totalErCount = await ErList.countDocuments(erCountFilter);
    }
    
    const totalCount = totalRegularCount + totalAsrCount + totalErCount;
    
    // Get GRAND total count for "All Capabilities" (without any filters, always include all types)
    const grandTotalRegular = await RequestList.countDocuments({});
    const grandTotalAsr = await AsrList.countDocuments({});
    const grandTotalEr = await ErList.countDocuments({});
    const grandTotal = grandTotalRegular + grandTotalAsr + grandTotalEr;
    
    // Fetch all capabilities for the filter sidebar
    const capabilities = await Capability.find({}).lean();
    
    // Calculate capability counts - aggregate by capability name
    let capabilityCounts = {};
    
    // Count capabilities from regular requests (NTR)
    if (type === "all" || type === "ntr") {
      const allRequests = await RequestList.find({}).lean();
      
      allRequests.forEach(req => {
        try {
          if (req.jsonTestingList) {
            const testingList = JSON.parse(req.jsonTestingList);
            if (testingList && testingList.length > 0) {
              const capName = testingList[0].capabilityName;
              if (capName) {
                capabilityCounts[capName] = (capabilityCounts[capName] || 0) + 1;
              }
            }
          }
        } catch (e) {
          // Skip malformed JSON
        }
      });
    }
    
    // Count capabilities from ASR requests
    if (type === "all" || type === "asr") {
      const allAsrRequests = await AsrList.find({}).populate('capabilityId').lean();
      
      allAsrRequests.forEach(req => {
        if (req.capabilityId && req.capabilityId.capabilityName) {
          const capName = req.capabilityId.capabilityName;
          capabilityCounts[capName] = (capabilityCounts[capName] || 0) + 1;
        } else {
          // Handle ASR requests without capability (default to Unknown)
          const capName = "Unknown";
          capabilityCounts[capName] = (capabilityCounts[capName] || 0) + 1;
        }
      });
    }
    
    // Count capabilities from ER requests
    if (type === "all" || type === "er") {
      const allErRequests = await ErList.find({}).lean();
      
      allErRequests.forEach(req => {
        try {
          if (req.jsonEquipmentList) {
            const equipmentList = JSON.parse(req.jsonEquipmentList);
            if (equipmentList && equipmentList.length > 0) {
              // Try to get capability from first equipment
              const capName = equipmentList[0].capability || "Unknown";
              capabilityCounts[capName] = (capabilityCounts[capName] || 0) + 1;
            } else {
              capabilityCounts["Unknown"] = (capabilityCounts["Unknown"] || 0) + 1;
            }
          } else {
            capabilityCounts["Unknown"] = (capabilityCounts["Unknown"] || 0) + 1;
          }
        } catch (e) {
          capabilityCounts["Unknown"] = (capabilityCounts["Unknown"] || 0) + 1;
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: combinedRequests,
      capabilities: capabilities.map(cap => ({
        id: cap._id.toString(),
        name: cap.capabilityName,
        shortName: cap.shortName,
        description: cap.capabilityDesc
      })),
      capabilityCounts,
      grandTotal: grandTotal, // Add grand total for "All Capabilities"
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a request's status
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, status, note } = body;
    
    console.log("PATCH request received:", { id, status, note });
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Request ID and status are required" },
        { status: 400 }
      );
    }
    
    // Map frontend status to database status
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

    // Determine if it's an ER request or regular request
    const isErRequest = id.includes("-ER-");
    
    console.log("Request type:", isErRequest ? "ER" : "Regular", "Request ID:", id, "DB Status:", dbStatus);
    
    let updatedRequest;
    
    if (isErRequest) {
      console.log("Updating ER request with requestNumber:", id);
      updatedRequest = await ErList.findOneAndUpdate(
        { requestNumber: id },
        { 
          requestStatus: dbStatus,
          ...(note && { note })
        },
        { new: true }
      );
    } else {
      console.log("Updating regular request with requestNumber:", id);
      updatedRequest = await RequestList.findOneAndUpdate(
        { requestNumber: id },
        { 
          requestStatus: dbStatus,
          ...(note && { note })
        },
        { new: true }
      );
      
      // If status is changed to "in-progress", also update all TestingSampleList records
      if (dbStatus === "in-progress" && updatedRequest) {
        const testingSampleUpdates = await TestingSampleList.updateMany(
          { requestNumber: id },
          { 
            sampleStatus: 'in-progress',
            updatedAt: new Date()
          }
        );
        
        console.log(`Updated ${testingSampleUpdates.modifiedCount} testing samples to in-progress for request ${id}`);
      }
    }
    
    console.log("Update result:", updatedRequest ? "Found and updated" : "Not found");
    
    if (!updatedRequest) {
      // Try to find the request to see if it exists
      const checkRequest = await RequestList.findOne({ requestNumber: id });
      console.log("Request exists in DB?", checkRequest ? "Yes" : "No");
      if (checkRequest) {
        console.log("Request status in DB:", checkRequest.requestStatus);
      }
      
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }
    
    // Create notification for status change
    try {
      const previousStatus = dbStatus === "in-progress" ? "Pending Receive" : "Previous Status"; // We'd need to track this better
      
      await Notification.createStatusChangeNotification({
        userId: updatedRequest.requesterEmail || 'system', // We'll need to get the actual user ID
        userEmail: updatedRequest.requesterEmail || 'admin@admin.com',
        requestNumber: id,
        entityType: isErRequest ? 'er_request' : 'request',
        entityId: id,
        previousStatus: previousStatus,
        newStatus: dbStatus,
        changedBy: 'System Administrator', // We'd get this from the request in a real scenario
        changedByEmail: 'admin@admin.com',
        priority: updatedRequest.priority === 'urgent' ? 'urgent' : 'medium'
      });
      
      console.log(`Created notification for request ${id} status change to ${dbStatus}`);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request update if notification creation fails
    }
    
    return NextResponse.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update multiple requests' statuses
export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { ids, status, note } = body;
    
    if (!ids || !ids.length || !status) {
      return NextResponse.json(
        { success: false, error: "Request IDs and status are required" },
        { status: 400 }
      );
    }
    
    // Map frontend status to database status
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

    // Split IDs into ER and regular requests
    const erIds = ids.filter((id: string) => id.includes("-ER-"));
    const regularIds = ids.filter((id: string) => !id.includes("-ER-"));
    
    let erUpdates = { count: 0 };
    let regularUpdates = { count: 0 };
    
    // Update ER requests
    if (erIds.length > 0) {
      const result = await ErList.updateMany(
        { requestNumber: { $in: erIds } },
        { 
          requestStatus: dbStatus,
          ...(note && { note }),
          updatedAt: new Date()
        }
      );
      erUpdates = { count: result.modifiedCount };
    }
    
    // Update regular requests
    if (regularIds.length > 0) {
      const result = await RequestList.updateMany(
        { requestNumber: { $in: regularIds } },
        { 
          requestStatus: dbStatus,
          ...(note && { note }),
          updatedAt: new Date()
        }
      );
      regularUpdates = { count: result.modifiedCount };
      
      // If status is changed to "in-progress", also update all TestingSampleList records
      if (dbStatus === "in-progress") {
        const testingSampleUpdates = await TestingSampleList.updateMany(
          { requestNumber: { $in: regularIds } },
          { 
            sampleStatus: 'in-progress',
            updatedAt: new Date()
          }
        );
        
        console.log(`Updated ${testingSampleUpdates.modifiedCount} testing samples to in-progress for ${regularIds.length} requests`);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        erUpdates,
        regularUpdates,
        totalUpdated: erUpdates.count + regularUpdates.count
      }
    });
  } catch (error) {
    console.error("Error updating requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update requests" },
      { status: 500 }
    );
  }
}
