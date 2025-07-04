"use client"

import { DialogTitle } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Search, Info } from "lucide-react"
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
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown"
import { SampleSelectionList } from "@/components/sample-selection-list"
import { ChevronDown, ChevronUp, Trash2, X, Plus, CalendarIcon, ChevronRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  
  // State to track sample priorities and requirements
  const [samplePriorities, setSamplePriorities] = useState<Record<string, Record<string, 'normal' | 'urgent'>>>({})
  const [sampleRequirements, setSampleRequirements] = useState<Record<string, Record<string, string>>>({})
  
  // State to track method-level priority
  const [methodPriorities, setMethodPriorities] = useState<Record<string, 'normal' | 'urgent'>>({})
  
  // State for global request priority
  const [globalPriority, setGlobalPriority] = useState<'normal' | 'urgent'>('normal')
  
  // State for urgent completion date
  const [urgentCompletionDate, setUrgentCompletionDate] = useState<Date>()

  // State for controlling Available Test Methods visibility
  const [showAvailableMethods, setShowAvailableMethods] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  // State for expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())
  
  // State for keywords management
  const [keywords, setKeywords] = useState<Array<{id: string, text: string, active: boolean}>>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [showKeywordInput, setShowKeywordInput] = useState(false)
  
  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Check if any sample has urgent priority
  const hasAnyUrgentSample = () => {
    // Check global priority first
    if (globalPriority === 'urgent') return true
    
    // Check individual samples
    for (const method of testMethods) {
      if (method.selected || method.instances.length > 0) {
        // Check main method samples
        if (method.selected) {
          const activeSamples = method.samples.filter(
            sample => !deselectedSamples[method.id]?.includes(sample)
          )
          
          for (const sample of activeSamples) {
            const sampleKey = `${method.id}-${sample}`
            const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority
            if (samplePriority === 'urgent') return true
          }
        }
        
        // Check instance samples
        for (let i = 0; i < method.instances.length; i++) {
          const instance = method.instances[i]
          const instanceKey = `${method.id}-instance-${i}`
          const activeSamples = instance.samples.filter(
            sample => !deselectedSamples[instanceKey]?.includes(sample)
          )
          
          for (const sample of activeSamples) {
            const sampleKey = `${method.id}-instance-${i}-${sample}`
            const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority
            if (samplePriority === 'urgent') return true
          }
        }
      }
    }
    
    return false
  }

  // Log deselectedSamples state changes
  useEffect(() => {
    console.log('Current deselectedSamples state:', deselectedSamples);
  }, [deselectedSamples])

  // Handle clicking outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the popup
      const popup = document.getElementById('available-methods-popup')
      const searchInput = document.querySelector('input[type="search"]')
      const filterSection = document.querySelector('.space-y-4') // The filter section container
      
      if (popup && showAvailableMethods) {
        const target = event.target as Node
        
        // Check if click is on any dropdown trigger, content, or filter area
        const isDropdownClick = 
          target instanceof Element && (
            target.closest('button[role="combobox"]') || 
            target.closest('[role="listbox"]') ||
            target.closest('[data-radix-select-content]') ||
            target.closest('.flex-1') || // Dropdown containers
            (filterSection && filterSection.contains(target))
          )
        
        // Check if click is outside popup and not on search/filters
        if (!popup.contains(target) && 
            !searchInput?.contains(target) &&
            !isDropdownClick) {
          setShowAvailableMethods(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAvailableMethods])

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
          const formattedMethods = data.data.map((method) => {
            console.log('Raw method from API:', method);
            console.log('PriorityPrice value:', method.priorityPrice);
            return {
              id: method._id || method.id || `method-${Math.random().toString(36).substr(2, 9)}`,
              name: method.testingName || method.methodName || method.name || 'Unnamed Method',
              description: method.detailEng || method.description || '',
              methodcode: method.methodcode || method.code || '',
              category: method.capability || method.category || 'Uncategorized',
            // Store the capability ID for filtering
            capabilityId: method.capabilityId ? method.capabilityId._id || method.capabilityId : null,
            // Store the capability name for display
            capabilityName: method.capabilityId ? method.capabilityId.capabilityName || '' : '',
            price: method.price || method.cost || 0,
            priorityPrice: method.priorityPrice || null,
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
            };
          })

          // After fetching methods from API, check if we have saved methods in localStorage
          try {
            const savedTestMethods = localStorage.getItem("asrTestMethods")
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
                    // Preserve methodcode from existing method (from API)
                    methodcode: existingMethod.methodcode || savedMethod.methodcode || savedMethod.methodCode || '',
                    // Preserve equipment information from existing method
                    equipmentName: existingMethod.equipmentName || savedMethod.equipmentName || '',
                    equipmentId: existingMethod.equipmentId || savedMethod.equipmentId || null
                  })
                } else {
                  // Add the saved method if it doesn't exist in the fetched methods
                  // Ensure methodcode field exists
                  methodsMap.set(savedMethod.id, {
                    ...savedMethod,
                    methodcode: savedMethod.methodcode || savedMethod.methodCode || ''
                  })
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
      const savedFormData = localStorage.getItem("asrFormData")
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
      const savedSamples = localStorage.getItem("asrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        setSamples(parsedSamples)
      }
    } catch (error) {
      console.error("Error loading samples from localStorage:", error)
    }

    try {
      // Load samples
      const savedSamples = localStorage.getItem("asrSamples")
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
    
    // Load sample priorities and requirements
    try {
      const savedPriorities = localStorage.getItem("asrSamplePriorities")
      if (savedPriorities) {
        setSamplePriorities(JSON.parse(savedPriorities))
      }
      
      const savedRequirements = localStorage.getItem("asrSampleRequirements")
      if (savedRequirements) {
        setSampleRequirements(JSON.parse(savedRequirements))
      }
    } catch (error) {
      console.error("Error loading sample data:", error)
    }
  }, [])

  // State for filtering and search
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
  const [equipments, setEquipments] = useState<any[]>([])
  const [loadingEquipments, setLoadingEquipments] = useState(false)
  // currentMethodId and currentInstanceIndex were removed as we no longer need the Sample Selection Dialog
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [sortBy, setSortBy] = useState("methodcode-asc")
  
  // State for expanded methods in selected section
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set())

  // Update selectedCapabilities when edit/duplicate mode capability is loaded
  useEffect(() => {
    if ((isEditMode || isDuplicateMode) && editModeCapability) {
      setSelectedCapabilities([editModeCapability])
    }
  }, [isEditMode, isDuplicateMode, editModeCapability])

  // Extract unique equipment from test methods based on selected capabilities
  useEffect(() => {
    if (testMethods.length > 0) {
      setLoadingEquipments(true)
      setSelectedEquipments([]) // Reset equipment selection when capabilities change
      
      // Filter methods by capabilities first
      const methodsToExtractFrom = testMethods.filter((method) => {
        if (selectedCapabilities.length === 0) return true
        return method.capabilityId && selectedCapabilities.includes(method.capabilityId)
      })
      
      // Extract unique equipment from filtered methods
      const equipmentMap = new Map()
      
      methodsToExtractFrom.forEach((method) => {
        if (method.equipmentName && method.equipmentName.trim() !== '') {
          const key = method.equipmentName
          if (!equipmentMap.has(key)) {
            equipmentMap.set(key, {
              id: method.equipmentId || key,
              name: method.equipmentName
            })
          }
        }
      })
      
      const uniqueEquipments = Array.from(equipmentMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      )
      
      setEquipments(uniqueEquipments)
      setLoadingEquipments(false)
    }
  }, [testMethods, selectedCapabilities])

  // Filter methods based on capabilities and search query
  const filteredMethods = testMethods.filter((method) => {
    // In edit/duplicate mode, restrict to only the capability from the original request
    if ((isEditMode || isDuplicateMode) && editModeCapability) {
      const matchesEditCapability = method.capabilityId && method.capabilityId === editModeCapability
      if (!matchesEditCapability) {
        return false
      }
    }

    // Filter by capabilities (only applies in non-edit mode or when no edit capability is set)
    const matchesCapabilities =
      selectedCapabilities.length === 0 ||
      (method.capabilityId && selectedCapabilities.includes(method.capabilityId))

    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (method.methodcode && method.methodcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (method.capabilityName && method.capabilityName.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by equipment
    const matchesEquipment = 
      selectedEquipments.length === 0 || 
      (method.equipmentName && selectedEquipments.includes(method.equipmentName))

    // Filter by selection status
    const matchesSelection = !showOnlySelected || method.selected || method.instances.length > 0

    return matchesCapabilities && matchesSearch && matchesEquipment && matchesSelection
  })

  // Sort filtered methods based on sortBy value
  const sortedMethods = [...filteredMethods].sort((a, b) => {
    switch (sortBy) {
      case "methodcode-asc":
        return (a.methodcode || "").localeCompare(b.methodcode || "")
      case "methodcode-desc":
        return (b.methodcode || "").localeCompare(a.methodcode || "")
      case "price-asc":
        return (a.price || 0) - (b.price || 0)
      case "price-desc":
        return (b.price || 0) - (a.price || 0)
      case "queue":
        // TODO: Add queue sorting logic
        return 0
      case "pending-sample":
        // TODO: Add pending sample sorting logic
        return 0
      default:
        return 0
    }
  })

  // Count selected methods
  const selectedMethodsCount = testMethods.filter((method) => method.selected || method.instances.length > 0).length

  // Toggle method selection
  const toggleMethodSelection = (id: string) => {
    const method = testMethods.find(m => m.id === id);
    
    setTestMethods((prev) =>
      prev.map((method) => {
        if (method.id === id) {
          const newSelected = !method.selected
          // If deselecting, clear everything including instances
          if (!newSelected) {
            return {
              ...method,
              selected: false,
              samples: [],
              instances: [],
              requirements: ''
            }
          }
          // If selecting, add all samples
          return {
            ...method,
            selected: newSelected,
            samples: samples.map((sample) => sample.name),
          }
        }
        return method
      }),
    )

    // If deselecting the method, clean up all related data
    if (method && method.selected) {
      setDeselectedSamples((prev) => {
        const newDeselected = { ...prev };
        // Remove main method deselected samples
        delete newDeselected[id];
        // Remove all instance deselected samples
        if (method.instances) {
          method.instances.forEach((_, index) => {
            delete newDeselected[`${id}-instance-${index}`];
          });
        }
        return newDeselected;
      });
      
      // Clean up sample priorities and requirements
      setSamplePriorities((prev) => {
        const newPriorities = { ...prev };
        delete newPriorities[id];
        return newPriorities;
      });
      
      setSampleRequirements((prev) => {
        const newRequirements = { ...prev };
        delete newRequirements[id];
        return newRequirements;
      });
    }
  }

  // Toggle method expansion in selected section
  const toggleMethodExpansion = (methodId: string) => {
    setExpandedMethods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
  }

  // Toggle description expansion
  const toggleDescriptionExpansion = (methodId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
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

  // Apply method requirements to all samples
  const applyRequirementsToAllSamples = (id: string) => {
    const method = testMethods.find(m => m.id === id)
    if (method && method.requirements) {
      const newRequirements = { ...sampleRequirements[id] || {} }
      
      // Apply to main method samples
      method.samples.forEach(sample => {
        const key = `${id}-${sample}`
        newRequirements[key] = method.requirements
      })
      
      // Apply to instance samples
      method.instances.forEach((instance, index) => {
        instance.samples.forEach(sample => {
          const sampleName = typeof sample === "string" ? sample : sample.name
          const key = `${id}-instance-${index}-${sampleName}`
          newRequirements[key] = method.requirements
        })
      })
      
      setSampleRequirements(prev => ({
        ...prev,
        [id]: newRequirements
      }))
      
      toast({
        title: "Requirements Applied",
        description: "Additional requirements have been applied to all samples.",
      })
    }
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

  // Apply method priority to all samples
  const applyMethodPriorityToAllSamples = (methodId: string, priority: 'normal' | 'urgent') => {
    const method = testMethods.find(m => m.id === methodId)
    if (method) {
      const newPriorities = { ...samplePriorities[methodId] || {} }
      
      // Apply to main method samples
      method.samples.forEach(sample => {
        const key = `${methodId}-${sample}`
        newPriorities[key] = priority
      })
      
      // Apply to instance samples
      method.instances.forEach((instance, index) => {
        instance.samples.forEach(sample => {
          const sampleName = typeof sample === "string" ? sample : sample.name
          const key = `${methodId}-instance-${index}-${sampleName}`
          newPriorities[key] = priority
        })
      })
      
      setSamplePriorities(prev => ({
        ...prev,
        [methodId]: newPriorities
      }))
      
      // Update method priority state
      setMethodPriorities(prev => ({
        ...prev,
        [methodId]: priority
      }))
      
      toast({
        title: "Priority Applied",
        description: `${priority === 'urgent' ? 'Urgent' : 'Normal'} priority has been applied to all samples.`,
      })
    }
  }

  // Apply global priority to all methods and samples
  const applyGlobalPriority = (priority: 'normal' | 'urgent') => {
    setGlobalPriority(priority)
    
    // Get all selected methods
    const selectedMethods = testMethods.filter(method => method.selected || method.instances.length > 0)
    
    // Apply priority to each method
    selectedMethods.forEach(method => {
      applyMethodPriorityToAllSamples(method.id, priority)
    })
    
    toast({
      title: "Global Priority Applied",
      description: `${priority === 'urgent' ? 'Urgent' : 'Normal'} priority has been applied to all test methods and samples.`,
    })
  }

  // Apply instance requirements to all samples in that instance
  const applyInstanceRequirementsToAllSamples = (id: string, instanceIndex: number) => {
    const method = testMethods.find(m => m.id === id)
    if (method && method.instances[instanceIndex] && method.instances[instanceIndex].requirements) {
      const newRequirements = { ...sampleRequirements[id] || {} }
      
      method.instances[instanceIndex].samples.forEach(sample => {
        const sampleName = typeof sample === "string" ? sample : sample.name
        const key = `${id}-instance-${instanceIndex}-${sampleName}`
        newRequirements[key] = method.instances[instanceIndex].requirements
      })
      
      setSampleRequirements(prev => ({
        ...prev,
        [id]: newRequirements
      }))
      
      toast({
        title: "Requirements Applied",
        description: "Additional requirements have been applied to all samples in this repeat.",
      })
    }
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

  // Handler for sample priority changes
  const handleSamplePriorityChange = (methodId: string, sampleName: string, priority: 'normal' | 'urgent', instanceIndex?: number) => {
    const key = instanceIndex !== undefined 
      ? `${methodId}-instance-${instanceIndex}-${sampleName}`
      : `${methodId}-${sampleName}`;
    
    setSamplePriorities(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [key]: priority
      }
    }));
  };

  // Handler for sample requirement changes
  const handleSampleRequirementChange = (methodId: string, sampleName: string, requirement: string, instanceIndex?: number) => {
    const key = instanceIndex !== undefined 
      ? `${methodId}-instance-${instanceIndex}-${sampleName}`
      : `${methodId}-${sampleName}`;
    
    setSampleRequirements(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [key]: requirement
      }
    }));
  };

  // Function to extract keywords from form data
  const extractKeywords = () => {
    const extractedKeywords = new Set<string>()
    
    // Extract from title
    if (formData.requestTitle) {
      const titleWords = formData.requestTitle
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter(word => word.length > 3 && !['test', 'request', 'sample', 'analysis', 'with', 'from', 'this', 'that', 'these', 'those'].includes(word))
      titleWords.forEach(word => extractedKeywords.add(word))
    }
    
    // Add priority if urgent
    if (formData.priority === 'urgent') {
      extractedKeywords.add('urgent')
    }
    
    // Extract from samples
    samples.forEach(sample => {
      if (sample.category) extractedKeywords.add(sample.category.toLowerCase())
      if (sample.grade) extractedKeywords.add(sample.grade.toLowerCase())
      if (sample.type) extractedKeywords.add(sample.type.toLowerCase())
      if (sample.form) extractedKeywords.add(sample.form.toLowerCase())
      if (sample.plant) extractedKeywords.add(sample.plant.toLowerCase())
    })
    
    // Add IO number if exists
    if (formData.useIONumber === 'yes' && formData.ioNumber) {
      extractedKeywords.add(formData.ioNumber)
    }
    
    return Array.from(extractedKeywords).slice(0, 8) // Limit to 8 keywords
  }
  
  // Initialize keywords when data changes
  useEffect(() => {
    const extracted = extractKeywords()
    const newKeywords = extracted.map((text, index) => ({
      id: `keyword-${Date.now()}-${index}`,
      text,
      active: true
    }))
    
    // Only update if keywords have changed
    const currentTexts = keywords.map(k => k.text).sort()
    const newTexts = newKeywords.map(k => k.text).sort()
    if (JSON.stringify(currentTexts) !== JSON.stringify(newTexts)) {
      setKeywords(prev => {
        // Preserve existing keywords that are still relevant
        const existingMap = new Map(prev.map(k => [k.text, k]))
        return newKeywords.map(k => existingMap.get(k.text) || k)
      })
    }
  }, [formData.requestTitle, formData.priority, formData.useIONumber, formData.ioNumber, samples])
  
  // Handler for adding new keyword
  const handleAddKeyword = () => {
    if (newKeyword.trim() && keywords.length < 12) {
      setKeywords(prev => [...prev, {
        id: `keyword-${Date.now()}`,
        text: newKeyword.trim().toLowerCase(),
        active: true
      }])
      setNewKeyword('')
      setShowKeywordInput(false)
    }
  }
  
  // Handler for toggling keyword active state
  const toggleKeyword = (id: string) => {
    setKeywords(prev => prev.map(k => 
      k.id === id ? { ...k, active: !k.active } : k
    ))
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
            instances: filteredInstances
          };
        });

      localStorage.setItem("asrTestMethods", JSON.stringify(selectedTestMethods))
      
      // Save sample priorities and requirements
      localStorage.setItem("asrSamplePriorities", JSON.stringify(samplePriorities))
      localStorage.setItem("asrSampleRequirements", JSON.stringify(sampleRequirements))
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
        "asrFormData",
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
        "asrFormData_persistent",
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
      // Navigate back to the sample information page (step 2)
      const queryParams = new URLSearchParams();
      queryParams.set('step', '2');
      if (isEditMode && editRequestId) {
        queryParams.set('edit', editRequestId);
      } else if (isDuplicateMode && duplicateRequestId) {
        queryParams.set('duplicate', duplicateRequestId);
      }
      window.location.href = `/request/new/asr?${queryParams.toString()}`;
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

        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-2 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Test Method Selection" : "Add Test Methods"}
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
          
          {isSidebarCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Show Summary
            </Button>
          )}
        </div>

        <div className={`grid gap-6 ${isSidebarCollapsed ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
          <div className={`${isSidebarCollapsed ? 'md:col-span-1' : 'md:col-span-2'} space-y-6`}>
            {/* Search and filter */}
            <div className="space-y-4">
              {/* Browse Test Methods - Show card when no methods selected, button when methods exist */}
              {selectedMethodsCount === 0 ? (
                <Card className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors cursor-pointer" 
                      onClick={() => {
                        setShowAvailableMethods(true)
                        setHasSearched(true)
                      }}>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No Test Methods Selected</h3>
                        <p className="text-muted-foreground mt-2">
                          Click here to browse and select test methods for your samples
                        </p>
                      </div>
                      <Button variant="outline" className="mt-4">
                        <Search className="h-4 w-4 mr-2" />
                        Browse Test Methods
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAvailableMethods(true)
                      setHasSearched(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Browse More Test Methods
                  </Button>
                </div>
              )}
              
              
              {isEditMode && editModeCapability && (
                <div className="text-xs text-blue-600">
                  <Info className="inline h-3 w-3 mr-1" />
                  Capability filter is locked to the original request's capability in edit mode
                </div>
              )}
            </div>

            {/* Selected Methods Section */}
            {selectedMethodsCount > 0 && (
              <>
                {/* Global Priority Selection */}
                <div className="mb-6 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="p-5">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Whole Request Prioritization:</Label>
                        <RadioGroup
                          value={globalPriority}
                          onValueChange={(value: 'normal' | 'urgent') => applyGlobalPriority(value)}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <RadioGroupItem value="normal" id="global-normal" className="border-gray-400" />
                            <Label htmlFor="global-normal" className="text-sm font-normal cursor-pointer select-none">
                              Normal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <RadioGroupItem value="urgent" id="global-urgent" className="border-red-500 text-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                            <Label htmlFor="global-urgent" className="text-sm font-normal cursor-pointer text-red-600 select-none">
                              Urgent
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {hasAnyUrgentSample() && (
                        <div className="flex items-center gap-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs font-normal text-gray-600 dark:text-gray-400">Expected Completion Date:</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-[180px] h-8 justify-start text-left font-normal border-red-300 bg-white hover:bg-red-50 hover:border-red-400 transition-colors",
                                    !urgentCompletionDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-3 w-3 text-red-500" />
                                  {urgentCompletionDate ? (
                                    <span className="text-sm">{format(urgentCompletionDate, "PPP")}</span>
                                  ) : (
                                    <span className="text-sm">Select date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white shadow-lg" align="start">
                                <Calendar
                                  mode="single"
                                  selected={urgentCompletionDate}
                                  onSelect={setUrgentCompletionDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="bg-white rounded-md"
                                  classNames={{
                                    head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
                                    cell: "h-9 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-9 w-10 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                    table: "w-full border-collapse",
                                    head_row: "flex justify-between",
                                    row: "flex w-full mt-2 justify-between"
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Selected Test Methods
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 shadow-sm">
                        {selectedMethodsCount} selected
                      </Badge>
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                    {testMethods
                      .filter((method) => method.selected || method.instances.length > 0)
                      .map((method) => {
                        const isExpanded = expandedMethods.has(method.id);
                        return (
                          <div key={method.id} className="border border-blue-100 rounded-lg p-3 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 whitespace-nowrap shadow-sm">
                                    {method.methodcode || 'N/A'}
                                  </Badge>
                                  <span className="font-medium">{method.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ({(() => {
                                      let totalSamples = 0;
                                      
                                      // Count samples in main method
                                      if (method.selected) {
                                        totalSamples += method.samples.filter(
                                          sample => !deselectedSamples[method.id]?.includes(sample)
                                        ).length;
                                      }
                                      
                                      // Count samples in instances
                                      method.instances.forEach((instance, index) => {
                                        const instanceKey = `${method.id}-instance-${index}`;
                                        totalSamples += instance.samples.filter(
                                          sample => !deselectedSamples[instanceKey]?.includes(sample)
                                        ).length;
                                      });
                                      
                                      return totalSamples;
                                    })()} samples)
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className={`${(() => {
                                    // Check if any sample in this method has urgent priority
                                    let hasUrgent = false;
                                    
                                    // Check main method samples
                                    if (method.selected) {
                                      const activeSamples = method.samples.filter(
                                        sample => !deselectedSamples[method.id]?.includes(sample)
                                      );
                                      
                                      activeSamples.forEach(sample => {
                                        const sampleKey = `${method.id}-${sample}`;
                                        const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                                        if (samplePriority === 'urgent') {
                                          hasUrgent = true;
                                        }
                                      });
                                    }
                                    
                                    // Check instance samples
                                    if (!hasUrgent) {
                                      method.instances.forEach((instance, index) => {
                                        const instanceKey = `${method.id}-instance-${index}`;
                                        const activeSamples = instance.samples.filter(
                                          sample => !deselectedSamples[instanceKey]?.includes(sample)
                                        );
                                        
                                        activeSamples.forEach(sample => {
                                          const sampleKey = `${method.id}-instance-${index}-${sample}`;
                                          const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                                          if (samplePriority === 'urgent') {
                                            hasUrgent = true;
                                          }
                                        });
                                      });
                                    }
                                    
                                    return hasUrgent ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200';
                                  })()} text-xs`}>
                                    Total Cost: {(() => {
                                      const price = typeof method.price === 'string' 
                                        ? parseFloat(method.price.replace(/,/g, '')) 
                                        : Number(method.price) || 0;
                                      const urgentPrice = method.priorityPrice 
                                        ? (typeof method.priorityPrice === 'string' 
                                          ? parseFloat(method.priorityPrice.replace(/,/g, '')) 
                                          : Number(method.priorityPrice))
                                        : price;
                                      
                                      const basePrice = globalPriority === 'urgent' ? urgentPrice : price;
                                      
                                      let totalCost = 0;
                                      
                                      // Calculate cost for main method if selected
                                      if (method.selected) {
                                        const activeSamples = method.samples.filter(
                                          sample => !deselectedSamples[method.id]?.includes(sample)
                                        );
                                        totalCost += basePrice * activeSamples.length;
                                      }
                                      
                                      // Calculate cost for instances
                                      method.instances.forEach((instance, index) => {
                                        const instanceKey = `${method.id}-instance-${index}`;
                                        const activeSamples = instance.samples.filter(
                                          sample => !deselectedSamples[instanceKey]?.includes(sample)
                                        );
                                        totalCost += basePrice * activeSamples.length;
                                      });
                                      
                                      return totalCost.toLocaleString('en-US');
                                    })()} {method.unit || 'THB'}
                                  </Badge>
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                    {method.turnaround} days
                                  </Badge>
                                  {method.sampleAmount > 0 && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                      Sample: {method.sampleAmount} g
                                    </Badge>
                                  )}
                                  {method.equipmentName && (
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                                      {method.equipmentName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleMethodExpansion(method.id)}
                                  className="h-8 w-8"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleMethodSelection(method.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t">
                                {method.selected && (
                                  <div className="space-y-3">
                                    {method.instances.length > 0 && (
                                      <p className="text-sm font-medium">Repeat #1</p>
                                    )}
                                    <div className="space-y-2">
                                      <Label htmlFor={`remarks-${method.id}`} className="text-sm">
                                        Additional Requirements
                                      </Label>
                                      <div className="flex gap-2">
                                        <Input
                                          id={`remarks-${method.id}`}
                                          placeholder="e.g., Temperature 180°C, specific conditions, etc."
                                          className="flex-1"
                                          value={method.requirements || ""}
                                          onChange={(e) => updateMethodRequirements(method.id, e.target.value)}
                                          autoComplete="off"
                                        />
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => applyRequirementsToAllSamples(method.id)}
                                          disabled={!method.requirements}
                                        >
                                          Apply to all
                                        </Button>
                                      </div>
                                    </div>

                                    {method.samples.length > 0 && (
                                      <div className="mt-3">
                                        <SampleSelectionList
                                          methodId={method.id}
                                          samples={samples.map(s => s.name)}
                                          selectedSamples={method.samples.filter(
                                            sample => !deselectedSamples[method.id]?.includes(sample)
                                          )}
                                          samplePriorities={samplePriorities[method.id] || {}}
                                          sampleRequirements={sampleRequirements[method.id] || {}}
                                          onSampleToggle={(sampleName) => toggleSampleSelection(method.id, sampleName)}
                                          onPriorityChange={(sampleName, priority) => 
                                            handleSamplePriorityChange(method.id, sampleName, priority)
                                          }
                                          onRequirementChange={(sampleName, requirement) => 
                                            handleSampleRequirementChange(method.id, sampleName, requirement)
                                          }
                                          isExpanded={isSidebarCollapsed}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Show method instances */}
                                {method.instances.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    <p className="text-sm font-medium">Additional Repeats:</p>
                                    {method.instances.map((instance, index) => (
                                      <div key={index} className="border rounded-md p-3 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                          <p className="text-sm font-medium">Repeat #{index + 2}</p>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMethodInstance(method.id, index)}
                                            className="text-red-500 -mt-1"
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor={`instance-${method.id}-${index}`} className="text-sm">
                                            Additional Requirements
                                          </Label>
                                          <div className="flex gap-2">
                                            <Input
                                              id={`instance-${method.id}-${index}`}
                                              placeholder="e.g., Temperature 180°C, specific conditions, etc."
                                              className="flex-1"
                                              value={instance.requirements || ""}
                                              onChange={(e) => updateInstanceRequirements(method.id, index, e.target.value)}
                                              autoComplete="off"
                                            />
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={() => applyInstanceRequirementsToAllSamples(method.id, index)}
                                              disabled={!instance.requirements}
                                            >
                                              Apply to all
                                            </Button>
                                          </div>
                                        </div>

                                        {instance.samples && instance.samples.length > 0 && (
                                          <div className="mt-3">
                                            <SampleSelectionList
                                              methodId={method.id}
                                              instanceIndex={index}
                                              samples={samples.map(s => s.name)}
                                              selectedSamples={instance.samples.filter(sample => {
                                                const sampleName = typeof sample === "string" ? sample : sample.name;
                                                const instanceKey = `${method.id}-instance-${index}`;
                                                return !deselectedSamples[instanceKey]?.includes(sampleName);
                                              }).map(sample => typeof sample === "string" ? sample : sample.name)}
                                              samplePriorities={samplePriorities[method.id] || {}}
                                              sampleRequirements={sampleRequirements[method.id] || {}}
                                              onSampleToggle={(sampleName) => toggleSampleSelection(method.id, sampleName, index)}
                                              onPriorityChange={(sampleName, priority) => 
                                                handleSamplePriorityChange(method.id, sampleName, priority, index)
                                              }
                                              onRequirementChange={(sampleName, requirement) => 
                                                handleSampleRequirementChange(method.id, sampleName, requirement, index)
                                              }
                                              isExpanded={isSidebarCollapsed}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMethodInstance(method.id)}
                                    className="flex items-center gap-1"
                                  >
                                    Add Repeat
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                </CardContent>
              </Card>
              </>
            )}

            {/* Test method list - Only show when searched */}
            {showAvailableMethods && (
              <div id="available-methods-popup" className="fixed right-6 top-6 w-[600px] max-h-[calc(100vh-80px)] z-50 shadow-2xl">
                <Card className="border-2 overflow-hidden">
                  <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CardTitle>Available Test Methods</CardTitle>
                        {/* Capability filter inline */}
                        <div className="relative z-50">
                          <MultiSelectDropdown
                            options={capabilities.map(cap => ({
                              value: cap._id,
                              label: cap.capabilityName
                            }))}
                            selected={selectedCapabilities}
                            onChange={(values) => {
                              setSelectedCapabilities(values)
                            }}
                            placeholder="All Capabilities"
                            disabled={(isEditMode || isDuplicateMode) && !!editModeCapability}
                            className="w-48 text-xs [&>button]:h-8 [&>button]:text-xs"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAvailableMethods(false)
                          setHasSearched(false)
                          // Optionally reset search but keep filters
                          // setSearchQuery('')
                          // setSelectedCapabilities([])
                          // setSelectedEquipments([])
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto pt-4">
                    {/* Search field in popup */}
                    <div className="relative mb-3">
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
                    
                    {/* Equipment and Sort by filters in popup */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex items-center gap-2" style={{ flex: '1.5' }}>
                        <Label className="text-xs font-medium whitespace-nowrap">Equipment:</Label>
                        <div className="flex-1">
                          <MultiSelectDropdown
                            options={equipments.map(eq => ({
                              value: eq.name,
                              label: eq.name
                            }))}
                            selected={selectedEquipments}
                            onChange={(values) => {
                              setSelectedEquipments(values)
                            }}
                            placeholder="All Equipment"
                            disabled={loadingEquipments || equipments.length === 0}
                            className="text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-xs font-medium whitespace-nowrap">Sort by:</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="flex-1 text-xs min-h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="methodcode-asc">A-Z (Method Code)</SelectItem>
                            <SelectItem value="methodcode-desc">Z-A (Method Code)</SelectItem>
                            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                            <SelectItem value="queue">Queue</SelectItem>
                            <SelectItem value="pending-sample">Pending Sample</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                      <p className="mt-4 text-lg text-muted-foreground">Loading test methods...</p>
                    </div>
                  ) : sortedMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No test methods found matching your criteria</p>
                    </div>
                  ) : (
                    sortedMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 transition-all ${
                          method.selected || method.instances.length > 0
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`method-${method.id}`}
                            checked={method.selected || method.instances.length > 0}
                            onCheckedChange={() => toggleMethodSelection(method.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                                {(() => {
                                  console.log(`Method ${method.name} - methodcode:`, method.methodcode);
                                  return method.methodcode || 'N/A';
                                })()}
                              </Badge>
                              <Label htmlFor={`method-${method.id}`} className="text-base font-medium cursor-pointer">
                                {method.name}
                              </Label>
                            </div>
                            <div className="mt-1">
                              {expandedDescriptions.has(method.id) ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {method.description}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleDescriptionExpansion(method.id)
                                      }}
                                      className="text-blue-600 hover:text-blue-800 ml-1"
                                    >
                                      Show less
                                    </button>
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {method.description && method.description.length > 80 ? (
                                      <>
                                        {method.description.substring(0, 80)}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleDescriptionExpansion(method.id)
                                          }}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          ...
                                        </button>
                                      </>
                                    ) : (
                                      method.description
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="flex gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Normal: {method.price} {method.unit || 'THB'}
                                </Badge>
                                {method.priorityPrice && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Urgent: {method.priorityPrice} {method.unit || 'THB'}
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {method.turnaround} days
                              </Badge>
                              {method.sampleAmount > 0 && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  Sample: {method.sampleAmount} g
                                </Badge>
                              )}
                              {method.equipmentName && (
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  Equipment: {method.equipmentName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {method.isSmartAssistant && (
                          <div className="flex justify-end mt-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Smart Assistant</Badge>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action buttons - moved outside of the popup */}
            <div className="flex justify-between gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handleBackToSampleInfo}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Sample Information
              </Button>
              <Button
                onClick={() => {
                  handleSaveAndContinue()
                  router.push("/request/new/asr/summary")
                }}
                disabled={testMethods.filter((m) => m.selected || m.instances.length > 0).length === 0}
              >
                Save and Continue
              </Button>
            </div>
          </div>

          <div className={`${isSidebarCollapsed ? 'hidden' : 'md:col-span-1'}`}>
            {/* Request Summary card */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Request Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
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

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Samples</p>
                    <p className="text-lg font-bold">{samples.length}</p>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Selected Methods ({selectedMethodsCount})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {testMethods
                        .filter((method) => method.selected || method.instances.length > 0)
                        .map((method) => {
                          const repeatCount = (method.selected ? 1 : 0) + method.instances.length;
                          return (
                            <Badge 
                              key={method.id} 
                              variant="secondary" 
                              className="text-xs whitespace-nowrap bg-blue-100 text-blue-700 border-blue-300 shadow-sm"
                            >
                              {method.methodcode || 'N/A'}
                              {repeatCount > 1 && ` (×${repeatCount})`}
                            </Badge>
                          );
                        })
                      }
                      {selectedMethodsCount === 0 && (
                        <p className="text-sm text-muted-foreground italic">No methods selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Estimated Cost</p>
                    <p className="text-2xl font-bold">
                      {testMethods
                        .filter((m) => m.selected || m.instances.length > 0)
                        .reduce((sum, method) => {
                          const normalPrice = typeof method.price === 'string' 
                            ? parseFloat(method.price.replace(/,/g, '')) 
                            : Number(method.price) || 0;
                          const urgentPrice = method.priorityPrice 
                            ? (typeof method.priorityPrice === 'string' 
                              ? parseFloat(method.priorityPrice.replace(/,/g, '')) 
                              : Number(method.priorityPrice))
                            : normalPrice;
                          
                          let methodCost = 0;
                          
                          // Calculate cost for main method if selected
                          if (method.selected) {
                            const activeSamples = method.samples.filter(
                              sample => !deselectedSamples[method.id]?.includes(sample)
                            );
                            
                            activeSamples.forEach(sample => {
                              const sampleKey = `${method.id}-${sample}`;
                              const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                              const samplePrice = samplePriority === 'urgent' ? urgentPrice : normalPrice;
                              methodCost += samplePrice;
                            });
                          }
                          
                          // Calculate cost for instances
                          method.instances.forEach((instance, index) => {
                            const instanceKey = `${method.id}-instance-${index}`;
                            const activeSamples = instance.samples.filter(
                              sample => !deselectedSamples[instanceKey]?.includes(sample)
                            );
                            
                            activeSamples.forEach(sample => {
                              const sampleKey = `${method.id}-instance-${index}-${sample}`;
                              const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                              const samplePrice = samplePriority === 'urgent' ? urgentPrice : normalPrice;
                              methodCost += samplePrice;
                            });
                          });
                          
                          return sum + methodCost;
                        }, 0).toLocaleString('en-US')}{" "}
                      THB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected Completion Date</p>
                    <p className="text-2xl font-bold">
                      {testMethods.filter((m) => m.selected || m.instances.length > 0).length > 0
                        ? `${Math.max(...testMethods.filter((m) => m.selected || m.instances.length > 0).map((m) => m.turnaround))} days`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-950/20">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      Keywords
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {keywords.map((keyword, index) => (
                          <Badge 
                            key={keyword.id} 
                            variant="secondary" 
                            className={`text-xs transition-all cursor-move shadow-sm ${
                              keyword.active 
                                ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-400 line-through'
                            }`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', index.toString())
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                              const targetIndex = index
                              
                              if (draggedIndex !== targetIndex) {
                                setKeywords(prev => {
                                  const newKeywords = [...prev]
                                  const [draggedItem] = newKeywords.splice(draggedIndex, 1)
                                  newKeywords.splice(targetIndex, 0, draggedItem)
                                  return newKeywords
                                })
                              }
                            }}
                            onClick={() => {
                              setKeywords(prev => prev.map(k => 
                                k.id === keyword.id ? { ...k, active: !k.active } : k
                              ))
                            }}
                          >
                            {keyword.text}
                            <X 
                              className="ml-1 h-2 w-2 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                setKeywords(prev => prev.filter(k => k.id !== keyword.id))
                              }}
                            />
                          </Badge>
                        ))}
                        {showKeywordInput ? (
                          <Input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newKeyword.trim()) {
                                setKeywords(prev => [...prev, {
                                  id: `keyword-${Date.now()}`,
                                  text: newKeyword.trim(),
                                  active: true
                                }])
                                setNewKeyword('')
                                setShowKeywordInput(false)
                              } else if (e.key === 'Escape') {
                                setNewKeyword('')
                                setShowKeywordInput(false)
                              }
                            }}
                            onBlur={() => {
                              if (newKeyword.trim()) {
                                setKeywords(prev => [...prev, {
                                  id: `keyword-${Date.now()}`,
                                  text: newKeyword.trim(),
                                  active: true
                                }])
                              }
                              setNewKeyword('')
                              setShowKeywordInput(false)
                            }}
                            className="h-6 w-24 text-xs"
                            placeholder="Add keyword"
                            autoFocus
                          />
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-purple-100 bg-purple-50 text-purple-700 border-purple-300 shadow-sm"
                            onClick={() => setShowKeywordInput(true)}
                          >
                            <Plus className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {keywords.length === 0 && !showKeywordInput && (
                        <p className="text-xs text-muted-foreground italic">No keywords yet</p>
                      )}
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20 mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Request Breakdown
                    </p>
                    {(() => {
                      // Calculate request breakdown by capability and priority
                      const capabilityBreakdown = new Map<string, { normal: boolean, urgent: boolean, capabilityName: string }>()
                      
                      testMethods
                        .filter(method => method.selected || method.instances.length > 0)
                        .forEach(method => {
                          const capability = method.capabilityId || method.capability || 'Unknown'
                          
                          if (!capabilityBreakdown.has(capability)) {
                            // Find capability name from the capabilities array
                            const capabilityData = capabilities.find(cap => cap._id === capability)
                            capabilityBreakdown.set(capability, { 
                              normal: false, 
                              urgent: false, 
                              capabilityName: capabilityData?.capabilityName || method.capabilityName || 'Unknown'
                            })
                          }
                          
                          const status = capabilityBreakdown.get(capability)!
                          
                          // Check for normal and urgent samples in main method
                          if (method.selected) {
                            const activeSamples = method.samples.filter(
                              sample => !deselectedSamples[method.id]?.includes(sample)
                            )
                            
                            activeSamples.forEach(sample => {
                              const sampleKey = `${method.id}-${sample}`
                              const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority
                              if (samplePriority === 'urgent') {
                                status.urgent = true
                              } else {
                                status.normal = true
                              }
                            })
                          }
                          
                          // Check for instances
                          method.instances.forEach((instance, index) => {
                            const instanceKey = `${method.id}-instance-${index}`
                            const activeSamples = instance.samples.filter(
                              sample => !deselectedSamples[instanceKey]?.includes(sample)
                            )
                            
                            activeSamples.forEach(sample => {
                              const sampleKey = `${method.id}-instance-${index}-${sample}`
                              const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority
                              if (samplePriority === 'urgent') {
                                status.urgent = true
                              } else {
                                status.normal = true
                              }
                            })
                          })
                        })
                      
                      // Calculate total number of requests
                      let totalRequests = 0
                      capabilityBreakdown.forEach(status => {
                        if (status.normal) totalRequests++
                        if (status.urgent) totalRequests++
                      })
                      
                      if (totalRequests === 0) {
                        return <p className="text-xs text-muted-foreground italic">No requests yet</p>
                      }
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-green-700 dark:text-green-300">
                              This request will generate
                            </p>
                            <span className="text-sm font-bold text-green-900 dark:text-green-100">
                              {totalRequests} sub-request{totalRequests !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            {Array.from(capabilityBreakdown.entries())
                              .filter(([_, status]) => status.normal || status.urgent)
                              .map(([capabilityId, status]) => {
                                const capabilityRequestCount = (status.normal ? 1 : 0) + (status.urgent ? 1 : 0)
                                return (
                                  <div key={capabilityId} className="flex items-center justify-between bg-white dark:bg-green-900/30 p-1.5 rounded border border-green-100 dark:border-green-800">
                                    <span className="text-sm text-green-800 dark:text-green-200">{status.capabilityName}:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-green-700 dark:text-green-300">
                                        {capabilityRequestCount} Req.
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${status.normal ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                                          [{status.normal ? '1' : '-'}] N
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${status.urgent ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                                          [{status.urgent ? '1' : '-'}] E
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )
                    })()}
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
                <Link href="/request/new/asr/smart-assistant" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Launch Smart Assistant</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sample selection dialog was removed as we no longer need it */}
    </DashboardLayout>
  )
}

// Sample Selection Dialog Component was removed as we no longer need it