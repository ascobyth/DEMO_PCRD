import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import TestingMethod from '@/models/TestingMethod';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const testMethod = await TestingMethod.findById(id)
      .populate({
        path: 'locationId',
        select: 'locationId sublocation contactPerson'
      })
      .populate({
        path: 'capabilityId',
        select: 'capabilityName shortName'
      });

    if (!testMethod) {
      return NextResponse.json(
        { success: false, error: 'Test method not found' },
        { status: 404 }
      );
    }

    // Log the raw test method data for debugging
    console.log('API: Raw test method data from database (before toObject):', {
      id: testMethod._id,
      locationId: testMethod.locationId,
      locationIdType: typeof testMethod.locationId,
      locationIdIsObject: testMethod.locationId && typeof testMethod.locationId === 'object',
      locationIdHasId: testMethod.locationId && testMethod.locationId._id ? true : false,
      capabilityId: testMethod.capabilityId,
      capabilityIdType: typeof testMethod.capabilityId,
      capabilityIdIsObject: testMethod.capabilityId && typeof testMethod.capabilityId === 'object',
      capabilityIdHasId: testMethod.capabilityId && testMethod.capabilityId._id ? true : false,
    });

    // Process the test method data to ensure image fields are strings
    const processedTestMethod = testMethod.toObject();

    // Log the processed test method data for debugging
    console.log('API: Processed test method data (after toObject):', {
      id: processedTestMethod._id,
      locationId: processedTestMethod.locationId,
      locationIdType: typeof processedTestMethod.locationId,
      locationIdIsObject: processedTestMethod.locationId && typeof processedTestMethod.locationId === 'object',
      locationIdHasId: processedTestMethod.locationId && processedTestMethod.locationId._id ? true : false,
      capabilityId: processedTestMethod.capabilityId,
      capabilityIdType: typeof processedTestMethod.capabilityId,
      capabilityIdIsObject: processedTestMethod.capabilityId && typeof processedTestMethod.capabilityId === 'object',
      capabilityIdHasId: processedTestMethod.capabilityId && processedTestMethod.capabilityId._id ? true : false,
    });

    // Log the raw data from the database
    console.log('API: Raw test method data from database:', {
      descriptionImg: processedTestMethod.descriptionImg,
      keyResultImg: processedTestMethod.keyResultImg,
      images: processedTestMethod.images,
      descriptionImgType: typeof processedTestMethod.descriptionImg,
      keyResultImgType: typeof processedTestMethod.keyResultImg,
      hasDescriptionImgBuffer: processedTestMethod.descriptionImg && processedTestMethod.descriptionImg.buffer ? true : false,
      hasKeyResultImgBuffer: processedTestMethod.keyResultImg && processedTestMethod.keyResultImg.buffer ? true : false
    });

    // Convert Binary objects to base64 strings for client-side processing
    if (processedTestMethod.descriptionImg &&
        typeof processedTestMethod.descriptionImg === 'object' &&
        processedTestMethod.descriptionImg.buffer) {
      try {
        // Convert Binary to base64 string for transmission
        const binaryData = processedTestMethod.descriptionImg.buffer;
        const base64String = Buffer.from(binaryData).toString('base64');

        // Create a special object that indicates this is a Binary object
        processedTestMethod.descriptionImg = {
          _isBinary: true,
          base64Data: base64String,
          subType: processedTestMethod.descriptionImg.subType
        };

        console.log('API: Converted descriptionImg Binary to base64 for transmission');
      } catch (error) {
        console.error('API: Error converting descriptionImg Binary to base64:', error);
        processedTestMethod.descriptionImg = null;
      }
    }

    if (processedTestMethod.keyResultImg &&
        typeof processedTestMethod.keyResultImg === 'object' &&
        processedTestMethod.keyResultImg.buffer) {
      try {
        // Convert Binary to base64 string for transmission
        const binaryData = processedTestMethod.keyResultImg.buffer;
        const base64String = Buffer.from(binaryData).toString('base64');

        // Create a special object that indicates this is a Binary object
        processedTestMethod.keyResultImg = {
          _isBinary: true,
          base64Data: base64String,
          subType: processedTestMethod.keyResultImg.subType
        };

        console.log('API: Converted keyResultImg Binary to base64 for transmission');
      } catch (error) {
        console.error('API: Error converting keyResultImg Binary to base64:', error);
        processedTestMethod.keyResultImg = null;
      }
    }

    // Process images object if it exists
    if (processedTestMethod.images) {
      if (processedTestMethod.images.description &&
          typeof processedTestMethod.images.description === 'object' &&
          processedTestMethod.images.description.buffer) {
        try {
          // Convert Binary to base64 string for transmission
          const binaryData = processedTestMethod.images.description.buffer;
          const base64String = Buffer.from(binaryData).toString('base64');

          // Create a special object that indicates this is a Binary object
          processedTestMethod.images.description = {
            _isBinary: true,
            base64Data: base64String,
            subType: processedTestMethod.images.description.subType
          };

          console.log('API: Converted images.description Binary to base64 for transmission');
        } catch (error) {
          console.error('API: Error converting images.description Binary to base64:', error);
          processedTestMethod.images.description = '';
        }
      }

      if (processedTestMethod.images.keyResult &&
          typeof processedTestMethod.images.keyResult === 'object' &&
          processedTestMethod.images.keyResult.buffer) {
        try {
          // Convert Binary to base64 string for transmission
          const binaryData = processedTestMethod.images.keyResult.buffer;
          const base64String = Buffer.from(binaryData).toString('base64');

          // Create a special object that indicates this is a Binary object
          processedTestMethod.images.keyResult = {
            _isBinary: true,
            base64Data: base64String,
            subType: processedTestMethod.images.keyResult.subType
          };

          console.log('API: Converted images.keyResult Binary to base64 for transmission');
        } catch (error) {
          console.error('API: Error converting images.keyResult Binary to base64:', error);
          processedTestMethod.images.keyResult = '';
        }
      }
    }

    // Process descriptionImg - handle Binary objects and ensure it's a valid path
    if (processedTestMethod.descriptionImg) {
      // Check if it's a Binary object (from MongoDB)
      if (typeof processedTestMethod.descriptionImg === 'object') {
        if (processedTestMethod.descriptionImg.buffer && processedTestMethod.descriptionImg.subType === 0) {
          try {
            // Try to convert Binary to string
            const binaryString = processedTestMethod.descriptionImg.toString();
            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              processedTestMethod.descriptionImg = binaryString;
              console.log('API: Converted Binary descriptionImg to path string:', binaryString);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                if (decoded.startsWith('/uploads/')) {
                  processedTestMethod.descriptionImg = decoded;
                  console.log('API: Decoded base64 descriptionImg to path:', decoded);
                } else {
                  processedTestMethod.descriptionImg = null;
                  console.log('API: Could not decode Binary descriptionImg to valid path');
                }
              } catch (decodeError) {
                processedTestMethod.descriptionImg = null;
                console.log('API: Failed to decode Binary descriptionImg:', decodeError);
              }
            }
          } catch (error) {
            processedTestMethod.descriptionImg = null;
            console.log('API: Error processing Binary descriptionImg:', error);
          }
        } else {
          // For other object types, set to null
          processedTestMethod.descriptionImg = null;
          console.log('API: Set non-Binary object descriptionImg to null');
        }
      } else if (typeof processedTestMethod.descriptionImg === 'string') {
        // If it's a string but not a valid path, try to decode it
        if (!processedTestMethod.descriptionImg.startsWith('/uploads/')) {
          try {
            // Try to decode from base64 if it might be encoded
            const decoded = Buffer.from(processedTestMethod.descriptionImg, 'base64').toString();
            if (decoded.startsWith('/uploads/')) {
              processedTestMethod.descriptionImg = decoded;
              console.log('API: Decoded string descriptionImg to path:', decoded);
            } else {
              processedTestMethod.descriptionImg = null;
              console.log('API: Invalid path string descriptionImg set to null');
            }
          } catch (error) {
            processedTestMethod.descriptionImg = null;
            console.log('API: Failed to decode string descriptionImg:', error);
          }
        }
      }
    }

    // Process keyResultImg - handle Binary objects and ensure it's a valid path
    if (processedTestMethod.keyResultImg) {
      // Check if it's a Binary object (from MongoDB)
      if (typeof processedTestMethod.keyResultImg === 'object') {
        if (processedTestMethod.keyResultImg.buffer && processedTestMethod.keyResultImg.subType === 0) {
          try {
            // Try to convert Binary to string
            const binaryString = processedTestMethod.keyResultImg.toString();
            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              processedTestMethod.keyResultImg = binaryString;
              console.log('API: Converted Binary keyResultImg to path string:', binaryString);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                if (decoded.startsWith('/uploads/')) {
                  processedTestMethod.keyResultImg = decoded;
                  console.log('API: Decoded base64 keyResultImg to path:', decoded);
                } else {
                  processedTestMethod.keyResultImg = null;
                  console.log('API: Could not decode Binary keyResultImg to valid path');
                }
              } catch (decodeError) {
                processedTestMethod.keyResultImg = null;
                console.log('API: Failed to decode Binary keyResultImg:', decodeError);
              }
            }
          } catch (error) {
            processedTestMethod.keyResultImg = null;
            console.log('API: Error processing Binary keyResultImg:', error);
          }
        } else {
          // For other object types, set to null
          processedTestMethod.keyResultImg = null;
          console.log('API: Set non-Binary object keyResultImg to null');
        }
      } else if (typeof processedTestMethod.keyResultImg === 'string') {
        // If it's a string but not a valid path, try to decode it
        if (!processedTestMethod.keyResultImg.startsWith('/uploads/')) {
          try {
            // Try to decode from base64 if it might be encoded
            const decoded = Buffer.from(processedTestMethod.keyResultImg, 'base64').toString();
            if (decoded.startsWith('/uploads/')) {
              processedTestMethod.keyResultImg = decoded;
              console.log('API: Decoded string keyResultImg to path:', decoded);
            } else {
              processedTestMethod.keyResultImg = null;
              console.log('API: Invalid path string keyResultImg set to null');
            }
          } catch (error) {
            processedTestMethod.keyResultImg = null;
            console.log('API: Failed to decode string keyResultImg:', error);
          }
        }
      }
    }

    // Ensure images object exists and has valid paths
    if (!processedTestMethod.images) {
      processedTestMethod.images = { description: '', keyResult: '' };
    } else {
      // Process description image in images object
      if (processedTestMethod.images.description) {
        // Check if it's a Binary object (from MongoDB)
        if (typeof processedTestMethod.images.description === 'object') {
          if (processedTestMethod.images.description.buffer && processedTestMethod.images.description.subType === 0) {
            try {
              // Try to convert Binary to string
              const binaryString = processedTestMethod.images.description.toString();
              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                processedTestMethod.images.description = binaryString;
                console.log('API: Converted Binary images.description to path string:', binaryString);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  if (decoded.startsWith('/uploads/')) {
                    processedTestMethod.images.description = decoded;
                    console.log('API: Decoded base64 images.description to path:', decoded);
                  } else {
                    processedTestMethod.images.description = '';
                    console.log('API: Could not decode Binary images.description to valid path');
                  }
                } catch (decodeError) {
                  processedTestMethod.images.description = '';
                  console.log('API: Failed to decode Binary images.description:', decodeError);
                }
              }
            } catch (error) {
              processedTestMethod.images.description = '';
              console.log('API: Error processing Binary images.description:', error);
            }
          } else {
            // For other object types, set to empty string
            processedTestMethod.images.description = '';
            console.log('API: Set non-Binary object images.description to empty string');
          }
        } else if (typeof processedTestMethod.images.description === 'string') {
          // If it's a string but not a valid path, try to decode it
          if (!processedTestMethod.images.description.startsWith('/uploads/')) {
            try {
              // Try to decode from base64 if it might be encoded
              const decoded = Buffer.from(processedTestMethod.images.description, 'base64').toString();
              if (decoded.startsWith('/uploads/')) {
                processedTestMethod.images.description = decoded;
                console.log('API: Decoded string images.description to path:', decoded);
              } else {
                processedTestMethod.images.description = '';
                console.log('API: Invalid path string images.description set to empty string');
              }
            } catch (error) {
              processedTestMethod.images.description = '';
              console.log('API: Failed to decode string images.description:', error);
            }
          }
        }
      }

      // Process key result image in images object
      if (processedTestMethod.images.keyResult) {
        // Check if it's a Binary object (from MongoDB)
        if (typeof processedTestMethod.images.keyResult === 'object') {
          if (processedTestMethod.images.keyResult.buffer && processedTestMethod.images.keyResult.subType === 0) {
            try {
              // Try to convert Binary to string
              const binaryString = processedTestMethod.images.keyResult.toString();
              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                processedTestMethod.images.keyResult = binaryString;
                console.log('API: Converted Binary images.keyResult to path string:', binaryString);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  if (decoded.startsWith('/uploads/')) {
                    processedTestMethod.images.keyResult = decoded;
                    console.log('API: Decoded base64 images.keyResult to path:', decoded);
                  } else {
                    processedTestMethod.images.keyResult = '';
                    console.log('API: Could not decode Binary images.keyResult to valid path');
                  }
                } catch (decodeError) {
                  processedTestMethod.images.keyResult = '';
                  console.log('API: Failed to decode Binary images.keyResult:', decodeError);
                }
              }
            } catch (error) {
              processedTestMethod.images.keyResult = '';
              console.log('API: Error processing Binary images.keyResult:', error);
            }
          } else {
            // For other object types, set to empty string
            processedTestMethod.images.keyResult = '';
            console.log('API: Set non-Binary object images.keyResult to empty string');
          }
        } else if (typeof processedTestMethod.images.keyResult === 'string') {
          // If it's a string but not a valid path, try to decode it
          if (!processedTestMethod.images.keyResult.startsWith('/uploads/')) {
            try {
              // Try to decode from base64 if it might be encoded
              const decoded = Buffer.from(processedTestMethod.images.keyResult, 'base64').toString();
              if (decoded.startsWith('/uploads/')) {
                processedTestMethod.images.keyResult = decoded;
                console.log('API: Decoded string images.keyResult to path:', decoded);
              } else {
                processedTestMethod.images.keyResult = '';
                console.log('API: Invalid path string images.keyResult set to empty string');
              }
            } catch (error) {
              processedTestMethod.images.keyResult = '';
              console.log('API: Failed to decode string images.keyResult:', error);
            }
          }
        }
      }
    }

    // Update the images object with the current image paths
    if (processedTestMethod.descriptionImg) {
      processedTestMethod.images.description = processedTestMethod.descriptionImg;
    }

    if (processedTestMethod.keyResultImg) {
      processedTestMethod.images.keyResult = processedTestMethod.keyResultImg;
    }

    console.log('API: Final image data for response:', {
      descriptionImg: processedTestMethod.descriptionImg,
      keyResultImg: processedTestMethod.keyResultImg,
      images: processedTestMethod.images
    });

    return NextResponse.json({ success: true, data: processedTestMethod }, { status: 200 });
  } catch (error) {
    console.error('Error fetching test method:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test method' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    console.log('Updating test method with ID:', id);
    console.log('Received body data:', body);

    // The model now handles methodCode/methodcode mapping via virtual field

    // Ensure price fields are stored in the correct format
    // Keep them as strings if that's how they're stored in the database
    if (body.price !== undefined) {
      console.log('Processing price field:', body.price, 'Type:', typeof body.price);
      // If it's a number, convert to string with comma formatting
      if (typeof body.price === 'number') {
        body.price = body.price.toLocaleString('en-US');
        console.log('Converted price to string format:', body.price);
      }
    }

    if (body.priorityPrice !== undefined) {
      console.log('Processing priorityPrice field:', body.priorityPrice, 'Type:', typeof body.priorityPrice);
      // If it's a number, convert to string with comma formatting
      if (typeof body.priorityPrice === 'number') {
        body.priorityPrice = body.priorityPrice.toLocaleString('en-US');
        console.log('Converted priorityPrice to string format:', body.priorityPrice);
      }
    }

    // Process image fields to ensure they are stored as strings
    if (body.descriptionImg && typeof body.descriptionImg === 'object') {
      // If it's an object, try to convert it to a string
      if (body.descriptionImg.buffer && body.descriptionImg.subType === 0) {
        try {
          // Try to convert Binary to string
          const binaryString = body.descriptionImg.toString();
          // Check if it's a base64 encoded path
          if (binaryString.startsWith('/uploads/')) {
            body.descriptionImg = binaryString;
            console.log('API: Converted Binary descriptionImg to path string for update:', binaryString);
          } else {
            // Try to decode from base64 if it might be encoded
            try {
              const decoded = Buffer.from(binaryString, 'base64').toString();
              if (decoded.startsWith('/uploads/')) {
                body.descriptionImg = decoded;
                console.log('API: Decoded base64 descriptionImg to path for update:', decoded);
              } else {
                body.descriptionImg = null;
                console.log('API: Could not decode Binary descriptionImg to valid path for update');
              }
            } catch (decodeError) {
              body.descriptionImg = null;
              console.log('API: Failed to decode Binary descriptionImg for update:', decodeError);
            }
          }
        } catch (error) {
          body.descriptionImg = null;
          console.log('API: Error processing Binary descriptionImg for update:', error);
        }
      } else {
        // For other object types, set to null
        body.descriptionImg = null;
        console.log('API: Set non-Binary object descriptionImg to null for update');
      }
    }

    if (body.keyResultImg && typeof body.keyResultImg === 'object') {
      // If it's an object, try to convert it to a string
      if (body.keyResultImg.buffer && body.keyResultImg.subType === 0) {
        try {
          // Try to convert Binary to string
          const binaryString = body.keyResultImg.toString();
          // Check if it's a base64 encoded path
          if (binaryString.startsWith('/uploads/')) {
            body.keyResultImg = binaryString;
            console.log('API: Converted Binary keyResultImg to path string for update:', binaryString);
          } else {
            // Try to decode from base64 if it might be encoded
            try {
              const decoded = Buffer.from(binaryString, 'base64').toString();
              if (decoded.startsWith('/uploads/')) {
                body.keyResultImg = decoded;
                console.log('API: Decoded base64 keyResultImg to path for update:', decoded);
              } else {
                body.keyResultImg = null;
                console.log('API: Could not decode Binary keyResultImg to valid path for update');
              }
            } catch (decodeError) {
              body.keyResultImg = null;
              console.log('API: Failed to decode Binary keyResultImg for update:', decodeError);
            }
          }
        } catch (error) {
          body.keyResultImg = null;
          console.log('API: Error processing Binary keyResultImg for update:', error);
        }
      } else {
        // For other object types, set to null
        body.keyResultImg = null;
        console.log('API: Set non-Binary object keyResultImg to null for update');
      }
    }

    // Process images object if it exists
    if (body.images) {
      if (body.images.description && typeof body.images.description === 'object') {
        // If it's an object, try to convert it to a string
        if (body.images.description.buffer && body.images.description.subType === 0) {
          try {
            // Try to convert Binary to string
            const binaryString = body.images.description.toString();
            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              body.images.description = binaryString;
              console.log('API: Converted Binary images.description to path string for update:', binaryString);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                if (decoded.startsWith('/uploads/')) {
                  body.images.description = decoded;
                  console.log('API: Decoded base64 images.description to path for update:', decoded);
                } else {
                  body.images.description = '';
                  console.log('API: Could not decode Binary images.description to valid path for update');
                }
              } catch (decodeError) {
                body.images.description = '';
                console.log('API: Failed to decode Binary images.description for update:', decodeError);
              }
            }
          } catch (error) {
            body.images.description = '';
            console.log('API: Error processing Binary images.description for update:', error);
          }
        } else {
          // For other object types, set to empty string
          body.images.description = '';
          console.log('API: Set non-Binary object images.description to empty string for update');
        }
      }

      if (body.images.keyResult && typeof body.images.keyResult === 'object') {
        // If it's an object, try to convert it to a string
        if (body.images.keyResult.buffer && body.images.keyResult.subType === 0) {
          try {
            // Try to convert Binary to string
            const binaryString = body.images.keyResult.toString();
            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              body.images.keyResult = binaryString;
              console.log('API: Converted Binary images.keyResult to path string for update:', binaryString);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                if (decoded.startsWith('/uploads/')) {
                  body.images.keyResult = decoded;
                  console.log('API: Decoded base64 images.keyResult to path for update:', decoded);
                } else {
                  body.images.keyResult = '';
                  console.log('API: Could not decode Binary images.keyResult to valid path for update');
                }
              } catch (decodeError) {
                body.images.keyResult = '';
                console.log('API: Failed to decode Binary images.keyResult for update:', decodeError);
              }
            }
          } catch (error) {
            body.images.keyResult = '';
            console.log('API: Error processing Binary images.keyResult for update:', error);
          }
        } else {
          // For other object types, set to empty string
          body.images.keyResult = '';
          console.log('API: Set non-Binary object images.keyResult to empty string for update');
        }
      }
    }

    // Handle locationId field
    console.log('API: Processing locationId:', body.locationId, 'Type:', typeof body.locationId);

    if (body.locationId === "none" || body.locationId === "") {
      // If locationId is "none" or empty, set it to null
      body.locationId = null;
      console.log('API: Set locationId to null because it was "none" or empty');
    } else if (body.locationId) {
      // Try to convert to string if it's an object
      if (typeof body.locationId === 'object') {
        if (body.locationId._id) {
          body.locationId = body.locationId._id.toString();
          console.log('API: Extracted _id from locationId object:', body.locationId);
        } else if (body.locationId.id) {
          body.locationId = body.locationId.id.toString();
          console.log('API: Extracted id from locationId object:', body.locationId);
        } else {
          body.locationId = null;
          console.log('API: Set locationId to null because object had no _id or id');
        }
      }

      // Now check if it's a valid ObjectId string
      if (body.locationId && mongoose.Types.ObjectId.isValid(body.locationId)) {
        try {
          body.locationId = new mongoose.Types.ObjectId(body.locationId);
          console.log('API: Converted locationId string to ObjectId:', body.locationId);
        } catch (error) {
          console.error('API: Error converting locationId to ObjectId:', error);
          body.locationId = null;
        }
      } else if (body.locationId) {
        console.log('API: Invalid ObjectId for locationId:', body.locationId);
        body.locationId = null;
      }
    }

    // Handle capabilityId field
    console.log('API: Processing capabilityId:', body.capabilityId, 'Type:', typeof body.capabilityId);

    if (body.capabilityId === "" || body.capabilityId === undefined || body.capabilityId === "none") {
      // If capabilityId is empty, undefined, or "none", set it to null
      body.capabilityId = null;
      console.log('API: Set capabilityId to null because it was empty, undefined, or "none"');
    } else if (body.capabilityId) {
      // Try to convert to string if it's an object
      if (typeof body.capabilityId === 'object') {
        if (body.capabilityId._id) {
          body.capabilityId = body.capabilityId._id.toString();
          console.log('API: Extracted _id from capabilityId object:', body.capabilityId);
        } else if (body.capabilityId.id) {
          body.capabilityId = body.capabilityId.id.toString();
          console.log('API: Extracted id from capabilityId object:', body.capabilityId);
        } else {
          body.capabilityId = null;
          console.log('API: Set capabilityId to null because object had no _id or id');
        }
      }

      // Now check if it's a valid ObjectId string
      if (body.capabilityId && mongoose.Types.ObjectId.isValid(body.capabilityId)) {
        try {
          body.capabilityId = new mongoose.Types.ObjectId(body.capabilityId);
          console.log('API: Converted capabilityId string to ObjectId:', body.capabilityId);
        } catch (error) {
          console.error('API: Error converting capabilityId to ObjectId:', error);
          body.capabilityId = null;
        }
      } else if (body.capabilityId) {
        console.log('API: Invalid ObjectId for capabilityId:', body.capabilityId);
        body.capabilityId = null;
      }
    }

    // Log the final capabilityId value
    console.log('API: Final capabilityId value:', body.capabilityId);

    console.log('Processed update data:', body);

    const testMethod = await TestingMethod.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!testMethod) {
      return NextResponse.json(
        { success: false, error: 'Test method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: testMethod }, { status: 200 });
  } catch (error) {
    console.error('Error updating test method:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A test method with that code already exists' },
        { status: 400 }
      );
    }

    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid ${error.path} value: ${error.value}. Please provide a valid ID.`,
          details: {
            path: error.path,
            value: error.value,
            kind: error.kind
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update test method',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const testMethod = await TestingMethod.findByIdAndDelete(id);

    if (!testMethod) {
      return NextResponse.json(
        { success: false, error: 'Test method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('Error deleting test method:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test method' },
      { status: 500 }
    );
  }
}
