import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);
const writeFilePromise = promisify(fs.writeFile);
const mkdirPromise = promisify(fs.mkdir);

export async function GET() {
  try {
    await dbConnect();

    // Get MongoDB connection URI
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smr_augment';

    // Parse the URI to get database name
    const dbName = uri.split('/').pop().split('?')[0];

    // Create a temporary directory for the backup
    const tempDir = path.join(os.tmpdir(), 'mongodb-backup-' + Date.now());
    await mkdirPromise(tempDir, { recursive: true });

    // Get all collections in the database
    const collections = await mongoose.connection.db.collections();

    // Create a JSON object to store all collections data
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: dbName,
        collections: collections.map(c => c.collectionName)
      },
      collections: {}
    };

    // For each collection, fetch all documents
    for (const collection of collections) {
      const collectionName = collection.collectionName;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue;
      }

      // Get all documents in the collection
      const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();

      // Process documents to ensure _id is properly serialized
      const processedDocuments = documents.map(doc => {
        // MongoDB ObjectId needs special handling for proper serialization
        if (doc._id && typeof doc._id === 'object' && doc._id.toString) {
          // Create a new document with _id as string to ensure it can be restored properly
          return {
            ...doc,
            _id: doc._id.toString() // Convert ObjectId to string
          };
        }
        return doc;
      });

      // Add to backup data
      backupData.collections[collectionName] = processedDocuments;
    }

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2);

    // Create a filename for the backup
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `mongodb-backup-${dbName}-${timestamp}.json`;

    // Create a blob with the backup data
    const blob = new Blob([backupJson], { type: 'application/json' });

    // Create a response with the file
    const response = new NextResponse(blob);

    // Set headers for file download
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return response;
  } catch (error) {
    console.error('Error creating database backup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create database backup',
        details: error.message
      },
      { status: 500 }
    );
  }
}
