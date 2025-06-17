"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"

interface CapabilityFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function CapabilityForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: CapabilityFormProps) {
  const [locations, setLocations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    capabilityName: "",
    shortName: "",
    capabilityDesc: "",
    locationId: "none",
    capHeadGroup: "none",
    reqRunNo: "",
    reqAsrRunNo: ""
  })

  // Fetch locations and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch locations
        try {
          const locResponse = await fetch('/api/locations');

          // Check if response is OK before trying to parse JSON
          if (locResponse.ok) {
            const locData = await locResponse.json();
            setLocations(locData.data || []);
          } else {
            console.error('Error fetching locations:', locResponse.status, locResponse.statusText);
            // Try to get error message if possible
            try {
              const errorData = await locResponse.json();
              console.error('Location API error:', errorData);
            } catch (e) {
              console.error('Could not parse location error response');
            }
          }
        } catch (locError) {
          console.error('Exception fetching locations:', locError);
        }

        // Fetch users
        try {
          const userResponse = await fetch('/api/users');

          // Check if response is OK before trying to parse JSON
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUsers(userData.data || []);
          } else {
            console.error('Error fetching users:', userResponse.status, userResponse.statusText);
            // Try to get error message if possible
            try {
              const errorData = await userResponse.json();
              console.error('User API error:', errorData);
            } catch (e) {
              console.error('Could not parse user error response');
            }
          }
        } catch (userError) {
          console.error('Exception fetching users:', userError);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, []);

  // Initialize form with data if editing. We include `locations` in the
  // dependency array so that the form updates once the locations list has
  // been fetched from the server. This ensures the location select displays
  // the correct default value when editing.
  useEffect(() => {
    // Wait until locations are loaded before attempting to map the
    // initial location value. This prevents the form from defaulting to
    // "none" when the data arrives after the initial render.
    if (initialData && locations.length > 0) {
      console.log('Initial data for capability:', initialData);
      console.log('Available locations:', locations);

      // Handle capHeadGroup which might be a string ID or a populated object
      let headGroupValue = "none";
      if (initialData.capHeadGroup) {
        // If it's a populated object with _id
        if (typeof initialData.capHeadGroup === 'object' && initialData.capHeadGroup._id) {
          headGroupValue = initialData.capHeadGroup._id;
          console.log('capHeadGroup is an object with _id:', headGroupValue);
        }
        // If it's just an ID string
        else if (typeof initialData.capHeadGroup === 'string' && initialData.capHeadGroup !== "none") {
          headGroupValue = initialData.capHeadGroup;
          console.log('capHeadGroup is a string:', headGroupValue);
        }
      }

      // Handle locationId which might be a string ID, object, or null
      let locationValue = "none";

      if (initialData.locationId) {
        console.log('Raw locationId from initialData:', initialData.locationId);
        console.log('Type of locationId:', typeof initialData.locationId);

        // If it's a populated object with _id
        if (typeof initialData.locationId === 'object' && initialData.locationId._id) {
          locationValue = initialData.locationId._id.toString();
          console.log('LocationId is an object with _id:', locationValue);
          console.log('Location details:', {
            _id: initialData.locationId._id,
            locationId: initialData.locationId.locationId,
            sublocation: initialData.locationId.sublocation
          });
        }
        // If it's just an ID string
        else if (typeof initialData.locationId === 'string' && initialData.locationId !== "none") {
          locationValue = initialData.locationId;
          console.log('LocationId is a string:', locationValue);
        }
        // If it's an ObjectId (has toString method)
        else if (initialData.locationId.toString && typeof initialData.locationId.toString === 'function') {
          locationValue = initialData.locationId.toString();
          console.log('LocationId is an ObjectId:', locationValue);
        }
      }

      // Check if the location exists in the locations array
      if (locations.length > 0) {
        const matchingLocation = locations.find(loc =>
          (loc._id && locationValue && loc._id.toString() === locationValue.toString()) ||
          (loc.id && locationValue && loc.id.toString() === locationValue.toString())
        );

        if (matchingLocation) {
          console.log('Found matching location:', {
            id: matchingLocation._id,
            name: matchingLocation.sublocation || matchingLocation.locationId
          });
          // Use the exact _id from the matching location to ensure consistency
          locationValue = matchingLocation._id.toString();
        } else if (locationValue !== "none") {
          console.warn('Location not found in locations array:', locationValue);
          console.log('Available locations:', locations.map(loc => ({
            _id: loc._id ? loc._id.toString() : null,
            id: loc.id ? loc.id.toString() : null,
            name: loc.sublocation || loc.locationId
          })));
        }
      } else {
        console.warn('Locations array is empty. Cannot validate locationId:', locationValue);
      }

      console.log('Final locationId value for form:', locationValue);

      setFormData({
        capabilityName: initialData.capabilityName || "",
        shortName: initialData.shortName || "",
        capabilityDesc: initialData.capabilityDesc || "",
        locationId: locationValue,
        capHeadGroup: headGroupValue,
        reqRunNo: initialData.reqRunNo?.toString() || "",
        reqAsrRunNo: initialData.reqAsrRunNo || ""
      })
    }
  }, [initialData, locations])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`handleSelectChange called for ${name} with value:`, value);

    // For capHeadGroup, validate that it's a valid ObjectId or "none"
    if (name === "capHeadGroup") {
      if (value === "none" || /^[0-9a-fA-F]{24}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // If a user is selected, find their name to display
        if (value !== "none") {
          const selectedUser = users.find(user => user._id === value);
          if (selectedUser) {
            console.log('Selected user:', selectedUser.name || selectedUser.username || selectedUser.email);
          }
        }
      } else {
        console.warn(`Invalid value for ${name}:`, value);
        // Default to "none" if invalid
        setFormData((prev) => ({ ...prev, [name]: "none" }));
      }
    } else if (name === "locationId") {
      console.log(`Setting locationId to:`, value);

      // Always convert to string for consistent comparison
      const valueStr = value ? value.toString() : "none";

      // If a location is selected, find its details to display
      if (valueStr !== "none") {
        // Find the location in the locations array
        const selectedLocation = locations.find(location =>
          location._id && location._id.toString() === valueStr
        );

        if (selectedLocation) {
          console.log('Selected location:', {
            id: selectedLocation._id,
            name: selectedLocation.sublocation || selectedLocation.locationId
          });
        } else {
          console.warn('Location not found for ID:', valueStr);
          console.log('Available locations:', locations.map(loc => ({
            _id: loc._id ? loc._id.toString() : null,
            name: loc.sublocation || loc.locationId
          })));
        }
      } else {
        console.log('No location selected (none)');
      }

      // Force re-render to update the SelectValue display
      setTimeout(() => {
        // Update the form data with the new locationId
        setFormData((prev) => {
          const newFormData = { ...prev, [name]: valueStr };
          console.log('Updated form data with locationId:', newFormData);
          return newFormData;
        });
      }, 0);
    } else {
      // For other fields, just set the value
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Process the form data
    const processedData = {
      ...formData,
      // Convert reqRunNo to number if it's not empty
      reqRunNo: formData.reqRunNo ? parseInt(formData.reqRunNo) : undefined,
      // Convert locationId to null if it's "none"
      locationId: formData.locationId === "none" ? null : formData.locationId,
      // Convert capHeadGroup to null if it's "none"
      capHeadGroup: formData.capHeadGroup === "none" ? null : formData.capHeadGroup
    }

    console.log('Form data before processing:', formData);
    console.log('Submitting capability data:', processedData);

    // Log location information for debugging
    if (processedData.locationId && processedData.locationId !== "none") {
      // Check if it's a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(processedData.locationId);
      if (!isValidObjectId) {
        console.warn('Invalid ObjectId for locationId:', processedData.locationId);
        // If not valid, set to null
        processedData.locationId = null;
      } else {
        // Log the selected location for debugging
        const selectedLocation = locations.find(location => location._id === processedData.locationId);
        if (selectedLocation) {
          console.log('Submitting with selected location:', selectedLocation.sublocation || selectedLocation.locationId);
        } else {
          console.warn('Location not found for ID:', processedData.locationId);
        }
      }
    }

    // Ensure we're sending a valid ObjectId for capHeadGroup
    if (processedData.capHeadGroup && processedData.capHeadGroup !== "none") {
      // Check if it's a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(processedData.capHeadGroup);
      if (!isValidObjectId) {
        console.warn('Invalid ObjectId for capHeadGroup:', processedData.capHeadGroup);
        // If not valid, set to null
        processedData.capHeadGroup = null;
      } else {
        // Log the selected user for debugging
        const selectedUser = users.find(user => user._id === processedData.capHeadGroup);
        if (selectedUser) {
          console.log('Submitting with selected user:', selectedUser.name || selectedUser.username || selectedUser.email);
        } else {
          console.warn('User not found for ID:', processedData.capHeadGroup);
        }
      }
    }

    onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Capability Name</label>
          <Input
            name="capabilityName"
            value={formData.capabilityName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Short Name</label>
          <Input
            name="shortName"
            value={formData.shortName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="capabilityDesc"
            value={formData.capabilityDesc}
            onChange={handleChange}
            rows={2}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={formData.locationId}
            onValueChange={(value) => handleSelectChange("locationId", value)}
            defaultValue="none"
          >
            <SelectTrigger className="bg-white">
              <SelectValue>
                {formData.locationId === "none" ? "None" :
                  (() => {
                    const loc = locations.find(l =>
                      l._id && formData.locationId &&
                      l._id.toString() === formData.locationId.toString()
                    );
                    return loc ?
                      (loc.sublocation || loc.locationId) :
                      "Select location";
                  })()
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {locations.map((location) => (
                <SelectItem
                  key={location._id}
                  value={location._id ? location._id.toString() : ""}
                >
                  {location.sublocation || location.locationId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Capability Head Group</label>
          <Combobox
            value={formData.capHeadGroup}
            onChange={(value) => handleSelectChange("capHeadGroup", value)}
            placeholder="Search head group"
            emptyMessage="No users found"
            options={[
              { value: "none", label: "None" },
              ...users
                .filter(user => user.isActive !== false) // Only show active users
                .sort((a, b) => (a.name || '').localeCompare(b.name || '')) // Sort by name
                .map((user) => {
                  // Create a descriptive string with available user information
                  const details = [
                    user.position,
                    user.department,
                    user.division,
                    user.email
                  ].filter(Boolean);

                  return {
                    value: user._id,
                    label: user.name || user.username || user.email,
                    description: details.length > 0 ? details.join(' • ') : undefined
                  };
                })
            ]}
            className="bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Request Run Number</label>
          <Input
            name="reqRunNo"
            type="number"
            value={formData.reqRunNo}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">ASR Request Run Number</label>
          <Input
            name="reqAsrRunNo"
            value={formData.reqAsrRunNo}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Capability")}
        </Button>
      </div>
    </form>
  )
}
