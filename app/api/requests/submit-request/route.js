import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import crypto from 'crypto';

const mongoose = require('mongoose');

/**
 * API route handler for submitting NTR requests
 * This implementation splits requests by capability when a TestingMethod belongs to multiple capabilities
 *
 * @param {Request} request - The HTTP request object
 * @returns {Promise<NextResponse>} The HTTP response
 */
export async function POST(request) {
  console.log('Submit request API called at:', new Date().toISOString());
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Connect to the database
    console.log('Attempting to connect to database...');
    await connectToDatabase();
    console.log('Database connection successful');

    // Import models after database connection
    const RequestList = mongoose.models.RequestList || require('@/models/RequestList');
    const TestingSampleList = mongoose.models.TestingSampleList || require('@/models/TestingSampleList');
    const Capability = mongoose.models.Capability || require('@/models/Capability');
    const Io = mongoose.models.Io || require('@/models/Io');
    const TestingMethod = mongoose.models.TestingMethod || require('@/models/TestingMethod');
    const User = mongoose.models.User ? mongoose.models.User : (require('@/models/User').User);

    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('API received request submission data:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.testMethods || body.testMethods.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No test methods provided' },
        { status: 400 }
      );
    }
    
    // Check if at least one method is selected or has instances
    const hasActiveMethod = body.testMethods.some(method => 
      method.selected || (method.instances && method.instances.length > 0)
    );
    
    if (!hasActiveMethod) {
      return NextResponse.json(
        { success: false, error: 'No test methods are selected. Please select at least one test method.' },
        { status: 400 }
      );
    }
    
    // Log test methods with instances for debugging
    console.log('Test methods with instances:');
    console.log('First method details:', body.testMethods?.[0]);
    body.testMethods?.forEach((method, index) => {
      console.log(`Method ${index + 1}: ${method.name}`);
      console.log(`  - Selected: ${method.selected}`);
      console.log(`  - Samples: ${JSON.stringify(method.samples)}`);
      console.log(`  - Instances: ${JSON.stringify(method.instances)}`);
      console.log(`  - Equipment Name: ${method.equipmentName}`);
      console.log(`  - Equipment ID: ${method.equipmentId}`);
      if (method.instances) {
        method.instances.forEach((instance, instIndex) => {
          console.log(`    Instance ${instIndex + 1}:`, {
            requirements: instance.requirements,
            samples: instance.samples
          });
        });
      }
    });

    try {
      // Group test methods by capability
      const methodsByCapability = await groupMethodsByCapability(body.testMethods, { TestingMethod, Capability });
      console.log('Methods grouped by capability:', methodsByCapability);
      
      // Check if we have any capability groups
      if (Object.keys(methodsByCapability).length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid test methods with capabilities found. Please ensure test methods have valid capability IDs.' },
          { status: 400 }
        );
      }

      // Generate request numbers for each capability
      const requestNumbers = await generateRequestNumbers(methodsByCapability, body.priority, { Capability });
      console.log('Generated request numbers:', requestNumbers);

      // Create requests for each capability
      const createdRequests = await createRequests(body, methodsByCapability, requestNumbers, { RequestList, Capability, Io, User });
      console.log('Created requests:', createdRequests);

      // Create testing sample entries for each capability
      const testingSamples = await createTestingSamples(body, methodsByCapability, requestNumbers, createdRequests, { TestingSampleList });
      console.log('Created testing samples:', testingSamples);

      // Return success response with the created request numbers
      return NextResponse.json({
        success: true,
        data: {
          requestNumbers: Object.values(requestNumbers),
          requestIds: createdRequests.map(req => req._id.toString())
        }
      }, { status: 201 });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error submitting request:', error);

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

    // Return generic error for other cases
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit request',
        details: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Group test methods by capability
 * @param {Array} testMethods - Array of test methods
 * @returns {Promise<Object>} - Object with capability IDs as keys and arrays of test methods as values
 */
