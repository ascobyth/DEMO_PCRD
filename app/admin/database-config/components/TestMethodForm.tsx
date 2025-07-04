"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

interface RawTestMethodData {
  _id?: string | { toString(): string }; // Allow ObjectId or string
  id?: string;
  methodcode?: string;
  testingName?: string;
  detailTh?: string;
  detailEng?: string;
  keyResult?: string | string[];
  price?: number | string;
  unit?: string;
  sampleAmount?: number | string;
  workingHour?: number | string;
  othersRemark?: string;
  methodStatus?: string;
  resultAnalysisTime?: number | string;
  analysisLeadtime?: number | string;
  serviceType?: string | string[];
  testingTime?: number | string;
  noSamplePerYear?: number | string;
  methodAsset?: string | string[];
  methodFoh?: string | string[];
  priceEffectiveDate?: Date | string;
  priorityPrice?: number | string;
  priceNote?: string;
  managable?: string; // "Yes" or "No"
  erSlotTime?: number | string;
  erPerSlot?: string;
  equipmentName?: string;
  locationId?: string | { _id?: string | { toString(): string }, id?: string | { toString(): string } } | null; // Allow ObjectId object, string, or null
  equipmentId?: number | string;
  methodType?: string;
  erTimeStart?: number | string;
  erTimeEnd?: number | string;
  capabilityId?: string | { _id?: string | { toString(): string }, id?: string | { toString(): string } } | null; // Allow ObjectId object, string, or null
  descriptionImg?: string | { _id?: string | { toString(): string }, buffer?: Buffer, subType?: number, _isBinary?: boolean, base64Data?: string } | null; // Allow various image data types or null
  keyResultImg?: string | { _id?: string | { toString(): string }, buffer?: Buffer, subType?: number, _isBinary?: boolean, base64Data?: string } | null; // Allow various image data types or null
  images?: {
    description?: string | { _id?: string | { toString(): string }, buffer?: Buffer, subType?: number, _isBinary?: boolean, base64Data?: string } | null;
    keyResult?: string | { _id?: string | { toString(): string }, buffer?: Buffer, subType?: number, _isBinary?: boolean, base64Data?: string } | null;
  };
  description?: { th?: string, en?: string };
  pricing?: { standard?: number | string, urgent?: number | string, effectiveDate?: Date | string };
  sampleRequirements?: { minimumAmount?: number | string, unit?: string };
  timeEstimates?: { testing?: number | string, analysis?: number | string, leadTime?: number | string, workingHours?: number | string };
  equipment?: { name?: string, equipmentId?: number | string };
  erSettings?: { slotDuration?: number | string, startTime?: number | string, endTime?: number | string };
  performance?: { samplesPerYear?: number | string };
  assets?: string[];
  foh?: string[];
  keyResults?: string[];
  name?: string;
  isActive?: boolean;
  // Add raw location data fields for debugging
  rawLocationId?: any;
  rawLocationIdType?: string;
  location?: any;
  capability?: any;
}

interface FormattedTestMethodData {
  methodcode: string;
  testingName: string;
  detailTh: string;
  detailEng: string;
  keyResult: string; // Stored as comma-separated string in form
  price: string; // Stored as string in form
  unit: string;
  sampleAmount: string; // Stored as string in form
  workingHour: string; // Stored as string in form
  othersRemark: string;
  methodStatus: string; // "Active", "Inactive", "Maintenance"
  resultAnalysisTime: string; // Stored as string in form
  analysisLeadtime: string; // Stored as string in form
  serviceType: string[]; // Stored as array of strings in form
  testingTime: string; // Stored as string in form
  noSamplePerYear: string; // Stored as string in form
  methodAsset: string; // Stored as comma-separated string in form
  methodFoh: string; // Stored as comma-separated string in form
  priceEffectiveDate: string; // Stored as date string in form
  priorityPrice: string; // Stored as string in form
  priceNote: string;
  managable: string; // "Yes" or "No"
  erSlotTime: string; // Stored as string in form
  erPerSlot: string;
  equipmentName: string;
  locationId: string | null; // Stored as string ID or "none" or null
  equipmentId: string; // Stored as string in form
  methodType: string;
  erTimeStart: string; // Stored as string in form
  erTimeEnd: string; // Stored as string in form
  capabilityId: string | null; // Stored as string ID or null
  descriptionImg: string | null; // Stored as string path or null
  keyResultImg: string | null; // Stored as string path or null
  images: { // Stored as string paths or empty strings
    description: string;
    keyResult: string;
  };
  // Add fields for debugging
  [key: string]: any; // Allow any additional fields
}

