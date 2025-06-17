const { MongoClient } = require('mongodb');

async function listDatabases() {
  const uri = 'mongodb://localhost:27017/smr_augment';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    
    // List databases
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:');
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    
    // List collections in the smr_augment database
    const db = client.db('smr_augment');
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in smr_augment database:');
    collections.forEach(collection => console.log(` - ${collection.name}`));
    
    // Check the documents in the first collection (if any)
    if (collections.length > 0) {
      const firstCollection = collections[0].name;
      const documents = await db.collection(firstCollection).find({}).limit(5).toArray();
      console.log(`\nSample documents from ${firstCollection} collection:`);
      console.log(JSON.stringify(documents, null, 2));
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

listDatabases().catch(console.error);