async function groupMethodsByCapability(testMethods, models) {
  const { TestingMethod, Capability } = models;
  const methodsByCapability = {};

  // Only process active (non-deleted) methods
  const activeMethods = testMethods.filter(method => !method.isDeleted);
  
  console.log(`Processing ${activeMethods.length} active methods out of ${testMethods.length} total methods`);

  // Check if there are any active methods
  if (activeMethods.length === 0) {
    console.log('No active methods to process (all methods are deleted or filtered out)');
    return {};
  }

  // Fetch all capabilities to get their shortNames
  const capabilities = await Capability.find({});
  const capabilityMap = {};
  capabilities.forEach(cap => {
    capabilityMap[cap._id.toString()] = cap;
  });

  // Group methods by capability
  let methodsWithoutCapability = 0;
  for (const method of activeMethods) {
    if (method.capabilityId) {
      const capabilityId = method.capabilityId.toString();
      if (!methodsByCapability[capabilityId]) {
        methodsByCapability[capabilityId] = {
          methods: [],
          capability: capabilityMap[capabilityId]
        };
      }
      methodsByCapability[capabilityId].methods.push(method);
    } else {
      methodsWithoutCapability++;
      console.warn(`Method ${method.name} (ID: ${method.id}) has no capabilityId`);
    }
  }
  
  if (methodsWithoutCapability > 0) {
    console.warn(`${methodsWithoutCapability} methods have no capability ID and were skipped`);
  }

  console.log(`Methods grouped into ${Object.keys(methodsByCapability).length} capabilities`);
  
  return methodsByCapability;
}

/**
 * Generate request numbers for each capability
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {string} priority - Priority of the request ('normal' or 'urgent')
 * @param {Object} models - Models object containing Capability
 * @returns {Promise<Object>} - Object with capability IDs as keys and request numbers as values
 */
async function generateRequestNumbers(methodsByCapability, priority, models) {
  const { Capability } = models;
  const requestNumbers = {};
  const currentDate = new Date();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = String(currentDate.getFullYear()).slice(-2);
  const mmyy = `${month}${year}`;

  // Priority code: 'N' for normal, 'E' for urgent
  const priorityCode = priority === 'urgent' ? 'E' : 'N';

  for (const capabilityId in methodsByCapability) {
    const capability = methodsByCapability[capabilityId].capability;

    // Get the capability's short name
    const shortName = capability.shortName;

    // Get the current run number and increment it
    let runNumber = capability.reqRunNo || 1;

    // Format the run number with leading zeros (5 digits)
    const formattedRunNumber = String(runNumber).padStart(5, '0');

    // Generate the request number in the format XX-Y-MMYY-NNNNN
    const requestNumber = `${shortName}-${priorityCode}-${mmyy}-${formattedRunNumber}`;

    // Store the request number
    requestNumbers[capabilityId] = requestNumber;

    // Update the capability's run number
    await Capability.findByIdAndUpdate(
      capabilityId,
      { $set: { reqRunNo: runNumber + 1 } }
    );
  }

  return requestNumbers;
}

/**
 * Create requests for each capability
 * @param {Object} body - Request body
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {Object} requestNumbers - Object with capability IDs as keys and request numbers as values
 * @returns {Array} - Array of created requests
 */
async function createRequests(body, methodsByCapability, requestNumbers, models) {
  const { RequestList, Capability, Io, User } = models;
  const createdRequests = [];

  // Get IO information if using IO number
  let ioInfo = null;
  if (body.useIONumber === 'yes' && body.ioNumber) {
    ioInfo = await Io.findOne({ ioNo: body.ioNumber });
  }

  // Create a request for each capability
  for (const capabilityId in methodsByCapability) {
    const requestNumber = requestNumbers[capabilityId];
    const capability = methodsByCapability[capabilityId].capability;
    const methods = methodsByCapability[capabilityId].methods;

    // Create the request data
    const requestData = {
      // Core request identification
      requestNumber,
      requestStatus: 'Pending Receive', // Using the correct status for new requests

      // Request details
      requestTitle: body.requestTitle,

      // Cost information
      useIoNumber: body.useIONumber === 'yes',
      ioNumber: body.useIONumber === 'yes' ? body.ioNumber : null,
      ioCostCenter: ioInfo ? ioInfo.costCenter : null,
      requesterCostCenter: body.costCenter,

      // Priority settings
      priority: body.priority,
      urgentType: body.urgentType,
      urgencyReason: body.urgencyReason,

      // Approval information
      approver: body.approver,

      // Document uploads
      urgentRequestDocument: body.urgentRequestDocument,

      // Sample and testing information
      jsonSampleList: JSON.stringify(body.samples),
      jsonTestingList: JSON.stringify(methods),

      // Create a folder for test results
      datapool: `/data/requests/${requestNumber}`,

      // Results and evaluation
      returnSampleAddress: null,
      evaluationScore: null,

      // ASR project reference
      asrId: null,
      isAsrRequest: false,

      // Requester information
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,

      // On behalf information
      isOnBehalf: body.isOnBehalf === 'yes',
      onBehalfOfName: body.onBehalfOfName,
      onBehalfOfEmail: body.onBehalfOfEmail,
      onBehalfOfCostCenter: body.onBehalfOfCostCenter,

      // Support staff
      supportStaff: null,

      // Important dates
      receiveDate: null,
      completeDate: null,
      terminateDate: null,
      cancelDate: null,

      // PPC member list
      ppcMemberList: null,

      // Tech sprint flag
      isTechsprint: ioInfo ? ioInfo.isTechsprint : false,
      
      // Approval status - urgent requests need approval
      isApproved: body.priority !== 'urgent' // Non-urgent requests are auto-approved
    };

    // Create the request
    const newRequest = await RequestList.create(requestData);
    createdRequests.push(newRequest);
  }

  return createdRequests;
}

