const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smr_augment';

// Import models
const TestingMethod = require('./models/TestingMethod');
const Capability = require('./models/Capability');

async function testData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // Test Capabilities
    console.log('=== CAPABILITIES DATA ===');
    console.log('------------------------');
    
    const capabilities = await Capability.find({});
    console.log(`Total capabilities: ${capabilities.length}\n`);
    
    if (capabilities.length > 0) {
      console.log('All capabilities:');
      capabilities.forEach(cap => {
        console.log(`- ID: ${cap._id}`);
        console.log(`  Name: ${cap.capabilityName}`);
        console.log(`  Short Name: ${cap.shortName}`);
        console.log(`  Description: ${cap.capabilityDesc || 'N/A'}\n`);
      });
    }

    // Test Methods
    console.log('\n=== TEST METHODS DATA ===');
    console.log('-------------------------');
    
    const methods = await TestingMethod.find({});
    console.log(`Total test methods: ${methods.length}\n`);
    
    // Check for ER service type
    console.log('Checking for methods with "ER" in serviceType:');
    const erMethods = methods.filter(method => 
      method.serviceType && method.serviceType.includes('ER')
    );
    
    if (erMethods.length > 0) {
      console.log(`\nFound ${erMethods.length} methods with "ER" in serviceType:`);
      erMethods.forEach(method => {
        console.log(`\n- Method: ${method.testingName}`);
        console.log(`  Code: ${method.methodCode}`);
        console.log(`  Service Type: ${JSON.stringify(method.serviceType)}`);
        console.log(`  Capability ID: ${method.capabilityId}`);
        console.log(`  ER Slot Time: ${method.erSlotTime || 'N/A'}`);
        console.log(`  ER Per Slot: ${method.erPerSlot || 'N/A'}`);
        console.log(`  ER Time Start: ${method.erTimeStart || 'N/A'}`);
        console.log(`  ER Time End: ${method.erTimeEnd || 'N/A'}`);
      });
    } else {
      console.log('No methods found with "ER" in serviceType\n');
      
      // Show all unique service types
      const allServiceTypes = new Set();
      methods.forEach(method => {
        if (method.serviceType && Array.isArray(method.serviceType)) {
          method.serviceType.forEach(type => allServiceTypes.add(type));
        }
      });
      
      if (allServiceTypes.size > 0) {
        console.log('All unique service types found:');
        Array.from(allServiceTypes).forEach(type => console.log(`- ${type}`));
      } else {
        console.log('No service types found in any methods');
      }
    }
    
    // Check ER-related fields
    console.log('\n\nChecking methods with ER-related fields populated:');
    const methodsWithERFields = methods.filter(method => 
      method.erSlotTime || method.erPerSlot || method.erTimeStart || method.erTimeEnd
    );
    
    if (methodsWithERFields.length > 0) {
      console.log(`\nFound ${methodsWithERFields.length} methods with ER-related fields:`);
      methodsWithERFields.forEach(method => {
        console.log(`\n- Method: ${method.testingName}`);
        console.log(`  Code: ${method.methodCode}`);
        console.log(`  Service Type: ${JSON.stringify(method.serviceType)}`);
        console.log(`  ER Slot Time: ${method.erSlotTime}`);
        console.log(`  ER Per Slot: ${method.erPerSlot}`);
        console.log(`  ER Time Start: ${method.erTimeStart}`);
        console.log(`  ER Time End: ${method.erTimeEnd}`);
      });
    } else {
      console.log('No methods found with ER-related fields populated');
    }
    
    // Verify capability ID matching
    console.log('\n\n=== CAPABILITY ID MATCHING ===');
    console.log('------------------------------');
    
    const capabilityIds = new Set(capabilities.map(c => c._id.toString()));
    const methodsWithInvalidCapability = methods.filter(method => 
      method.capabilityId && !capabilityIds.has(method.capabilityId.toString())
    );
    
    if (methodsWithInvalidCapability.length > 0) {
      console.log(`\nWARNING: Found ${methodsWithInvalidCapability.length} methods with invalid capability IDs:`);
      methodsWithInvalidCapability.forEach(method => {
        console.log(`- ${method.testingName} (${method.methodCode}) references capability ID: ${method.capabilityId}`);
      });
    } else {
      console.log('\n✓ All method capability IDs are valid');
    }
    
    // Show methods by capability
    console.log('\n\nMethods grouped by capability:');
    const methodsByCapability = {};
    
    methods.forEach(method => {
      const capId = method.capabilityId ? method.capabilityId.toString() : 'No Capability';
      if (!methodsByCapability[capId]) {
        methodsByCapability[capId] = [];
      }
      methodsByCapability[capId].push(method);
    });
    
    Object.entries(methodsByCapability).forEach(([capId, methodList]) => {
      const capability = capabilities.find(c => c._id.toString() === capId);
      const capName = capability ? capability.capabilityName : capId;
      console.log(`\n${capName}: ${methodList.length} methods`);
      if (methodList.length <= 5) {
        methodList.forEach(m => console.log(`  - ${m.testingName} (${m.methodCode})`));
      } else {
        methodList.slice(0, 3).forEach(m => console.log(`  - ${m.testingName} (${m.methodCode})`));
        console.log(`  ... and ${methodList.length - 3} more`);
      }
    });
    
    // Sample of method structure
    if (methods.length > 0) {
      console.log('\n\nSample method structure (first method):');
      console.log(JSON.stringify(methods[0].toObject(), null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n\nDisconnected from MongoDB');
  }
}

// Run the test
testData();