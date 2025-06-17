import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongoose';
const TestingSampleList = require('@/models/TestingSampleList');

export async function POST(request) {
  console.log('Upload test results API called');
  console.log('Request method:', request.method);
  
  try {
    await dbConnect();
    console.log('Database connected successfully');

    const formData = await request.formData();
    const file = formData.get('file');
    const testingListId = formData.get('testingListId');
    const requestNumber = formData.get('requestNumber');
    
    console.log('Upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      testingListId,
      requestNumber
    });

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    if (!testingListId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Testing list ID is required' 
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size must be less than 10MB' 
      }, { status: 400 });
    }

    // Validate file type - expanded to include images and CSV
    const allowedTypes = [
      // PDF
      'application/pdf',
      // Word documents
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel files
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // CSV files
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/tiff',
      // Generic types (browsers sometimes report these)
      'application/octet-stream',
      'application/x-zip-compressed',
      'application/zip',
      'text/plain' // Sometimes for CSV
    ];

    const allowedExtensions = [
      '.pdf', 
      '.doc', '.docx', 
      '.xls', '.xlsx',
      '.csv',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'
    ];
    
    const fileExtension = path.extname(file.name).toLowerCase();
    console.log('File validation - Name:', file.name, 'Type:', file.type, 'Extension:', fileExtension);

    // Check file extension first (more reliable than MIME type)
    if (!allowedExtensions.includes(fileExtension)) {
      console.log('File rejected - Invalid extension:', fileExtension);
      return NextResponse.json({ 
        success: false, 
        error: `Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, CSV, and images (JPG, PNG, GIF, BMP, WEBP, TIFF). (File: ${file.name})` 
      }, { status: 400 });
    }

    // If extension is valid, check MIME type (but be more lenient)
    if (!allowedTypes.includes(file.type) && file.type !== '') {
      console.log('Warning - Uncommon MIME type but valid extension:', file.type, 'for', fileExtension);
      // Allow it but log the warning - some browsers report unusual MIME types
    }

    // Get testing sample to get method code
    const testingSample = await TestingSampleList.findOne({ testingListId });
    if (!testingSample) {
      return NextResponse.json({ 
        success: false, 
        error: 'Testing sample not found' 
      }, { status: 404 });
    }

    // Create folder structure: /public/testresults/[year]/[requestNumber]/[methodCode]
    const currentYear = new Date().getFullYear().toString();
    const methodCode = testingSample.methodCode || 'unknown';
    const uploadDir = path.join(
      process.cwd(), 
      'public', 
      'testresults', 
      currentYear, 
      requestNumber, 
      methodCode
    );

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`Created directory structure: ${uploadDir}`);
    }

    // Create unique filename using timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileId = `${timestamp}-${randomString}`;
    const filename = `${fileId}${fileExtension}`;

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    console.log('Writing file to:', filePath);
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      console.log('File written successfully');
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      throw new Error(`Failed to write file: ${writeError.message}`);
    }

    // Create relative path for database storage
    const relativePath = `/testresults/${currentYear}/${requestNumber}/${methodCode}/${filename}`;
    console.log('File saved at relative path:', relativePath);

    // Create file info object
    const newFile = {
      filename: file.name,
      fileId: fileId,
      filePath: relativePath,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date()
    };

    // First update the specific sample - add to attachedFiles array
    const updatedSample = await TestingSampleList.findOneAndUpdate(
      { testingListId },
      {
        $push: { attachedFiles: newFile },
        // Also update legacy fields for backward compatibility
        attachedFileName: file.name,
        attachedFileId: fileId,
        attachedFilePath: relativePath,
        attachedFileSize: file.size,
        attachedFileType: file.type,
        attachedFileDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedSample) {
      // Remove uploaded file if database update fails
      await unlink(filePath);
      return NextResponse.json({ 
        success: false, 
        error: 'Testing sample not found' 
      }, { status: 404 });
    }

    // Also update all other samples with the same methodCode and requestNumber
    // This ensures all samples in the same method group share the same files
    await TestingSampleList.updateMany(
      { 
        requestNumber: updatedSample.requestNumber,
        methodCode: updatedSample.methodCode,
        testingListId: { $ne: testingListId } // Exclude the already updated sample
      },
      {
        $push: { attachedFiles: newFile },
        // Also update legacy fields for backward compatibility with last uploaded file
        attachedFileName: file.name,
        attachedFileId: fileId,
        attachedFilePath: relativePath,
        attachedFileSize: file.size,
        attachedFileType: file.type,
        attachedFileDate: new Date(),
        updatedAt: new Date()
      }
    );

    console.log(`Added file to all samples with methodCode: ${updatedSample.methodCode}`);

    return NextResponse.json({
      success: true,
      fileId,
      filename: file.name,
      size: file.size,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading test result:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to upload file',
      details: error.toString(),
      type: error.name || 'UnknownError'
    }, { status: 500 });
  }
}