/**
 * Create testing sample entries for each capability
 * @param {Object} body - Request body
 * @param {Object} methodsByCapability - Object with capability IDs as keys and arrays of test methods as values
 * @param {Object} requestNumbers - Object with capability IDs as keys and request numbers as values
 * @param {Array} createdRequests - Array of created requests
 * @returns {Array} - Array of created testing samples
 */
async function createTestingSamples(body, methodsByCapability, requestNumbers, createdRequests, models) {
  const { TestingSampleList } = models;
  const createdTestingSamples = [];

  // Create a map of request numbers to request IDs
  const requestMap = {};
  createdRequests.forEach(request => {
    requestMap[request.requestNumber] = request._id;
  });

  // Create testing sample entries for each capability
  for (const capabilityId in methodsByCapability) {
    const requestNumber = requestNumbers[capabilityId];
    const capability = methodsByCapability[capabilityId].capability;
    const methods = methodsByCapability[capabilityId].methods;
    const requestId = requestMap[requestNumber];

    // Process each method
    for (const method of methods) {
      // Check if method is selected (main method) and has instances (repeats)
      const hasMainMethod = method.selected;
      const hasInstances = method.instances && method.instances.length > 0;
      
      // Process the main method if it's selected
      if (hasMainMethod) {
        // Generate a unique testing ID for the main method
        const testingId = generateUniqueId();

        // Process each sample for the main method
        for (const sampleName of method.samples || []) {
          // Find the corresponding sample object
          const sample = body.samples.find(s =>
            (s.generatedName === sampleName) ||
            (s.name === sampleName)
          );

          if (sample) {
            // Generate a unique sample ID for this sample
            const sampleId = generateUniqueId();

            // Generate a unique testing list ID for this record
            const testingListId = generateUniqueId();

            // Create the testing sample data for main method (Repeat #1)
            const testingRemark = method.requirements || method.remarks || method.testingRemark || '';
            console.log(`Main method testingRemark for ${sample.generatedName || sample.name}:`, {
              methodRequirements: method.requirements,
              methodRemarks: method.remarks,
              methodTestingRemark: method.testingRemark,
              finalTestingRemark: testingRemark,
              equipmentName: method.equipmentName,
              equipmentIdType: typeof method.equipmentId,
              equipmentIdValue: method.equipmentId
            });

            const testingSampleData = {
              // Request references
              requestId,
              requestNumber,

              // Equipment information
              equipmentName: method.equipmentName || '',
              // Don't include equipmentId if it's a number - TestingSampleList expects ObjectId
              // equipmentId: method.equipmentId || null,

              // Sample identification
              sampleId,
              sampleName: sample.generatedName || sample.name,
              sysSampleName: sample.generatedName || sample.name,
              fullSampleName: `${sample.generatedName || sample.name}_${method.methodCode || ''}_R1`,
              remark: sample.remark || '',

              // Testing method information
              methodCode: method.methodCode || '',
              methodId: method.id || null,
              testingRemark: testingRemark,
              testingCost: method.price ? method.price.toString() : '0',

              // Capability information
              capabilityId,
              capabilityName: capability.capabilityName,

              // Testing identifiers
              testingListId,
              testingId,

              // Priority (inherited from request)
              priority: body.priority || 'normal',

              // Status tracking
              sampleStatus: 'Pending Receive',

              // Important dates
              submitDate: new Date(),
              receiveDate: null,
              operationCompleteDate: null,
              entryResultDate: null,
              approveDate: null,
              requestCompleteDate: null,
              dueDate: null,

              // Request type
              requestType: 'NTR',

              // Personnel tracking
              receiveBy: null,
              operationCompleteBy: null,
              entryResultBy: null,
              requestCompleteBy: null,

              // Equipment reservation
              startReserveTime: null,
              endReserveTime: null
            };

            // Log the testing sample data before creation
            console.log(`Creating testing sample for ${sample.generatedName || sample.name}:`, {
              equipmentName: testingSampleData.equipmentName,
              methodCode: testingSampleData.methodCode,
              sampleName: testingSampleData.sampleName
            });

            // Create the testing sample
            const newTestingSample = await TestingSampleList.create(testingSampleData);
            createdTestingSamples.push(newTestingSample);
          }
        }
      }
      
      // Process instances if they exist
      if (hasInstances) {
        // Process each instance as a separate testing sample entry
        for (let instanceIndex = 0; instanceIndex < method.instances.length; instanceIndex++) {
          const instance = method.instances[instanceIndex];
          // Generate a unique testing ID for this instance
          const testingId = generateUniqueId();

          // Process each sample for this instance
          for (const sampleName of instance.samples) {
            // Find the corresponding sample object
            const sample = body.samples.find(s =>
              (s.generatedName === sampleName) ||
              (s.name === sampleName)
            );

            if (sample) {
              // Generate a unique sample ID for this sample
              const sampleId = generateUniqueId();

              // Generate a unique testing list ID for this record
              const testingListId = generateUniqueId();

              // Create the testing sample data
              const instanceTestingRemark = instance.requirements || method.remarks || method.testingRemark || '';
              console.log(`Instance ${instanceIndex + 1} testingRemark for ${sample.generatedName || sample.name}:`, {
                instanceRequirements: instance.requirements,
                methodRemarks: method.remarks,
                methodTestingRemark: method.testingRemark,
                finalTestingRemark: instanceTestingRemark,
                repeatNumber: hasMainMethod ? instanceIndex + 2 : instanceIndex + 1
              });

              const testingSampleData = {
                // Request references
                requestId,
                requestNumber,

                // Equipment information
                equipmentName: method.equipmentName || '',
                // Don't include equipmentId if it's a number - TestingSampleList expects ObjectId
                // equipmentId: method.equipmentId || null,

                // Sample identification
                sampleId,
                sampleName: sample.generatedName || sample.name,
                sysSampleName: sample.generatedName || sample.name,
                fullSampleName: `${sample.generatedName || sample.name}_${method.methodCode || ''}_R${hasMainMethod ? instanceIndex + 2 : instanceIndex + 1}`,
                remark: sample.remark || '',

                // Testing method information
                methodCode: method.methodCode || '',
                methodId: method.id || null,
                testingRemark: instanceTestingRemark,
                testingCost: method.price ? method.price.toString() : '0',

                // Capability information
                capabilityId,
                capabilityName: capability.capabilityName,

                // Testing identifiers
                testingListId,
                testingId,

                // Priority (inherited from request)
                priority: body.priority || 'normal',

                // Status tracking
                sampleStatus: 'Pending Receive',

                // Important dates
                submitDate: new Date(),
                receiveDate: null,
                operationCompleteDate: null,
                entryResultDate: null,
                approveDate: null,
                requestCompleteDate: null,
                dueDate: null,

                // Request type
                requestType: 'NTR',

                // Personnel tracking
                receiveBy: null,
                operationCompleteBy: null,
                entryResultBy: null,
                requestCompleteBy: null,

                // Equipment reservation
                startReserveTime: null,
                endReserveTime: null
              };

              // Log the testing sample data before creation
              console.log(`Creating testing sample instance for ${sample.generatedName || sample.name} (Repeat ${hasMainMethod ? instanceIndex + 2 : instanceIndex + 1}):`, {
                equipmentName: testingSampleData.equipmentName,
                methodCode: testingSampleData.methodCode,
                sampleName: testingSampleData.sampleName
              });

              // Create the testing sample
              const newTestingSample = await TestingSampleList.create(testingSampleData);
              createdTestingSamples.push(newTestingSample);
            }
          }
        }
      }
    }
  }

  return createdTestingSamples;
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
  return crypto.randomBytes(4).toString('hex');
}
