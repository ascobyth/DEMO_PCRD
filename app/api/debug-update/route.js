import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Debug PUT received:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'PUT received successfully',
      receivedData: {
        title: body.requestTitle,
        samplesCount: body.samples?.length || 0,
        methodsCount: body.testMethods?.length || 0
      }
    });
  } catch (error) {
    console.error('Debug PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}