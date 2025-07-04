const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.production' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smr_augment';

async function migrateMethodCode() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const collection = db.collection('testing_methods');

    // Count documents with methodCode
    const countWithMethodCode = await collection.countDocuments({ methodCode: { $exists: true } });
    console.log(`Found ${countWithMethodCode} documents with methodCode field`);

    // Count documents with methodcode
    const countWithMethodcode = await collection.countDocuments({ methodcode: { $exists: true } });
    console.log(`Found ${countWithMethodcode} documents with methodcode field`);

    if (countWithMethodCode > 0) {
      console.log('\nMigrating methodCode to methodcode...');
      
      // Update all documents: rename methodCode to methodcode
      const result = await collection.updateMany(
        { methodCode: { $exists: true } },
        { $rename: { methodCode: 'methodcode' } }
      );

      console.log(`Updated ${result.modifiedCount} documents`);
    }

    // Verify migration
    const afterCountMethodCode = await collection.countDocuments({ methodCode: { $exists: true } });
    const afterCountMethodcode = await collection.countDocuments({ methodcode: { $exists: true } });
    
    console.log('\nAfter migration:');
    console.log(`Documents with methodCode: ${afterCountMethodCode}`);
    console.log(`Documents with methodcode: ${afterCountMethodcode}`);

    // Show a few examples
    console.log('\nSample documents after migration:');
    const samples = await collection.find({}).limit(3).toArray();
    samples.forEach(doc => {
      console.log(`- ${doc.testingName}: methodcode = ${doc.methodcode}`);
    });

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateMethodCode();