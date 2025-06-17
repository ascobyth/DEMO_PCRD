import { NextResponse } from 'next/server';

export async function PUT(request) {
  console.log('Test PUT endpoint hit');
  
  try {
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Test PUT successful',
      receivedData: {
        title: body.requestTitle,
        hasBody: !!body,
        bodyKeys: Object.keys(body)
      }
    });
  } catch (error) {
    console.error('Test PUT error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}