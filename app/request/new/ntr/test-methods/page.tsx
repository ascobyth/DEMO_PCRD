"use client"

import { DialogTitle } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Search, Info, ChevronRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export default function TestMethodCatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editRequestId = searchParams.get('edit')
  const duplicateRequestId = searchParams.get('duplicate')
  const isEditMode = !!editRequestId
  const isDuplicateMode = !!duplicateRequestId

  // State for form data from previous steps
  const [formData, setFormData] = useState({
    requestTitle: "",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "",
    costCenter: ""
  })

  // State for edit mode capability filtering
  const [editModeCapability, setEditModeCapability] = useState<string | null>(null)
  const [loadingEditData, setLoadingEditData] = useState(false)

  // Update the testMethods state to be empty initially
  const [testMethods, setTestMethods] = useState<any[]>([])

  // Add loading state
  const [loading, setLoading] = useState(true)

  // State for capabilities
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [loadingCapabilities, setLoadingCapabilities] = useState(true)

  // State to track deselected samples for each method
  const [deselectedSamples, setDeselectedSamples] = useState<Record<string, string[]>>({})
  
  // State to track urgent samples for each method
  const [urgentSamples, setUrgentSamples] = useState<Record<string, string[]>>({})

  // Log deselectedSamples state changes
  useEffect(() => {
    console.log('Current deselectedSamples state:', deselectedSamples);
  }, [deselectedSamples])

  // Get samples from localStorage (populated in the Sample Information page)
  const [samples, setSamples] = useState<Array<{ id: string; name: string; category: string }>>([])

  // Load edit data if in edit or duplicate mode
  useEffect(() => {
    const requestId = editRequestId || duplicateRequestId
    if ((isEditMode || isDuplicateMode) && requestId) {
      const loadEditData = async () => {
        try {
          setLoadingEditData(true)
          const response = await fetch(`/api/requests/${requestId}/details`)
          const result = await response.json()

          if (result.success && result.data) {
            const requestData = result.data

            // Extract capability information from existing test methods
            try {
              if (requestData.jsonTestingList) {
                const testMethods = JSON.parse(requestData.jsonTestingList)
                if (testMethods.length > 0) {
                  // Get the capability from the first test method
                  const firstMethod = testMethods[0]
                  if (firstMethod.capabilityId) {
                    setEditModeCapability(firstMethod.capabilityId)
                    console.log(`${isDuplicateMode ? 'Duplicate' : 'Edit'} mode: Setting capability filter to:`, firstMethod.capabilityId)
                  }
                }
              }
            } catch (e) {
              console.warn('Failed to parse testing list for capability extraction:', e)
            }
          }
        } catch (error) {
          console.error('Error loading edit data:', error)
        } finally {
          setLoadingEditData(false)
        }
      }

      loadEditData()
    }
  }, [isEditMode, isDuplicateMode, editRequestId, duplicateRequestId])

  // Load samples and smart assistant recommendations from localStorage on component mount
  useEffect(() => {
    // Fetch test methods from API
    const fetchTestMethods = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/test-methods')
        if (!response.ok) {
          throw new Error('Failed to fetch test methods')
        }
        const data = await response.json()
        // Check if the response has a data property (API returns { success: true, data: [...] })
        if (data && data.success && Array.isArray(data.data)) {
          console.log('Test Methods API response data:', data)
          // Map the data to include required properties for the UI
          const formattedMethods = data.data.map((method) => ({
            id: method._id || method.id || `method-${Math.random().toString(36).substr(2, 9)}`,
            name: method.testingName || method.methodName || method.name || 'Unnamed Method',
            description: method.detailEng || method.description || '',
            methodCode: method.methodCode || '',
            category: method.capability || method.category || 'Uncategorized',
            // Store the capability ID for filtering
            capabilityId: method.capabilityId ? method.capabilityId._id || method.capabilityId : null,
            // Store the capability name for display
            capabilityName: method.capabilityId ? method.capabilityId.capabilityName || '' : '',
            price: method.price || method.cost || 0,
            priorityPrice: method.priorityPrice || method.price || method.cost || 0,
            turnaround: method.analysisLeadtime || method.resultAnalysisTime || method.turnaround || method.duration || 7,
            sampleAmount: method.sampleAmount || 0,
            unit: method.unit || '',
            keyResult: method.keyResult || '',
            workingHour: method.workingHour || 0,
            images: method.images || { description: '', keyResult: '' },
            // Include equipment information
            equipmentName: method.equipmentName || '',
            equipmentId: method.equipmentId || null,
            selected: false,
            samples: [],
            instances: [],
            requirements: '',
            isSmartAssistant: false
          }))

          // After fetching methods from API, check if we have saved methods in localStorage
          try {
            const savedTestMethods = localStorage.getItem("ntrTestMethods")
            if (savedTestMethods) {
              const parsedTestMethods = JSON.parse(savedTestMethods)
              console.log("Loaded saved test methods:", parsedTestMethods)

              // Create a map of the fetched methods by ID for easy lookup
              const methodsMap = new Map(formattedMethods.map(method => [method.id, method]))

              // Update the map with saved methods
              parsedTestMethods.forEach((savedMethod: any) => {
                if (methodsMap.has(savedMethod.id)) {
                  // Update existing method with saved selections
                  const existingMethod = methodsMap.get(savedMethod.id)
                  methodsMap.set(savedMethod.id, {
                    ...existingMethod,
                    selected: savedMethod.selected,
                    samples: savedMethod.samples || [],
                    instances: savedMethod.instances || [],
                    requirements: savedMethod.requirements || '',
                    isSmartAssistant: savedMethod.isSmartAssistant || false,
                    // Preserve equipment information from existing method
                    equipmentName: existingMethod.equipmentName || savedMethod.equipmentName || '',
                    equipmentId: existingMethod.equipmentId || savedMethod.equipmentId || null
                  })
                } else {
                  // Add the saved method if it doesn't exist in the fetched methods
                  methodsMap.set(savedMethod.id, savedMethod)
                }
              })

              // Convert the map back to an array and set as state
              const mergedMethods = Array.from(methodsMap.values())
              setTestMethods(mergedMethods)

              toast({
                title: "Test methods loaded",
                description: `${parsedTestMethods.length} previously selected test methods have been restored.`,
              })
            } else {
              // If no saved methods, just use the fetched methods
              setTestMethods(formattedMethods)
            }
          } catch (error) {
            console.error("Error loading saved test methods:", error)
            // If there's an error loading saved methods, just use the fetched methods
            setTestMethods(formattedMethods)
          }
        } else {
          console.error('Invalid test methods data format:', data)
          setTestMethods([])
        }
      } catch (error) {
        console.error('Error fetching test methods:', error)
        // Fallback to empty array if API fails
        setTestMethods([])
      } finally {
        setLoading(false)
      }
    }

    // Fetch capabilities from API
    const fetchCapabilities = async () => {
      try {
        setLoadingCapabilities(true)
        const response = await fetch('/api/capabilities')
        if (!response.ok) {
          throw new Error('Failed to fetch capabilities')
        }
        const data = await response.json()
        // Check if the response has a data property
        if (data && data.success && Array.isArray(data.data)) {
          console.log('Capabilities API response data:', data)
          setCapabilities(data.data)
        } else {
          console.error('Invalid capabilities data format:', data)
          setCapabilities([])
        }
      } catch (error) {
        console.error('Error fetching capabilities:', error)
        // Fallback to empty array if API fails
        setCapabilities([])
      } finally {
        setLoadingCapabilities(false)
      }
    }

    fetchTestMethods()
    fetchCapabilities()

    // Load form data from localStorage
    try {
      const savedFormData = localStorage.getItem("ntrFormData")
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData)
        console.log("Loaded form data:", parsedFormData)
        setFormData(prev => ({
          ...prev,
          ...parsedFormData
        }))
      }
    } catch (error) {
      console.error("Error loading form data from localStorage:", error)
    }

    // Load samples from localStorage
    try {
      const savedSamples = localStorage.getItem("ntrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        setSamples(parsedSamples)
      }
    } catch (error) {
      console.error("Error loading samples from localStorage:", error)
    }

    try {
      // Load samples
      const savedSamples = localStorage.getItem("ntrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        // Transform the samples to the format needed for this page
        const formattedSamples = parsedSamples.map((sample: any, index: number) => ({
          id: (index + 1).toString(),
          name: sample.generatedName || sample.name,
          category:
            sample.category === "commercial"
              ? "Commercial Grade"
              : sample.category === "td"
                ? "TD/NPD"
                : sample.category === "benchmark"
                  ? "Benchmark"
                  : sample.category === "inprocess"
                    ? "Inprocess"
                    : sample.category === "chemicals"
                      ? "Chemicals/Substances"
                      : sample.category === "chemicals"
                        ? "Chemicals/Substances"
                        : "Cap Development",
        }))
        setSamples(formattedSamples)



        // Load Smart Assistant recommendations after samples are loaded
        const savedRecommendations = localStorage.getItem("smartAssistantRecommendations")
        if (savedRecommendations) {
          const parsedRecommendations = JSON.parse(savedRecommendations)

          // Update test methods with Smart Assistant recommendations
          setTestMethods((prevMethods) => {
            const updatedMethods = [...prevMethods]

            // For each recommendation, find the matching test method and update it
            parsedRecommendations.forEach((rec: any) => {
              const methodIndex = updatedMethods.findIndex((method) => method.id === rec.id)
              if (methodIndex !== -1) {
                updatedMethods[methodIndex] = {
                  ...updatedMethods[methodIndex],
                  selected: true,
                  isSmartAssistant: true,
                  // Store only the sample names, not the entire objects
                  samples: formattedSamples.length > 0 ? formattedSamples.map((sample) => sample.name) : [],
                }
              }
            })

            return updatedMethods
          })

          // Show a toast notification
          toast({
            title: "Smart Assistant recommendations applied",
            description: `${parsedRecommendations.length} test methods have been selected based on your requirements.`,
          })
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
    
    // Load urgent samples state
    try {
      const savedUrgentSamples = localStorage.getItem("ntrUrgentSamples")
      if (savedUrgentSamples) {
        setUrgentSamples(JSON.parse(savedUrgentSamples))
      }
    } catch (error) {
      console.error("Error loading urgent samples:", error)
    }
  }, [])

  // State for filtering and search
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  // currentMethodId and currentInstanceIndex were removed as we no longer need the Sample Selection Dialog
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Update activeCategory when edit/duplicate mode capability is loaded
  useEffect(() => {
    if ((isEditMode || isDuplicateMode) && editModeCapability) {
      setActiveCategory(editModeCapability)
    }
  }, [isEditMode, isDuplicateMode, editModeCapability])

  // Group methods by equipment
  const groupMethodsByEquipment = (methods: any[]) => {
    const grouped = methods.reduce((acc, method) => {
      const equipmentKey = method.equipmentName || 'Other Methods';
      if (!acc[equipmentKey]) {
        acc[equipmentKey] = [];
      }
      acc[equipmentKey].push(method);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Sort equipment names alphabetically, with 'Other Methods' at the end
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'Other Methods') return 1;
      if (b === 'Other Methods') return -1;
      return a.localeCompare(b);
    });
    
    return sortedKeys.map(key => ({ equipment: key, methods: grouped[key] }));
  };

  // Filter methods based on category and search query
  const filteredMethods = testMethods.filter((method) => {
    // In edit/duplicate mode, restrict to only the capability from the original request
    if ((isEditMode || isDuplicateMode) && editModeCapability) {
      const matchesEditCapability = method.capabilityId && method.capabilityId === editModeCapability
      if (!matchesEditCapability) {
        return false
      }
    }

    // Filter by capability (only applies in non-edit mode or when no edit capability is set)
    const matchesCategory =
      activeCategory === "all" ||
      (method.capabilityId && method.capabilityId === activeCategory)

    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (method.methodCode && method.methodCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.capabilityName && method.capabilityName.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by selection status
    const matchesSelection = !showOnlySelected || method.selected || method.instances.length > 0

    return matchesCategory && matchesSearch && matchesSelection
  })

  // Count selected methods
  const selectedMethodsCount = testMethods.filter((method) => method.selected || method.instances.length > 0).length

  // Toggle method selection
  const toggleMethodSelection = (id: string) => {
    setTestMethods((prev) =>
      prev.map((method) => {
        if (method.id === id) {
          const newSelected = !method.selected
          // If the method is being selected, automatically select all samples
          return {
            ...method,
            selected: newSelected,
            // If newly selected, add all sample names; otherwise keep current samples
            samples: newSelected ? samples.map((sample) => sample.name) : method.samples,
          }
        }
        return method
      }),
    )

    // If deselecting the method, reset the deselected samples
    const method = testMethods.find(m => m.id === id);
    if (method && method.selected) {
      setDeselectedSamples((prev) => {
        const newDeselected = { ...prev };
        delete newDeselected[id];
        return newDeselected;
      });
    }
  }

  // This function was removed as we no longer need the Samples button

  // This function was removed as we no longer need the Sample Selection Dialog

  // Add these new functions to handle method instances
  const addMethodInstance = (id: string) => {
    setTestMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? {
              ...method,
              instances: [
                ...method.instances,
                {
                  requirements: "",
                  // Store only the sample names, not the entire objects
                  samples: samples.map((sample) => sample.name),
                },
              ],
            }
          : method,
      ),
    )
  }

  const removeMethodInstance = (id: string, instanceIndex: number) => {
    setTestMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? {
              ...method,
              instances: method.instances.filter((_, index) => index !== instanceIndex),
            }
          : method,
      ),
    )
  }

  const updateMethodRequirements = (id: string, requirements: string) => {
    setTestMethods((prev) => prev.map((method) => (method.id === id ? { ...method, requirements } : method)))
  }

  const updateInstanceRequirements = (id: string, instanceIndex: number, requirements: string) => {
    setTestMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? {
              ...method,
              instances: method.instances.map((instance, index) =>
                index === instanceIndex ? { ...instance, requirements } : instance,
              ),
            }
          : method,
      ),
    )
  }

  // This function was removed as we no longer need the Samples button for instances

  // Toggle individual sample selection directly from the badge
  const toggleSampleSelection = (methodId: string, sampleName: string, instanceIndex: number | null = null) => {
    console.log(`Toggling sample: ${sampleName} for method: ${methodId}, instance: ${instanceIndex}`);

    // Create a deep copy of the current state to work with
    const newDeselectedSamples = JSON.parse(JSON.stringify(deselectedSamples));

    if (instanceIndex !== null) {
      // Toggle sample for a method instance
      const key = `${methodId}-instance-${instanceIndex}`;

      // Initialize the array if it doesn't exist
      if (!newDeselectedSamples[key]) {
        newDeselectedSamples[key] = [];
      }

      const currentDeselected = newDeselectedSamples[key];
      const isCurrentlyDeselected = currentDeselected.includes(sampleName);

      console.log(`Instance sample ${sampleName} is currently ${isCurrentlyDeselected ? 'deselected' : 'selected'}`);

      if (isCurrentlyDeselected) {
        // Remove from deselected (select it)
        newDeselectedSamples[key] = currentDeselected.filter(s => s !== sampleName);
      } else {
        // Add to deselected (deselect it)
        newDeselectedSamples[key] = [...currentDeselected, sampleName];
      }

      // Update the actual test methods data to reflect the change
      setTestMethods(prev =>
        prev.map(method => {
          if (method.id === methodId) {
            // Create a copy of the method's instances
            const updatedInstances = [...method.instances];

            // Update the specific instance
            if (updatedInstances[instanceIndex]) {
              // Get the active samples (those that aren't deselected)
              const activeSamples = updatedInstances[instanceIndex].samples.filter(
                s => !newDeselectedSamples[key].includes(typeof s === 'string' ? s : s.name)
              );

              // Update the instance with the new active samples count
              updatedInstances[instanceIndex] = {
                ...updatedInstances[instanceIndex],
                activeSampleCount: activeSamples.length
              };

              // If all samples are deselected, remove this instance
              if (activeSamples.length === 0) {
                console.log(`All samples deselected for instance ${instanceIndex}, removing instance`);
                return {
                  ...method,
                  instances: method.instances.filter((_, idx) => idx !== instanceIndex)
                };
              }
            }

            return {
              ...method,
              instances: updatedInstances
            };
          }
          return method;
        })
      );
    } else {
      // Toggle sample for the main method
      // Initialize the array if it doesn't exist
      if (!newDeselectedSamples[methodId]) {
        newDeselectedSamples[methodId] = [];
      }

      const currentDeselected = newDeselectedSamples[methodId];
      const isCurrentlyDeselected = currentDeselected.includes(sampleName);

      console.log(`Main sample ${sampleName} is currently ${isCurrentlyDeselected ? 'deselected' : 'selected'}`);

      if (isCurrentlyDeselected) {
        // Remove from deselected (select it)
        newDeselectedSamples[methodId] = currentDeselected.filter(s => s !== sampleName);
      } else {
        // Add to deselected (deselect it)
        newDeselectedSamples[methodId] = [...currentDeselected, sampleName];
      }

      // Find the method to check if all samples will be deselected
      const method = testMethods.find(m => m.id === methodId);
      if (method) {
        // Check if this toggle will deselect all samples
        const willAllBeDeselected = method.samples.every(sample =>
          sample === sampleName ? true : newDeselectedSamples[methodId].includes(sample)
        );

        if (willAllBeDeselected && !isCurrentlyDeselected) {
          console.log(`All samples will be deselected for method ${methodId}, deselecting method`);

          // Deselect the method entirely
          setTestMethods(prev =>
            prev.map(m =>
              m.id === methodId ? { ...m, selected: false } : m
            )
          );

          // Clear deselected samples for this method since it's no longer selected
          delete newDeselectedSamples[methodId];
          setDeselectedSamples(newDeselectedSamples);
          return; // Exit early since we're deselecting the whole method
        }
      }

      // Update the actual test methods data to reflect the change
      setTestMethods(prev =>
        prev.map(method => {
          if (method.id === methodId) {
            // Get the active samples (those that aren't deselected)
            const activeSamples = method.samples.filter(
              s => !newDeselectedSamples[methodId].includes(s)
            );

            return {
              ...method,
              activeSampleCount: activeSamples.length
            };
          }
          return method;
        })
      );
    }

    console.log('New deselected samples state:', newDeselectedSamples);

    // Update the state with the new object
    setDeselectedSamples(newDeselectedSamples);
  }

  const handleSaveAndContinue = () => {
    // Save selected test methods to localStorage
    try {
      // Filter out deselected samples before saving
      const selectedTestMethods = testMethods
        .filter((method) => method.selected || method.instances.length > 0)
        .map(method => {
          // Filter out deselected samples for the main method
          const filteredSamples = method.samples.filter(
            sample => !deselectedSamples[method.id]?.includes(sample)
          );

          // Filter out deselected samples for each instance
          const filteredInstances = method.instances.map((instance, index) => {
            const instanceKey = `${method.id}-instance-${index}`;
            return {
              ...instance,
              samples: instance.samples.filter(
                sample => {
                  const sampleName = typeof sample === "string" ? sample : sample.name;
                  return !deselectedSamples[instanceKey]?.includes(sampleName);
                }
              )
            };
          });

          // Log the method data being saved
          console.log('Saving method to localStorage:', {
            name: method.name,
            selected: method.selected,
            requirements: method.requirements,
            samples: filteredSamples,
            instances: filteredInstances
          });

          return {
            ...method,
            samples: filteredSamples,
            instances: filteredInstances,
            urgentSamples: urgentSamples[method.id] || [],
            instanceUrgentSamples: method.instances.map((_, index) => {
              const instanceKey = `${method.id}-instance-${index}`;
              return urgentSamples[instanceKey] || [];
            })
          };
        });

      localStorage.setItem("ntrTestMethods", JSON.stringify(selectedTestMethods))
      
      // Save urgent samples state
      localStorage.setItem("ntrUrgentSamples", JSON.stringify(urgentSamples))
    } catch (error) {
      console.error("Error saving test methods to localStorage:", error)
    }
  }

  const handleBackToSampleInfo = (e) => {
    e.preventDefault();

    // Save test methods data first
    handleSaveAndContinue();

    // Save form data to localStorage with a different key to avoid it being removed
    try {
      // First, save with the original key for compatibility
      localStorage.setItem(
        "ntrFormData",
        JSON.stringify({
          requestTitle: formData.requestTitle,
          priority: formData.priority,
          useIONumber: formData.useIONumber,
          ioNumber: formData.ioNumber,
          costCenter: formData.costCenter,
        })
      );

      // Also save with a persistent key that won't be removed
      localStorage.setItem(
        "ntrFormData_persistent",
        JSON.stringify({
          requestTitle: formData.requestTitle,
          priority: formData.priority,
          useIONumber: formData.useIONumber,
          ioNumber: formData.ioNumber,
          costCenter: formData.costCenter,
        })
      );
    } catch (error) {
      console.error("Error saving form data to localStorage:", error);
    }

    // Show toast to indicate data is being saved
    toast({
      title: "Saving your selections",
      description: "Your test method selections are being saved...",
    });

    // Add a small delay to ensure data is saved before navigation
    setTimeout(() => {
      // Then navigate back to the sample information page
      window.location.href = `/request/new/ntr${isEditMode ? `?edit=${editRequestId}` : ''}`;
    }, 500);
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => handleBackToSampleInfo(e)}>
            <ChevronLeft className="h-4 w-4" />
            {isEditMode ? "Back to Edit Request" : "Back to Sample Information"}
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Test Method Selection" : "Test Method Catalog"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Modify your test method selection for this request"
              : "Browse and select test methods for your samples"
            }
          </p>
          {isEditMode && editRequestId && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Editing Request:</strong> {editRequestId}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <div className={`flex-1 space-y-6 transition-all duration-300 ${isSidebarCollapsed ? 'md:mr-16' : ''}`}>
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search test methods..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Select
                value={activeCategory}
                onValueChange={setActiveCategory}
                disabled={(isEditMode || isDuplicateMode) && editModeCapability}
              >
                <SelectTrigger className={`w-[180px] ${(isEditMode || isDuplicateMode) && editModeCapability ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capability</SelectItem>
                  {loadingCapabilities ? (
                    <SelectItem value="loading" disabled>Loading capabilities...</SelectItem>
                  ) : capabilities.length > 0 ? (
                    capabilities.map((capability) => (
                      <SelectItem
                        key={capability._id}
                        value={capability._id}
                      >
                        {capability.capabilityName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No capabilities found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isEditMode && editModeCapability && (
                <div className="text-xs text-blue-600 mt-1">
                  <Info className="inline h-3 w-3 mr-1" />
                  Capability filter is locked to the original request's capability in edit mode
                </div>
              )}
            </div>

            {/* Test method list */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Available Test Methods</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10">
                      {selectedMethodsCount} selected
                    </Badge>
                  </div>
                </div>
                <CardDescription>Select the test methods you want to apply to your samples</CardDescription>
                
                {/* Action buttons moved to top */}
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={(e) => handleBackToSampleInfo(e)}>
                    {isEditMode || isDuplicateMode ? "Back to Edit Request" : "Back to Sample Information"}
                  </Button>
                  <Link href={`/request/new/ntr/summary${isEditMode ? `?edit=${editRequestId}` : isDuplicateMode ? `?duplicate=${duplicateRequestId}` : ''}`} onClick={handleSaveAndContinue}>
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      {isEditMode && !isDuplicateMode ? "Save Changes and Continue" : "Save and Continue"}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                      <p className="mt-4 text-lg text-muted-foreground">Loading test methods...</p>
                    </div>
                  ) : filteredMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No test methods found matching your criteria</p>
                    </div>
                  ) : (
                    groupMethodsByEquipment(filteredMethods).map((group) => (
                      <div key={group.equipment} className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b pb-2">{group.equipment}</h3>
                        {group.methods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 transition-all ${
                          method.selected || method.instances.length > 0
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`method-${method.id}`}
                              checked={method.selected || method.instances.length > 0}
                              onCheckedChange={() => toggleMethodSelection(method.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`method-${method.id}`} className="text-base font-medium cursor-pointer">
                                  {method.methodCode} - {method.name}
                                </Label>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline">
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Normal/Urgent:</span>
                                    <span className="text-green-600 font-semibold">{method.price}</span>
                                    <span>/</span>
                                    <span className="text-red-500 font-semibold">{method.priorityPrice || method.price}</span>
                                    <span className="text-gray-600">{method.unit || 'THB'}</span>
                                  </span>
                                </Badge>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {method.turnaround} days
                                </Badge>
                                {method.sampleAmount > 0 && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    Sample: {method.sampleAmount} g/ml
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {(method.selected || method.instances.length > 0) && (
                            <div className="flex space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addMethodInstance(method.id)}
                                      className="flex items-center gap-1"
                                    >
                                      Add Repeat
                                      <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs bg-gray-900 text-white border-gray-800">
                                    <p>
                                      Use this to select the same method with different conditions or to repeat the test.
                                      Each repeat can have its own requirements and sample selection.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>

                        {/* Show the main method if selected */}
                        {method.selected && (
                          <div className="mt-3 pl-8">
                            <div className="border rounded-md p-3 bg-gray-50 mt-3">
                              {/* Only show Repeat #1 label if there are additional repeats */}
                              {method.instances.length > 0 && (
                                <p className="text-sm font-medium mb-2">Repeat #1</p>
                              )}
                              <Label htmlFor={`remarks-${method.id}`} className="text-sm">
                                Additional Requirements
                              </Label>
                              <Input
                                id={`remarks-${method.id}`}
                                placeholder="e.g., Temperature 180°C, specific conditions, etc."
                                className="mt-1"
                                value={method.requirements || ""}
                                onChange={(e) => updateMethodRequirements(method.id, e.target.value)}
                                autoComplete="off"
                              />

                              {method.samples.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                      <p className="text-sm font-medium">Selected Samples:</p>
                                      <p className="text-xs text-muted-foreground">(Click to include/exclude samples)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        id={`${method.id}-select-all-urgent`}
                                        checked={method.samples.every(s => urgentSamples[method.id]?.includes(s))}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            // Set all non-deselected samples as urgent
                                            const activeSamples = method.samples.filter(s => !deselectedSamples[method.id]?.includes(s));
                                            setUrgentSamples(prev => ({
                                              ...prev,
                                              [method.id]: activeSamples
                                            }));
                                          } else {
                                            // Remove all samples from urgent
                                            setUrgentSamples(prev => ({
                                              ...prev,
                                              [method.id]: []
                                            }));
                                          }
                                        }}
                                        className="border-red-500 data-[state=checked]:bg-red-100 data-[state=checked]:border-red-500"
                                      />
                                      <Label htmlFor={`${method.id}-select-all-urgent`} className="text-xs text-red-500 cursor-pointer">
                                        Select all for urgent
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {method.samples.map((sample, index) => {
                                      const isDeselected = deselectedSamples[method.id]?.includes(sample);
                                      const isUrgent = urgentSamples[method.id]?.includes(sample);
                                      console.log(`Rendering sample ${sample} for method ${method.id}, isDeselected: ${isDeselected}`);
                                      return (
                                        <div
                                          key={`${method.id}-sample-${index}`}
                                          className={`flex items-center gap-3 p-2 rounded-md border ${isDeselected ? 'bg-gray-50 opacity-50' : 'bg-white'}`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Checkbox
                                              id={`${method.id}-sample-${index}-normal`}
                                              checked={!isDeselected && !isUrgent}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  // Remove from urgent if it was urgent
                                                  setUrgentSamples(prev => ({
                                                    ...prev,
                                                    [method.id]: (prev[method.id] || []).filter(s => s !== sample)
                                                  }));
                                                  // Remove from deselected
                                                  setDeselectedSamples(prev => ({
                                                    ...prev,
                                                    [method.id]: (prev[method.id] || []).filter(s => s !== sample)
                                                  }));
                                                }
                                              }}
                                              className="border-green-500 data-[state=checked]:bg-green-100 data-[state=checked]:border-green-500"
                                            />
                                            <Label htmlFor={`${method.id}-sample-${index}-normal`} className="text-xs text-green-600 cursor-pointer">
                                              Normal
                                            </Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Checkbox
                                              id={`${method.id}-sample-${index}-urgent`}
                                              checked={!isDeselected && isUrgent}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  // Add to urgent
                                                  setUrgentSamples(prev => ({
                                                    ...prev,
                                                    [method.id]: [...(prev[method.id] || []), sample]
                                                  }));
                                                  // Remove from deselected
                                                  setDeselectedSamples(prev => ({
                                                    ...prev,
                                                    [method.id]: (prev[method.id] || []).filter(s => s !== sample)
                                                  }));
                                                }
                                              }}
                                              className="border-red-500 data-[state=checked]:bg-red-100 data-[state=checked]:border-red-500"
                                            />
                                            <Label htmlFor={`${method.id}-sample-${index}-urgent`} className="text-xs text-red-500 cursor-pointer">
                                              Urgent
                                            </Label>
                                          </div>
                                          <span className={`flex-1 text-sm ${isDeselected ? 'line-through text-gray-400' : ''}`}>
                                            {sample}
                                          </span>
                                          <button
                                            onClick={() => toggleSampleSelection(method.id, sample)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title={isDeselected ? "Restore sample" : "Remove sample"}
                                          >
                                            {isDeselected ? (
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            ) : (
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Show method instances */}
                        {method.instances.length > 0 && (
                          <div className="mt-4 pl-8 space-y-3">
                            <p className="text-sm font-medium">Additional Repeats:</p>
                            {method.instances.map((instance, index) => (
                              <div key={index} className="border rounded-md p-3 bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium">Repeat #{index + 2}</p>
                                    <div className="mt-2">
                                      <Label htmlFor={`instance-${method.id}-${index}`} className="text-sm">
                                        Additional Requirements
                                      </Label>
                                      <Input
                                        id={`instance-${method.id}-${index}`}
                                        placeholder="e.g., Temperature 180°C, specific conditions, etc."
                                        className="mt-1"
                                        value={instance.requirements || ""}
                                        onChange={(e) => updateInstanceRequirements(method.id, index, e.target.value)}
                                        autoComplete="off"
                                      />
                                    </div>

                                    {instance.samples && instance.samples.length > 0 && (
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-1">
                                            <p className="text-xs font-medium">Selected Samples:</p>
                                            <p className="text-xs text-muted-foreground">(Click to include/exclude samples)</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Checkbox
                                              id={`${method.id}-instance-${index}-select-all-urgent`}
                                              checked={instance.samples.every(s => {
                                                const sampleName = typeof s === "string" ? s : s.name;
                                                const instanceKey = `${method.id}-instance-${index}`;
                                                return urgentSamples[instanceKey]?.includes(sampleName);
                                              })}
                                              onCheckedChange={(checked) => {
                                                const instanceKey = `${method.id}-instance-${index}`;
                                                if (checked) {
                                                  // Set all non-deselected samples as urgent
                                                  const activeSamples = instance.samples
                                                    .map(s => typeof s === "string" ? s : s.name)
                                                    .filter(s => !deselectedSamples[instanceKey]?.includes(s));
                                                  setUrgentSamples(prev => ({
                                                    ...prev,
                                                    [instanceKey]: activeSamples
                                                  }));
                                                } else {
                                                  // Remove all samples from urgent
                                                  setUrgentSamples(prev => ({
                                                    ...prev,
                                                    [instanceKey]: []
                                                  }));
                                                }
                                              }}
                                              className="border-red-500 data-[state=checked]:bg-red-100 data-[state=checked]:border-red-500"
                                            />
                                            <Label htmlFor={`${method.id}-instance-${index}-select-all-urgent`} className="text-xs text-red-500 cursor-pointer">
                                              Select all for urgent
                                            </Label>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          {instance.samples.map((sample, sampleIndex) => {
                                            const sampleName = typeof sample === "string" ? sample : sample.name;
                                            const instanceKey = `${method.id}-instance-${index}`;
                                            const isDeselected = deselectedSamples[instanceKey]?.includes(sampleName);
                                            const isUrgent = urgentSamples[instanceKey]?.includes(sampleName);

                                            return (
                                              <div
                                                key={`instance-${index}-sample-${sampleIndex}`}
                                                className={`flex items-center gap-3 p-2 rounded-md border ${isDeselected ? 'bg-gray-50 opacity-50' : 'bg-white'}`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Checkbox
                                                    id={`${instanceKey}-sample-${sampleIndex}-normal`}
                                                    checked={!isDeselected && !isUrgent}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        // Remove from urgent if it was urgent
                                                        setUrgentSamples(prev => ({
                                                          ...prev,
                                                          [instanceKey]: (prev[instanceKey] || []).filter(s => s !== sampleName)
                                                        }));
                                                        // Remove from deselected
                                                        setDeselectedSamples(prev => ({
                                                          ...prev,
                                                          [instanceKey]: (prev[instanceKey] || []).filter(s => s !== sampleName)
                                                        }));
                                                      }
                                                    }}
                                                    className="border-green-500 data-[state=checked]:bg-green-100 data-[state=checked]:border-green-500"
                                                  />
                                                  <Label htmlFor={`${instanceKey}-sample-${sampleIndex}-normal`} className="text-xs text-green-600 cursor-pointer">
                                                    Normal
                                                  </Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Checkbox
                                                    id={`${instanceKey}-sample-${sampleIndex}-urgent`}
                                                    checked={!isDeselected && isUrgent}
                                                    onCheckedChange={(checked) => {
                                                      if (checked) {
                                                        // Add to urgent
                                                        setUrgentSamples(prev => ({
                                                          ...prev,
                                                          [instanceKey]: [...(prev[instanceKey] || []), sampleName]
                                                        }));
                                                        // Remove from deselected
                                                        setDeselectedSamples(prev => ({
                                                          ...prev,
                                                          [instanceKey]: (prev[instanceKey] || []).filter(s => s !== sampleName)
                                                        }));
                                                      }
                                                    }}
                                                    className="border-red-500 data-[state=checked]:bg-red-100 data-[state=checked]:border-red-500"
                                                  />
                                                  <Label htmlFor={`${instanceKey}-sample-${sampleIndex}-urgent`} className="text-xs text-red-500 cursor-pointer">
                                                    Urgent
                                                  </Label>
                                                </div>
                                                <span className={`flex-1 text-sm ${isDeselected ? 'line-through text-gray-400' : ''}`}>
                                                  {sampleName}
                                                </span>
                                                <button
                                                  onClick={() => toggleSampleSelection(method.id, sampleName, index)}
                                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                                  title={isDeselected ? "Restore sample" : "Remove sample"}
                                                >
                                                  {isDeselected ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                  ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                  )}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMethodInstance(method.id, index)}
                                      className="text-red-500"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {method.isSmartAssistant && (
                          <div className="flex justify-end mt-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Smart Assistant</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={`${isSidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 relative`}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -left-3 top-4 z-10 bg-white border rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            <div className={`${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
            {/* Request Info card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Request Title</p>
                    <p className="font-medium">{formData.requestTitle || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <p className="font-medium capitalize">{formData.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IO Number</p>
                    <p className="font-medium">
                      {formData.useIONumber === "yes" ? formData.ioNumber || "Not selected" : "Not using IO Number"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Request Title</p>
                    <p className="text-sm font-semibold">{formData.requestTitle || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">IO Number</p>
                    <p className="text-sm font-semibold">
                      {formData.useIONumber === "yes" ? formData.ioNumber || "Not selected" : "Not using IO"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Samples</p>
                    <p className="text-sm font-semibold">{samples.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Test Methods</p>
                    <p className="text-sm font-semibold">{selectedMethodsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Testing Cost</p>
                    <p className="text-sm font-semibold">
                      {testMethods
                        .filter((m) => m.selected || m.instances.length > 0)
                        .reduce((sum, method) => {
                          // Calculate cost based on normal/urgent samples
                          const normalPrice = typeof method.price === 'string' 
                            ? parseFloat(method.price.replace(/,/g, '')) 
                            : Number(method.price) || 0;
                          const urgentPrice = typeof method.priorityPrice === 'string' 
                            ? parseFloat(method.priorityPrice.replace(/,/g, '')) 
                            : Number(method.priorityPrice) || normalPrice;
                          
                          let methodCost = 0;
                          
                          if (method.selected) {
                            // Count normal vs urgent samples
                            const urgentCount = (urgentSamples[method.id] || []).length;
                            const normalCount = method.samples.filter(s => 
                              !deselectedSamples[method.id]?.includes(s) && 
                              !urgentSamples[method.id]?.includes(s)
                            ).length;
                            
                            methodCost += (normalCount * normalPrice) + (urgentCount * urgentPrice);
                          }
                          
                          // Add instance costs
                          method.instances.forEach((instance, idx) => {
                            const instanceKey = `${method.id}-instance-${idx}`;
                            const instanceUrgentCount = (urgentSamples[instanceKey] || []).length;
                            const instanceNormalCount = instance.samples.filter(s => {
                              const sampleName = typeof s === 'string' ? s : s.name;
                              return !deselectedSamples[instanceKey]?.includes(sampleName) && 
                                     !urgentSamples[instanceKey]?.includes(sampleName);
                            }).length;
                            
                            methodCost += (instanceNormalCount * normalPrice) + (instanceUrgentCount * urgentPrice);
                          });
                          
                          return sum + methodCost;
                        }, 0).toLocaleString('en-US')}{" "}
                      THB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Expected Complete Date</p>
                    <p className="text-sm font-semibold">
                      {testMethods.filter((m) => m.selected || m.instances.length > 0).length > 0
                        ? `${Math.max(...testMethods.filter((m) => m.selected || m.instances.length > 0).map((m) => m.turnaround))} days`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need help section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Need help selecting test methods?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm mb-4">
                  Our Smart Assistant can recommend the most appropriate test methods based on your requirements.
                </p>
                <Link href="/request/new/ntr/smart-assistant" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Launch Smart Assistant</Button>
                </Link>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Sample selection dialog was removed as we no longer need it */}
    </DashboardLayout>
  )
}

// Sample Selection Dialog Component was removed as we no longer need it

