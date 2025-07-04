import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import TestingMethod from '@/models/TestingMethod';

export async function GET() {
  try {
    await dbConnect();
    // Try to fetch test methods with population, but handle the case where related models don't exist
    let testMethods;
    try {
      testMethods = await TestingMethod.find({})
        .populate({
          path: 'locationId',
          select: 'locationId sublocation contactPerson'
        })
        .populate({
          path: 'capabilityId',
          select: 'capabilityName shortName'
        })
        .sort({ methodcode: 1 });
    } catch (error) {
      console.warn('Error populating test methods:', error.message);
      // Fall back to fetching without population
      testMethods = await TestingMethod.find({}).sort({ methodcode: 1 });
    }

    // Transform and fix field names
    const transformedMethods = testMethods.map(method => {
      // Get the raw document to bypass virtuals
      const rawDoc = method.toObject ? method.toObject({ virtuals: false }) : method;
      const methodObj = { ...rawDoc };
      
      // Keep methodcode as is - do not transform
      
      // Ensure the images object exists
      if (!methodObj.images) {
        methodObj.images = { description: '', keyResult: '' };
      }

      // If descriptionImg exists but images.description doesn't, copy it over
      if (methodObj.descriptionImg && !methodObj.images.description) {
        methodObj.images.description = methodObj.descriptionImg;
      }

      // If keyResultImg exists but images.keyResult doesn't, copy it over
      if (methodObj.keyResultImg && !methodObj.images.keyResult) {
        methodObj.images.keyResult = methodObj.keyResultImg;
      }

      console.log(`API: Test method ${methodObj.methodcode} data:`, {
        methodcode: methodObj.methodcode,
        price: methodObj.price,
        priorityPrice: methodObj.priorityPrice,
        testingName: methodObj.testingName,
        equipmentName: methodObj.equipmentName,
        equipmentId: methodObj.equipmentId
      });
      
      
      return methodObj;
    });

    return NextResponse.json({ success: true, data: transformedMethods }, { status: 200 });
  } catch (error) {
    console.error('Error fetching test methods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test methods' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Ensure methodcode exists (required field)
    if (!body.methodcode) {
      return NextResponse.json(
        { success: false, error: 'Method code is required' },
        { status: 400 }
      );
    }
    
    // Ensure testingName exists (required field)
    if (!body.testingName) {
      return NextResponse.json(
        { success: false, error: 'Testing name is required' },
        { status: 400 }
      );
    }

    // Ensure the images object exists
    if (!body.images) {
      body.images = { description: '', keyResult: '' };
    }

    // If descriptionImg exists but images.description doesn't, copy it over
    if (body.descriptionImg && !body.images.description) {
      body.images.description = body.descriptionImg;
    }

    // If keyResultImg exists but images.keyResult doesn't, copy it over
    if (body.keyResultImg && !body.images.keyResult) {
      body.images.keyResult = body.keyResultImg;
    }

    // Handle empty capability field
    if (body.capabilityId === "" || body.capabilityId === "none") {
      body.capabilityId = null;
    }

    // Create a new test method
    const testMethod = await TestingMethod.create(body);

    return NextResponse.json({ success: true, data: testMethod }, { status: 201 });
  } catch (error) {
    console.error('Error creating test method:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));
      console.error('Validation errors:', validationErrors);
      return NextResponse.json(
        { 
          success: false, 
          error: validationErrors.map(e => e.message).join(', '),
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue ? error.keyValue[field] : 'unknown';
      return NextResponse.json(
        { 
          success: false, 
          error: `A test method with ${field} "${value}" already exists`,
          details: { field, value, keyPattern: error.keyPattern, keyValue: error.keyValue }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create test method',
        details: { name: error.name, message: error.message }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const dropAll = searchParams.get('dropAll') === 'true';
    
    if (dropAll) {
      // Delete all test methods
      const result = await TestingMethod.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} test methods` 
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting test methods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test methods' },
      { status: 500 }
    );
  }
}
