import mongoose from 'mongoose';

// Cache the MongoDB connection to avoid creating multiple connections
let cachedConnection = null;

/**
 * Connect to MongoDB and cache the connection
 * @returns {Promise<mongoose.Connection>} The MongoDB connection
 */
async function connectToDatabase() {
  // If we already have a connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Set mongoose options
  mongoose.set('strictQuery', false);

  // Get MongoDB URI from environment variable or use default
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smr_augment';

  try {
    // Create a new connection
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('Connected to MongoDB:', MONGODB_URI);

    // Ensure all models are loaded
    require('../models/RequestList');
    require('../models/TestingSampleList');
    require('../models/AsrList');
    require('../models/Capability');

    // Cache the connection
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

// Export the mongoose instance as well for direct access to models
export { mongoose };
export default connectToDatabase;
