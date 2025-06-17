import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const folderPath = formData.get('folderPath');
    const asrId = formData.get('asrId');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      );
    }
    
    const publicPath = path.join(process.cwd(), 'public', folderPath);
    
    // Ensure directory exists
    await fs.mkdir(publicPath, { recursive: true });
    
    // Process each file
    const uploadedFiles = [];
    for (const file of files) {
      if (file instanceof File) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create safe filename
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = path.join(publicPath, filename);
        
        // Write file
        await writeFile(filePath, buffer);
        uploadedFiles.push(filename);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}