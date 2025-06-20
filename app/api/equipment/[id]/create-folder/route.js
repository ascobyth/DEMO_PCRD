import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import ErList from '@/models/ErList';
import fs from 'fs';
import path from 'path';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    // Find ER request
    const erRequest = await ErList.findOne({ requestNumber: id });
    
    if (!erRequest) {
      return NextResponse.json(
        { success: false, error: 'ER request not found' },
        { status: 404 }
      );
    }
    
    // Create folder structure similar to NTR
    const year = new Date().getFullYear();
    const folderPath = path.join(process.cwd(), 'public', 'erresults', year.toString(), id);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      
      // Create a README file in the folder
      const readmeContent = `# ER Results - ${id}

## Request Information
- Request ID: ${id}
- Title: ${erRequest.requestTitle}
- Requester: ${erRequest.requesterName}
- Created: ${new Date(erRequest.createdAt).toLocaleDateString()}

## Equipment Information
${erRequest.jsonEquipmentList ? JSON.parse(erRequest.jsonEquipmentList).map(eq => 
  `- ${eq.equipmentName} (${eq.reservationDate} ${eq.startTime}-${eq.endTime})`
).join('\n') : 'No equipment information available'}

## Results
Place your test results and reports in this folder.
`;
      
      fs.writeFileSync(path.join(folderPath, 'README.md'), readmeContent);
    }
    
    // Return the relative path for web access
    const webPath = `/erresults/${year}/${id}`;
    
    return NextResponse.json({
      success: true,
      folderPath: webPath,
      message: 'Results folder created successfully'
    });
  } catch (error) {
    console.error('Error creating results folder:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}