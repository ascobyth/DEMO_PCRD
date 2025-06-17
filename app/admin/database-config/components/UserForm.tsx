"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckboxGroup } from "./CheckboxGroup"
import { Combobox } from "@/components/ui/combobox"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: UserFormProps) {
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    username: "",
    password: isEditing ? undefined : "password123", // Default password for new users
    email: "",
    name: "",
    position: "",
    department: "",
    division: "",
    costCenter: "",
    role: "Requester", // Default role
    isActive: true,
    capabilities: [] as string[],
    approvers: [] as string[], // Changed to array for MultiSelect
    onBehalfAccess: [] as string[], // Users that this user can create requests on behalf of
  })

  // Fetch capabilities and users
  useEffect(() => {
    const fetchData = async () => {
      // Fetch capabilities with error handling
      try {
        console.log('Fetching capabilities...');
        const capResponse = await fetch('/api/capabilities', {
          // Add cache control to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (capResponse.ok) {
          const capData = await capResponse.json();
          console.log('Capabilities data:', capData.data);
          const mappedCapabilities = capData.data.map((cap: any) => ({
            _id: cap._id,
            label: cap.capabilityName || cap.shortName || cap._id,
            value: cap._id
          }));
          console.log('Mapped capabilities:', mappedCapabilities);
          setCapabilities(mappedCapabilities);
        } else {
          console.error('Failed to fetch capabilities. Status:', capResponse.status);
        }
      } catch (capError) {
        console.error('Exception fetching capabilities:', capError);
        // Set empty capabilities array to prevent UI errors
        setCapabilities([]);
      }

      // Fetch users for approvers selection with separate try/catch
      try {
        console.log('Fetching users...');
        const userResponse = await fetch('/api/users', {
          // Add cache control to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Users data:', userData.data);
          const mappedUsers = userData.data.map((user: any) => ({
            _id: user._id,
            label: user.name || user.username || user.email,
            value: user._id,
            // Include additional info for display
            email: user.email,
            position: user.position,
            department: user.department
          }));
          console.log('Mapped users:', mappedUsers);
          setUsers(mappedUsers);
        } else {
          console.error('Failed to fetch users. Status:', userResponse.status);
          // Set empty users array to prevent UI errors
          setUsers([]);
        }
      } catch (userError) {
        console.error('Exception fetching users:', userError);
        // Set empty users array to prevent UI errors
        setUsers([]);
      }
    };

    fetchData();
  }, []);

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      console.log('Initial data for user:', initialData);
      console.log('Initial approvers:', initialData.approvers);

      // Handle approvers - convert to array of IDs
      let approverValues: string[] = [];
      if (Array.isArray(initialData.approvers) && initialData.approvers.length > 0) {
        approverValues = initialData.approvers.map((approver: any) => {
          if (typeof approver === 'string') {
            return approver;
          } else if (approver && approver._id) {
            return approver._id;
          }
          return null;
        }).filter(Boolean); // Remove any null values
        console.log('Approver values set to:', approverValues);
      }

      // Handle onBehalfAccess - convert to array of IDs
      let onBehalfAccessValues: string[] = [];
      if (Array.isArray(initialData.onBehalfAccess) && initialData.onBehalfAccess.length > 0) {
        onBehalfAccessValues = initialData.onBehalfAccess.map((user: any) => {
          if (typeof user === 'string') {
            return user;
          } else if (user && user._id) {
            return user._id;
          }
          return null;
        }).filter(Boolean); // Remove any null values
        console.log('OnBehalfAccess values set to:', onBehalfAccessValues);
      }

      setFormData({
        username: initialData.username || "",
        // Don't include password when editing
        email: initialData.email || "",
        name: initialData.fullName || initialData.name || "",
        position: initialData.position || "",
        department: initialData.department || "",
        division: initialData.division || "",
        costCenter: initialData.costCenter?.code || initialData.costCenter || "",
        role: initialData.role || "Requester",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        capabilities: Array.isArray(initialData.capabilities)
          ? initialData.capabilities.map((cap: any) =>
              typeof cap === 'string' ? cap : cap._id ? cap._id : cap
            )
          : [],
        approvers: approverValues,
        onBehalfAccess: onBehalfAccessValues,
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "isActive") {
      setFormData((prev) => ({ ...prev, [name]: value === "active" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create a copy of the form data for validation
    const validatedData = { ...formData };

    // Ensure role is not empty and is a valid enum value
    if (!validatedData.role || validatedData.role === "") {
      validatedData.role = "Requester"; // Default to Requester if empty
    }

    // No need to convert approvers as it's already an array
    const processedData = {
      ...validatedData
    };

    console.log('Submitting form data:', processedData);
    console.log('Capabilities in form data:', processedData.capabilities);
    console.log('Approvers in form data:', processedData.approvers);
    console.log('Approvers type:', Array.isArray(processedData.approvers) ? 'Array' : typeof processedData.approvers);
    console.log('OnBehalfAccess in form data:', processedData.onBehalfAccess);
    console.log('OnBehalfAccess type:', Array.isArray(processedData.onBehalfAccess) ? 'Array' : typeof processedData.onBehalfAccess);

    // Ensure approvers is properly formatted for MongoDB
    if (Array.isArray(processedData.approvers)) {
      processedData.approvers = processedData.approvers.map(id => {
        console.log('Processing approver ID:', id, 'Type:', typeof id);
        return id;
      });
    }

    // Ensure onBehalfAccess is properly formatted for MongoDB
    if (Array.isArray(processedData.onBehalfAccess)) {
      processedData.onBehalfAccess = processedData.onBehalfAccess.map(id => {
        console.log('Processing onBehalfAccess ID:', id, 'Type:', typeof id);
        return id;
      });
    }

    onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Username</label>
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Position</label>
          <Input
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Department</label>
          <Input
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Division</label>
          <Input
            name="division"
            value={formData.division}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cost Center</label>
          <Input
            name="costCenter"
            value={formData.costCenter}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleSelectChange("role", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SuperAdmin">Super Admin</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="ATCManager">ATC Manager</SelectItem>
              <SelectItem value="RequesterManager">Requester Manager</SelectItem>
              <SelectItem value="Requester">Requester</SelectItem>
              <SelectItem value="EngineerResearcher">Engineer/Researcher</SelectItem>
              <SelectItem value="SeniorEngineerSeniorResearcher">Senior Engineer/Senior Researcher</SelectItem>
              <SelectItem value="Technician">Technician</SelectItem>
              <SelectItem value="TechnicianAssistant">Technician Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.isActive ? "active" : "inactive"}
            onValueChange={(value) => handleSelectChange("isActive", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-sm font-medium">Capabilities</label>
          <CheckboxGroup
            options={capabilities}
            selected={formData.capabilities}
            onChange={(selected) => {
              console.log('UserForm received selected capabilities:', selected);
              setFormData(prev => {
                const newFormData = { ...prev, capabilities: selected };
                console.log('New form data:', newFormData);
                return newFormData;
              });
            }}
          />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-sm font-medium">Approvers</label>
          <div className="space-y-2">
            {/* Display selected approvers as badges */}
            {formData.approvers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.approvers.map((approverId: string) => {
                  const approver = users.find(u => u._id === approverId);
                  return (
                    <Badge key={approverId} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                      {approver ? (approver.name || approver.username || approver.email) : approverId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            approvers: prev.approvers.filter((id: string) => id !== approverId)
                          }));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Searchable select to add new approvers */}
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect
                  options={Array.isArray(users) && users.length > 0
                    ? users
                      .filter(user =>
                        user &&
                        user._id &&
                        user._id !== initialData?._id &&
                        !formData.approvers.includes(user._id)
                      ) // Filter out current user, already selected users, and ensure valid users
                      .sort((a, b) => ((a.name || '') || '').localeCompare((b.name || '') || '')) // Sort by name with null checks
                      .map((user) => ({
                        value: user._id,
                        label: user.name || user.username || user.email || 'Unknown User',
                      }))
                    : [] // Return empty array if users is not available
                  }
                  value=""
                  onChange={(value) => {
                    if (value && !formData.approvers.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        approvers: [...prev.approvers, value]
                      }));
                    }
                  }}
                  placeholder="Search and select an approver"
                  emptyMessage="No more users available"
                  className="bg-white"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  // This is just a visual cue - the actual adding happens in the onChange of SearchableSelect
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1 col-span-2">
          <label className="text-sm font-medium">On Behalf Users</label>
          <div className="space-y-2">
            {/* Display selected onBehalfAccess as badges */}
            {formData.onBehalfAccess.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.onBehalfAccess.map((userId: string) => {
                  const user = users.find(u => u._id === userId);
                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                      {user ? (user.name || user.username || user.email) : userId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            onBehalfAccess: prev.onBehalfAccess.filter((id: string) => id !== userId)
                          }));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Searchable select to add new onBehalfAccess */}
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect
                  options={Array.isArray(users) && users.length > 0
                    ? users
                      .filter(user =>
                        user &&
                        user._id &&
                        user._id !== initialData?._id &&
                        !formData.onBehalfAccess.includes(user._id)
                      ) // Filter out current user, already selected users, and ensure valid users
                      .sort((a, b) => ((a.name || '') || '').localeCompare((b.name || '') || '')) // Sort by name with null checks
                      .map((user) => ({
                        value: user._id,
                        label: user.name || user.username || user.email || 'Unknown User',
                      }))
                    : [] // Return empty array if users is not available
                  }
                  value=""
                  onChange={(value) => {
                    if (value && !formData.onBehalfAccess.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        onBehalfAccess: [...prev.onBehalfAccess, value]
                      }));
                    }
                  }}
                  placeholder="Search and select users"
                  emptyMessage="No more users available"
                  className="bg-white"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  // This is just a visual cue - the actual adding happens in the onChange of SearchableSelect
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add User")}
        </Button>
      </div>
    </form>
  )
}
