import { NextResponse } from 'next/server';
import connectToDatabase, { mongoose } from '@/lib/db';
import crypto from 'crypto';

// Import models directly
const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');
const Capability = mongoose.models.Capability || require('@/models/Capability');
const Io = mongoose.models.Io || require('@/models/Io');
const TestingMethod = mongoose.models.TestingMethod || require('@/models/TestingMethod');

/**
 * API route handler for submitting NTR requests from the confirmation page
 * This implementation splits requests by capability when a TestingMethod belongs to multiple capabilities
 * 
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function POST(request) {
  let session = null;

  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();
    console.log('API received NTR confirmation submission data:', body);

    // Start a transaction
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Group test methods by capability
      const methodsByCapability = await groupMethodsByCapability(body.testMethods);
      console.log('Methods grouped by capability:', methodsByCapability);

      // If no capabilities found, return an error
      if (Object.keys(methodsByCapability).length === 0) {
        throw new Error('No capabilities found for the selected test methods');
      }

      // Generate request numbers for each capability
      const requestNumbers = await generateRequestNumbers(methodsByCapability, body.priority);
      console.log('Generated request numbers:', requestNumbers);

      // Create requests for each capability
      const createdRequests = await createRequests(body, methodsByCapability, requestNumbers, session);
      console.log('Created requests:', createdRequests);

      // Create testing sample entries for each capability
      const testingSamples = await createTestingSamples(body, methodsByCapability, requestNumbers, createdRequests, session);
      console.log('Created testing samples:', testingSamples);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        success: true,
        data: {
          requestNumbers,
          requestIds: createdRequests.map(req => req._id.toString()),
          splitByCapability: Object.keys(methodsByCapability).length > 1
        }
      }, { status: 201 });
    } catch (error) {
      // Abort the transaction on error
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error submitting NTR request:', error);

    // Log detailed error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A request with that number already exists' },
        { status: 400 }
      );
    }

    // Handle model compilation errors
    if (error.message && error.message.includes('Schema hasn\'t been registered')) {
      return NextResponse.json(
        { success: false, error: 'Database schema error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit NTR request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Group test methods by capability
 * @param {Array} testMethods - Array of test methods
 * @returns {Object} - Object with capability IDs as keys and arrays of test methods as values
 */
async function groupMethodsByCapability(testMethods) {
  const methodsByCapability = {};

  // Fetch all test methods from the database to get their capability information
  const methodIds = testMethods.map(method => method.id || method._id).filter(id => id);
  
  // If no method IDs, return empty object
  if (methodIds.length === 0) {
    return methodsByCapability;
  }

  // Fetch methods from database
  const dbMethods = await TestingMethod.find({
    _id: { $in: methodIds }
  }).populate('capabilityId');

  // Create a map of method IDs to their database records
  const methodMap = {};
  dbMethods.forEach(method => {
    methodMap[method._id.toString()] = method;
  });

  // Group methods by capability
  for (const method of testMethods) {
    const methodId = method.id || method._id;
    if (!methodId) continue;

    const dbMethod = methodMap[methodId.toString()];
    if (!dbMethod || !dbMethod.capabilityId) continue;

    const capabilityId = dbMethod.capabilityId._id.toString();
    const capabilityName = dbMethod.capabilityId.capabilityName;
    const shortName = dbMethod.capabilityId.shortName;

    if (!methodsByCapability[capabilityId]) {
      methodsByCapability[capabilityId] = {
        methods: [],
        capabilityName,
        shortName
      };
    }

    methodsByCapability[capabilityId].methods.push({
      ...method,
      dbMethod
    });
  }

  return methodsByCapability;
}

/**
 * Generate request numbers for each capability
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {String} priority - Priority of the request ('normal' or 'urgent')
 * @returns {Object} - Object with capability IDs as keys and request numbers as values
 */
async function generateRequestNumbers(methodsByCapability, priority) {
  const requestNumbers = {};
  const currentDate = new Date();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear().toString().slice(-2);
  const mmyy = `${month}${year}`;

  // Priority code: 'N' for normal, 'E' for urgent
  const priorityCode = priority === 'urgent' ? 'E' : 'N';

  for (const capabilityId in methodsByCapability) {
    // Get the capability short name
    const shortName = methodsByCapability[capabilityId].shortName;
    
    // Find the capability in the database
    const capability = await Capability.findById(capabilityId);
    
    if (!capability) {
      throw new Error(`Capability with ID ${capabilityId} not found`);
    }

    // Get the current run number and increment it
    let runNumber = capability.reqRunNo || 1;
    const paddedRunNumber = runNumber.toString().padStart(5, '0');

    // Format: XX-Y-MMYY-NNNNN
    // XX: Capability short name
    // Y: Priority code (N or E)
    // MMYY: Month and year
    // NNNNN: Run number
    const requestNumber = `${shortName}-${priorityCode}-${mmyy}-${paddedRunNumber}`;
    
    // Update the capability with the new run number
    await Capability.findByIdAndUpdate(capabilityId, { reqRunNo: runNumber + 1 });
    
    // Store the request number
    requestNumbers[capabilityId] = requestNumber;
  }

  return requestNumbers;
}

/**
 * Create requests for each capability
 * @param {Object} body - Request body
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {Object} requestNumbers - Object with capability IDs as keys and request numbers as values
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 * @returns {Array} - Array of created requests
 */
