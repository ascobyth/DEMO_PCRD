import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('folder');
    
    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      );
    }
    
    const publicPath = path.join(process.cwd(), 'public', folderPath);
    
    // Check if directory exists
    try {
      await fs.access(publicPath);
    } catch {
      return NextResponse.json({
        success: true,
        files: []
      });
    }
    
    // Read directory contents
    const files = await fs.readdir(publicPath);
    
    // Filter out directories and get only file names
    const fileList = [];
    for (const file of files) {
      const filePath = path.join(publicPath, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        fileList.push(file);
      }
    }
    
    return NextResponse.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to read files' },
      { status: 500 }
    );
  }
}