import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectToDatabase, { mongoose } from '@/lib/db';

const AsrList = mongoose.models.AsrList || require('@/models/AsrList');

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { asrId, asrNumber, folderPath } = body;
    
    if (!asrId || !asrNumber || !folderPath) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the folder path
    const publicPath = path.join(process.cwd(), 'public', folderPath);
    
    // Create directory if it doesn't exist
    await fs.mkdir(publicPath, { recursive: true });
    
    // Update ASR with the folder path
    await AsrList.findByIdAndUpdate(asrId, {
      asrLink: folderPath
    });
    
    // Create a README file in the folder
    const readmeContent = `# ASR Results - ${asrNumber}

This folder contains results and documents for ASR ${asrNumber}.

Created on: ${new Date().toISOString()}
`;
    
    await fs.writeFile(path.join(publicPath, 'README.md'), readmeContent);
    
    return NextResponse.json({
      success: true,
      message: 'Folder initialized successfully',
      folderPath
    });
  } catch (error) {
    console.error('Error initializing folder:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize folder' },
      { status: 500 }
    );
  }
}