async function createRequests(body, methodsByCapability, requestNumbers, session) {
  const createdRequests = [];

  // Get IO information if using IO number
  let ioInfo = null;
  if (body.useIONumber === 'yes' && body.ioNumber) {
    ioInfo = await Io.findOne({ ioNo: body.ioNumber });
  }

  for (const capabilityId in methodsByCapability) {
    const requestNumber = requestNumbers[capabilityId];
    const capabilityName = methodsByCapability[capabilityId].capabilityName;
    
    // Filter test methods for this capability
    const capabilityMethods = methodsByCapability[capabilityId].methods;
    
    // Create the request data
    const requestData = {
      // Core request identification
      requestNumber,
      requestStatus: 'Pending Receive Sample', // As specified in requirements
      
      // Request details
      requestTitle: body.requestTitle || 'New Test Request',
      
      // Cost information
      useIoNumber: body.useIONumber === 'yes',
      ioCostCenter: ioInfo ? ioInfo.costCenter : null,
      requesterCostCenter: body.costCenter || '',
      
      // Priority settings
      priority: body.priority || 'normal',
      urgentType: body.urgentType || '',
      urgencyReason: body.urgencyReason || '',
      
      // Approval information
      approver: body.approver ? {
        name: body.approver.name || '',
        email: body.approver.email || ''
      } : null,
      
      // Document uploads
      urgentRequestDocument: body.urgentMemo || '',
      
      // Sample and testing information (stored as JSON strings)
      jsonSampleList: JSON.stringify(body.samples || []),
      jsonTestingList: JSON.stringify(capabilityMethods || []),
      
      // Results and evaluation
      datapool: '', // Create a folder for test results
      returnSampleAddress: '',
      evaluationScore: '',
      
      // ASR project reference
      asrId: '',
      isAsrRequest: false,
      
      // Requester information
      requesterName: body.requester?.name || 'Anonymous',
      requesterEmail: body.requester?.email || 'anonymous@example.com',
      
      // On behalf information
      isOnBehalf: body.isOnBehalf || false,
      onBehalfOfName: body.onBehalfOfName || '',
      onBehalfOfEmail: body.onBehalfOfEmail || '',
      onBehalfOfCostCenter: body.onBehalfOfCostCenter || '',
      
      // Support staff
      supportStaff: '',
      
      // Important dates - only set submissionDate for now
      // receiveDate, completeDate, terminateDate, and cancelDate will be set later
      
      // PPC member list
      ppcMemberList: '',
      
      // Tech sprint flag
      isTechsprint: ioInfo ? ioInfo.isTechsprint : false
    };

    // Create the request
    const newRequest = await RequestList.create([requestData], { session });
    createdRequests.push(newRequest[0]);
  }

  return createdRequests;
}

/**
 * Create testing sample entries for each capability
 * @param {Object} body - Request body
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {Object} requestNumbers - Object with capability IDs as keys and request numbers as values
 * @param {Array} createdRequests - Array of created requests
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 * @returns {Array} - Array of created testing samples
 */
async function createTestingSamples(body, methodsByCapability, requestNumbers, createdRequests, session) {
  const createdTestingSamples = [];
  
  // Create a map of capability IDs to request IDs
  const requestIdMap = {};
  createdRequests.forEach(request => {
    // Find the capability ID for this request
    for (const capabilityId in requestNumbers) {
      if (requestNumbers[capabilityId] === request.requestNumber) {
        requestIdMap[capabilityId] = request._id;
        break;
      }
    }
  });

  // Process each capability
  for (const capabilityId in methodsByCapability) {
    const requestNumber = requestNumbers[capabilityId];
    const requestId = requestIdMap[capabilityId];
    const capabilityName = methodsByCapability[capabilityId].capabilityName;
    const methods = methodsByCapability[capabilityId].methods;

    // Process each method in this capability
    for (const method of methods) {
      // Generate a unique testing ID for this method
      const testingId = generateUniqueId();

      // Process each sample for this method
      for (const sampleName of method.samples) {
        // Find the corresponding sample object
        const sample = body.samples.find(s =>
          (s.generatedName === sampleName) ||
          (s.name === sampleName)
        );

        if (sample) {
          // Generate a unique sample ID for this sample
          const sampleId = generateUniqueId();

          // Create the testing sample data
          const testingSampleData = {
            // Request references
            requestId,
            requestNumber,
            
            // Equipment information
            equipmentName: method.equipmentName || '',
            equipmentId: method.equipmentId || null,
            
            // Sample identification
            sampleId,
            sampleName: sample.generatedName || sample.name || '',
            sysSampleName: sample.generatedName || sample.name || '',
            fullSampleName: sample.generatedName || sample.name || '',
            remark: sample.remark || '',
            
            // Testing method information
            methodCode: method.dbMethod.methodCode || '',
            methodId: method.id || method._id,
            testingRemark: method.requirements || '',
            testingCost: method.price || method.cost || 0,
            
            // Capability information
            capabilityId,
            capabilityName,
            
            // Testing identifiers
            testingListId: generateUniqueId(),
            testingId,
            
            // Priority (inherited from request)
            priority: body.priority || 'normal',
            
            // Status tracking
            sampleStatus: 'submitted',
            
            // Important dates
            submitDate: new Date(),
            
            // Request type
            requestType: 'NTR',
          };

          // Create the testing sample
          const newTestingSample = await TestingSampleList.create([testingSampleData], { session });
          createdTestingSamples.push(newTestingSample[0]);
        }
      }
    }
  }

  return createdTestingSamples;
}

/**
 * Generate a unique ID (8 characters)
 * @returns {String} - Unique ID
 */
function generateUniqueId() {
  return crypto.randomBytes(4).toString('hex');
}
