import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the upload directory path
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const testMethodImgDir = path.join(uploadDir, 'testmethod_img');
const equipmentImgDir = path.join(uploadDir, 'equipment_img');

export async function POST(request) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    // Get the file type parameter (testmethod_img, equipment_img, or default)
    const fileType = formData.get('fileType') || 'default';

    if (!file) {
      console.error('No file provided in upload request');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file information
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File size exceeds limit:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check file type (only allow images)
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Determine which directory to use based on fileType
    let targetDir = uploadDir;
    let subDir = '';

    if (fileType === 'testmethod_img') {
      targetDir = testMethodImgDir;
      subDir = 'testmethod_img/';
    } else if (fileType === 'equipment_img') {
      targetDir = equipmentImgDir;
      subDir = 'equipment_img/';
    }

    // Ensure the target directory exists
    try {
      await mkdir(targetDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('Error creating upload directory:', err);
        return NextResponse.json(
          { success: false, error: 'Failed to create upload directory' },
          { status: 500 }
        );
      }
    }

    // Generate a unique filename to prevent collisions
    const fileExtension = path.extname(file.name);
    const uniqueId = uuidv4();
    const uniqueFilename = `${uniqueId}${fileExtension}`;
    const filePath = path.join(targetDir, uniqueFilename);

    // Convert the file to a buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create a relative path for the file (for use in URLs)
    const relativePath = `/uploads/${subDir}${uniqueFilename}`;

    console.log('File uploaded successfully:', {
      path: relativePath,
      filename: file.name,
      size: buffer.length
    });

    // Return the file path and metadata
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      // For backward compatibility with existing code
      fileId: relativePath,
      originalFilename: file.name,
      size: buffer.length,
      contentType: file.type
    }, { status: 201 });
  } catch (error) {
    console.error('Error in file upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}
