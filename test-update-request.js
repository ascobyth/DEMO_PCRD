// Test script to verify request update functionality
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcrd-smr';

async function testRequestUpdate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import the RequestList model
    const RequestList = require('./models/RequestList');

    // Find a request to test with
    const testRequestNumber = 'ME-N-0525-00002'; // Replace with your actual request number
    
    console.log(`\nLooking for request: ${testRequestNumber}`);
    const request = await RequestList.findOne({ requestNumber: testRequestNumber });
    
    if (!request) {
      console.log('Request not found!');
      return;
    }

    console.log('\nCurrent request details:');
    console.log('- Request Number:', request.requestNumber);
    console.log('- Title:', request.requestTitle);
    console.log('- Status:', request.requestStatus);
    console.log('- Priority:', request.priority);
    console.log('- Updated At:', request.updatedAt);

    // Test update
    const newTitle = `Updated Title - Test ${new Date().toISOString()}`;
    console.log(`\nUpdating title to: "${newTitle}"`);

    const updateResult = await RequestList.updateOne(
      { requestNumber: testRequestNumber },
      { 
        $set: { 
          requestTitle: newTitle,
          updatedAt: new Date()
        } 
      }
    );

    console.log('\nUpdate result:', updateResult);

    // Verify the update
    const updatedRequest = await RequestList.findOne({ requestNumber: testRequestNumber });
    console.log('\nAfter update:');
    console.log('- Title:', updatedRequest.requestTitle);
    console.log('- Updated At:', updatedRequest.updatedAt);

    if (updatedRequest.requestTitle === newTitle) {
      console.log('\n✅ Update successful!');
    } else {
      console.log('\n❌ Update failed - title not changed');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testRequestUpdate();