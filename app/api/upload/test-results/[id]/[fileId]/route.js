import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongoose';
const TestingSampleList = require('@/models/TestingSampleList');

// DELETE endpoint to remove uploaded file
export async function DELETE(request, { params }) {
  console.log('Delete test results API called');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    await dbConnect();
    console.log('Database connected');

    const { fileId } = await params;
    console.log('FileId from params:', fileId);
    
    const body = await request.json();
    const { testingListId, methodCode } = body;
    console.log('Request body:', { testingListId, methodCode });

    if (!fileId || !testingListId) {
      return NextResponse.json({ 
        success: false, 
        error: 'File ID and Testing list ID are required' 
      }, { status: 400 });
    }

    // Find the testing sample
    const sample = await TestingSampleList.findOne({ 
      testingListId,
      'attachedFiles.fileId': fileId 
    });

    if (!sample) {
      return NextResponse.json({ 
        success: false, 
        error: 'File not found' 
      }, { status: 404 });
    }

    // Find the specific file info
    const fileToDelete = sample.attachedFiles.find(f => f.fileId === fileId);
    if (!fileToDelete) {
      return NextResponse.json({ 
        success: false, 
        error: 'File not found in attachedFiles' 
      }, { status: 404 });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', fileToDelete.filePath);
    console.log('Deleting file from:', filePath);
    
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log('File deleted from disk');
    }

    // Remove file from attachedFiles array for this sample
    const updatedSample = await TestingSampleList.findOneAndUpdate(
      { testingListId },
      {
        $pull: { attachedFiles: { fileId: fileId } },
        updatedAt: new Date()
      },
      { new: true }
    );

    // Also remove file from all other samples with the same methodCode and requestNumber
    if (updatedSample && methodCode) {
      await TestingSampleList.updateMany(
        { 
          requestNumber: updatedSample.requestNumber,
          methodCode: methodCode,
          testingListId: { $ne: testingListId }
        },
        {
          $pull: { attachedFiles: { fileId: fileId } },
          updatedAt: new Date()
        }
      );
    }

    // Update legacy fields if no more files exist
    const remainingSample = await TestingSampleList.findOne({ testingListId });
    if (remainingSample && (!remainingSample.attachedFiles || remainingSample.attachedFiles.length === 0)) {
      await TestingSampleList.updateMany(
        { 
          requestNumber: remainingSample.requestNumber,
          methodCode: remainingSample.methodCode
        },
        {
          $unset: {
            attachedFileName: '',
            attachedFileId: '',
            attachedFilePath: '',
            attachedFileSize: '',
            attachedFileType: '',
            attachedFileDate: ''
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File removed successfully'
    });

  } catch (error) {
    console.error('Error removing test result:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove file',
      details: error.message
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET(request, { params }) {
  const { fileId } = await params;
  return NextResponse.json({
    message: 'DELETE endpoint is accessible',
    fileId,
    method: 'GET'
  });
}