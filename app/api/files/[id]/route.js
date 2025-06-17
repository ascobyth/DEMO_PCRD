import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Retrieving file with path:', id);

    // Check if the ID is empty or undefined
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Empty or invalid file path:', id);
      return NextResponse.json(
        { success: false, error: 'Empty or invalid file path' },
        { status: 400 }
      );
    }

    // If the path starts with /uploads/, it's already a relative path
    let filePath;
    if (id.startsWith('/uploads/')) {
      // Remove the leading slash to make it relative to the public directory
      filePath = path.join(process.cwd(), 'public', id);
    } else {
      // Otherwise, assume it's a filename in the uploads directory
      filePath = path.join(process.cwd(), 'public', 'uploads', id);
    }

    console.log('Attempting to read file from:', filePath);

    try {
      // Read the file
      const fileBuffer = await readFile(filePath);

      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream'; // Default content type

      // Map common extensions to content types
      const contentTypeMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
      };

      if (contentTypeMap[ext]) {
        contentType = contentTypeMap[ext];
      }

      console.log('File read successfully, size:', fileBuffer.length, 'Content-Type:', contentType);

      // Create a response with the file data
      const response = new NextResponse(fileBuffer);

      // Set the content type
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);

      // Add cache control headers
      response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      return response;
    } catch (error) {
      console.error('Error reading file:', error);

      // If the file doesn't exist, return a 404
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }

      // For other errors, return a 500
      return NextResponse.json(
        { success: false, error: 'Failed to read file', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve file', details: error.message },
      { status: 500 }
    );
  }
}
