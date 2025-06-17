import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';

// Import models directly
const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');
const Capability = mongoose.models.Capability || require('@/models/Capability');
const Location = mongoose.models.Location || require('@/models/Location');
const User = mongoose.models.User ? mongoose.models.User : (require('@/models/User').User);

/**
 * API route handler for fetching details of multiple requests
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function GET(request) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the request numbers from the query parameters
    const { searchParams } = new URL(request.url);
    const requestNumbersParam = searchParams.get('requestNumbers');

    if (!requestNumbersParam) {
      return NextResponse.json(
        { success: false, error: 'Request numbers are required' },
        { status: 400 }
      );
    }

    // Parse the request numbers
    let requestNumbers;
    try {
      requestNumbers = JSON.parse(requestNumbersParam);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request numbers format' },
        { status: 400 }
      );
    }

    // If requestNumbers is an object, extract the values
    if (typeof requestNumbers === 'object' && !Array.isArray(requestNumbers)) {
      requestNumbers = Object.values(requestNumbers);
    }

    // Ensure requestNumbers is an array
    if (!Array.isArray(requestNumbers)) {
      requestNumbers = [requestNumbers];
    }

    console.log('Fetching details for requests:', requestNumbers);

    // Find all requests in the database
    const requests = await RequestList.find({ requestNumber: { $in: requestNumbers } }).lean();

    if (requests.length === 0) {
      console.log('No requests found in database for:', requestNumbers);

      // For development purposes, return mock data
      return NextResponse.json({
        success: true,
        data: {
          requestTitle: 'Mock Request Title',
          submissionDate: new Date().toISOString().split('T')[0],
          requester: {
            name: 'John Doe',
            department: 'R&D',
            email: 'john.doe@example.com',
            phone: '123-456-7890'
          },
          splitRequests: requestNumbers.map((requestNumber, index) => ({
            requestId: requestNumber,
            capability: `Mock Capability ${index + 1}`,
            methods: [
              {
                id: `mock-method-id-${index}`,
                name: `Mock Method ${index + 1}`,
                samples: [`Mock Sample ${index + 1}-1`, `Mock Sample ${index + 1}-2`]
              }
            ],
            estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            capabilityInfo: {
              address: 'Building 3, Floor 2, Lab 205, Research Center, 123 Science Park',
              contactPerson: 'Dr. Sarah Johnson',
              contactEmail: 'sarah.johnson@example.com',
              contactPhone: '123-456-7891'
            }
          }))
        }
      }, { status: 200 });
    }

    // Find all testing samples for these requests
    const testingSamples = await TestingSampleList.find({
      requestNumber: { $in: requestNumbers }
    }).lean();

    // Fetch all capabilities
    const capabilities = await Capability.find({}).lean();

    // Create a map of capability IDs to capabilities
    const capabilityMap = {};
    capabilities.forEach(capability => {
      capabilityMap[capability._id.toString()] = capability;
    });

    // Fetch all locations
    const locations = await Location.find({}).lean();

    // Create a map of location IDs to locations
    const locationMap = {};
    locations.forEach(location => {
      locationMap[location._id.toString()] = location;
    });

    // Fetch all capability head users
    const capabilityHeadIds = capabilities
      .filter(cap => cap.capHeadGroup)
      .map(cap => cap.capHeadGroup.toString());

    const capabilityHeads = await User.find({
      _id: { $in: capabilityHeadIds }
    }).lean();

    // Create a map of user IDs to users
    const userMap = {};
    capabilityHeads.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Group testing samples by request number and capability
    const requestsMap = new Map();

    // Initialize the map with request data
    requests.forEach(request => {
      requestsMap.set(request.requestNumber, {
        requestId: request._id.toString(),
        requestNumber: request.requestNumber,
        requestTitle: request.requestTitle,
        submissionDate: request.createdAt ? new Date(request.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        requester: {
          name: request.requesterName,
          department: 'R&D', // Default department
          email: request.requesterEmail,
          phone: '123-456-7890' // Default phone
        },
        capabilities: new Map()
      });
    });

    // Group samples by capability within each request
    testingSamples.forEach(sample => {
      const requestNumber = sample.requestNumber;
      const capabilityId = sample.capabilityId ? sample.capabilityId.toString() : 'unknown';
      const capabilityName = sample.capabilityName || 'Unknown Capability';

      // Skip if request not found
      if (!requestsMap.has(requestNumber)) return;

      const requestData = requestsMap.get(requestNumber);
      
      // Log sample information for debugging repeat data
      console.log(`Processing sample: ${sample.sampleName}, fullSampleName: ${sample.fullSampleName}, methodCode: ${sample.methodCode}`);

      // Initialize capability if not exists
      if (!requestData.capabilities.has(capabilityId)) {
        // Get capability details from the map
        const capabilityDetails = capabilityMap[capabilityId] || {
          capabilityName: capabilityName,
          shortName: 'N/A',
          locationId: null,
          capHeadGroup: null
        };

        // Get location details if available
        let locationDetails = null;
        if (capabilityDetails.locationId) {
          const locationId = capabilityDetails.locationId.toString();
          locationDetails = locationMap[locationId] || null;
        }

        // Get capability head details if available
        let capabilityHeadDetails = null;
        if (capabilityDetails.capHeadGroup) {
          const capHeadId = capabilityDetails.capHeadGroup.toString();
          capabilityHeadDetails = userMap[capHeadId] || null;
        }

        // Create capability info object
        const capabilityInfo = {
          address: locationDetails ? locationDetails.address || locationDetails.sendingAddress || 'No address available' : 'No address available',
          contactPerson: capabilityHeadDetails ? capabilityHeadDetails.fullName || capabilityHeadDetails.name || 'No contact person available' : 'No contact person available',
          contactEmail: capabilityHeadDetails ? capabilityHeadDetails.email || 'No email available' : 'No email available',
          contactPhone: locationDetails ? locationDetails.contactNumber || 'No phone available' : 'No phone available'
        };

        requestData.capabilities.set(capabilityId, {
          capabilityId,
          capability: capabilityName,
          methods: new Map(),
          samples: new Set(),
          estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          capabilityInfo
        });
      }

      const capabilityData = requestData.capabilities.get(capabilityId);

      // Use fullSampleName (contains repeat info) instead of sampleName
      const displaySampleName = sample.fullSampleName || sample.sampleName;
      
      // Add sample to capability
      capabilityData.samples.add(displaySampleName);

      // Add method if not exists
      const methodId = sample.methodId ? sample.methodId.toString() : 'unknown';
      if (!capabilityData.methods.has(methodId)) {
        capabilityData.methods.set(methodId, {
          id: methodId,
          name: sample.methodCode || 'Unknown Method',
          samples: []
        });
      }

      // Add sample to method
      const methodData = capabilityData.methods.get(methodId);
      if (!methodData.samples.includes(displaySampleName)) {
        methodData.samples.push(displaySampleName);
      }
    });

    // Convert the maps to arrays for the response
    const splitRequests = [];
    requestsMap.forEach(requestData => {
      requestData.capabilities.forEach(capabilityData => {
        splitRequests.push({
          requestId: requestData.requestNumber,
          capability: capabilityData.capability,
          methods: Array.from(capabilityData.methods.values()),
          estimatedCompletion: capabilityData.estimatedCompletion,
          capabilityInfo: capabilityData.capabilityInfo
        });
      });
    });

    // Use the first request's data for the main request info
    const firstRequest = requests[0];
    
    // Try to get user information for department
    let requesterDepartment = 'R&D'; // Default department
    try {
      const user = await User.findOne({ email: firstRequest.requesterEmail }).lean();
      if (user && user.department) {
        requesterDepartment = user.department;
      }
    } catch (userError) {
      console.log('Could not fetch user department:', userError);
    }
    
    const response = {
      requestTitle: firstRequest.requestTitle,
      requestType: firstRequest.requestType || 'NTR',
      priority: firstRequest.priority || 'normal',
      requesterName: firstRequest.requesterName,
      requesterDepartment: requesterDepartment,
      submitDate: firstRequest.createdAt ? new Date(firstRequest.createdAt).toISOString() : new Date().toISOString(),
      submissionDate: firstRequest.createdAt ? new Date(firstRequest.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      requester: {
        name: firstRequest.requesterName,
        department: requesterDepartment,
        email: firstRequest.requesterEmail,
        phone: '123-456-7890' // Default phone
      },
      splitRequests
    };

    return NextResponse.json({ success: true, data: [response] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching request details:', error);

    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch request details',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
