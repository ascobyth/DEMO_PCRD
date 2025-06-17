import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await dbConnect();

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No backup file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== 'application/json') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JSON backup files are supported.' },
        { status: 400 }
      );
    }

    // Read the file content
    const fileContent = await file.text();
    let backupData;

    try {
      backupData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup file format. The file is not valid JSON.' },
        { status: 400 }
      );
    }

    // Validate backup data structure
    if (!backupData.metadata || !backupData.collections) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup file format. Missing required metadata or collections.' },
        { status: 400 }
      );
    }

    // Get the admin password from form data
    const adminPassword = formData.get('adminPassword');

    // Validate admin password (this should be more secure in a real application)
    if (adminPassword !== '1133557799') {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // Restore each collection
    const results = [];

    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      try {
        // Skip system collections
        if (collectionName.startsWith('system.')) {
          continue;
        }

        const collection = mongoose.connection.db.collection(collectionName);

        // Drop the existing collection
        await collection.drop().catch(() => {
          // Ignore error if collection doesn't exist
        });

        // Insert the documents if there are any
        if (documents && documents.length > 0) {
          // Process documents to ensure _id is properly converted to ObjectId
          const processedDocuments = documents.map(doc => {
            // Create a new document object to avoid modifying the original
            const newDoc = { ...doc };

            // If _id exists as a string, convert it to ObjectId
            if (newDoc._id && typeof newDoc._id === 'string') {
              try {
                newDoc._id = new mongoose.Types.ObjectId(newDoc._id);
              } catch (err) {
                console.warn(`Could not convert _id ${newDoc._id} to ObjectId, using as is`);
              }
            }

            return newDoc;
          });

          // Use ordered: false to continue processing even if some documents fail
          await collection.insertMany(processedDocuments, { ordered: false });
        }

        results.push({
          collection: collectionName,
          status: 'success',
          count: documents.length
        });
      } catch (error) {
        console.error(`Error restoring collection ${collectionName}:`, error);
        results.push({
          collection: collectionName,
          status: 'error',
          error: error.message
        });
      }
    }

    // Return success response with results
    return NextResponse.json({
      success: true,
      message: 'Database restored successfully',
      timestamp: new Date().toISOString(),
      results
    }, { status: 200 });
  } catch (error) {
    console.error('Error restoring database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to restore database',
        details: error.message
      },
      { status: 500 }
    );
  }
}
