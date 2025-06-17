const { MongoClient } = require('mongodb');

// Connection strings
const LOCAL_URI = 'mongodb://localhost:27017';
const ATLAS_URI = 'mongodb+srv://ascobyth02:JFCoXcVAgrD8bc4j@pcrdnextgen.nqvviyg.mongodb.net/?retryWrites=true&w=majority&appName=pcrdnextgen';

// Database name
const DATABASE_NAME = 'smr_augment';

// Collections to migrate
const COLLECTIONS = [
  'userscores',
  'test_collection', 
  'uploads.files',
  'plant_reactors',
  'testing_sample_lists',
  'request_lists', 
  'testing_methods',
  'requests',
  'app_techs',
  'asr_lists',
  'er_lists',
  'testing_samples',
  'notifications',
  'locations',
  'testing_er_lists',
  'ios',
  'sample_commercials',
  'sample_sets',
  'uploads.chunks',
  'timereservations',
  'equipment',
  'users',
  'capabilities'
];

async function migrateData() {
  let localClient, atlasClient;
  
  try {
    console.log('🔄 Starting data migration...');
    
    // Connect to both databases
    console.log('📡 Connecting to local MongoDB...');
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    
    console.log('📡 Connecting to MongoDB Atlas...');
    atlasClient = new MongoClient(ATLAS_URI);
    await atlasClient.connect();
    
    const localDb = localClient.db(DATABASE_NAME);
    const atlasDb = atlasClient.db(DATABASE_NAME);
    
    console.log(`🗃️  Found ${COLLECTIONS.length} collections to migrate`);
    
    // Migrate each collection
    for (const collectionName of COLLECTIONS) {
      try {
        console.log(`\n📋 Migrating collection: ${collectionName}`);
        
        const sourceCollection = localDb.collection(collectionName);
        const targetCollection = atlasDb.collection(collectionName);
        
        // Get document count
        const count = await sourceCollection.countDocuments();
        console.log(`   📊 Found ${count} documents`);
        
        if (count === 0) {
          console.log(`   ⏭️  Skipping empty collection`);
          continue;
        }
        
        // Get all documents
        const documents = await sourceCollection.find({}).toArray();
        
        // Insert into Atlas (in batches of 1000)
        const batchSize = 1000;
        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = documents.slice(i, i + batchSize);
          await targetCollection.insertMany(batch, { ordered: false });
          console.log(`   ✅ Migrated ${Math.min(i + batchSize, documents.length)}/${documents.length} documents`);
        }
        
        console.log(`   🎉 Successfully migrated ${collectionName}`);
        
      } catch (error) {
        console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
        // Continue with next collection
      }
    }
    
    console.log('\n🎊 Migration completed successfully!');
    
    // Verify migration
    console.log('\n📋 Verifying migration...');
    for (const collectionName of COLLECTIONS) {
      try {
        const localCount = await localClient.db(DATABASE_NAME).collection(collectionName).countDocuments();
        const atlasCount = await atlasClient.db(DATABASE_NAME).collection(collectionName).countDocuments();
        
        const status = localCount === atlasCount ? '✅' : '⚠️';
        console.log(`   ${status} ${collectionName}: Local=${localCount}, Atlas=${atlasCount}`);
      } catch (error) {
        console.log(`   ❌ ${collectionName}: Error verifying - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    // Close connections
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    console.log('\n🔌 Connections closed');
  }
}

// Run migration
migrateData().catch(console.error);