interface TestMethodFormProps {
  initialData?: RawTestMethodData;
  onSubmit: (data: FormattedTestMethodData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function TestMethodForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}: TestMethodFormProps) {
  // Default form data with empty strings for all text fields to prevent controlled/uncontrolled input errors
  const defaultFormData: FormattedTestMethodData = {
    methodcode: "",
    testingName: "",
    detailTh: "",
    detailEng: "",
    keyResult: "",
    price: "",
    unit: "",
    sampleAmount: "",
    workingHour: "",
    othersRemark: "",
    methodStatus: "Active",
    resultAnalysisTime: "",
    analysisLeadtime: "",
    serviceType: [],
    testingTime: "",
    noSamplePerYear: "",
    methodAsset: "",
    methodFoh: "",
    priceEffectiveDate: "",
    priorityPrice: "",
    priceNote: "",
    managable: "Yes",
    erSlotTime: "",
    erPerSlot: "",
    equipmentName: "",
    locationId: "none",
    equipmentId: "",
    methodType: "",
    erTimeStart: "",
    erTimeEnd: "",
    capabilityId: "none",
    descriptionImg: null,
    keyResultImg: null,
    images: {
      description: '',
      keyResult: '',
    },
  };

  const [formData, setFormData] = useState<FormattedTestMethodData>(defaultFormData)

  // Refs for file inputs
  const descriptionImgInputRef = useRef<HTMLInputElement>(null)
  const keyResultImgInputRef = useRef<HTMLInputElement>(null)

  // State for file uploads
  const [descriptionImgFile, setDescriptionImgFile] = useState<File | null>(null)
  const [keyResultImgFile, setKeyResultImgFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ description: false, keyResult: false })

  const [locations, setLocations] = useState<any[]>([])
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])

  // Fetch locations, capabilities, and equipment for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch locations
        const locationsResponse = await fetch('/api/locations');
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          const locationsArray = locationsData.data || [];
          setLocations(locationsArray);
          console.log('Fetched locations:', locationsArray);
        }

        // Fetch capabilities
        const capabilitiesResponse = await fetch('/api/capabilities');
        if (capabilitiesResponse.ok) {
          const capabilitiesData = await capabilitiesResponse.json();
          const capabilitiesArray = capabilitiesData.data || [];
          setCapabilities(capabilitiesArray);
          console.log('Fetched capabilities:', capabilitiesArray);
        }

        // Fetch equipment
        console.log('Fetching equipment from /api/equipment...');
        const equipmentResponse = await fetch('/api/equipment');
        console.log('Equipment response status:', equipmentResponse.status);
        
        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json();
          console.log('Equipment API response:', equipmentData);
          
          const equipmentArray = equipmentData.data || [];
          setEquipment(equipmentArray);
          
          console.log('Fetched equipment for TestMethodForm:', equipmentArray);
          console.log('Equipment array length:', equipmentArray.length);
          console.log('Equipment with names:', equipmentArray.filter(eq => 
            (eq.equipmentName && eq.equipmentName.trim() !== '') || 
            (eq.name && eq.name.trim() !== '')
          ));
          console.log('Equipment data structure sample:', equipmentArray.length > 0 ? equipmentArray[0] : 'No equipment');
          console.log('Equipment fields check:', equipmentArray.length > 0 ? {
            hasEquipmentName: !!equipmentArray[0].equipmentName,
            hasName: !!equipmentArray[0].name,
            hasEquipmentCode: !!equipmentArray[0].equipmentCode,
            hasCode: !!equipmentArray[0].code,
            has_id: !!equipmentArray[0]._id,
            hasId: !!equipmentArray[0].id,
            sample: {
              _id: equipmentArray[0]._id,
              equipmentName: equipmentArray[0].equipmentName,
              equipmentCode: equipmentArray[0].equipmentCode
            }
          } : 'No equipment to check');
        } else {
          console.error('Failed to fetch equipment:', equipmentResponse.status);
          const errorText = await equipmentResponse.text();
          console.error('Equipment error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchData();
  }, []);

  // File upload handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'description' | 'keyResult') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size exceeds 5MB limit",
          variant: "destructive",
        });
        return;
      }

      // Check file type (only allow images)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }

      if (type === 'description') {
        setDescriptionImgFile(file);
      } else {
        setKeyResultImgFile(file);
      }
    }
  };

  const uploadFile = async (file: File, type: 'description' | 'keyResult'): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'testmethod_img');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      console.log('File upload response:', data);

      // Check for filePath (new system) or fileId (legacy system)
      if (data.filePath) {
        return data.filePath;
      } else if (data.fileId) {
        return data.fileId;
      } else {
        throw new Error('File upload response missing path or ID');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleRemoveFile = (type: 'description' | 'keyResult') => {
    if (type === 'description') {
      setDescriptionImgFile(null);
      setFormData(prev => ({ ...prev, descriptionImg: null }));
      if (descriptionImgInputRef.current) {
        descriptionImgInputRef.current.value = '';
      }
    } else {
      setKeyResultImgFile(null);
      setFormData(prev => ({ ...prev, keyResultImg: null }));
      if (keyResultImgInputRef.current) {
        keyResultImgInputRef.current.value = '';
      }
    }
  };

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData && capabilities.length > 0 && locations.length > 0) {
      console.log('Initializing form with data:', initialData);
      console.log('Capabilities and locations are loaded, capabilities:', capabilities.length, 'locations:', locations.length);

      // Start with default form data to ensure all fields have defined values
      const formattedData = {
        ...defaultFormData,
        ...initialData,
        // Convert dates to string format for input fields
        priceEffectiveDate: initialData.priceEffectiveDate
          ? new Date(initialData.priceEffectiveDate).toISOString().split('T')[0]
          : "",
      };

      // Make sure we have the images object with valid properties
      if (!formattedData.images && initialData.images) {
        // Copy from initialData if available
        formattedData.images = {
          description: initialData.images.description || '',
          keyResult: initialData.images.keyResult || ''
        };
      } else if (!formattedData.images) {
        // Create a new empty images object
        formattedData.images = { description: '', keyResult: '' };
      } else {
        // Ensure the existing images object has valid properties
        formattedData.images = {
          description: formattedData.images.description || '',
          keyResult: formattedData.images.keyResult || ''
        };
      }

      // Process images.description if it's a Binary object
      if (formattedData.images.description && typeof formattedData.images.description === 'object') {
        if (formattedData.images.description._isBinary) {
          // This is our special marker for a Binary object that was converted to base64 by the API
          try {
            // Decode the base64 string
            const decoded = Buffer.from(formattedData.images.description.base64Data, 'base64').toString();
            console.log('Decoded base64 data for images.description:', decoded);

            if (decoded.startsWith('/uploads/')) {
              formattedData.images.description = decoded;
              console.log('Successfully decoded Binary to path for images.description:', formattedData.images.description);
            } else {
              console.error('Decoded Binary does not contain a valid path for images.description:', decoded);
              formattedData.images.description = '';
            }
          } catch (error) {
            console.error('Error decoding base64 data for images.description:', error);
            formattedData.images.description = '';
          }
        } else if (formattedData.images.description.buffer && formattedData.images.description.subType === 0) {
          // If it's a Binary object, try to convert it to a string
          try {
            // Try to convert Binary to string
            const binaryString = formattedData.images.description.toString();
            console.log('Binary toString result for images.description:', binaryString);

            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              formattedData.images.description = binaryString;
              console.log('Binary object contains a direct path for images.description:', formattedData.images.description);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                console.log('Decoded base64 result for images.description:', decoded);

                if (decoded.startsWith('/uploads/')) {
                  formattedData.images.description = decoded;
                  console.log('Successfully decoded Binary to path for images.description:', formattedData.images.description);
                } else {
                  console.error('Decoded Binary does not contain a valid path for images.description:', decoded);
                  formattedData.images.description = '';
                }
              } catch (decodeError) {
                console.error('Failed to decode Binary for images.description:', decodeError);
                formattedData.images.description = '';
              }
            }
          } catch (error) {
            console.error('Error processing Binary object for images.description:', error);
            formattedData.images.description = '';
          }
        }
      }

      // Process images.keyResult if it's a Binary object
      if (formattedData.images.keyResult && typeof formattedData.images.keyResult === 'object') {
        if (formattedData.images.keyResult._isBinary) {
          // This is our special marker for a Binary object that was converted to base64 by the API
          try {
            // Decode the base64 string
            const decoded = Buffer.from(formattedData.images.keyResult.base64Data, 'base64').toString();
            console.log('Decoded base64 data for images.keyResult:', decoded);

            if (decoded.startsWith('/uploads/')) {
              formattedData.images.keyResult = decoded;
              console.log('Successfully decoded Binary to path for images.keyResult:', formattedData.images.keyResult);
            } else {
              console.error('Decoded Binary does not contain a valid path for images.keyResult:', decoded);
              formattedData.images.keyResult = '';
            }
          } catch (error) {
            console.error('Error decoding base64 data for images.keyResult:', error);
            formattedData.images.keyResult = '';
          }
        } else if (formattedData.images.keyResult.buffer && formattedData.images.keyResult.subType === 0) {
          // If it's a Binary object, try to convert it to a string
          try {
            // Try to convert Binary to string
            const binaryString = formattedData.images.keyResult.toString();
            console.log('Binary toString result for images.keyResult:', binaryString);

            // Check if it's a base64 encoded path
            if (binaryString.startsWith('/uploads/')) {
              formattedData.images.keyResult = binaryString;
              console.log('Binary object contains a direct path for images.keyResult:', formattedData.images.keyResult);
            } else {
              // Try to decode from base64 if it might be encoded
              try {
                const decoded = Buffer.from(binaryString, 'base64').toString();
                console.log('Decoded base64 result for images.keyResult:', decoded);

                if (decoded.startsWith('/uploads/')) {
                  formattedData.images.keyResult = decoded;
                  console.log('Successfully decoded Binary to path for images.keyResult:', formattedData.images.keyResult);
                } else {
                  console.error('Decoded Binary does not contain a valid path for images.keyResult:', decoded);
                  formattedData.images.keyResult = '';
                }
              } catch (decodeError) {
                console.error('Failed to decode Binary for images.keyResult:', decodeError);
                formattedData.images.keyResult = '';
              }
            }
          } catch (error) {
            console.error('Error processing Binary object for images.keyResult:', error);
            formattedData.images.keyResult = '';
          }
        }
      }

      // Log the images object for debugging
      console.log('Images object after initialization:', formattedData.images);

      // Handle numeric fields
      const numericFields = [
        'price', 'sampleAmount', 'workingHour', 'resultAnalysisTime',
        'analysisLeadtime', 'testingTime', 'noSamplePerYear', 'priorityPrice',
        'erSlotTime', 'equipmentId', 'erTimeStart', 'erTimeEnd'
      ];

      numericFields.forEach(field => {
        if (formattedData[field] !== undefined && formattedData[field] !== null) {
          formattedData[field] = formattedData[field].toString();
        } else {
          formattedData[field] = ""; // Ensure numeric fields are never undefined
        }
      });

      // Ensure serviceType is always an array
      if (!formattedData.serviceType) {
        formattedData.serviceType = [];
      } else if (!Array.isArray(formattedData.serviceType)) {
        // If it's a string, convert it to an array
        formattedData.serviceType = [formattedData.serviceType.toString()];
      }

      // Handle locationId (convert ObjectId to string)
      console.log('Raw locationId before processing:', formattedData.locationId, 'Type:', typeof formattedData.locationId);
      console.log('Raw location object before processing:', formattedData.location);

      // Store the original location object for reference
      const originalLocation = formattedData.location || initialData.location;

      // Check if we have a populated location object from the API
      if (initialData.locationId && typeof initialData.locationId === 'object') {
        // This is likely a populated object from the API
        if (initialData.locationId._id) {
          // Extract the ID from the populated object
          formattedData.locationId = String(initialData.locationId._id);
          console.log('Extracted locationId from populated object in initialData:', formattedData.locationId);

          // Also store the location object for reference
          if (!formattedData.location) {
            formattedData.location = initialData.locationId;
            console.log('Stored location object from initialData.locationId');
          }
        }
      }

      // Check if we have raw location data from the API
      if (initialData.rawLocationId) {
        console.log('Found raw location data in initialData:', initialData.rawLocationId);

        // This is the raw location object from the API
        if (typeof initialData.rawLocationId === 'object' && initialData.rawLocationId !== null && initialData.rawLocationId._id) {
          // Extract the ID from the raw object
          formattedData.locationId = String(initialData.rawLocationId._id);
          console.log('Extracted locationId from raw location object:', formattedData.locationId);
        }
      }

      // Check if we have a location object but no locationId
      if (!formattedData.locationId && originalLocation && typeof originalLocation === 'object') {
        if (originalLocation._id) {
          formattedData.locationId = String(originalLocation._id);
          console.log('Extracted locationId from location object:', formattedData.locationId);
        } else if (originalLocation.id) {
          formattedData.locationId = String(originalLocation.id);
          console.log('Extracted locationId from location.id:', formattedData.locationId);
        }
      }

      // Now process the formattedData.locationId
      if (formattedData.locationId && typeof formattedData.locationId === 'object') {
        if (formattedData.locationId._id) {
          // If it has an _id property, use that
          const originalId = formattedData.locationId._id;
          formattedData.locationId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted locationId from object to string ID:', formattedData.locationId, 'Original:', originalId);
        } else if (formattedData.locationId.id) {
          // Some objects might use 'id' instead of '_id'
          const originalId = formattedData.locationId.id;
          formattedData.locationId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted locationId from object with id to string:', formattedData.locationId, 'Original:', originalId);
        } else {
          console.log('locationId is an object without _id or id, setting to "none":', formattedData.locationId);
          formattedData.locationId = "none";
        }
      } else if (!formattedData.locationId) {
        formattedData.locationId = "none";
        console.log('locationId is empty, setting to "none"');
      } else {
        console.log('locationId is already a primitive value:', formattedData.locationId);
        // Ensure it's a string if it's not "none"
        if (formattedData.locationId !== "none") {
          formattedData.locationId = String(formattedData.locationId);
        }
      }

      // Debug: Check if the locationId matches any of the available locations
      if (formattedData.locationId && formattedData.locationId !== "none") {
        const matchingLocation = locations.find(l => String(l._id) === String(formattedData.locationId));
        console.log('Matching location for form initialization:', matchingLocation ?
          `Found: ${matchingLocation.locationId} - ${matchingLocation.sublocation}` :
          'Not found');
      }

      console.log('Final locationId after processing:', formattedData.locationId, 'Type:', typeof formattedData.locationId);

      // Handle capabilityId (convert ObjectId to string)
      console.log('Raw capabilityId before processing:', formattedData.capabilityId, 'Type:', typeof formattedData.capabilityId);
      console.log('Raw capability object before processing:', formattedData.capability);

      // Store the original capability object for reference
      const originalCapability = formattedData.capability || initialData.capability;

      // Check if we have a populated capability object from the API
      if (initialData.capabilityId && typeof initialData.capabilityId === 'object') {
        // This is likely a populated object from the API
        if (initialData.capabilityId._id) {
          // Extract the ID from the populated object
          formattedData.capabilityId = String(initialData.capabilityId._id);
          console.log('Extracted capabilityId from populated object in initialData:', formattedData.capabilityId);

          // Also store the capability object for reference
          if (!formattedData.capability) {
            formattedData.capability = initialData.capabilityId;
            console.log('Stored capability object from initialData.capabilityId');
          }
        }
      }

      // Check if we have a capability object but no capabilityId
      if (!formattedData.capabilityId && originalCapability && typeof originalCapability === 'object') {
        if (originalCapability._id) {
          formattedData.capabilityId = String(originalCapability._id);
          console.log('Extracted capabilityId from capability object:', formattedData.capabilityId);
        } else if (originalCapability.id) {
          formattedData.capabilityId = String(originalCapability.id);
          console.log('Extracted capabilityId from capability.id:', formattedData.capabilityId);
        }
      }

      // Now process the formattedData.capabilityId
      if (formattedData.capabilityId && typeof formattedData.capabilityId === 'object') {
        if (formattedData.capabilityId._id) {
          // If it has an _id property, use that
          const originalId = formattedData.capabilityId._id;
          formattedData.capabilityId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted capabilityId from object to string ID:', formattedData.capabilityId, 'Original:', originalId);
        } else if (formattedData.capabilityId.id) {
          // Some objects might use 'id' instead of '_id'
          const originalId = formattedData.capabilityId.id;
          formattedData.capabilityId = typeof originalId === 'object' && originalId.toString ?
            originalId.toString() :
            String(originalId);
          console.log('Converted capabilityId from object with id to string:', formattedData.capabilityId, 'Original:', originalId);
        } else {
          console.log('capabilityId is an object without _id or id, setting to "none":', formattedData.capabilityId);
          formattedData.capabilityId = "none";
        }
      } else if (!formattedData.capabilityId) {
        formattedData.capabilityId = "none";
        console.log('capabilityId is empty, setting to "none"');
      } else {
        console.log('capabilityId is already a primitive value:', formattedData.capabilityId);
        // Ensure it's a string
        formattedData.capabilityId = String(formattedData.capabilityId);
      }

      // Debug: Check if the capabilityId matches any of the available capabilities
      if (formattedData.capabilityId) {
        const matchingCapability = capabilities.find(c => String(c._id) === String(formattedData.capabilityId));
        console.log('Matching capability for form initialization:', matchingCapability ?
          `Found: ${matchingCapability.capabilityName || matchingCapability.shortName}` :
          'Not found');
      }

      console.log('Final capabilityId after processing:', formattedData.capabilityId, 'Type:', typeof formattedData.capabilityId);

      // Handle image fields
      console.log('Description image before processing:', formattedData.descriptionImg);
      console.log('Key result image before processing:', formattedData.keyResultImg);
      console.log('Images object before processing:', formattedData.images);

      // Check if images are in the nested structure
      if (formattedData.images) {
        if (!formattedData.descriptionImg && formattedData.images.description) {
          formattedData.descriptionImg = formattedData.images.description;
          console.log('Found description image in nested structure:', formattedData.descriptionImg);
        }

        if (!formattedData.keyResultImg && formattedData.images.keyResult) {
          formattedData.keyResultImg = formattedData.images.keyResult;
          console.log('Found key result image in nested structure:', formattedData.keyResultImg);
        }
      }

      // Handle descriptionImg
      if (formattedData.descriptionImg) {
        console.log('Raw descriptionImg before processing:', formattedData.descriptionImg, 'Type:', typeof formattedData.descriptionImg);

        // If it's an object, try to convert it to a string
        if (typeof formattedData.descriptionImg === 'object') {
          if (formattedData.descriptionImg === null) {
            // If it's null, keep it as null
            console.log('descriptionImg is null');
          } else if (formattedData.descriptionImg._isBinary) {
            // This is our special marker for a Binary object that was converted to base64 by the API
            try {
              // Decode the base64 string
              const decoded = Buffer.from(formattedData.descriptionImg.base64Data, 'base64').toString();
              console.log('Decoded base64 data for descriptionImg:', decoded);

              if (decoded.startsWith('/uploads/')) {
                formattedData.descriptionImg = decoded;
                console.log('Successfully decoded Binary to path for descriptionImg:', formattedData.descriptionImg);
              } else {
                console.error('Decoded Binary does not contain a valid path for descriptionImg:', decoded);
                formattedData.descriptionImg = null;
              }
            } catch (error) {
              console.error('Error decoding base64 data for descriptionImg:', error);
              formattedData.descriptionImg = null;
            }
          } else if (formattedData.descriptionImg.buffer && formattedData.descriptionImg.subType === 0) {
            // If it's a Binary object, try to convert it to a string
            try {
              // Try to convert Binary to string
              const binaryString = formattedData.descriptionImg.toString();
              console.log('Binary toString result for descriptionImg:', binaryString);

              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                formattedData.descriptionImg = binaryString;
                console.log('Binary object contains a direct path for descriptionImg:', formattedData.descriptionImg);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  console.log('Decoded base64 result for descriptionImg:', decoded);

                  if (decoded.startsWith('/uploads/')) {
                    formattedData.descriptionImg = decoded;
                    console.log('Successfully decoded Binary to path for descriptionImg:', formattedData.descriptionImg);
                  } else {
                    console.error('Decoded Binary does not contain a valid path for descriptionImg:', decoded);
                    formattedData.descriptionImg = null;
                  }
                } catch (decodeError) {
                  console.error('Failed to decode Binary for descriptionImg:', decodeError);
                  formattedData.descriptionImg = null;
                }
              }
            } catch (error) {
              console.error('Error processing Binary object for descriptionImg:', error);
              formattedData.descriptionImg = null;
            }
          } else if (formattedData.descriptionImg.type === 'Buffer') {
            // Convert Buffer to string ID if needed
            formattedData.descriptionImg = formattedData.descriptionImg.toString();
            console.log('Converted Buffer descriptionImg to string:', formattedData.descriptionImg);
          } else if (formattedData.descriptionImg._id) {
            // If it's an ObjectId, use the string representation
            formattedData.descriptionImg = formattedData.descriptionImg._id.toString();
            console.log('Converted ObjectId descriptionImg to string:', formattedData.descriptionImg);
          } else {
            // For any other object, convert to string or set to null
            try {
              const stringValue = JSON.stringify(formattedData.descriptionImg);
              console.log('Converted object descriptionImg to JSON string:', stringValue);
              // Don't use the stringified object as the ID, set to null instead
              formattedData.descriptionImg = null;
            } catch (error) {
              console.error('Failed to stringify descriptionImg object:', error);
              formattedData.descriptionImg = null;
            }
          }
        }

        // If it's a string, validate it
        if (formattedData.descriptionImg && typeof formattedData.descriptionImg === 'string') {
          // Keep any string value, even if it's not a valid ObjectId
          console.log('Final descriptionImg string value:', formattedData.descriptionImg);
        }
      }

      // Handle keyResultImg
      if (formattedData.keyResultImg) {
        console.log('Raw keyResultImg before processing:', formattedData.keyResultImg, 'Type:', typeof formattedData.keyResultImg);

        // If it's an object, try to convert it to a string
        if (typeof formattedData.keyResultImg === 'object') {
          if (formattedData.keyResultImg === null) {
            // If it's null, keep it as null
            console.log('keyResultImg is null');
          } else if (formattedData.keyResultImg._isBinary) {
            // This is our special marker for a Binary object that was converted to base64 by the API
            try {
              // Decode the base64 string
              const decoded = Buffer.from(formattedData.keyResultImg.base64Data, 'base64').toString();
              console.log('Decoded base64 data for keyResultImg:', decoded);

              if (decoded.startsWith('/uploads/')) {
                formattedData.keyResultImg = decoded;
                console.log('Successfully decoded Binary to path for keyResultImg:', formattedData.keyResultImg);
              } else {
                console.error('Decoded Binary does not contain a valid path for keyResultImg:', decoded);
                formattedData.keyResultImg = null;
              }
            } catch (error) {
              console.error('Error decoding base64 data for keyResultImg:', error);
              formattedData.keyResultImg = null;
            }
          } else if (formattedData.keyResultImg.buffer && formattedData.keyResultImg.subType === 0) {
            // If it's a Binary object, try to convert it to a string
            try {
              // Try to convert Binary to string
              const binaryString = formattedData.keyResultImg.toString();
              console.log('Binary toString result for keyResultImg:', binaryString);

              // Check if it's a base64 encoded path
              if (binaryString.startsWith('/uploads/')) {
                formattedData.keyResultImg = binaryString;
                console.log('Binary object contains a direct path for keyResultImg:', formattedData.keyResultImg);
              } else {
                // Try to decode from base64 if it might be encoded
                try {
                  const decoded = Buffer.from(binaryString, 'base64').toString();
                  console.log('Decoded base64 result for keyResultImg:', decoded);

                  if (decoded.startsWith('/uploads/')) {
                    formattedData.keyResultImg = decoded;
                    console.log('Successfully decoded Binary to path for keyResultImg:', formattedData.keyResultImg);
                  } else {
                    console.error('Decoded Binary does not contain a valid path for keyResultImg:', decoded);
                    formattedData.keyResultImg = null;
                  }
                } catch (decodeError) {
                  console.error('Failed to decode Binary for keyResultImg:', decodeError);
                  formattedData.keyResultImg = null;
                }
              }
            } catch (error) {
              console.error('Error processing Binary object for keyResultImg:', error);
              formattedData.keyResultImg = null;
            }
          } else if (formattedData.keyResultImg.type === 'Buffer') {
            // Convert Buffer to string ID if needed
            formattedData.keyResultImg = formattedData.keyResultImg.toString();
            console.log('Converted Buffer keyResultImg to string:', formattedData.keyResultImg);
          } else if (formattedData.keyResultImg._id) {
            // If it's an ObjectId, use the string representation
            formattedData.keyResultImg = formattedData.keyResultImg._id.toString();
            console.log('Converted ObjectId keyResultImg to string:', formattedData.keyResultImg);
          } else {
            // For any other object, convert to string or set to null
            try {
              const stringValue = JSON.stringify(formattedData.keyResultImg);
              console.log('Converted object keyResultImg to JSON string:', stringValue);
              // Don't use the stringified object as the ID, set to null instead
              formattedData.keyResultImg = null;
            } catch (error) {
              console.error('Failed to stringify keyResultImg object:', error);
              formattedData.keyResultImg = null;
            }
          }
        }

        // If it's a string, validate it
        if (formattedData.keyResultImg && typeof formattedData.keyResultImg === 'string') {
          // Keep any string value, even if it's not a valid ObjectId
          console.log('Final keyResultImg string value:', formattedData.keyResultImg);
        }
      }

      console.log('Description image after processing:', formattedData.descriptionImg);
      console.log('Key result image after processing:', formattedData.keyResultImg);

      // Log the final values for capability and location
      console.log('Final capabilityId value:', formattedData.capabilityId, 'Type:', typeof formattedData.capabilityId);
      console.log('Final locationId value:', formattedData.locationId, 'Type:', typeof formattedData.locationId);

      // Log the available capabilities and locations for comparison
      console.log('Available capabilities:', capabilities.map(c => ({ id: c._id, name: c.capabilityName || c.shortName })));
      console.log('Available locations:', locations.map(l => ({ id: l._id, name: `${l.locationId} - ${l.sublocation}` })));

      setFormData(formattedData);
    }
  }, [initialData, capabilities, locations]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Ensure we never set undefined values
    setFormData((prev) => ({ ...prev, [name]: value === undefined ? "" : value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    console.log(`handleSelectChange called for ${name}:`, {
      oldValue: formData[name],
      newValue: value,
      oldValueType: typeof formData[name],
      newValueType: typeof value
    });


    // Special handling for capabilityId and locationId
    if (name === 'capabilityId' || name === 'locationId') {
      // For locationId and capabilityId, handle the "none" value specially
      if ((name === 'locationId' || name === 'capabilityId') && value === 'none') {
        setFormData((prev) => ({ ...prev, [name]: "none" }));
        console.log(`Updated ${name} to "none"`);
        return;
      }

      // For both fields, ensure we're storing the value as a string
      setFormData((prev) => ({ ...prev, [name]: String(value) }));

      // Log the updated value
      console.log(`Updated ${name} to:`, value, 'Type:', typeof value);

      // Debug: Check if the value matches any of the available options
      if (name === 'capabilityId') {
        const matchingCapability = capabilities.find(c => String(c._id) === String(value));
        console.log('Matching capability:', matchingCapability ?
          `Found: ${matchingCapability.capabilityName || matchingCapability.shortName}` :
          'Not found');
      } else if (name === 'locationId') {
        const matchingLocation = locations.find(l => String(l._id) === String(value));
        console.log('Matching location:', matchingLocation ?
          `Found: ${matchingLocation.locationId} - ${matchingLocation.sublocation}` :
          'Not found');
      }

      return;
    }

    // For other fields, ensure we never set undefined values
    setFormData((prev) => ({ ...prev, [name]: value === undefined ? "" : value }));
  };

  // Handle checkbox changes for service type
  const handleServiceTypeChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      // Ensure serviceType is always an array
      const currentServiceTypes = Array.isArray(prev.serviceType) ? [...prev.serviceType] : [];

      if (checked) {
        if (!currentServiceTypes.includes(value)) {
          return { ...prev, serviceType: [...currentServiceTypes, value] };
        }
      } else {
        return { ...prev, serviceType: currentServiceTypes.filter(type => type !== value) };
      }

      // Always return the current state if no changes
      return prev;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TestMethodForm handleSubmit called');
    console.log('Form data being submitted:', formData);

    // Log the current form data before submission
    console.log('Form data before submission:', {
      ...formData,
      capabilityId: {
        value: formData.capabilityId,
        type: typeof formData.capabilityId
      },
      locationId: {
        value: formData.locationId,
        type: typeof formData.locationId
      }
    });

    // Check if we have files to upload
    const hasFilesToUpload = descriptionImgFile || keyResultImgFile;

    if (hasFilesToUpload) {
      setIsUploading(true);
      setUploadProgress({ description: false, keyResult: false });
    }

    // Upload files if needed
    let descriptionImgId = formData.descriptionImg;
    let keyResultImgId = formData.keyResultImg;

    try {
      // Upload description image if selected
      if (descriptionImgFile) {
        descriptionImgId = await uploadFile(descriptionImgFile, 'description');
        setUploadProgress(prev => ({ ...prev, description: true }));
      }

      // Upload key result image if selected
      if (keyResultImgFile) {
        keyResultImgId = await uploadFile(keyResultImgFile, 'keyResult');
        setUploadProgress(prev => ({ ...prev, keyResult: true }));
      }

      // Ensure image IDs are strings
      let descriptionImgString = null;
      if (descriptionImgId) {
        console.log('Raw descriptionImgId before processing:', descriptionImgId, 'Type:', typeof descriptionImgId);

        if (typeof descriptionImgId === 'object') {
          if (descriptionImgId === null) {
            // If it's null, keep it as null
            console.log('descriptionImgId is null');
          } else if (descriptionImgId._id) {
            // If it's an ObjectId, convert to string
            descriptionImgString = descriptionImgId._id.toString();
            console.log('Converted descriptionImgId from ObjectId to string:', descriptionImgString);
          } else {
            // For any other object, try to get a meaningful string or set to null
            try {
              // Don't use the stringified object as the ID, set to null instead
              console.log('descriptionImgId is an object without _id property:', descriptionImgId);
              descriptionImgString = null;
            } catch (error) {
              console.error('Error processing descriptionImgId object:', error);
              descriptionImgString = null;
            }
          }
        } else if (typeof descriptionImgId === 'string') {
          // If it's already a string, use it directly
          descriptionImgString = descriptionImgId;
          console.log('descriptionImgId is already a string:', descriptionImgString);
        } else {
          // For any other type, set to null
          console.log('descriptionImgId is an unsupported type:', typeof descriptionImgId);
          descriptionImgString = null;
        }
      }

      let keyResultImgString = null;
      if (keyResultImgId) {
        console.log('Raw keyResultImgId before processing:', keyResultImgId, 'Type:', typeof keyResultImgId);

        if (typeof keyResultImgId === 'object') {
          if (keyResultImgId === null) {
            // If it's null, keep it as null
            console.log('keyResultImgId is null');
          } else if (keyResultImgId._id) {
            // If it's an ObjectId, convert to string
            keyResultImgString = keyResultImgId._id.toString();
            console.log('Converted keyResultImgId from ObjectId to string:', keyResultImgString);
          } else {
            // For any other object, try to get a meaningful string or set to null
            try {
              // Don't use the stringified object as the ID, set to null instead
              console.log('keyResultImgId is an object without _id property:', keyResultImgId);
              keyResultImgString = null;
            } catch (error) {
              console.error('Error processing keyResultImgId object:', error);
              keyResultImgString = null;
            }
          }
        } else if (typeof keyResultImgId === 'string') {
          // If it's already a string, use it directly
          keyResultImgString = keyResultImgId;
          console.log('keyResultImgId is already a string:', keyResultImgString);
        } else {
          // For any other type, set to null
          console.log('keyResultImgId is an unsupported type:', typeof keyResultImgId);
          keyResultImgString = null;
        }
      }

      console.log('Final image IDs after processing:', {
        descriptionImgString,
        keyResultImgString
      });

      // Process the form data
      const processedData = {
        ...formData,
        // Keep price fields as strings to match database format
        price: formData.price || undefined,
        priorityPrice: formData.priorityPrice || undefined,
        // Convert string values to numbers for numeric fields (non-price fields)
        sampleAmount: formData.sampleAmount ? parseFloat(formData.sampleAmount) : undefined,
        workingHour: formData.workingHour ? parseFloat(formData.workingHour) : undefined,
        resultAnalysisTime: formData.resultAnalysisTime ? parseFloat(formData.resultAnalysisTime) : undefined,
        analysisLeadtime: formData.analysisLeadtime ? parseFloat(formData.analysisLeadtime) : undefined,
        testingTime: formData.testingTime ? parseFloat(formData.testingTime) : undefined,
        noSamplePerYear: formData.noSamplePerYear ? parseFloat(formData.noSamplePerYear) : undefined,
        erSlotTime: formData.erSlotTime ? parseFloat(formData.erSlotTime) : undefined,
        equipmentId: formData.equipmentId ? parseFloat(formData.equipmentId) : undefined,
        erTimeStart: formData.erTimeStart ? parseFloat(formData.erTimeStart) : undefined,
        erTimeEnd: formData.erTimeEnd ? parseFloat(formData.erTimeEnd) : undefined,
        // Convert date string to Date object
        priceEffectiveDate: formData.priceEffectiveDate ? new Date(formData.priceEffectiveDate) : undefined,
        // Convert locationId to null if it's "none" or empty
        locationId: formData.locationId === "none" || formData.locationId === "" ? null : formData.locationId,
        // Convert capabilityId to null if it's empty or "none"
        capabilityId: formData.capabilityId === "" || formData.capabilityId === "none" ? null : formData.capabilityId,
      };

      // Validate and process image paths
      let validDescriptionImg = null;
      if (descriptionImgString && typeof descriptionImgString === 'string') {
        // Only use the path if it starts with /uploads/
        validDescriptionImg = descriptionImgString.startsWith('/uploads/') ? descriptionImgString : null;
      }

      let validKeyResultImg = null;
      if (keyResultImgString && typeof keyResultImgString === 'string') {
        // Only use the path if it starts with /uploads/
        validKeyResultImg = keyResultImgString.startsWith('/uploads/') ? keyResultImgString : null;
      }

      // Process images from the form data
      let validDescriptionImgFromForm = null;
      if (formData.images && formData.images.description && typeof formData.images.description === 'string') {
        // Only use the path if it starts with /uploads/
        validDescriptionImgFromForm = formData.images.description.startsWith('/uploads/') ? formData.images.description : null;
      }

      let validKeyResultImgFromForm = null;
      if (formData.images && formData.images.keyResult && typeof formData.images.keyResult === 'string') {
        // Only use the path if it starts with /uploads/
        validKeyResultImgFromForm = formData.images.keyResult.startsWith('/uploads/') ? formData.images.keyResult : null;
      }

      // Add the validated image paths to the processed data
      processedData.descriptionImg = validDescriptionImg;
      processedData.keyResultImg = validKeyResultImg;

      // Update the images object with valid paths
      processedData.images = {
        description: validDescriptionImg || validDescriptionImgFromForm || '',
        keyResult: validKeyResultImg || validKeyResultImgFromForm || '',
      };

      console.log('Form data before processing:', formData);
      console.log('Submitting test method data:', processedData);

      onSubmit(processedData);
    } catch (error) {
      console.error('Error during form submission:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (hasFilesToUpload) {
        setIsUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="methodcode">Method Code *</Label>
            <Input
              id="methodcode"
              name="methodcode"
              value={formData.methodcode}
              onChange={handleChange}
              required
              placeholder="e.g., MS-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testingName">Testing Name *</Label>
            <Input
              id="testingName"
              name="testingName"
              value={formData.testingName}
              onChange={handleChange}
              required
              placeholder="e.g., SEM Analysis"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="detailEng">Description (English)</Label>
            <Textarea
              id="detailEng"
              name="detailEng"
              value={formData.detailEng}
              onChange={handleChange}
              placeholder="Enter description in English"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detailTh">Description (Thai)</Label>
            <Textarea
              id="detailTh"
              name="detailTh"
              value={formData.detailTh}
              onChange={handleChange}
              placeholder="Enter description in Thai"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyResult">Key Results</Label>
          <Textarea
            id="keyResult"
            name="keyResult"
            value={formData.keyResult}
            onChange={handleChange}
            placeholder="Enter key results (comma separated)"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Standard Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 5000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priorityPrice">Priority Price</Label>
            <Input
              id="priorityPrice"
              name="priorityPrice"
              type="number"
              value={formData.priorityPrice}
              onChange={handleChange}
              placeholder="e.g., 7500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sampleAmount">Sample Amount</Label>
            <Input
              id="sampleAmount"
              name="sampleAmount"
              type="number"
              value={formData.sampleAmount}
              onChange={handleChange}
              placeholder="e.g., 5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., g, ml, pieces"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workingHour">Working Hours</Label>
            <Input
              id="workingHour"
              name="workingHour"
              type="number"
              value={formData.workingHour}
              onChange={handleChange}
              placeholder="e.g., 8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testingTime">Testing Time (minutes)</Label>
            <Input
              id="testingTime"
              name="testingTime"
              type="number"
              value={formData.testingTime}
              onChange={handleChange}
              placeholder="e.g., 120"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resultAnalysisTime">Result Analysis Time (minutes)</Label>
            <Input
              id="resultAnalysisTime"
              name="resultAnalysisTime"
              type="number"
              value={formData.resultAnalysisTime}
              onChange={handleChange}
              placeholder="e.g., 60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysisLeadtime">Analysis Lead Time (days)</Label>
            <Input
              id="analysisLeadtime"
              name="analysisLeadtime"
              type="number"
              value={formData.analysisLeadtime}
              onChange={handleChange}
              placeholder="e.g., 3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Service Type</Label>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceType-ntr"
                checked={formData.serviceType?.includes('NTR')}
                onCheckedChange={(checked) => handleServiceTypeChange('NTR', checked as boolean)}
              />
              <Label htmlFor="serviceType-ntr" className="font-normal">NTR</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceType-asr"
                checked={formData.serviceType?.includes('ASR')}
                onCheckedChange={(checked) => handleServiceTypeChange('ASR', checked as boolean)}
              />
              <Label htmlFor="serviceType-asr" className="font-normal">ASR</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceType-er"
                checked={formData.serviceType?.includes('ER')}
                onCheckedChange={(checked) => handleServiceTypeChange('ER', checked as boolean)}
              />
              <Label htmlFor="serviceType-er" className="font-normal">ER</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="methodType">Method Type</Label>
            <Input
              id="methodType"
              name="methodType"
              value={formData.methodType}
              onChange={handleChange}
              placeholder="e.g., Microscopy, Rheological"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noSamplePerYear">Samples Per Year</Label>
            <Input
              id="noSamplePerYear"
              name="noSamplePerYear"
              type="number"
              value={formData.noSamplePerYear}
              onChange={handleChange}
              placeholder="e.g., 120"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capabilityId">Capability</Label>
          <Select
            value={String(formData.capabilityId || "")}
            onValueChange={(value) => handleSelectChange('capabilityId', value)}
            defaultValue={String(formData.capabilityId || "")}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a capability">
                {(() => {
                  // Find the matching capability
                  const matchingCapability = capabilities.find(c => String(c._id) === String(formData.capabilityId));

                  console.log('Capability SelectValue rendering:', {
                    formDataCapabilityId: formData.capabilityId,
                    formDataCapabilityIdType: typeof formData.capabilityId,
                    matchingCapability: matchingCapability ?
                      `Found: ${matchingCapability.capabilityName || matchingCapability.shortName}` :
                      'Not found',
                    allCapabilities: capabilities.map(c => ({ id: c._id, name: c.capabilityName || c.shortName }))
                  });

                  if (formData.capabilityId === "none") {
                    return "None";
                  }

                  if (formData.capabilityId && matchingCapability) {
                    return matchingCapability.capabilityName || matchingCapability.shortName;
                  }

                  return "Select a capability";
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {capabilities.map((capability) => {
                // Use string comparison for more reliable matching
                const isSelected = String(capability._id) === String(formData.capabilityId);

                if (isSelected) {
                  console.log('Found matching capability in dropdown:', {
                    capabilityId: capability._id,
                    capabilityName: capability.capabilityName || capability.shortName,
                    formDataCapabilityId: formData.capabilityId,
                    match: isSelected
                  });
                }

                return (
                  <SelectItem key={capability._id} value={String(capability._id)}>
                    {capability.capabilityName || capability.shortName}
                    {isSelected ? " ✓" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground mt-1">
            {formData.capabilityId === "none" ?
              "No capability selected" :
              (formData.capabilityId ?
                `Selected capability ID: ${formData.capabilityId}` :
                "No capability selected")}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipmentName">Equipment Name</Label>
          <Combobox
            options={equipment
              .filter(eq => (eq.equipmentName || eq.name) && (eq.equipmentName || eq.name).trim() !== '') // Filter out equipment with empty names
              .map((eq, index) => ({
                value: eq._id || eq.id || `equipment-${index}`,
                label: `${eq.equipmentName || eq.name || 'Unnamed Equipment'} (${eq.equipmentCode || eq.code || 'No Code'})`
              }))}
            value={(() => {
              // Find equipment by name and return its ID
              const foundEquipment = equipment.find(eq => 
                (eq.equipmentName === formData.equipmentName) || 
                (eq.name === formData.equipmentName)
              );
              return foundEquipment ? (foundEquipment._id || foundEquipment.id || '') : '';
            })()}
            onChange={(value) => {
              // Find equipment by ID and update the form
              const selectedEquipment = equipment.find(eq => (eq._id || eq.id) === value);
              if (selectedEquipment) {
                console.log('Selected equipment details:', selectedEquipment);
                // Store only the equipment name (without code) as static text
                const equipmentNameOnly = selectedEquipment.equipmentName || selectedEquipment.name || '';
                
                setFormData((prev) => ({ 
                  ...prev, 
                  equipmentName: equipmentNameOnly, // Static name only, no code
                  equipmentId: selectedEquipment._id || selectedEquipment.id || '' // Reference ID to Equipment collection
                }));
              }
            }}
            placeholder="Select equipment"
            emptyMessage="No equipment found"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipmentId">Equipment ID (Reference)</Label>
          <Input
            id="equipmentId"
            name="equipmentId"
            type="text"
            value={formData.equipmentId}
            disabled
            className="bg-gray-100"
            placeholder="Auto-filled when equipment is selected"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationId">Location</Label>
          <Select
            value={String(formData.locationId || "none")}
            onValueChange={(value) => handleSelectChange('locationId', value)}
            defaultValue={String(formData.locationId || "none")}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a location">
                {(() => {
                  if (formData.locationId === "none") {
                    return "None";
                  }

                  // Find the matching location
                  const matchingLocation = locations.find(l => String(l._id) === String(formData.locationId));

                  console.log('Location SelectValue rendering:', {
                    formDataLocationId: formData.locationId,
                    formDataLocationIdType: typeof formData.locationId,
                    matchingLocation: matchingLocation ?
                      `Found: ${matchingLocation.locationId} - ${matchingLocation.sublocation}` :
                      'Not found',
                    allLocations: locations.map(l => ({ id: l._id, name: `${l.locationId} - ${l.sublocation}` }))
                  });

                  if (formData.locationId && matchingLocation) {
                    return `${matchingLocation.locationId} - ${matchingLocation.sublocation}`;
                  }

                  return "Select a location";
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {locations.map((location) => {
                // Use string comparison for more reliable matching
                const isSelected = String(location._id) === String(formData.locationId);

                if (isSelected) {
                  console.log('Found matching location in dropdown:', {
                    locationId: location._id,
                    locationName: `${location.locationId} - ${location.sublocation}`,
                    formDataLocationId: formData.locationId,
                    match: isSelected
                  });
                }

                return (
                  <SelectItem key={location._id} value={String(location._id)}>
                    {location.locationId} - {location.sublocation}
                    {isSelected ? " ✓" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {formData.locationId && formData.locationId !== "none" && (
            <div className="text-xs text-muted-foreground mt-1">
              Selected location ID: {formData.locationId}
            </div>
          )}
        </div>

        {/* Image uploads */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Description Image</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  ref={descriptionImgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'description')}
                  className="cursor-pointer"
                />
              </div>
              {(descriptionImgFile || formData.descriptionImg) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveFile('description')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {formData.descriptionImg && !descriptionImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Image uploaded</span>
                  <div className="ml-auto">
                    <a
                      href={typeof formData.descriptionImg === 'string' ? formData.descriptionImg : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
                <div className="w-full h-32 relative">
                  {/* Add a key with a timestamp to force re-render */}
                  {(() => {
                    // Process the image ID to ensure it's a string
                    let imageId = formData.descriptionImg;
                    let imageIdStr = '';

                    if (typeof imageId === 'string') {
                      imageIdStr = imageId;
                      console.log('Image ID is a string:', imageIdStr);
                    } else if (typeof imageId === 'object' && imageId !== null) {
                      // Check if it's a Binary object (from MongoDB)
                      if (imageId.buffer && imageId.subType === 0) {
                        try {
                          // Try to convert Binary to string
                          const binaryString = imageId.toString();
                          console.log('Binary toString result:', binaryString);

                          // Check if it's a base64 encoded path
                          if (binaryString.startsWith('/uploads/')) {
                            imageIdStr = binaryString;
                            console.log('Binary object contains a direct path:', imageIdStr);
                          } else {
                            // Try to decode from base64 if it might be encoded
                            try {
                              const decoded = Buffer.from(binaryString, 'base64').toString();
                              console.log('Decoded base64 result:', decoded);

                              if (decoded.startsWith('/uploads/')) {
                                imageIdStr = decoded;
                                console.log('Successfully decoded Binary to path:', imageIdStr);
                              } else {
                                console.error('Decoded Binary does not contain a valid path:', decoded);
                                return (
                                  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                    <span className="text-sm text-red-500">Failed to load image</span>
                                    <span className="text-xs text-gray-500">Binary data does not decode to a valid path</span>
                                    <button
                                      className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          descriptionImg: null,
                                          images: {
                                            ...prev.images,
                                            description: ''
                                          }
                                        }));
                                      }}
                                    >
                                      Remove Invalid Image
                                    </button>
                                  </div>
                                );
                              }
                            } catch (decodeError) {
                              console.error('Failed to decode Binary:', decodeError);
                              return (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                  <span className="text-sm text-red-500">Failed to load image</span>
                                  <span className="text-xs text-gray-500">Binary data decode error</span>
                                  <button
                                    className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        descriptionImg: null,
                                        images: {
                                          ...prev.images,
                                          description: ''
                                        }
                                      }));
                                    }}
                                  >
                                    Remove Invalid Image
                                  </button>
                                </div>
                              );
                            }
                          }
                        } catch (error) {
                          console.error('Error processing Binary object:', error);
                          return (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                              <span className="text-sm text-red-500">Failed to load image</span>
                              <span className="text-xs text-gray-500">Binary processing error</span>
                              <button
                                className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    descriptionImg: null,
                                    images: {
                                      ...prev.images,
                                      description: ''
                                    }
                                  }));
                                }}
                              >
                                Remove Invalid Image
                              </button>
                            </div>
                          );
                        }
                      } else if (imageId._id) {
                        // If it's an ObjectId, use the string representation
                        imageIdStr = imageId._id.toString();
                        console.log('Extracted string ID from object:', imageIdStr);
                      } else {
                        console.error('Image ID is an object without _id property or buffer:', imageId);
                        return (
                          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                            <span className="text-sm text-red-500">Failed to load image</span>
                            <span className="text-xs text-gray-500">ID is an invalid object</span>
                            <button
                              className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  descriptionImg: null,
                                  images: {
                                    ...prev.images,
                                    description: ''
                                  }
                                }));
                              }}
                            >
                              Remove Invalid Image
                            </button>
                          </div>
                        );
                      }
                    } else {
                      console.error('Image ID is not a string or object:', imageId);
                      return (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                          <span className="text-sm text-red-500">Failed to load image</span>
                          <span className="text-xs text-gray-500">ID type: {typeof imageId}</span>
                          <button
                            className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                descriptionImg: null,
                                images: {
                                  ...prev.images,
                                  description: ''
                                }
                              }));
                            }}
                          >
                            Remove Invalid Image
                          </button>
                        </div>
                      );
                    }

                    // Now we have a string ID, render the image
                    return (
                      <img
                        key={`desc-img-${Date.now()}`}
                        src={`${imageIdStr}?t=${Date.now()}`}
                        alt="Description image"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // If image fails to load, show error message
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex flex-col items-center justify-center h-full bg-gray-100';
                            errorDiv.innerHTML = `
                              <span class="text-sm text-red-500">Failed to load image</span>
                              <span class="text-xs text-gray-500 mb-2">Path: ${imageIdStr}</span>
                              <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      id="remove-desc-img-btn">
                                Remove Invalid Image
                              </button>
                            `;
                            parent.appendChild(errorDiv);

                            // Add event listener to the remove button
                            setTimeout(() => {
                              const removeBtn = document.getElementById('remove-desc-img-btn');
                              if (removeBtn) {
                                removeBtn.addEventListener('click', (event) => {
                                  event.preventDefault();
                                  // Clear the description image
                                  setFormData(prev => ({
                                    ...prev,
                                    descriptionImg: null,
                                    images: {
                                      ...prev.images,
                                      description: ''
                                    }
                                  }));
                                  // Remove the error div
                                  if (parent && errorDiv) {
                                    parent.removeChild(errorDiv);
                                  }
                                });
                              }
                            }, 0);
                          }
                          console.error('Failed to load description image:', imageIdStr);

                          // Try to use the backup image from images object if available
                          if (formData.images && formData.images.description &&
                              typeof formData.images.description === 'string' &&
                              formData.images.description.trim() !== '' &&
                              formData.images.description !== imageIdStr) {
                            console.log('Trying backup image from images.description:', formData.images.description);
                            const backupImg = document.createElement('img');
                            const backupPath = formData.images.description;
                            backupImg.src = `${backupPath}?t=${Date.now()}`;
                            backupImg.alt = "Description image (backup)";
                            backupImg.className = "w-full h-full object-contain";
                            backupImg.onerror = () => {
                              backupImg.style.display = 'none';
                              console.error('Failed to load backup description image:', formData.images.description);
                            };
                            parent.appendChild(backupImg);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Fallback for when descriptionImg is not a valid ID but we have an image in the images object */}
            {!formData.descriptionImg && formData.images && formData.images.description &&
             typeof formData.images.description === 'string' && formData.images.description.trim() !== '' &&
             !descriptionImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Image uploaded (from images object)</span>
                  <div className="ml-auto">
                    <a
                      href={typeof formData.images.description === 'string' ? formData.images.description : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
                <div className="w-full h-32 relative">
                  {/* Add a key with a timestamp to force re-render */}
                  {(() => {
                    // Process the image ID to ensure it's a string
                    let imageId = formData.images.description;
                    let imageIdStr = '';

                    if (typeof imageId === 'string') {
                      imageIdStr = imageId;
                      console.log('Image ID is a string:', imageIdStr);
                    } else if (typeof imageId === 'object' && imageId !== null) {
                      // Check if it's a Binary object (from MongoDB)
                      if (imageId.buffer && imageId.subType === 0) {
                        try {
                          // Try to convert Binary to string
                          const binaryString = imageId.toString();
                          console.log('Binary toString result (images.description):', binaryString);

                          // Check if it's a base64 encoded path
                          if (binaryString.startsWith('/uploads/')) {
                            imageIdStr = binaryString;
                            console.log('Binary object contains a direct path (images.description):', imageIdStr);
                          } else {
                            // Try to decode from base64 if it might be encoded
                            try {
                              const decoded = Buffer.from(binaryString, 'base64').toString();
                              console.log('Decoded base64 result (images.description):', decoded);

                              if (decoded.startsWith('/uploads/')) {
                                imageIdStr = decoded;
                                console.log('Successfully decoded Binary to path (images.description):', imageIdStr);
                              } else {
                                console.error('Decoded Binary does not contain a valid path (images.description):', decoded);
                                return (
                                  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                    <span className="text-sm text-red-500">Failed to load image</span>
                                    <span className="text-xs text-gray-500">Binary data does not decode to a valid path</span>
                                    <button
                                      className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          images: {
                                            ...prev.images,
                                            description: ''
                                          }
                                        }));
                                      }}
                                    >
                                      Remove Invalid Image
                                    </button>
                                  </div>
                                );
                              }
                            } catch (decodeError) {
                              console.error('Failed to decode Binary (images.description):', decodeError);
                              return (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                  <span className="text-sm text-red-500">Failed to load image</span>
                                  <span className="text-xs text-gray-500">Binary data decode error</span>
                                  <button
                                    className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        images: {
                                          ...prev.images,
                                          description: ''
                                        }
                                      }));
                                    }}
                                  >
                                    Remove Invalid Image
                                  </button>
                                </div>
                              );
                            }
                          }
                        } catch (error) {
                          console.error('Error processing Binary object (images.description):', error);
                          return (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                              <span className="text-sm text-red-500">Failed to load image</span>
                              <span className="text-xs text-gray-500">Binary processing error</span>
                              <button
                                className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    images: {
                                      ...prev.images,
                                      description: ''
                                    }
                                  }));
                                }}
                              >
                                Remove Invalid Image
                              </button>
                            </div>
                          );
                        }
                      } else if (imageId._id) {
                        // If it's an ObjectId, use the string representation
                        imageIdStr = imageId._id.toString();
                        console.log('Extracted string ID from images.description object:', imageIdStr);
                      } else {
                        console.error('images.description ID is an object without _id property or buffer:', imageId);
                        return (
                          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                            <span className="text-sm text-red-500">Failed to load image</span>
                            <span className="text-xs text-gray-500">ID is an invalid object</span>
                            <button
                              className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: {
                                    ...prev.images,
                                    description: ''
                                  }
                                }));
                              }}
                            >
                              Remove Invalid Image
                            </button>
                          </div>
                        );
                      }
                    } else {
                      console.error('images.description ID is not a string or object:', imageId);
                      return (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                          <span className="text-sm text-red-500">Failed to load image</span>
                          <span className="text-xs text-gray-500">ID type: {typeof imageId}</span>
                          <button
                            className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: {
                                  ...prev.images,
                                  description: ''
                                }
                              }));
                            }}
                          >
                            Remove Invalid Image
                          </button>
                        </div>
                      );
                    }

                    // Now we have a string ID, render the image
                    return (
                      <img
                        key={`desc-img-fallback-${Date.now()}`}
                        src={`${imageIdStr}?t=${Date.now()}`}
                        alt="Description image"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // If image fails to load, show error message
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex flex-col items-center justify-center h-full bg-gray-100';
                            errorDiv.innerHTML = `
                              <span class="text-sm text-red-500">Failed to load image</span>
                              <span class="text-xs text-gray-500 mb-2">Path: ${imageIdStr}</span>
                              <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      id="remove-desc-img-fallback-btn">
                                Remove Invalid Image
                              </button>
                            `;
                            parent.appendChild(errorDiv);

                            // Add event listener to the remove button
                            setTimeout(() => {
                              const removeBtn = document.getElementById('remove-desc-img-fallback-btn');
                              if (removeBtn) {
                                removeBtn.addEventListener('click', (event) => {
                                  event.preventDefault();
                                  // Clear the description image in images object
                                  setFormData(prev => ({
                                    ...prev,
                                    images: {
                                      ...prev.images,
                                      description: ''
                                    }
                                  }));
                                  // Remove the error div
                                  if (parent && errorDiv) {
                                    parent.removeChild(errorDiv);
                                  }
                                });
                              }
                            }, 0);
                          }
                          console.error('Failed to load description image from images object:', imageIdStr);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}
            {descriptionImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="w-full h-32 relative">
                  <Image
                    src={URL.createObjectURL(descriptionImgFile)}
                    alt="Description preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Key Result Image</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  ref={keyResultImgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'keyResult')}
                  className="cursor-pointer"
                />
              </div>
              {(keyResultImgFile || formData.keyResultImg) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveFile('keyResult')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {formData.keyResultImg && !keyResultImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Image uploaded</span>
                  <div className="ml-auto">
                    <a
                      href={typeof formData.keyResultImg === 'string' ? formData.keyResultImg : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
                <div className="w-full h-32 relative">
                  {/* Add a key with a timestamp to force re-render */}
                  {(() => {
                    // Process the image ID to ensure it's a string
                    let imageId = formData.keyResultImg;
                    let imageIdStr = '';

                    if (typeof imageId === 'string') {
                      imageIdStr = imageId;
                      console.log('Image ID is a string:', imageIdStr);
                    } else if (typeof imageId === 'object' && imageId !== null) {
                      // Check if it's a Binary object (from MongoDB)
                      if (imageId.buffer && imageId.subType === 0) {
                        try {
                          // Try to convert Binary to string
                          const binaryString = imageId.toString();
                          console.log('Binary toString result:', binaryString);

                          // Check if it's a base64 encoded path
                          if (binaryString.startsWith('/uploads/')) {
                            imageIdStr = binaryString;
                            console.log('Binary object contains a direct path:', imageIdStr);
                          } else {
                            // Try to decode from base64 if it might be encoded
                            try {
                              const decoded = Buffer.from(binaryString, 'base64').toString();
                              console.log('Decoded base64 result:', decoded);

                              if (decoded.startsWith('/uploads/')) {
                                imageIdStr = decoded;
                                console.log('Successfully decoded Binary to path:', imageIdStr);
                              } else {
                                console.error('Decoded Binary does not contain a valid path:', decoded);
                                return (
                                  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                    <span className="text-sm text-red-500">Failed to load image</span>
                                    <span className="text-xs text-gray-500">Binary data does not decode to a valid path</span>
                                    <button
                                      className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          keyResultImg: null,
                                          images: {
                                            ...prev.images,
                                            keyResult: ''
                                          }
                                        }));
                                      }}
                                    >
                                      Remove Invalid Image
                                    </button>
                                  </div>
                                );
                              }
                            } catch (decodeError) {
                              console.error('Failed to decode Binary:', decodeError);
                              return (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                  <span className="text-sm text-red-500">Failed to load image</span>
                                  <span className="text-xs text-gray-500">Binary data decode error</span>
                                  <button
                                    className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        keyResultImg: null,
                                        images: {
                                          ...prev.images,
                                          keyResult: ''
                                        }
                                      }));
                                    }}
                                  >
                                    Remove Invalid Image
                                  </button>
                                </div>
                              );
                            }
                          }
                        } catch (error) {
                          console.error('Error processing Binary object:', error);
                          return (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                              <span className="text-sm text-red-500">Failed to load image</span>
                              <span className="text-xs text-gray-500">Binary processing error</span>
                              <button
                                className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    keyResultImg: null,
                                    images: {
                                      ...prev.images,
                                      keyResult: ''
                                    }
                                  }));
                                }}
                              >
                                Remove Invalid Image
                              </button>
                            </div>
                          );
                        }
                      } else if (imageId._id) {
                        // If it's an ObjectId, use the string representation
                        imageIdStr = imageId._id.toString();
                        console.log('Extracted string ID from object:', imageIdStr);
                      } else {
                        console.error('Image ID is an object without _id property or buffer:', imageId);
                        return (
                          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                            <span className="text-sm text-red-500">Failed to load image</span>
                            <span className="text-xs text-gray-500">ID is an invalid object</span>
                            <button
                              className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  keyResultImg: null,
                                  images: {
                                    ...prev.images,
                                    keyResult: ''
                                  }
                                }));
                              }}
                            >
                              Remove Invalid Image
                            </button>
                          </div>
                        );
                      }
                    } else {
                      console.error('Image ID is not a string or object:', imageId);
                      return (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                          <span className="text-sm text-red-500">Failed to load image</span>
                          <span className="text-xs text-gray-500">ID type: {typeof imageId}</span>
                          <button
                            className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                keyResultImg: null,
                                images: {
                                  ...prev.images,
                                  keyResult: ''
                                }
                              }));
                            }}
                          >
                            Remove Invalid Image
                          </button>
                        </div>
                      );
                    }

                    // Now we have a string ID, render the image
                    return (
                      <img
                        key={`key-result-img-${Date.now()}`}
                        src={`${imageIdStr}?t=${Date.now()}`}
                        alt="Key result image"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // If image fails to load, show error message
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex flex-col items-center justify-center h-full bg-gray-100';
                            errorDiv.innerHTML = `
                              <span class="text-sm text-red-500">Failed to load image</span>
                              <span class="text-xs text-gray-500 mb-2">Path: ${imageIdStr}</span>
                              <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      id="remove-key-result-img-btn">
                                Remove Invalid Image
                              </button>
                            `;
                            parent.appendChild(errorDiv);

                            // Add event listener to the remove button
                            setTimeout(() => {
                              const removeBtn = document.getElementById('remove-key-result-img-btn');
                              if (removeBtn) {
                                removeBtn.addEventListener('click', (event) => {
                                  event.preventDefault();
                                  // Clear the key result image
                                  setFormData(prev => ({
                                    ...prev,
                                    keyResultImg: null,
                                    images: {
                                      ...prev.images,
                                      keyResult: ''
                                    }
                                  }));
                                  // Remove the error div
                                  if (parent && errorDiv) {
                                    parent.removeChild(errorDiv);
                                  }
                                });
                              }
                            }, 0);
                          }
                          console.error('Failed to load key result image:', imageIdStr);

                          // Try to use the backup image from images object if available
                          if (formData.images && formData.images.keyResult &&
                              typeof formData.images.keyResult === 'string' &&
                              formData.images.keyResult.trim() !== '' &&
                              formData.images.keyResult !== imageIdStr) {
                            console.log('Trying backup image from images.keyResult:', formData.images.keyResult);
                            const backupImg = document.createElement('img');
                            const backupPath = formData.images.keyResult;
                            backupImg.src = `${backupPath}?t=${Date.now()}`;
                            backupImg.alt = "Key result image (backup)";
                            backupImg.className = "w-full h-full object-contain";
                            backupImg.onerror = () => {
                              backupImg.style.display = 'none';
                              console.error('Failed to load backup key result image:', formData.images.keyResult);
                            };
                            parent.appendChild(backupImg);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Fallback for when keyResultImg is not a valid ID but we have an image in the images object */}
            {!formData.keyResultImg && formData.images && formData.images.keyResult &&
             typeof formData.images.keyResult === 'string' && formData.images.keyResult.trim() !== '' &&
             !keyResultImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Image uploaded (from images object)</span>
                  <div className="ml-auto">
                    <a
                      href={typeof formData.images.keyResult === 'string' ? formData.images.keyResult : ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
                <div className="w-full h-32 relative">
                  {/* Add a key with a timestamp to force re-render */}
                  {(() => {
                    // Process the image ID to ensure it's a string
                    let imageId = formData.images.keyResult;
                    let imageIdStr = '';

                    if (typeof imageId === 'string') {
                      imageIdStr = imageId;
                      console.log('Image ID is a string:', imageIdStr);
                    } else if (typeof imageId === 'object' && imageId !== null) {
                      // Check if it's a Binary object (from MongoDB)
                      if (imageId.buffer && imageId.subType === 0) {
                        try {
                          // Try to convert Binary to string
                          const binaryString = imageId.toString();
                          console.log('Binary toString result (images.keyResult):', binaryString);

                          // Check if it's a base64 encoded path
                          if (binaryString.startsWith('/uploads/')) {
                            imageIdStr = binaryString;
                            console.log('Binary object contains a direct path (images.keyResult):', imageIdStr);
                          } else {
                            // Try to decode from base64 if it might be encoded
                            try {
                              const decoded = Buffer.from(binaryString, 'base64').toString();
                              console.log('Decoded base64 result (images.keyResult):', decoded);

                              if (decoded.startsWith('/uploads/')) {
                                imageIdStr = decoded;
                                console.log('Successfully decoded Binary to path (images.keyResult):', imageIdStr);
                              } else {
                                console.error('Decoded Binary does not contain a valid path (images.keyResult):', decoded);
                                return (
                                  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                    <span className="text-sm text-red-500">Failed to load image</span>
                                    <span className="text-xs text-gray-500">Binary data does not decode to a valid path</span>
                                    <button
                                      className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          images: {
                                            ...prev.images,
                                            keyResult: ''
                                          }
                                        }));
                                      }}
                                    >
                                      Remove Invalid Image
                                    </button>
                                  </div>
                                );
                              }
                            } catch (decodeError) {
                              console.error('Failed to decode Binary (images.keyResult):', decodeError);
                              return (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                                  <span className="text-sm text-red-500">Failed to load image</span>
                                  <span className="text-xs text-gray-500">Binary data decode error</span>
                                  <button
                                    className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        images: {
                                          ...prev.images,
                                          keyResult: ''
                                        }
                                      }));
                                    }}
                                  >
                                    Remove Invalid Image
                                  </button>
                                </div>
                              );
                            }
                          }
                        } catch (error) {
                          console.error('Error processing Binary object (images.keyResult):', error);
                          return (
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                              <span className="text-sm text-red-500">Failed to load image</span>
                              <span className="text-xs text-gray-500">Binary processing error</span>
                              <button
                                className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    images: {
                                      ...prev.images,
                                      keyResult: ''
                                    }
                                  }));
                                }}
                              >
                                Remove Invalid Image
                              </button>
                            </div>
                          );
                        }
                      } else if (imageId._id) {
                        // If it's an ObjectId, use the string representation
                        imageIdStr = imageId._id.toString();
                        console.log('Extracted string ID from images.keyResult object:', imageIdStr);
                      } else {
                        console.error('images.keyResult ID is an object without _id property or buffer:', imageId);
                        return (
                          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                            <span className="text-sm text-red-500">Failed to load image</span>
                            <span className="text-xs text-gray-500">ID is an invalid object</span>
                            <button
                              className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: {
                                    ...prev.images,
                                    keyResult: ''
                                  }
                                }));
                              }}
                            >
                              Remove Invalid Image
                            </button>
                          </div>
                        );
                      }
                    } else {
                      console.error('images.keyResult ID is not a string or object:', imageId);
                      return (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                          <span className="text-sm text-red-500">Failed to load image</span>
                          <span className="text-xs text-gray-500">ID type: {typeof imageId}</span>
                          <button
                            className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: {
                                  ...prev.images,
                                  keyResult: ''
                                }
                              }));
                            }}
                          >
                            Remove Invalid Image
                          </button>
                        </div>
                      );
                    }

                    // Now we have a string ID, render the image
                    return (
                      <img
                        key={`key-result-img-fallback-${Date.now()}`}
                        src={`${imageIdStr}?t=${Date.now()}`}
                        alt="Key result image"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // If image fails to load, show error message
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex flex-col items-center justify-center h-full bg-gray-100';
                            errorDiv.innerHTML = `
                              <span class="text-sm text-red-500">Failed to load image</span>
                              <span class="text-xs text-gray-500 mb-2">Path: ${imageIdStr}</span>
                              <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                      id="remove-key-result-img-fallback-btn">
                                Remove Invalid Image
                              </button>
                            `;
                            parent.appendChild(errorDiv);

                            // Add event listener to the remove button
                            setTimeout(() => {
                              const removeBtn = document.getElementById('remove-key-result-img-fallback-btn');
                              if (removeBtn) {
                                removeBtn.addEventListener('click', (event) => {
                                  event.preventDefault();
                                  // Clear the key result image in images object
                                  setFormData(prev => ({
                                    ...prev,
                                    images: {
                                      ...prev.images,
                                      keyResult: ''
                                    }
                                  }));
                                  // Remove the error div
                                  if (parent && errorDiv) {
                                    parent.removeChild(errorDiv);
                                  }
                                });
                              }
                            }, 0);
                          }
                          console.error('Failed to load key result image from images object:', imageIdStr);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            )}
            {keyResultImgFile && (
              <div className="mt-2 border rounded-md p-2">
                <div className="w-full h-32 relative">
                  <Image
                    src={URL.createObjectURL(keyResultImgFile)}
                    alt="Key result preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="methodAsset">Method Assets</Label>
            <Input
              id="methodAsset"
              name="methodAsset"
              value={formData.methodAsset}
              onChange={handleChange}
              placeholder="e.g., Gold coating, Sample preparation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="methodFoh">Method FOH</Label>
            <Input
              id="methodFoh"
              name="methodFoh"
              value={formData.methodFoh}
              onChange={handleChange}
              placeholder="e.g., Electricity, Nitrogen gas"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceEffectiveDate">Price Effective Date</Label>
          <Input
            id="priceEffectiveDate"
            name="priceEffectiveDate"
            type="date"
            value={formData.priceEffectiveDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceNote">Price Note</Label>
          <Textarea
            id="priceNote"
            name="priceNote"
            value={formData.priceNote}
            onChange={handleChange}
            placeholder="Enter any notes about pricing"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="managable">Manageable</Label>
          <RadioGroup
            value={formData.managable}
            onValueChange={(value) => handleSelectChange('managable', value)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="managable-yes" />
              <Label htmlFor="managable-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="managable-no" />
              <Label htmlFor="managable-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* ER Settings (only show if ER is selected in service type) */}
        {formData.serviceType?.includes('ER') && (
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">ER Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="erSlotTime">Slot Duration (minutes)</Label>
                <Input
                  id="erSlotTime"
                  name="erSlotTime"
                  type="number"
                  value={formData.erSlotTime}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="erTimeStart">Start Time (24h)</Label>
                <Input
                  id="erTimeStart"
                  name="erTimeStart"
                  type="number"
                  value={formData.erTimeStart}
                  onChange={handleChange}
                  placeholder="e.g., 900 for 9:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="erTimeEnd">End Time (24h)</Label>
                <Input
                  id="erTimeEnd"
                  name="erTimeEnd"
                  type="number"
                  value={formData.erTimeEnd}
                  onChange={handleChange}
                  placeholder="e.g., 1700 for 5:00 PM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="erPerSlot">ER Per Slot</Label>
              <Input
                id="erPerSlot"
                name="erPerSlot"
                value={formData.erPerSlot}
                onChange={handleChange}
                placeholder="e.g., 1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="othersRemark">Other Remarks</Label>
          <Textarea
            id="othersRemark"
            name="othersRemark"
            value={formData.othersRemark}
            onChange={handleChange}
            placeholder="Enter any additional remarks"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="methodStatus">Status</Label>
          <Select
            value={formData.methodStatus}
            onValueChange={(value) => handleSelectChange('methodStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading..." : isEditing ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
