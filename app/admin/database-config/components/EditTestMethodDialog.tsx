"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import TestMethodForm from "./TestMethodForm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface EditTestMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTestMethodUpdated: (testMethod: any) => void
  testMethodData: any
}

export default function EditTestMethodDialog({
  open,
  onOpenChange,
  onTestMethodUpdated,
  testMethodData
}: EditTestMethodDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [processedData, setProcessedData] = useState<any>(null)

  // Process the test method data before passing it to the form
  useEffect(() => {
    if (testMethodData) {
      console.log('Processing test method data for edit:', testMethodData);

      // Create a clean copy of the data
      const cleanData = { ...testMethodData };

      // Log all keys in the testMethodData object to see what's available
      console.log('Available keys in raw testMethodData:', Object.keys(testMethodData));

      // Process image fields to ensure they're strings
      console.log('Raw descriptionImg before processing:', cleanData.descriptionImg, 'Type:', typeof cleanData.descriptionImg);

      if (cleanData.descriptionImg) {
        if (typeof cleanData.descriptionImg === 'object') {
          if (cleanData.descriptionImg === null) {
            // If it's null, keep it as null
            console.log('descriptionImg is null');
          } else if (cleanData.descriptionImg.buffer && cleanData.descriptionImg.subType === 0) {
            // If it's a Binary object, try to convert it to a string
            try {
              // Try to convert Binary to string
              const binaryString = cleanData.descriptionImg.toString();
              console.log('Binary toString result for descriptionImg:', binaryString);

              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                cleanData.descriptionImg = binaryString;
                console.log('Binary object contains a direct path for descriptionImg:', cleanData.descriptionImg);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  console.log('Decoded base64 result for descriptionImg:', decoded);

                  if (decoded.startsWith('/uploads/')) {
                    cleanData.descriptionImg = decoded;
                    console.log('Successfully decoded Binary to path for descriptionImg:', cleanData.descriptionImg);
                  } else {
                    console.error('Decoded Binary does not contain a valid path for descriptionImg:', decoded);
                    cleanData.descriptionImg = null;
                  }
                } catch (decodeError) {
                  console.error('Failed to decode Binary for descriptionImg:', decodeError);
                  cleanData.descriptionImg = null;
                }
              }
            } catch (error) {
              console.error('Error processing Binary object for descriptionImg:', error);
              cleanData.descriptionImg = null;
            }
          } else if (cleanData.descriptionImg._id) {
            // If it's an ObjectId, convert to string
            cleanData.descriptionImg = cleanData.descriptionImg._id.toString();
            console.log('Converted descriptionImg from ObjectId to string:', cleanData.descriptionImg);
          } else {
            // For any other object, set to null
            console.log('descriptionImg is an object without _id property or buffer, setting to null');
            cleanData.descriptionImg = null;
          }
        } else if (typeof cleanData.descriptionImg === 'string') {
          // If it's already a string, keep it
          console.log('descriptionImg is already a string:', cleanData.descriptionImg);
        } else {
          // For any other type, set to null
          console.log('descriptionImg is an unsupported type, setting to null');
          cleanData.descriptionImg = null;
        }
      }

      console.log('Raw keyResultImg before processing:', cleanData.keyResultImg, 'Type:', typeof cleanData.keyResultImg);

      if (cleanData.keyResultImg) {
        if (typeof cleanData.keyResultImg === 'object') {
          if (cleanData.keyResultImg === null) {
            // If it's null, keep it as null
            console.log('keyResultImg is null');
          } else if (cleanData.keyResultImg.buffer && cleanData.keyResultImg.subType === 0) {
            // If it's a Binary object, try to convert it to a string
            try {
              // Try to convert Binary to string
              const binaryString = cleanData.keyResultImg.toString();
              console.log('Binary toString result for keyResultImg:', binaryString);

              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                cleanData.keyResultImg = binaryString;
                console.log('Binary object contains a direct path for keyResultImg:', cleanData.keyResultImg);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  console.log('Decoded base64 result for keyResultImg:', decoded);

                  if (decoded.startsWith('/uploads/')) {
                    cleanData.keyResultImg = decoded;
                    console.log('Successfully decoded Binary to path for keyResultImg:', cleanData.keyResultImg);
                  } else {
                    console.error('Decoded Binary does not contain a valid path for keyResultImg:', decoded);
                    cleanData.keyResultImg = null;
                  }
                } catch (decodeError) {
                  console.error('Failed to decode Binary for keyResultImg:', decodeError);
                  cleanData.keyResultImg = null;
                }
              }
            } catch (error) {
              console.error('Error processing Binary object for keyResultImg:', error);
              cleanData.keyResultImg = null;
            }
          } else if (cleanData.keyResultImg._id) {
            // If it's an ObjectId, convert to string
            cleanData.keyResultImg = cleanData.keyResultImg._id.toString();
            console.log('Converted keyResultImg from ObjectId to string:', cleanData.keyResultImg);
          } else {
            // For any other object, set to null
            console.log('keyResultImg is an object without _id property or buffer, setting to null');
            cleanData.keyResultImg = null;
          }
        } else if (typeof cleanData.keyResultImg === 'string') {
          // If it's already a string, keep it
          console.log('keyResultImg is already a string:', cleanData.keyResultImg);
        } else {
          // For any other type, set to null
          console.log('keyResultImg is an unsupported type, setting to null');
          cleanData.keyResultImg = null;
        }
      }

      // Ensure the images object is properly initialized and processed
      if (!cleanData.images) {
        cleanData.images = { description: '', keyResult: '' };
      } else {
        // Process description image in images object
        if (cleanData.images.description) {
          if (typeof cleanData.images.description === 'object') {
            if (cleanData.images.description.buffer && cleanData.images.description.subType === 0) {
              // If it's a Binary object, try to convert it to a string
              try {
                // Try to convert Binary to string
                const binaryString = cleanData.images.description.toString();
                console.log('Binary toString result for images.description:', binaryString);

                // Check if it's a base64 encoded path
                if (binaryString.startsWith('/uploads/')) {
                  cleanData.images.description = binaryString;
                  console.log('Binary object contains a direct path for images.description:', cleanData.images.description);
                } else {
                  // Try to decode from base64 if it might be encoded
                  try {
                    const decoded = Buffer.from(binaryString, 'base64').toString();
                    console.log('Decoded base64 result for images.description:', decoded);

                    if (decoded.startsWith('/uploads/')) {
                      cleanData.images.description = decoded;
                      console.log('Successfully decoded Binary to path for images.description:', cleanData.images.description);
                    } else {
                      console.error('Decoded Binary does not contain a valid path for images.description:', decoded);
                      cleanData.images.description = '';
                    }
                  } catch (decodeError) {
                    console.error('Failed to decode Binary for images.description:', decodeError);
                    cleanData.images.description = '';
                  }
                }
              } catch (error) {
                console.error('Error processing Binary object for images.description:', error);
                cleanData.images.description = '';
              }
            } else if (cleanData.images.description._id) {
              cleanData.images.description = cleanData.images.description._id.toString();
              console.log('Converted images.description from ObjectId to string:', cleanData.images.description);
            } else {
              cleanData.images.description = '';
            }
          } else if (typeof cleanData.images.description !== 'string') {
            cleanData.images.description = '';
          }
        }

        // Process key result image in images object
        if (cleanData.images.keyResult) {
          if (typeof cleanData.images.keyResult === 'object') {
            if (cleanData.images.keyResult.buffer && cleanData.images.keyResult.subType === 0) {
              // If it's a Binary object, try to convert it to a string
              try {
                // Try to convert Binary to string
                const binaryString = cleanData.images.keyResult.toString();
                console.log('Binary toString result for images.keyResult:', binaryString);

                // Check if it's a base64 encoded path
                if (binaryString.startsWith('/uploads/')) {
                  cleanData.images.keyResult = binaryString;
                  console.log('Binary object contains a direct path for images.keyResult:', cleanData.images.keyResult);
                } else {
                  // Try to decode from base64 if it might be encoded
                  try {
                    const decoded = Buffer.from(binaryString, 'base64').toString();
                    console.log('Decoded base64 result for images.keyResult:', decoded);

                    if (decoded.startsWith('/uploads/')) {
                      cleanData.images.keyResult = decoded;
                      console.log('Successfully decoded Binary to path for images.keyResult:', cleanData.images.keyResult);
                    } else {
                      console.error('Decoded Binary does not contain a valid path for images.keyResult:', decoded);
                      cleanData.images.keyResult = '';
                    }
                  } catch (decodeError) {
                    console.error('Failed to decode Binary for images.keyResult:', decodeError);
                    cleanData.images.keyResult = '';
                  }
                }
              } catch (error) {
                console.error('Error processing Binary object for images.keyResult:', error);
                cleanData.images.keyResult = '';
              }
            } else if (cleanData.images.keyResult._id) {
              cleanData.images.keyResult = cleanData.images.keyResult._id.toString();
              console.log('Converted images.keyResult from ObjectId to string:', cleanData.images.keyResult);
            } else {
              cleanData.images.keyResult = '';
            }
          } else if (typeof cleanData.images.keyResult !== 'string') {
            cleanData.images.keyResult = '';
          }
        }
      }

      // Update the images object with the current image IDs (now as strings)
      if (cleanData.descriptionImg) {
        cleanData.images.description = cleanData.descriptionImg;
      }

      if (cleanData.keyResultImg) {
        cleanData.images.keyResult = cleanData.keyResultImg;
      }

      console.log('Final image data after processing:', {
        descriptionImg: cleanData.descriptionImg,
        keyResultImg: cleanData.keyResultImg,
        images: cleanData.images
      });

      // Ensure all required fields exist
      if (!cleanData.serviceType) cleanData.serviceType = [];

      // Handle image fields - check all possible locations
      console.log('Image data in edit dialog:', {
        descriptionImg: cleanData.descriptionImg,
        keyResultImg: cleanData.keyResultImg,
        images: cleanData.images
      });

      // Ensure images object exists and has valid properties
      if (!cleanData.images) {
        cleanData.images = { description: '', keyResult: '' };
      } else {
        // Make sure the images object has the expected properties
        cleanData.images = {
          description: cleanData.images.description || '',
          keyResult: cleanData.images.keyResult || ''
        };
      }

      // Check for images in the nested structure
      if (typeof cleanData.images.description === 'string' && cleanData.images.description.trim() !== '') {
        if (!cleanData.descriptionImg) {
          cleanData.descriptionImg = cleanData.images.description;
          console.log('Found description image in nested structure:', cleanData.descriptionImg);
        }
      }

      if (typeof cleanData.images.keyResult === 'string' && cleanData.images.keyResult.trim() !== '') {
        if (!cleanData.keyResultImg) {
          cleanData.keyResultImg = cleanData.images.keyResult;
          console.log('Found key result image in nested structure:', cleanData.keyResultImg);
        }
      }

      // If we still don't have image data, check other possible fields
      if (!cleanData.descriptionImg && cleanData.descriptionImage) {
        cleanData.descriptionImg = cleanData.descriptionImage;
        console.log('Found description image in descriptionImage field:', cleanData.descriptionImg);
      }

      if (!cleanData.keyResultImg && cleanData.keyResultImage) {
        cleanData.keyResultImg = cleanData.keyResultImage;
        console.log('Found key result image in keyResultImage field:', cleanData.keyResultImg);
      }

      // Log all keys in the testMethodData object to see what's available
      console.log('Available keys in testMethodData:', Object.keys(cleanData));

      // Handle locationId (convert ObjectId to string)
      console.log('Raw locationId before processing:', cleanData.locationId, 'Type:', typeof cleanData.locationId);
      console.log('Raw location object before processing:', cleanData.location);

      // Store the original location object for reference
      const originalLocation = cleanData.location;

      if (cleanData.locationId && typeof cleanData.locationId === 'object') {
        if (cleanData.locationId._id) {
          // If it has an _id property, use that
          cleanData.locationId = cleanData.locationId._id.toString();
          console.log('Converted locationId from object to string ID:', cleanData.locationId);

          // Also store the location object for reference if not already set
          if (!cleanData.location) {
            cleanData.location = cleanData.locationId;
            console.log('Stored location object from locationId object');
          }
        } else if (cleanData.locationId.id) {
          // Some objects might use 'id' instead of '_id'
          cleanData.locationId = cleanData.locationId.id.toString();
          console.log('Converted locationId from object with id to string:', cleanData.locationId);

          // Also store the location object for reference if not already set
          if (!cleanData.location) {
            cleanData.location = cleanData.locationId;
            console.log('Stored location object from locationId object');
          }
        } else {
          console.log('locationId is an object without _id or id, setting to "none":', cleanData.locationId);
          cleanData.locationId = "none";
        }
      } else if (!cleanData.locationId) {
        // If location object exists but locationId is not set, try to get ID from location object
        if (originalLocation && typeof originalLocation === 'object') {
          if (originalLocation._id) {
            cleanData.locationId = originalLocation._id.toString();
            console.log('Setting locationId from location._id:', cleanData.locationId);
          } else if (originalLocation.id) {
            cleanData.locationId = originalLocation.id.toString();
            console.log('Setting locationId from location.id:', cleanData.locationId);
          } else {
            cleanData.locationId = "none";
            console.log('location object exists but has no ID, setting locationId to "none"');
          }
        } else {
          cleanData.locationId = "none";
          console.log('locationId is empty, setting to "none"');
        }
      } else {
        console.log('locationId is already a primitive value:', cleanData.locationId);
      }

      // Log the final locationId value
      console.log('Final locationId value after processing:', cleanData.locationId, 'Type:', typeof cleanData.locationId);

      // Handle capabilityId (convert ObjectId to string)
      console.log('Raw capabilityId before processing:', cleanData.capabilityId, 'Type:', typeof cleanData.capabilityId);
      console.log('Raw capability object before processing:', cleanData.capability);

      // Store the original capability object for reference
      const originalCapability = cleanData.capability;

      if (cleanData.capabilityId && typeof cleanData.capabilityId === 'object') {
        if (cleanData.capabilityId._id) {
          // If it has an _id property, use that
          cleanData.capabilityId = cleanData.capabilityId._id.toString();
          console.log('Converted capabilityId from object to string ID:', cleanData.capabilityId);
        } else if (cleanData.capabilityId.id) {
          // Some objects might use 'id' instead of '_id'
          cleanData.capabilityId = cleanData.capabilityId.id.toString();
          console.log('Converted capabilityId from object with id to string:', cleanData.capabilityId);
        } else {
          console.log('capabilityId is an object without _id or id, setting to "none":', cleanData.capabilityId);
          cleanData.capabilityId = "none";
        }
      } else if (!cleanData.capabilityId) {
        // If capability object exists but capabilityId is not set, try to get ID from capability object
        if (originalCapability && typeof originalCapability === 'object') {
          if (originalCapability._id) {
            cleanData.capabilityId = originalCapability._id.toString();
            console.log('Setting capabilityId from capability._id:', cleanData.capabilityId);
          } else if (originalCapability.id) {
            cleanData.capabilityId = originalCapability.id.toString();
            console.log('Setting capabilityId from capability.id:', cleanData.capabilityId);
          } else {
            cleanData.capabilityId = "none";
            console.log('capability object exists but has no ID, setting capabilityId to "none"');
          }
        } else {
          cleanData.capabilityId = "none";
          console.log('capabilityId is empty, setting to "none"');
        }
      } else {
        console.log('capabilityId is already a primitive value:', cleanData.capabilityId);
        // Ensure it's a string
        cleanData.capabilityId = String(cleanData.capabilityId);
      }

      // Log the final capabilityId value
      console.log('Final capabilityId value after processing:', cleanData.capabilityId, 'Type:', typeof cleanData.capabilityId);

      // Extract data from nested structures if needed
      if (cleanData.description) {
        if (cleanData.description.th) cleanData.detailTh = cleanData.description.th;
        if (cleanData.description.en) cleanData.detailEng = cleanData.description.en;
      }

      if (cleanData.pricing) {
        if (cleanData.pricing.standard) cleanData.price = cleanData.pricing.standard;
        if (cleanData.pricing.urgent) cleanData.priorityPrice = cleanData.pricing.urgent;
        if (cleanData.pricing.effectiveDate) cleanData.priceEffectiveDate = cleanData.pricing.effectiveDate;
      }

      if (cleanData.sampleRequirements) {
        if (cleanData.sampleRequirements.minimumAmount) cleanData.sampleAmount = cleanData.sampleRequirements.minimumAmount;
        if (cleanData.sampleRequirements.unit) cleanData.unit = cleanData.sampleRequirements.unit;
      }

      if (cleanData.timeEstimates) {
        if (cleanData.timeEstimates.testing) cleanData.testingTime = cleanData.timeEstimates.testing;
        if (cleanData.timeEstimates.analysis) cleanData.resultAnalysisTime = cleanData.timeEstimates.analysis;
        if (cleanData.timeEstimates.leadTime) cleanData.analysisLeadtime = cleanData.timeEstimates.leadTime;
        if (cleanData.timeEstimates.workingHours) cleanData.workingHour = cleanData.timeEstimates.workingHours;
      }

      if (cleanData.equipment) {
        if (cleanData.equipment.name) cleanData.equipmentName = cleanData.equipment.name;
        if (cleanData.equipment.equipmentId) cleanData.equipmentId = cleanData.equipment.equipmentId;
      }

      if (cleanData.erSettings) {
        if (cleanData.erSettings.slotDuration) cleanData.erSlotTime = cleanData.erSettings.slotDuration;
        if (cleanData.erSettings.startTime) cleanData.erTimeStart = cleanData.erSettings.startTime;
        if (cleanData.erSettings.endTime) cleanData.erTimeEnd = cleanData.erSettings.endTime;
      }

      if (cleanData.performance) {
        if (cleanData.performance.samplesPerYear) cleanData.noSamplePerYear = cleanData.performance.samplesPerYear;
      }

      if (cleanData.assets && Array.isArray(cleanData.assets)) {
        cleanData.methodAsset = cleanData.assets.join(', ');
      }

      if (cleanData.foh && Array.isArray(cleanData.foh)) {
        cleanData.methodFoh = cleanData.foh.join(', ');
      }

      if (cleanData.keyResults && Array.isArray(cleanData.keyResults)) {
        cleanData.keyResult = cleanData.keyResults.join(', ');
      }

      // Handle name field
      if (cleanData.name && !cleanData.testingName) {
        cleanData.testingName = cleanData.name;
      }

      // Handle manageable field
      if (cleanData.manageable !== undefined) {
        cleanData.managable = cleanData.manageable ? 'Yes' : 'No';
      }

      // Handle isActive field
      if (cleanData.isActive !== undefined) {
        cleanData.methodStatus = cleanData.isActive ? 'Active' : 'Inactive';
      }

      console.log('Final image data after processing:', {
        descriptionImg: cleanData.descriptionImg,
        keyResultImg: cleanData.keyResultImg
      });

      // Log the processed data
      console.log('Processed data for edit form:', cleanData);

      setProcessedData(cleanData);
    }
  }, [testMethodData]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    try {
      const methodId = testMethodData.id || testMethodData._id;
      console.log('Updating test method with ID:', methodId);

      // Log the image data for debugging
      console.log('Image data in update:', {
        descriptionImg: formData.descriptionImg,
        keyResultImg: formData.keyResultImg,
        images: formData.images
      });

      // Create a clean copy of the form data for submission
      const submissionData = { ...formData };

      // Ensure image fields are properly handled
      if (submissionData.descriptionImg === null) {
        // If explicitly set to null, keep it as null to remove the image
      } else if (!submissionData.descriptionImg) {
        // If undefined or empty string, don't update this field
        delete submissionData.descriptionImg;
      }

      if (submissionData.keyResultImg === null) {
        // If explicitly set to null, keep it as null to remove the image
      } else if (!submissionData.keyResultImg) {
        // If undefined or empty string, don't update this field
        delete submissionData.keyResultImg;
      }

      // Ensure the images object is properly updated
      if (!submissionData.images) {
        submissionData.images = { description: '', keyResult: '' };
      }

      // Ensure image IDs are strings
      if (submissionData.descriptionImg) {
        console.log('Raw descriptionImg before processing:', submissionData.descriptionImg, 'Type:', typeof submissionData.descriptionImg);

        if (typeof submissionData.descriptionImg === 'object') {
          if (submissionData.descriptionImg === null) {
            // If it's null, keep it as null
            console.log('descriptionImg is null');
          } else if (submissionData.descriptionImg._id) {
            // If it's an ObjectId, convert to string
            submissionData.descriptionImg = submissionData.descriptionImg._id.toString();
            console.log('Converted descriptionImg from ObjectId to string:', submissionData.descriptionImg);
          } else {
            // For any other object, set to null
            console.log('descriptionImg is an object without _id property, setting to null');
            submissionData.descriptionImg = null;
          }
        } else if (typeof submissionData.descriptionImg === 'string') {
          // If it's already a string, keep it
          console.log('descriptionImg is already a string:', submissionData.descriptionImg);
        } else {
          // For any other type, set to null
          console.log('descriptionImg is an unsupported type, setting to null');
          submissionData.descriptionImg = null;
        }
      }

      if (submissionData.keyResultImg) {
        console.log('Raw keyResultImg before processing:', submissionData.keyResultImg, 'Type:', typeof submissionData.keyResultImg);

        if (typeof submissionData.keyResultImg === 'object') {
          if (submissionData.keyResultImg === null) {
            // If it's null, keep it as null
            console.log('keyResultImg is null');
          } else if (submissionData.keyResultImg._id) {
            // If it's an ObjectId, convert to string
            submissionData.keyResultImg = submissionData.keyResultImg._id.toString();
            console.log('Converted keyResultImg from ObjectId to string:', submissionData.keyResultImg);
          } else {
            // For any other object, set to null
            console.log('keyResultImg is an object without _id property, setting to null');
            submissionData.keyResultImg = null;
          }
        } else if (typeof submissionData.keyResultImg === 'string') {
          // If it's already a string, keep it
          console.log('keyResultImg is already a string:', submissionData.keyResultImg);
        } else {
          // For any other type, set to null
          console.log('keyResultImg is an unsupported type, setting to null');
          submissionData.keyResultImg = null;
        }
      }

      // Handle locationId (convert ObjectId to string)
      console.log('Raw locationId before processing:', submissionData.locationId, 'Type:', typeof submissionData.locationId);

      if (submissionData.locationId && typeof submissionData.locationId === 'object') {
        if (submissionData.locationId._id) {
          // If it has an _id property, use that
          const originalId = submissionData.locationId._id;
          submissionData.locationId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted locationId from object to string ID:', submissionData.locationId, 'Original:', originalId);
        } else if (submissionData.locationId.id) {
          // Some objects might use 'id' instead of '_id'
          const originalId = submissionData.locationId.id;
          submissionData.locationId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted locationId from object with id to string:', submissionData.locationId, 'Original:', originalId);
        } else {
          console.log('locationId is an object without _id or id, setting to "none":', submissionData.locationId);
          submissionData.locationId = "none";
        }
      } else if (!submissionData.locationId) {
        submissionData.locationId = "none";
        console.log('locationId is empty, setting to "none"');
      } else {
        console.log('locationId is already a primitive value:', submissionData.locationId);
        // Ensure it's a string if it's not "none"
        if (submissionData.locationId !== "none") {
          submissionData.locationId = String(submissionData.locationId);
        }
      }

      console.log('Final locationId after processing:', submissionData.locationId, 'Type:', typeof submissionData.locationId);

      // Handle capabilityId (convert ObjectId to string)
      console.log('Raw capabilityId before processing:', submissionData.capabilityId, 'Type:', typeof submissionData.capabilityId);

      if (submissionData.capabilityId && typeof submissionData.capabilityId === 'object') {
        if (submissionData.capabilityId._id) {
          // If it has an _id property, use that
          const originalId = submissionData.capabilityId._id;
          submissionData.capabilityId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted capabilityId from object to string ID:', submissionData.capabilityId, 'Original:', originalId);
        } else if (submissionData.capabilityId.id) {
          // Some objects might use 'id' instead of '_id'
          const originalId = submissionData.capabilityId.id;
          submissionData.capabilityId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted capabilityId from object with id to string:', submissionData.capabilityId, 'Original:', originalId);
        } else {
          console.log('capabilityId is an object without _id or id, setting to empty string:', submissionData.capabilityId);
          submissionData.capabilityId = "";
        }
      } else if (!submissionData.capabilityId) {
        submissionData.capabilityId = "";
        console.log('capabilityId is empty, setting to empty string');
      } else {
        console.log('capabilityId is already a primitive value:', submissionData.capabilityId);
        // Ensure it's a string
        submissionData.capabilityId = String(submissionData.capabilityId);
      }

      console.log('Final capabilityId after processing:', submissionData.capabilityId, 'Type:', typeof submissionData.capabilityId);

      // Ensure the images object has string values
      if (!submissionData.images) {
        submissionData.images = { description: '', keyResult: '' };
      } else {
        // Process description image in images object
        if (submissionData.images.description) {
          if (typeof submissionData.images.description === 'object') {
            if (submissionData.images.description._id) {
              submissionData.images.description = submissionData.images.description._id.toString();
              console.log('Converted images.description from ObjectId to string:', submissionData.images.description);
            } else {
              submissionData.images.description = '';
            }
          } else if (typeof submissionData.images.description !== 'string') {
            submissionData.images.description = '';
          }
        }

        // Process key result image in images object
        if (submissionData.images.keyResult) {
          if (typeof submissionData.images.keyResult === 'object') {
            if (submissionData.images.keyResult._id) {
              submissionData.images.keyResult = submissionData.images.keyResult._id.toString();
              console.log('Converted images.keyResult from ObjectId to string:', submissionData.images.keyResult);
            } else {
              submissionData.images.keyResult = '';
            }
          } else if (typeof submissionData.images.keyResult !== 'string') {
            submissionData.images.keyResult = '';
          }
        }
      }

      // Update the images object with the current image IDs (now as strings)
      if (submissionData.descriptionImg) {
        submissionData.images.description = submissionData.descriptionImg;
      }

      if (submissionData.keyResultImg) {
        submissionData.images.keyResult = submissionData.keyResultImg;
      }

      console.log('Final image data for submission:', {
        descriptionImg: submissionData.descriptionImg,
        keyResultImg: submissionData.keyResultImg,
        images: submissionData.images
      });

      console.log('Sending test method update data:', submissionData);

      const response = await fetch(`/api/test-methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      console.log('API response status:', response.status);

      let data;
      try {
        // Get the response data as JSON
        data = await response.json();
        console.log('API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Failed to parse server response. Please try again.');
      }

      if (!response.ok) {
        // Construct a detailed error message
        let errorMessage = data?.error || `Failed to update test method (${response.status})`;

        // Add details if available
        if (data?.details) {
          if (typeof data.details === 'string') {
            errorMessage += `: ${data.details}`;
          } else if (typeof data.details === 'object') {
            errorMessage += `: ${JSON.stringify(data.details)}`;
          }
        }

        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: data?.error,
          details: data?.details,
          data: data
        });

        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Test method updated successfully",
      })

      onTestMethodUpdated(data.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating test method:', error);

      // Create a more detailed error message
      let errorMessage = "Failed to update test method";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1100px] lg:max-w-[1200px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Test Method</DialogTitle>
          <DialogDescription>
            Update the test method details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          {processedData ? (
            <TestMethodForm
              initialData={processedData}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
              isEditing={true}
            />
          ) : (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading form data...</span>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
