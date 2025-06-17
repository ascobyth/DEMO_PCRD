"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  HelpCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { RequestInformationForm } from "@/components/request-information-form"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Pencil, Upload, X } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Define proper types for Sample
interface Sample {
  id?: string; // Unique identifier for React keys
  category: string;
  grade?: string;
  lot?: string;
  sampleIdentity: string;
  type: string;
  form: string;
  tech?: string;
  feature?: string;
  plant?: string;
  samplingDate?: string;
  samplingTime?: string;
  generatedName: string;
}

export default function EquipmentReservationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Request Information fields (compatible with RequestInformationForm)
    requestTitle: "",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "",
    costCenter: "",
    isOnBehalf: false,
    onBehalfOfUser: "",
    onBehalfOfName: "",
    onBehalfOfEmail: "",
    onBehalfOfCostCenter: "",
    urgencyType: "",
    urgencyReason: "",
    approver: "",
    urgentMemo: null,
    // ER specific fields
    capability: "",
    selectedMethod: "",
    equipment: "",
    sampleCount: 0,
    samples: [] as Sample[],
    selectedDates: [],
    reservationSchedule: {}, // { date: { timeSlots: [] } }
    cost: 0,
    testingMode: "operator",
    specialRequirements: "",
    attachments: [],
  })

  // Sample category state (from NTR)
  const [sampleCategory, setSampleCategory] = useState("")
  const [currentSample, setCurrentSample] = useState<Sample>({
    category: "",
    grade: "",
    lot: "",
    sampleIdentity: "",
    type: "",
    form: "",
    tech: "",
    feature: "",
    plant: "",
    samplingDate: "",
    samplingTime: "",
    generatedName: "",
  })

  // Add these new state variables (from NTR)
  const [editMode, setEditMode] = useState(false)
  const [editingSampleIndex, setEditingSampleIndex] = useState<number | null>(null)
  const automaticNamingRef = useRef<HTMLDivElement>(null)
  const sampleSummaryRef = useRef<HTMLDivElement>(null)
  const addMoreButtonRef = useRef<HTMLButtonElement>(null)
  const [focusedSection, setFocusedSection] = useState<"naming" | "summary" | "addMore" | null>(null)
  const [showSampleSections, setShowSampleSections] = useState(false)
  const [highlightedField, setHighlightedField] = useState<string | null>("sample-category")
  const [sampleListName, setSampleListName] = useState("")
  const [sampleListDescription, setSampleListDescription] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [savedSampleLists, setSavedSampleLists] = useState<any[]>([])
  const [gradeSelectOpen, setGradeSelectOpen] = useState(false)
  const [loadingSampleLists, setLoadingSampleLists] = useState(false)
  const [savingSampleList, setSavingSampleList] = useState(false)
  
  // Add state for grade options
  const [gradeOptions, setGradeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [gradeError, setGradeError] = useState<string | null>(null)
  
  // Add state for app techs
  const [appTechs, setAppTechs] = useState<any[]>([])
  const [loadingAppTechs, setLoadingAppTechs] = useState(false)
  const [appTechError, setAppTechError] = useState<string | null>(null)
  const [techCatOptions, setTechCatOptions] = useState<Array<{ value: string; label: string; shortText: string }>>([])
  const [featureAppOptions, setFeatureAppOptions] = useState<Array<{ value: string; label: string; shortText: string }>>([])

  // States for RequestInformationForm
  const [ioOptions, setIoOptions] = useState<Array<{ value: string; label: string }>>([])
  const [onBehalfUsers, setOnBehalfUsers] = useState<Array<{ value: string; label: string; email: string; costCenter: string }>>([])
  const [approvers, setApprovers] = useState<Array<{ value: string; label: string }>>([])
  const [loadingIoOptions, setLoadingIoOptions] = useState(false)
  const [loadingCostCenter, setLoadingCostCenter] = useState(true)
  const [loadingOnBehalfUsers, setLoadingOnBehalfUsers] = useState(false)
  const [loadingApprovers, setLoadingApprovers] = useState(false)
  const [ioError, setIoError] = useState<string | null>(null)
  const [costCenterError, setCostCenterError] = useState<string | null>(null)
  const [onBehalfUsersError, setOnBehalfUsersError] = useState<string | null>(null)
  const [approversError, setApproversError] = useState<string | null>(null)

  // Calendar time slot management
  const [availableDates, setAvailableDates] = useState<{
    [date: string]: { available: boolean; partiallyAvailable: boolean; slots: number; totalSlots: number }
  }>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<{ id: number; time: string; available: boolean }[]>([])
  
  // States for capabilities and methods from database (moved here to fix initialization error)
  const [capabilities, setCapabilities] = useState<Array<{ id: string; name: string; methods: any[] }>>([])
  const [loadingCapabilities, setLoadingCapabilities] = useState(true)
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null)
  const [equipmentByMethod, setEquipmentByMethod] = useState<Record<string, any[]>>({})
  const [equipmentData, setEquipmentData] = useState<any[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(false)

  // Handlers for RequestInformationForm
  const handleFormChange = (name: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOnBehalfToggle = (isOnBehalf: boolean) => {
    setFormData(prev => ({
      ...prev,
      isOnBehalf,
      onBehalfOfUser: "",
      onBehalfOfName: "",
      onBehalfOfEmail: "",
      onBehalfOfCostCenter: ""
    }))
  }

  const handleOnBehalfUserChange = (userId: string) => {
    const selectedUser = onBehalfUsers.find(u => u.value === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        onBehalfOfUser: userId,
        onBehalfOfName: selectedUser.label,
        onBehalfOfEmail: selectedUser.email,
        onBehalfOfCostCenter: selectedUser.costCenter
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, urgentMemo: file }))
  }

  // Type and Form options
  const typeOptions = [
    { value: "HDPE", label: "HDPE" },
    { value: "LDPE", label: "LDPE" },
    { value: "LLDPE", label: "LLDPE" },
    { value: "UHWMPE", label: "UHWMPE" },
    { value: "PP", label: "PP" },
    { value: "PVC", label: "PVC" },
    { value: "Wax", label: "Wax" },
    { value: "Others", label: "Others" },
  ]

  const formOptions = [
    { value: "Pellet", label: "Pellet" },
    { value: "Powder", label: "Powder" },
    { value: "Flake", label: "Flake" },
    { value: "Scrap", label: "Scrap" },
    { value: "Specimen", label: "Specimen" },
    { value: "Liquid", label: "Liquid" },
    { value: "Others", label: "Others" },
  ]

  const plantOptions = [
    { value: "HD1", label: "HD1" },
    { value: "HD2", label: "HD2" },
    { value: "HD3", label: "HD3" },
    { value: "HD4", label: "HD4" },
    { value: "HD(LSP)", label: "HD(LSP)" },
    { value: "PP1", label: "PP1" },
    { value: "PP2", label: "PP2" },
    { value: "PP3", label: "PP3" },
    { value: "4P", label: "4P" },
    { value: "PP(LSP)", label: "PP(LSP)" },
    { value: "LDPE", label: "LDPE" },
    { value: "LLDPE", label: "LLDPE" },
  ]

  const [equipmentCosts, setEquipmentCosts] = useState({
    "sem-1": 2500,
    "tem-1": 3500,
    "xrd-1": 2000,
    "rheometer-1": 1800,
    "rheometer-2": 2200,
    "dma-1": 1500,
    "gc-ms-1": 2800,
    "hplc-1": 2300,
    "ftir-1": 1700,
    "saxs-1": 3000,
    "waxs-1": 2700,
    "confocal-1": 2200,
    "optical-1": 1200,
  })

  // Required fields for each sample category (from NTR)
  const requiredFields = {
    commercial: ["grade", "lot", "sampleIdentity", "type", "form"],
    td: ["tech", "feature", "sampleIdentity", "type", "form"],
    benchmark: ["feature", "sampleIdentity", "type", "form"],
    inprocess: ["plant", "samplingDate", "samplingTime", "sampleIdentity", "type", "form"],
    chemicals: ["plant", "samplingDate", "samplingTime", "sampleIdentity", "type", "form"],
    cap: ["feature", "sampleIdentity", "type", "form"],
  }

  const totalSteps = 7
  const progress = (currentStep / totalSteps) * 100

  // Urgency types
  const urgencyTypes = [
    { value: "claim", label: "Claim Complaint and Product quality problems" },
    { value: "decision", label: "Decision making" },
    { value: "plant", label: "Plant problem" },
    { value: "compliance", label: "Compliance" },
  ]

  // Function to check if a field is required (from NTR)

  // Fetch user cost center on mount
  useEffect(() => {
    const fetchUserCostCenter = async () => {
      if (!user?.email) return

      try {
        setLoadingCostCenter(true)
        console.log("Fetching cost center for:", user.email)
        const res = await fetch(`/api/users?email=${encodeURIComponent(user.email)}`)
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`)
        const data = await res.json()
        console.log("Users API response:", data)
        
        // API returns single user in 'user' field when email is provided
        if (data.success && data.user?.costCenter) {
          console.log("Found cost center:", data.user.costCenter)
          setFormData(prev => ({ ...prev, costCenter: data.user.costCenter }))
        } else {
          console.log("No cost center found for user")
          // Don't set error, just use default or empty
          setFormData(prev => ({ ...prev, costCenter: "" }))
        }
      } catch (error: any) {
        console.error("Failed to load cost center:", error)
        setCostCenterError(error.message)
      } finally {
        setLoadingCostCenter(false)
      }
    }

    fetchUserCostCenter()
  }, [user?.email])

  // Fetch IO options on mount
  useEffect(() => {
    const fetchIoOptions = async () => {
      // Don't fetch if user is not loaded yet
      if (!user) return
      
      try {
        const res = await fetch("/api/admin/ios")
        if (!res.ok) throw new Error(`Error fetching IO Numbers: ${res.statusText}`)
        const data = await res.json()
        console.log("IO API response:", data)
        
        // Check if data is an array or has a data property (for API compatibility)
        const ios = Array.isArray(data) ? data : data.data || []
        console.log("IOs to filter:", ios)
        console.log("User name for filtering:", user.name)
        
        // Filter IOs based on user's full name being contained in the member field
        const filteredIos = ios.filter((io: any) => {
          if (!io.member || !user.name) return false
          // Check if user's full name is contained in the member field (case-insensitive)
          return io.member.toLowerCase().includes(user.name.toLowerCase())
        })
        console.log("Filtered IOs:", filteredIos)
        
        const options = filteredIos.map((io: any) => ({
          value: io.ioNo,
          label: `${io.ioNo} ${io.ioName}`
        }))
        setIoOptions(options)
        console.log("Final IO options:", options)
      } catch (error: any) {
        console.error("Failed to fetch IO Numbers:", error)
        setIoError(error.message)
      } finally {
        setLoadingIoOptions(false)
      }
    }
    
    // Only fetch when user is available
    if (user) {
      fetchIoOptions()
    }
  }, [user])

  // Fetch on behalf users
  useEffect(() => {
    const fetchOnBehalfUsers = async () => {
      console.log("Fetching on behalf users for:", user?.email)
      if (!user?.email) {
        console.log("No user email available, skipping on behalf users fetch")
        return
      }

      try {
        setLoadingOnBehalfUsers(true)
        const res = await fetch(`/api/users/on-behalf?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()
        console.log("On behalf users response:", data)

        if (data.success && data.data) {
          const options = data.data.map((u: any) => ({
            value: u._id,  // Use _id as value (same as NTR)
            label: u.name || u.username,
            email: u.email,
            costCenter: u.costCenter || ""
          }))
          setOnBehalfUsers(options)
          console.log("Set on behalf users:", options)
        } else {
          console.log("No on behalf users in response")
        }
      } catch (error) {
        console.error("Failed to fetch on behalf users:", error)
        setOnBehalfUsersError("Failed to load users")
      } finally {
        setLoadingOnBehalfUsers(false)
      }
    }

    fetchOnBehalfUsers()
  }, [user?.email])

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      if (!user?.email) return

      try {
        setLoadingApprovers(true)
        const res = await fetch("/api/users")
        const data = await res.json()

        if (data.success && data.users) {
          const currentUser = data.users.find((u: any) => u.email === user.email)
          
          if (currentUser?.approvers && currentUser.approvers.length > 0) {
            const approverIds = currentUser.approvers.map((a: any) => 
              typeof a === 'string' ? a : a._id || a.$oid || String(a)
            ).filter(Boolean)

            const approverOptions = data.users
              .filter((u: any) => {
                const userId = u._id?.toString() || u.id?.toString()
                return u.isActive !== false && approverIds.some((id: string) => 
                  id.toString() === userId
                )
              })
              .map((u: any) => ({
                value: u._id,
                label: `${u.name || u.username} (${u.position || u.email})`
              }))

            setApprovers(approverOptions)
          }
        }
      } catch (error) {
        console.error("Failed to fetch approvers:", error)
        setApproversError("Failed to load approvers")
      } finally {
        setLoadingApprovers(false)
      }
    }

    fetchApprovers()
  }, [user?.email])

  // Fetch commercial grades from the database
  useEffect(() => {
    const fetchCommercialGrades = async () => {
      try {
        setLoadingGrades(true)
        const res = await fetch("/api/commercial-samples")
        if (!res.ok) throw new Error(`Error fetching commercial samples: ${res.statusText}`)
        const data = await res.json()

        if (data.success && data.data) {
          // Format the data for the SearchableSelect component
          const options = data.data
            .filter((sample: any) => sample.isActive !== false) // Only include active samples
            .map((sample: any) => ({
              value: sample.gradeName,
              label: sample.gradeName
            }))

          // Remove duplicates
          const uniqueGrades = Array.from(
            new Map(options.map((item: any) => [item.value, item])).values()
          )

          setGradeOptions(uniqueGrades)
          console.log(`Loaded ${uniqueGrades.length} commercial grades from database`)
        } else {
          console.error("Commercial samples data is not in expected format:", data)
          setGradeError("Data format error. Please contact support.")
        }
      } catch (error: any) {
        console.error("Failed to fetch commercial grades:", error)
        setGradeError(error.message)
      } finally {
        setLoadingGrades(false)
      }
    }

    fetchCommercialGrades()
  }, [])

  // Fetch AppTech data
  useEffect(() => {
    const fetchAppTechs = async () => {
      try {
        setLoadingAppTechs(true)
        const res = await fetch("/api/app-techs")
        if (!res.ok) throw new Error(`Error fetching AppTechs: ${res.statusText}`)
        const data = await res.json()

        if (data.success && data.data) {
          setAppTechs(data.data)

          // Filter for Tech/CAT options (Tech or CATALYST types)
          const techCatData = data.data.filter((item: any) =>
            item.appTechType === "Tech" || item.appTechType === "CATALYST"
          )

          // Filter for Feature/App options (Application or Feature types)
          const featureAppData = data.data.filter((item: any) =>
            item.appTechType === "Application" || item.appTechType === "Feature"
          )

          // Format Tech/CAT options
          const techOptions = techCatData.map((item: any) => ({
            value: item.shortText || item.appTechName,
            label: item.appTechName,
            shortText: item.shortText || item.appTechName
          }))

          // Format Feature/App options
          const featureOptions = featureAppData.map((item: any) => ({
            value: item.shortText || item.appTechName,
            label: item.appTechName,
            shortText: item.shortText || item.appTechName
          }))

          setTechCatOptions(techOptions)
          setFeatureAppOptions(featureOptions)

          console.log(`Loaded ${techOptions.length} Tech/CAT options and ${featureOptions.length} Feature/App options`)
        } else {
          console.error("AppTech data is not in expected format:", data)
          setAppTechError("Data format error. Please contact support.")
        }
      } catch (error: any) {
        console.error("Failed to fetch AppTechs:", error)
        setAppTechError(error.message)
      } finally {
        setLoadingAppTechs(false)
      }
    }

    fetchAppTechs()
  }, [])

  // Fetch capabilities with methods that have service type ER
  useEffect(() => {
    console.log("=== Capabilities useEffect triggered ===")
    console.log("Current step:", currentStep)
    console.log("Capabilities state:", capabilities)
    console.log("Already loaded?", capabilities.length > 0)
    
    // Fetch capabilities early (on page load) so they're ready when user reaches step 2
    if (capabilities.length > 0) {
      console.log("Capabilities already loaded:", capabilities.length)
      return
    }
    
    const fetchCapabilitiesAndMethods = async () => {
      console.log("Starting to fetch capabilities and methods...")
      try {
        setLoadingCapabilities(true)
        
        // Fetch capabilities
        console.log("Fetching capabilities from /api/capabilities...")
        const capRes = await fetch('/api/capabilities')
        if (!capRes.ok) {
          console.error(`Capabilities fetch failed with status: ${capRes.status}`)
          throw new Error(`Failed to fetch capabilities: ${capRes.status} ${capRes.statusText}`)
        }
        const capResponse = await capRes.json()
        console.log("Capabilities response:", capResponse)
        
        // Extract capabilities data (handle wrapped response)
        const capData = Array.isArray(capResponse) ? capResponse : (capResponse.data || [])
        console.log("Extracted capabilities:", capData)
        
        if (!Array.isArray(capData)) {
          throw new Error('Capabilities data is not an array')
        }
        
        // Fetch methods
        console.log("Fetching methods from /api/test-methods...")
        const methodsRes = await fetch('/api/test-methods')
        if (!methodsRes.ok) {
          console.error(`Methods fetch failed with status: ${methodsRes.status}`)
          throw new Error(`Failed to fetch methods: ${methodsRes.status} ${methodsRes.statusText}`)
        }
        const methodsResponse = await methodsRes.json()
        console.log("Methods response:", methodsResponse)
        
        // Extract methods data (handle wrapped response)
        const methodsData = Array.isArray(methodsResponse) ? methodsResponse : (methodsResponse.data || [])
        console.log("Extracted methods:", methodsData)
        
        if (!Array.isArray(methodsData)) {
          throw new Error('Methods data is not an array')
        }
        
        // Filter methods that have service type ER
        const erMethods = methodsData.filter((method: any) => 
          method.serviceType && method.serviceType.includes('ER')
        )
        console.log("ER methods:", erMethods)
        
        // Group methods by capability and add method count
        const capabilitiesWithMethods = capData.map((cap: any) => {
          const capMethods = erMethods.filter((method: any) => {
            // Match by capability ID - handle ObjectId comparison and populated objects
            const capIdStr = cap._id?.toString() || cap._id
            
            // Handle capabilityId as either a string or populated object
            let methodCapIdStr;
            if (typeof method.capabilityId === 'object' && method.capabilityId !== null) {
              // If capabilityId is a populated object, extract the _id
              methodCapIdStr = method.capabilityId._id?.toString() || method.capabilityId._id
            } else {
              // If capabilityId is a string
              methodCapIdStr = method.capabilityId?.toString() || method.capabilityId
            }
            
            const isMatch = methodCapIdStr === capIdStr || 
                           method.capability === cap._id || 
                           method.capability === cap.capabilityName ||
                           (method.capabilityId?.capabilityName === cap.capabilityName) // Also check populated object's name
            
            if (isMatch) {
              console.log(`Method ${method.methodCode} matched to capability ${cap.capabilityName}`)
            }
            
            return isMatch
          })
          const result = {
            id: cap._id,
            name: cap.capabilityName || cap.name,
            methods: capMethods,
            methodCount: capMethods.length
          }
          
          if (capMethods.length > 0) {
            console.log(`Capability ${result.name} has ${result.methodCount} ER methods`)
          }
          
          return result
        }).filter((cap: any) => cap.methodCount > 0) // Only show capabilities with ER methods
        
        console.log("Capabilities with ER methods:", capabilitiesWithMethods)
        console.log("Setting capabilities state to:", capabilitiesWithMethods)
        setCapabilities(capabilitiesWithMethods)
        console.log("Capabilities state set!")
        
        // Fetch equipment data
        const equipmentRes = await fetch('/api/equipment')
        if (!equipmentRes.ok) throw new Error('Failed to fetch equipment')
        const equipmentResponse = await equipmentRes.json()
        console.log("Equipment response:", equipmentResponse)
        
        // Extract equipment data (handle wrapped response)
        const extractedEquipmentData = Array.isArray(equipmentResponse) ? equipmentResponse : (equipmentResponse.data || [])
        console.log("Extracted equipment data:", extractedEquipmentData)
        
        if (!Array.isArray(extractedEquipmentData)) {
          console.error('Equipment data is not an array:', extractedEquipmentData)
          throw new Error('Equipment data is not in expected format')
        }
        
        // Set equipment data to state
        setEquipmentData(extractedEquipmentData)
        
        // Build equipment by method mapping
        const equipmentMapping: Record<string, any[]> = {}
        erMethods.forEach((method) => {
          // Check if method has equipment (either equipmentName or equipmentId)
          if (method.equipmentName || method.equipmentId) {
            // Find equipment based on name or ID
            const methodEquipment = extractedEquipmentData.filter((equip: any) => {
              return (
                (method.equipmentName && equip.equipmentName === method.equipmentName) ||
                (method.equipmentId && (equip._id === method.equipmentId || equip.equipmentCode === String(method.equipmentId)))
              )
            })
            
            if (methodEquipment.length > 0) {
              equipmentMapping[method._id] = methodEquipment
            } else {
              // If no specific equipment found, show all equipment as fallback
              console.log(`No specific equipment found for method ${method.methodCode}, showing all equipment`)
              equipmentMapping[method._id] = extractedEquipmentData
            }
          } else {
            // If method has no equipment specified, show all equipment
            console.log(`Method ${method.methodCode} has no equipment specified, showing all equipment`)
            equipmentMapping[method._id] = equipmentData
          }
        })
        console.log("Equipment mapping:", equipmentMapping)
        setEquipmentByMethod(equipmentMapping)
        
      } catch (error: any) {
        console.error('Failed to fetch capabilities and methods:', error)
        console.error('Error stack:', error.stack)
        setCapabilitiesError(error.message || 'Failed to load capabilities')
      } finally {
        setLoadingCapabilities(false)
        console.log("Finished loading capabilities")
      }
    }
    
    fetchCapabilitiesAndMethods()
  }, [capabilities.length])

  // Load form data from localStorage if available (from NTR)
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem("erFormData")
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData)
        setFormData((prev) => ({
          ...prev,
          ...parsedFormData,
        }))
        // Clear the saved form data after loading it
        localStorage.removeItem("erFormData")
      }

      // Load samples if available
      const savedSamples = localStorage.getItem("erSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        setFormData((prev) => ({
          ...prev,
          samples: parsedSamples,
          sampleCount: parsedSamples.length,
        }))

        // Samples loaded successfully
      }
    } catch (error) {
      console.error("Error loading saved data from localStorage:", error)
    }
  }, [])

  // Generate calendar availability data when equipment changes
  useEffect(() => {
    if (formData.equipment) {
      // This would be an API call in a real implementation
      generateMockAvailabilityData()
    }
  }, [formData.equipment])

  // Calculate total cost whenever reservation schedule changes
  useEffect(() => {
    calculateTotalCost()
  }, [formData.reservationSchedule])

  // Calculate the total cost based on all selected time slots across all dates
  const calculateTotalCost = () => {
    const costPerHour = equipmentCosts[formData.equipment] || 2000 // Default to 2000 if not found
    let totalSlots = 0

    // Count all time slots across all dates
    Object.values(formData.reservationSchedule).forEach((dateData) => {
      totalSlots += (dateData as any).timeSlots.length
    })

    const totalCost = totalSlots * costPerHour

    setFormData((prev) => ({
      ...prev,
      cost: totalCost,
    }))
  }

  // Generate mock availability data for the calendar
  const generateMockAvailabilityData = () => {
    const today = new Date()
    const availabilityData: {
      [date: string]: { available: boolean; partiallyAvailable: boolean; slots: number; totalSlots: number }
    } = {}

    // Generate data for the next 30 days
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      const dateString = currentDate.toISOString().split("T")[0]

      // Create random availability (in a real app, this would come from your backend)
      const totalSlots = 7 // 7 time slots per day
      let availableSlots = 0

      // Weekend days have fewer slots available
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        availableSlots = Math.floor(Math.random() * 2) // 0 or 1 slots on weekends
      } else {
        availableSlots = Math.floor(Math.random() * (totalSlots + 1)) // 0 to 7 slots on weekdays
      }

      availabilityData[dateString] = {
        available: availableSlots > 0,
        partiallyAvailable: availableSlots > 0 && availableSlots < totalSlots,
        slots: availableSlots,
        totalSlots: totalSlots,
      }
    }

    setAvailableDates(availabilityData)
  }

  // Generate time slots for a specific date
  const generateTimeSlotsForDate = (date: string) => {
    const baseTimeSlots = [
      { id: 1, time: "09:00 - 10:00", available: true },
      { id: 2, time: "10:00 - 11:00", available: true },
      { id: 3, time: "11:00 - 12:00", available: true },
      { id: 4, time: "13:00 - 14:00", available: true },
      { id: 5, time: "14:00 - 15:00", available: true },
      { id: 6, time: "15:00 - 16:00", available: true },
      { id: 7, time: "16:00 - 17:00", available: true },
    ]

    // If we have availability data for this date
    if (availableDates[date]) {
      const { slots } = availableDates[date]

      // Mark random slots as unavailable to match our availability count
      const availableCount = slots
      const unavailableCount = baseTimeSlots.length - availableCount

      if (unavailableCount > 0) {
        // Create a copy of slots to modify
        const modifiedSlots = [...baseTimeSlots]

        // Randomly select slots to mark as unavailable
        const indices = Array.from({ length: baseTimeSlots.length }, (_, i) => i)
        for (let i = 0; i < unavailableCount; i++) {
          const randomIndex = Math.floor(Math.random() * indices.length)
          const slotIndex = indices.splice(randomIndex, 1)[0]
          modifiedSlots[slotIndex].available = false
        }

        return modifiedSlots
      }
    }

    return baseTimeSlots
  }

  // Mock data for sample fields (from NTR)
  const mockGrades = [
    { value: "HD5000S", label: "HD5000S" },
    { value: "HD5300B", label: "HD5300B" },
    { value: "HD5401GA", label: "HD5401GA" },
    { value: "PP1100NK", label: "PP1100NK" },
    { value: "PP2100JC", label: "PP2100JC" },
  ]

  const mockTechCat = [
    { value: "EcoRv", label: "EcoRv - Eco-friendly Resin" },
    { value: "HighPerf", label: "HighPerf - High Performance" },
    { value: "BioAdd", label: "BioAdd - Bio-based Additives" },
    { value: "RecyTech", label: "RecyTech - Recycling Technology" },
    { value: "NanoComp", label: "NanoComp - Nanocomposites" },
    { value: "BioPlast", label: "BioPlast - Bioplastics" },
    { value: "SmartPoly", label: "SmartPoly - Smart Polymers" },
    { value: "CondPoly", label: "CondPoly - Conductive Polymers" },
    { value: "BarrierTech", label: "BarrierTech - Barrier Technology" },
    { value: "LightStab", label: "LightStab - Light Stabilizers" },
  ]

  const mockFeatureApp = [
    { value: "AT", label: "AT - Advanced Technology" },
    { value: "FP", label: "FP - Film Processing" },
    { value: "IM", label: "IM - Injection Molding" },
    { value: "BM", label: "BM - Blow Molding" },
    { value: "CM", label: "CM - Compression Molding" },
    { value: "EX", label: "EX - Extrusion" },
    { value: "RIM", label: "RIM - Reaction Injection Molding" },
    { value: "TF", label: "TF - Thermoforming" },
    { value: "RM", label: "RM - Rotational Molding" },
    { value: "AM", label: "AM - Additive Manufacturing" },
    { value: "CP", label: "CP - Coating Process" },
  ]

  const typeOptions = [
    { value: "HDPE", label: "HDPE" },
    { value: "LDPE", label: "LDPE" },
    { value: "LLDPE", label: "LLDPE" },
    { value: "UHWMPE", label: "UHWMPE" },
    { value: "PP", label: "PP" },
    { value: "PVC", label: "PVC" },
    { value: "Wax", label: "Wax" },
    { value: "Others", label: "Others" },
  ]

  const formOptions = [
    { value: "Pellet", label: "Pellet" },
    { value: "Powder", label: "Powder" },
    { value: "Flake", label: "Flake" },
    { value: "Scrap", label: "Scrap" },
    { value: "Specimen", label: "Specimen" },
    { value: "Liquid", label: "Liquid" },
    { value: "Others", label: "Others" },
  ]

  const plantOptions = [
    { value: "HD1", label: "HD1" },
    { value: "HD2", label: "HD2" },
    { value: "HD3", label: "HD3" },
    { value: "HD4", label: "HD4" },
    { value: "HD(LSP)", label: "HD(LSP)" },
    { value: "PP1", label: "PP1" },
    { value: "PP2", label: "PP2" },
    { value: "PP3", label: "PP3" },
    { value: "4P", label: "4P" },
    { value: "PP(LSP)", label: "PP(LSP)" },
    { value: "LDPE", label: "LDPE" },
    { value: "LLDPE", label: "LLDPE" },
  ]



  // Form handling functions
  // Note: handleSelectChange is different from the one used for RequestInformationForm
  // This one is for other form fields in the ER flow
  const handleSelectChangeOrig = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Reset date and time when equipment changes
    if (name === "equipment") {
      setFormData((prev) => ({
        ...prev,
        selectedDates: [],
        reservationSchedule: {},
      }))
      setSelectedDate(null)
    }
  }

  const handleAttachmentChange = (e) => {
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...e.target.files] }))
  }

  // Sample functions from NTR
  const handleSampleChange = async (name: string, value: string) => {
    // If grade is being changed in commercial category, fetch polymer type
    if (name === "grade" && sampleCategory === "commercial" && value) {
      try {
        const res = await fetch(`/api/commercial-samples/grade-details?gradeName=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.polymerType) {
            // Update both grade and type
            setCurrentSample((prev) => {
              const updatedSample = { 
                ...prev, 
                grade: value,
                type: data.data.polymerType 
              };
              
              // Generate the sample name
              if (updatedSample.grade && updatedSample.lot && updatedSample.sampleIdentity) {
                updatedSample.generatedName = `${updatedSample.grade}_${updatedSample.lot}_${updatedSample.sampleIdentity}`;
              }
              
              return updatedSample;
            });
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch grade details:", error);
      }
    }

    setCurrentSample((prev) => {
      const updated = { ...prev, [name]: value }

      // Generate sample name based on category and fields
      let generatedName = ""

      if (updated.category === "commercial" && updated.grade && updated.lot && updated.sampleIdentity) {
        generatedName = `${updated.grade}_${updated.lot}_${updated.sampleIdentity}`
      } else if (updated.category === "td" && updated.tech && updated.feature && updated.sampleIdentity) {
        // Get abbreviations from the mock data
        const featureAbbr = featureAppOptions.find((f) => f.value === updated.feature)?.value || updated.feature
        const techAbbr = techCatOptions.find((t) => t.value === updated.tech)?.value || updated.tech
        generatedName = `${featureAbbr}_${techAbbr}_${updated.sampleIdentity}`
      } else if (updated.category === "benchmark" && updated.feature && updated.sampleIdentity) {
        const featureAbbr = featureAppOptions.find((f) => f.value === updated.feature)?.value || updated.feature
        generatedName = `${featureAbbr}_${updated.sampleIdentity}`
      } else if (
        updated.category === "inprocess" &&
        updated.plant &&
        updated.samplingDate &&
        updated.samplingTime &&
        updated.sampleIdentity
      ) {
        generatedName = `${updated.plant}_${updated.samplingDate}_${updated.samplingTime}_${updated.sampleIdentity}`
      } else if (
        updated.category === "chemicals" &&
        updated.plant &&
        updated.samplingDate &&
        updated.samplingTime &&
        updated.sampleIdentity
      ) {
        generatedName = `${updated.plant}_${updated.samplingDate}_${updated.samplingTime}_${updated.sampleIdentity}`
      } else if (updated.category === "cap" && updated.feature && updated.sampleIdentity) {
        const featureAbbr = featureAppOptions.find((f) => f.value === updated.feature)?.value || updated.feature
        generatedName = `CAP_${featureAbbr}_${updated.sampleIdentity}`
      }

      return { ...updated, generatedName }
    })
  }

  // Check for duplicate sample names (from NTR)
  const isDuplicateSampleName = (name: string, excludeIndex?: number) => {
    return formData.samples.some(
      (sample, index) => sample.generatedName === name && (excludeIndex === undefined || index !== excludeIndex),
    )
  }

  // Handle adding a sample (from NTR)
  const handleAddSample = () => {
    if (currentSample.generatedName) {
      // Check for duplicate sample names
      const isDuplicate = isDuplicateSampleName(currentSample.generatedName, editMode ? editingSampleIndex : undefined)

      if (isDuplicate) {
        toast({
          title: "Duplicate sample name",
          description: "A sample with this name already exists. Please modify the sample details.",
          variant: "destructive",
        })
        return
      }

      if (editMode && editingSampleIndex !== null) {
        // Update existing sample
        const updatedSamples = [...formData.samples]
        updatedSamples[editingSampleIndex] = { ...currentSample }

        setFormData((prev) => ({
          ...prev,
          samples: updatedSamples,
          sampleCount: updatedSamples.length,
        }))

        // Exit edit mode
        setEditMode(false)
        setEditingSampleIndex(null)

        toast({
          title: "Sample updated",
          description: `Sample "${currentSample.generatedName}" has been updated.`,
        })
      } else {
        // Add new sample
        setFormData((prev) => ({
          ...prev,
          samples: [...prev.samples, { ...currentSample }],
          sampleCount: prev.samples.length + 1,
        }))

        toast({
          title: "Sample added",
          description: `Sample "${currentSample.generatedName}" has been added.`,
        })
      }

      // Don't reset the form completely, just clear identity fields to prepare for next sample
      setCurrentSample((prev) => ({
        ...prev,
        sampleIdentity: "",
        generatedName: "",
      }))

      // Scroll to Sample Summary section and highlight the "Add more sample" button
      if (sampleSummaryRef.current) {
        sampleSummaryRef.current.scrollIntoView({ behavior: "smooth" })

        setTimeout(() => {
          if (addMoreButtonRef.current) {
            setFocusedSection("addMore")
            addMoreButtonRef.current.focus()
            setTimeout(() => setFocusedSection(null), 2000) // Remove highlight after 2 seconds
          }
        }, 500)
      }

      // Reset highlighted field
      setHighlightedField(null)

      // After adding, highlight the sample identity field for the next sample
      setTimeout(() => {
        setHighlightedField("sampleIdentity")
        const element = document.getElementById("sample-identity")
        if (element) {
          element.focus()
        }
      }, 2100)
    }
  }

  // Function to focus on the Automatic Sample Naming System (from NTR)
  const focusOnNamingSystem = () => {
    if (automaticNamingRef.current) {
      automaticNamingRef.current.scrollIntoView({ behavior: "smooth" })
      setFocusedSection("naming")
      setTimeout(() => setFocusedSection(null), 2000) // Remove highlight after 2 seconds
    }
  }

  // Handle removing a sample (from NTR)
  const handleRemoveSample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      samples: prev.samples.filter((_, i) => i !== index),
      sampleCount: prev.samples.length - 1,
    }))

    // Keep focus on the Sample Summary section
    if (sampleSummaryRef.current) {
      setFocusedSection("summary")
      setTimeout(() => setFocusedSection(null), 2000) // Remove highlight after 2 seconds
    }
  }

  // Handle copying a sample (from NTR)
  const handleCopySample = (sample: any) => {
    // Set current sample to the copied sample
    setCurrentSample({ ...sample })
    setSampleCategory(sample.category)

    // Exit edit mode if it was active
    setEditMode(false)
    setEditingSampleIndex(null)

    // Focus on the automatic naming section
    focusOnNamingSystem()

    toast({
      title: "Sample copied",
      description: "Sample details copied. Make changes and add as a new sample.",
    })
  }

  // Handle editing a sample (from NTR)
  const handleEditSample = (sample: any, index: number) => {
    // Set current sample to this sample for editing
    setCurrentSample({ ...sample })
    setSampleCategory(sample.category)

    // Enter edit mode
    setEditMode(true)
    setEditingSampleIndex(index)

    // Focus on the automatic naming section
    focusOnNamingSystem()
  }

  // Handle saving a sample list (from NTR)
  const handleSaveSampleSet = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save sample sets.",
        variant: "destructive"
      });
      return;
    }

    if (formData.samples.length === 0) {
      toast({
        title: "No samples to save",
        description: "Please add samples before saving.",
        variant: "destructive"
      });
      return;
    }

    if (!sampleListName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the sample set.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSavingSampleList(true);

      const response = await fetch('/api/sample-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sampleSetName: sampleListName.trim(),
          requesterName: user.name || user.username || 'Unknown',
          requesterEmail: user.email,
          ioNumber: formData.ioNumber || '',
          samples: formData.samples,
          description: sampleListDescription.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sample set saved",
          description: `${sampleListName} has been saved to your sample sets.`,
        });
        setShowSaveDialog(false);
        setSampleListName("");
        setSampleListDescription("");
      } else {
        toast({
          title: "Failed to save",
          description: data.error || "An error occurred while saving the sample set.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error saving sample set:", error);
      toast({
        title: "Failed to save",
        description: error.message || "An error occurred while saving the sample set.",
        variant: "destructive"
      });
    } finally {
      setSavingSampleList(false);
    }
  };

  // Load sample set from database
  const handleLoadSampleSet = (sampleSet: any) => {
    if (sampleSet && sampleSet.samples) {
      // Add the samples to the current form
      setFormData((prev) => ({
        ...prev,
        samples: [...sampleSet.samples],
        sampleCount: sampleSet.samples.length,
      }))

      setShowLoadDialog(false)
      setShowSampleSections(true)

      toast({
        title: "Sample set loaded",
        description: `Loaded ${sampleSet.samples.length} samples from "${sampleSet.sampleSetName}".`,
      })
    }
  }

  // Function to start adding samples (from NTR)
  const startAddingSamples = () => {
    setShowSampleSections(true)
    setTimeout(() => {
      if (automaticNamingRef.current) {
        automaticNamingRef.current.scrollIntoView({ behavior: "smooth" })
        setFocusedSection("naming")
        setTimeout(() => {
          setFocusedSection(null)
        }, 1000)
      }
    }, 100)
  }

  const renderSampleFields = () => {
    switch (sampleCategory) {
      case "commercial":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <SearchableSelect
                  options={gradeOptions}
                  value={currentSample.grade}
                  onValueChange={(value) => handleSampleChange("grade", value)}
                  placeholder="Select grade..."
                  loading={loadingGrades}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot">Lot *</Label>
                <Input
                  id="lot"
                  value={currentSample.lot}
                  onChange={(e) => handleSampleChange("lot", e.target.value)}
                  placeholder="Enter lot number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      case "td":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tech">Technology Category *</Label>
                <Select value={currentSample.tech} onValueChange={(value) => handleSampleChange("tech", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tech category" />
                  </SelectTrigger>
                  <SelectContent>
                    {techCatOptions.map((tech) => (
                      <SelectItem key={tech.value} value={tech.value}>
                        {tech.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature">Feature Application *</Label>
                <Select value={currentSample.feature} onValueChange={(value) => handleSampleChange("feature", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {featureAppOptions.map((feature) => (
                      <SelectItem key={feature.value} value={feature.value}>
                        {feature.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      case "benchmark":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="feature">Feature Application *</Label>
              <Select value={currentSample.feature} onValueChange={(value) => handleSampleChange("feature", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {featureAppOptions.map((feature) => (
                    <SelectItem key={feature.value} value={feature.value}>
                      {feature.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      case "inprocess":
      case "chemicals":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="plant">Plant *</Label>
              <Select value={currentSample.plant} onValueChange={(value) => handleSampleChange("plant", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant" />
                </SelectTrigger>
                <SelectContent>
                  {plantOptions.map((plant) => (
                    <SelectItem key={plant.value} value={plant.value}>
                      {plant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="samplingDate">Sampling Date *</Label>
                <Input
                  id="samplingDate"
                  type="date"
                  value={currentSample.samplingDate}
                  onChange={(e) => handleSampleChange("samplingDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="samplingTime">Sampling Time *</Label>
                <Input
                  id="samplingTime"
                  type="time"
                  value={currentSample.samplingTime}
                  onChange={(e) => handleSampleChange("samplingTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      case "cap":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="feature">Feature Application *</Label>
              <Select value={currentSample.feature} onValueChange={(value) => handleSampleChange("feature", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {featureAppOptions.map((feature) => (
                    <SelectItem key={feature.value} value={feature.value}>
                      {feature.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  // Navigation functions
  const nextStep = () => {
    // Basic validation for each step
    if (currentStep === 1) {
      if (!formData.requestTitle) {
        toast({
          title: "Required Field Missing",
          description: "Please enter a request title to continue.",
          variant: "destructive",
        })
        return
      }

      if (formData.useIONumber === "yes" && !formData.ioNumber) {
        toast({
          title: "Required Field Missing",
          description: "Please select an IO Number to continue.",
          variant: "destructive",
        })
        return
      }
    } else if (currentStep === 2) {
      if (!formData.equipment) {
        toast({
          title: "Required Field Missing",
          description: "Please select an equipment to continue.",
          variant: "destructive",
        })
        return
      }
    } else if (currentStep === 4) {
      if (Object.keys(formData.reservationSchedule).length === 0) {
        toast({
          title: "Required Field Missing",
          description: "Please select at least one date and time slot to continue.",
          variant: "destructive",
        })
        return
      }
    }

    // If moving from step 3 to step 4, save samples to localStorage
    if (currentStep === 3) {
      try {
        localStorage.setItem("erSamples", JSON.stringify(formData.samples))
      } catch (error) {
        console.error("Error saving samples to localStorage:", error)
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else {
      router.push("/request/new/er/summary")
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle date selection in the enhanced calendar
  const handleDateSelect = (date: string) => {
    if (availableDates[date]?.available) {
      // Update selected date for UI
      setSelectedDate(date)

      // Update selected dates list
      const updatedSelectedDates = [...formData.selectedDates]
      if (!updatedSelectedDates.includes(date)) {
        updatedSelectedDates.push(date)
      }

      // Generate time slots for the selected date
      const generatedTimeSlots = generateTimeSlotsForDate(date)
      setTimeSlots(generatedTimeSlots)

      // Update form data with the new selected date
      setFormData((prev) => {
        // Create a copy of the current reservation schedule
        const updatedSchedule = { ...prev.reservationSchedule }

        // If this date isn't in the schedule yet, add it
        if (!updatedSchedule[date]) {
          updatedSchedule[date] = {
            timeSlots: [],
          }
        }

        return {
          ...prev,
          selectedDates: updatedSelectedDates,
          reservationSchedule: updatedSchedule,
        }
      })

      toast({
        title: "Date selected",
        description: `Selected date: ${date}. Please choose time slots.`,
      })
    }
  }

  // Handle removing a date from the schedule
  const handleRemoveDate = (date: string) => {
    setFormData((prev) => {
      // Create a copy of the current reservation schedule and selected dates
      const updatedSchedule = { ...prev.reservationSchedule }
      const updatedSelectedDates = prev.selectedDates.filter((d) => d !== date)

      // Remove this date from the schedule
      delete updatedSchedule[date]

      return {
        ...prev,
        selectedDates: updatedSelectedDates,
        reservationSchedule: updatedSchedule,
      }
    })

    // If the removed date was the currently selected date, clear it
    if (selectedDate === date) {
      setSelectedDate(null)
      setTimeSlots([])
    }

    toast({
      title: "Date removed",
      description: `Removed date: ${date} from schedule.`,
    })
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    if (!slot.available || !selectedDate) return

    const [start, end] = slot.time.split(" - ")

    setFormData((prev) => {
      // Create a copy of the current reservation schedule
      const updatedSchedule = { ...prev.reservationSchedule }

      // Get the time slots for the selected date
      const dateSchedule = updatedSchedule[selectedDate] || { timeSlots: [] }

      // Check if this slot is already selected
      const isSelected = dateSchedule.timeSlots.some((selectedSlot) => selectedSlot.time === slot.time)

      let updatedTimeSlots

      if (isSelected) {
        // Remove the slot if already selected
        updatedTimeSlots = dateSchedule.timeSlots.filter((selectedSlot) => selectedSlot.time !== slot.time)
      } else {
        // Add the slot if not already selected
        updatedTimeSlots = [
          ...dateSchedule.timeSlots,
          {
            id: slot.id,
            time: slot.time,
            start,
            end,
          },
        ]
      }

      // Sort the time slots by their id (which corresponds to time order)
      updatedTimeSlots.sort((a, b) => a.id - b.id)

      // Update the schedule for this date
      updatedSchedule[selectedDate] = {
        ...dateSchedule,
        timeSlots: updatedTimeSlots,
      }

      return {
        ...prev,
        reservationSchedule: updatedSchedule,
      }
    })

    const dateSchedule = formData.reservationSchedule[selectedDate] || { timeSlots: [] }

    toast({
      title: dateSchedule?.timeSlots.some((s) => s.time === slot.time) ? "Time slot removed" : "Time slot selected",
      description: `${dateSchedule?.timeSlots.some((s) => s.time === slot.time) ? "Removed" : "Selected"} time: ${slot.time} on ${selectedDate}`,
    })
  }


  // Calendar component for enhanced visualization
  const EnhancedCalendar = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Generate days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    // Create calendar grid
    const days = []

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(currentYear, currentMonth, i)
      const dateString = dateObj.toISOString().split("T")[0]
      const isToday = i === today.getDate()
      const isSelected = formData.selectedDates.includes(dateString)
      const isCurrentlyViewing = dateString === selectedDate
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

      // Get availability data for this date
      const dateAvailability = availableDates[dateString]
      const isAvailable = dateAvailability?.available
      const isPartiallyAvailable = dateAvailability?.partiallyAvailable

      // Determine the appropriate class based on availability
      let bgColorClass = "bg-gray-100 text-gray-400" // default/unavailable
      let hoverClass = ""

      if (isAvailable) {
        if (isPartiallyAvailable) {
          bgColorClass = "bg-yellow-50 text-yellow-800 border border-yellow-200"
          hoverClass = "hover:bg-yellow-100 cursor-pointer"
        } else {
          bgColorClass = "bg-green-50 text-green-800 border border-green-200"
          hoverClass = "hover:bg-green-100 cursor-pointer"
        }
      }

      // Disabled class for past dates
      const isPastDate = dateObj < new Date(today.setHours(0, 0, 0, 0))
      if (isPastDate) {
        bgColorClass = "bg-gray-100 text-gray-400"
        hoverClass = ""
      }

      // Selected date styling
      if (isSelected) {
        bgColorClass = "bg-blue-500 text-white"
        hoverClass = ""
      }

      // Currently viewing date styling
      if (isCurrentlyViewing) {
        bgColorClass = "bg-blue-700 text-white"
        hoverClass = ""
      }

      days.push(
        <div
          key={i}
          onClick={() => (!isPastDate && isAvailable ? handleDateSelect(dateString) : null)}
          className={`relative h-10 w-10 flex items-center justify-center rounded-full ${bgColorClass} ${hoverClass} ${isToday ? "font-bold" : ""}`}
        >
          {i}
          {isAvailable && !isSelected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>
                </TooltipTrigger>
                <TooltipContent>
                  {dateAvailability?.slots} of {dateAvailability?.totalSlots} slots available
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>,
      )
    }

    // Add empty cells to complete the grid if needed
    const totalCells = days.length
    const cellsToAdd = Math.ceil(totalCells / 7) * 7 - totalCells
    for (let i = 0; i < cellsToAdd; i++) {
      days.push(<div key={`end-empty-${i}`} className="h-10 w-10"></div>)
    }

    return (
      <div className="mt-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">
            {today.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
        <div className="mt-4 flex items-center text-sm text-muted-foreground justify-between">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200 mr-1"></div>
            <span>Fully Available</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-100 border border-yellow-200 mr-1"></div>
            <span>Partially Available</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    )
  }

  // Get total number of time slots across all dates
  const getTotalTimeSlots = () => {
    let total = 0
    Object.values(formData.reservationSchedule).forEach((dateData) => {
      total += (dateData as any).timeSlots.length
    })
    return total
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading user information...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  /*
  // Temporarily comment out everything to isolate the issue
  */

  // Main render
  const content = (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/request/new">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Request Types
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Equipment Reservation (ER)</h1>
          <p className="text-muted-foreground">Reserve laboratory equipment for self-service testing and experiments</p>
        </div>

        <div className="w-full">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-4">
            <RequestInformationForm
              requestType="ER"
              currentStep={currentStep}
              formData={formData}
              urgencyTypes={urgencyTypes}
              ioOptions={ioOptions}
              onBehalfUsers={onBehalfUsers}
              approvers={approvers}
              loadingStates={{
                loadingIoOptions,
                loadingCostCenter,
                loadingOnBehalfUsers,
                loadingApprovers
              }}
              errors={{
                ioError,
                costCenterError,
                onBehalfUsersError,
                approversError
              }}
              onFormChange={handleFormChange}
              onSelectChange={handleSelectChange}
              onOnBehalfToggle={handleOnBehalfToggle}
              onOnBehalfUserChange={handleOnBehalfUserChange}
              onFileChange={handleFileChange}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formData.requestTitle || (formData.useIONumber === "yes" && !formData.ioNumber)}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Equipment and Testing Method Selection</CardTitle>
              <CardDescription>Select equipment first, then choose from available testing methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capability">Select Capability</Label>
                {loadingCapabilities ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading capabilities...</span>
                  </div>
                ) : capabilitiesError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{capabilitiesError}</AlertDescription>
                  </Alert>
                ) : (
                  <Select value={formData.capability} onValueChange={(value) => {
                    handleSelectChangeOrig("capability", value)
                    // Reset equipment and method when capability changes
                    handleSelectChangeOrig("equipment", "")
                    handleSelectChangeOrig("selectedMethod", "")
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a capability" />
                    </SelectTrigger>
                    <SelectContent>
                      {capabilities.map((capability) => (
                        <SelectItem key={capability.id} value={capability.id}>
                          {capability.name} ({capability.methodCount} Testing Methods)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {formData.capability && (
                <div className="space-y-2">
                  <Label htmlFor="equipment">Select Equipment</Label>
                  <Select value={formData.equipment} onValueChange={(value) => {
                    handleSelectChangeOrig("equipment", value)
                    // Reset method when equipment changes
                    handleSelectChangeOrig("selectedMethod", "")
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        // Get all unique equipment from methods in selected capability
                        const selectedCapability = capabilities.find(cap => cap.id === formData.capability)
                        console.log("Selected capability:", selectedCapability)
                        
                        const capabilityMethods = selectedCapability?.methods || []
                        console.log("Capability methods:", capabilityMethods)
                        
                        const equipmentSet = new Set<string>()
                        const equipmentMap = new Map<string, any>()
                        
                        capabilityMethods.forEach((method) => {
                          console.log(`Method ${method.methodCode}: equipmentName=${method.equipmentName}, equipmentId=${method.equipmentId}`)
                          if (method.equipmentName) {
                            equipmentSet.add(method.equipmentName)
                            // Find the equipment object from equipmentData
                            const equipObj = equipmentData.find((e: any) => e.equipmentName === method.equipmentName)
                            if (equipObj) {
                              equipmentMap.set(method.equipmentName, equipObj)
                            }
                          }
                        })
                        
                        console.log("Equipment set:", Array.from(equipmentSet))
                        console.log("Equipment data available:", equipmentData.length)
                        
                        const equipmentItems = Array.from(equipmentSet).map(equipName => {
                          const equipObj = equipmentMap.get(equipName) || { equipmentName: equipName }
                          return (
                            <SelectItem key={equipObj._id || equipName} value={equipObj._id || equipName}>
                              {equipName}
                            </SelectItem>
                          )
                        })
                        
                        if (equipmentItems.length === 0) {
                          return <SelectItem value="none" disabled>No equipment available for this capability</SelectItem>
                        }
                        
                        return equipmentItems
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.equipment && (
                <div className="space-y-2">
                  <Label htmlFor="method">Select Testing Method</Label>
                  <Select 
                    value={formData.selectedMethod || ""} 
                    onValueChange={(value) => {
                      handleSelectChangeOrig("selectedMethod", value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a testing method" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        // Filter methods that use the selected equipment
                        const capabilityMethods = capabilities.find(cap => cap.id === formData.capability)?.methods || []
                        const equipmentMethods = capabilityMethods.filter((method: any) => {
                          // Match by equipment name or ID
                          const selectedEquip = equipmentData.find((e: any) => (e._id || e.equipmentName) === formData.equipment)
                          return method.equipmentName === (selectedEquip?.equipmentName || formData.equipment)
                        })
                        
                        return equipmentMethods.map((method: any) => (
                          <SelectItem key={method._id} value={method._id}>
                            {method.methodCode} - {method.testingName}
                          </SelectItem>
                        ))
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formData.selectedMethod && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Capability:</strong> {capabilities.find(c => c.id === formData.capability)?.name}</p>
                      <p><strong>Equipment:</strong> {
                        (() => {
                          const selectedEquip = equipmentData.find((e: any) => (e._id || e.equipmentName) === formData.equipment)
                          return selectedEquip?.equipmentName || formData.equipment
                        })()
                      }</p>
                      <p><strong>Method:</strong> {
                        capabilities
                          .find(c => c.id === formData.capability)
                          ?.methods.find((m: any) => m._id === formData.selectedMethod)?.testingName
                      }</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formData.selectedMethod}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
              <CardDescription>Add one or more samples for testing</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.samples.length === 0 && !showSampleSections ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium">No samples added yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Click the button below to start adding samples to your request. You'll be guided through the
                      process step by step.
                    </p>
                    <Button
                      onClick={startAddingSamples}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Click to start adding samples
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Automatic Naming System */}
                  <div
                    ref={automaticNamingRef}
                    className={`space-y-4 p-6 rounded-lg border transition-all duration-300 ${
                      focusedSection === "naming" ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Automatic Sample Naming System</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)}>
                          <Upload className="mr-1 h-3 w-3" />
                          Load Sample List
                        </Button>
                        {formData.samples.length > 0 && (
                          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                            <Save className="mr-1 h-3 w-3" />
                            Save Sample List
                          </Button>
                        )}
                      </div>
                    </div>

                    <Tabs value={sampleCategory} onValueChange={(value) => setSampleCategory(value as any)}>
                      <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger value="commercial">Commercial</TabsTrigger>
                        <TabsTrigger value="td">T&D</TabsTrigger>
                        <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                        <TabsTrigger value="inprocess">In Process</TabsTrigger>
                        <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
                        <TabsTrigger value="cap">Cap</TabsTrigger>
                      </TabsList>

                      <TabsContent value={sampleCategory} className="space-y-4">
                        <div className="space-y-4">
                          {renderSampleFields()}

                          <div className="space-y-2">
                            <Label htmlFor="sampleIdentity">Sample Identity *</Label>
                            <Input
                              id="sampleIdentity"
                              value={currentSample.sampleIdentity}
                              onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                              placeholder="Enter sample identifier"
                            />
                          </div>

                          {currentSample.generatedName && (
                            <div className="space-y-2">
                              <Label>Generated Sample Name</Label>
                              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                                {currentSample.generatedName}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              onClick={handleAddSample}
                              disabled={!currentSample.generatedName}
                              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Sample
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Sample Summary */}
                  {formData.samples.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Sample Summary</h3>
                        <Badge variant="outline">{formData.samples.length} samples</Badge>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sample Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Form</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.samples.map((sample, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">{sample.generatedName}</TableCell>
                              <TableCell className="capitalize">{sample.category}</TableCell>
                              <TableCell>{sample.type}</TableCell>
                              <TableCell>{sample.form}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopySample(sample)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSample(sample, index)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSample(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep} disabled={!formData.equipment}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Reservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Reservation Dates</Label>
                    <p className="text-sm text-muted-foreground">
                      Click on available dates in the calendar to select multiple dates
                    </p>
                    {/* Enhanced Calendar Component */}
                    <div className="border rounded-md p-4 bg-white">
                      <EnhancedCalendar />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDate && (
                    <>
                      <div className="space-y-2">
                        <Label>Selected Date: {selectedDate}</Label>
                        <div className="border rounded-md p-4 bg-white">
                          <h3 className="font-medium mb-2">Available Time Slots</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {timeSlots.map((slot) => {
                              const isSelected = formData.reservationSchedule[selectedDate]?.timeSlots.some(
                                (s) => s.time === slot.time,
                              )

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-3 rounded-md border ${
                                    !slot.available
                                      ? "bg-gray-100 cursor-not-allowed opacity-50"
                                      : isSelected
                                        ? "bg-green-50 border-green-300"
                                        : "hover:border-blue-500 cursor-pointer"
                                  }`}
                                  onClick={() => slot.available && handleTimeSlotSelect(slot)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span>{slot.time}</span>
                                    </div>
                                    <Badge variant={slot.available ? "outline" : "secondary"}>
                                      {!slot.available ? "Booked" : isSelected ? "Selected" : "Available"}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedDate && formData.selectedDates.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Select a date from the calendar</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Green dates have full availability, yellow dates have partial availability
                      </p>
                    </div>
                  )}

                  {/* Selected Dates Summary */}
                  {formData.selectedDates.length > 0 && (
                    <div className="border rounded-md p-4 bg-white">
                      <h3 className="font-medium mb-3">Selected Dates Summary</h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {formData.selectedDates.map((date) => {
                          const dateSchedule = formData.reservationSchedule[date] || { timeSlots: [] }
                          const timeSlotCount = dateSchedule.timeSlots.length

                          return (
                            <div key={date} className="p-3 border rounded-md">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="font-medium">{date}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{timeSlotCount} time slot(s)</Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveDate(date)}
                                    className="h-6 w-6"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>

                              {timeSlotCount > 0 && (
                                <div className="mt-2 pl-6">
                                  <p className="text-sm text-muted-foreground mb-1">Selected time slots:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {dateSchedule.timeSlots.map((slot, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {slot.time}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cost Summary */}
                  {getTotalTimeSlots() > 0 && (
                    <div className="mt-4 p-4 border rounded-md bg-blue-50">
                      <h3 className="font-medium text-blue-800 mb-2">Reservation Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Selected Dates:</span>
                          <span>{formData.selectedDates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Time Slots:</span>
                          <span>{getTotalTimeSlots()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per Hour:</span>
                          <span>฿{equipmentCosts[formData.equipment]?.toLocaleString() || "2,000"}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total Cost:</span>
                          <span>฿{formData.cost.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Note: The final cost may vary based on actual usage and any additional services required.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep} disabled={Object.keys(formData.reservationSchedule).length === 0}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Testing Mode and Operator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Testing Mode</Label>
                <RadioGroup
                  value={formData.testingMode}
                  onValueChange={(value) => handleSelectChangeOrig("testingMode", value)}
                  className="flex flex-col space-y-4"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem value="operator" id="operator" className="mt-1" />
                    <div>
                      <Label htmlFor="operator" className="cursor-pointer font-medium">
                        Expert Operator
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        A trained operator will conduct the testing for you
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem value="self" id="self" className="mt-1" />
                    <div>
                      <Label htmlFor="self" className="cursor-pointer font-medium">
                        Self-Service
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        You will conduct the testing yourself (requires prior training)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-md">
                    <RadioGroupItem value="observation" id="observation" className="mt-1" />
                    <div>
                      <Label htmlFor="observation" className="cursor-pointer font-medium">
                        Observation
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        You want to participate and observe the testing process
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements or Parameters</Label>
                <Textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  placeholder="Specify any special requirements or parameters for the testing"
                  rows={4}
                />
              </div>

              {formData.testingMode === "self" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Self-service testing requires prior training and certification on the equipment. If you haven't been
                    certified yet, please contact the lab manager to arrange for training.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attachments">Upload Relevant Files</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                  <Input id="attachments" type="file" multiple onChange={handleAttachmentChange} className="hidden" />
                  <Button variant="outline" onClick={() => document.getElementById("attachments").click()}>
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted file types: PDF, JPG, PNG, DOCX (Max 10MB per file)
                  </p>
                </div>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {Array.from(formData.attachments).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.priority === "urgent" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Don't forget to attach your Urgent Memo for priority processing.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 7 && (
          <Card>
            <CardHeader>
              <CardTitle>Review and Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="samples">Samples</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Project Name</Label>
                      <p className="font-medium">{formData.projectName || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Funding Source</Label>
                      <p className="font-medium">{formData.fundingSource === "io" ? "IO Number" : "Non-IO Request"}</p>
                    </div>
                    {formData.fundingSource === "io" && (
                      <div>
                        <Label className="text-muted-foreground">IO Number</Label>
                        <p className="font-medium">{formData.ioNumber || "Not specified"}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Cost Center</Label>
                      <p className="font-medium">{formData.costCenter || "Not specified"}</p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Testing Mode</Label>
                      <p className="font-medium">
                        {formData.testingMode === "operator"
                          ? "Expert Operator"
                          : formData.testingMode === "self"
                            ? "Self-Service"
                            : "Observation"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="equipment" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Capability</Label>
                      <p className="font-medium">
                        {capabilities.find((c) => c.id === formData.capability)?.name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Equipment</Label>
                      <p className="font-medium">
                        {equipmentByCapability[formData.capability]?.find((e) => e.id === formData.equipment)?.name ||
                          "Not selected"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Special Requirements</Label>
                    <p className="font-medium">{formData.specialRequirements || "None specified"}</p>
                  </div>
                </TabsContent>

                <TabsContent value="samples" className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Number of Samples</Label>
                    <p className="font-medium">{formData.samples.length}</p>
                  </div>

                  {formData.samples.map((sample, index) => (
                    <div key={index} className="p-4 border rounded-md space-y-2">
                      <Badge variant="outline">Sample {index + 1}</Badge>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Sample Name</Label>
                          <p className="font-medium">{sample.generatedName || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Category</Label>
                          <p className="font-medium">
                            {sample.category === "commercial"
                              ? "Commercial Grade"
                              : sample.category === "td"
                                ? "TD/NPD"
                                : sample.category === "benchmark"
                                  ? "Benchmark"
                                  : sample.category === "inprocess"
                                    ? "Inprocess"
                                    : sample.category === "chemicals"
                                      ? "Chemicals/Substances"
                                      : "Cap Development"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <p className="font-medium">{sample.type || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Form</Label>
                          <p className="font-medium">{sample.form || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Selected Dates</Label>
                    <div className="space-y-2 mt-2">
                      {formData.selectedDates.length > 0 ? (
                        formData.selectedDates.map((date) => {
                          const dateSchedule = formData.reservationSchedule[date] || { timeSlots: [] }
                          return (
                            <div key={date} className="p-3 border rounded-md">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{date}</span>
                                <Badge variant="outline">{dateSchedule.timeSlots.length} time slot(s)</Badge>
                              </div>
                              {dateSchedule.timeSlots.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground mb-1">Time slots:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {dateSchedule.timeSlots.map((slot, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {slot.time}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <p className="font-medium">No dates selected</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Cost</Label>
                    <p className="font-medium">฿{formData.cost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Based on {getTotalTimeSlots()} hour(s) at ฿
                      {equipmentCosts[formData.equipment]?.toLocaleString() || "2,000"}/hour
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Attachments</Label>
                    {formData.attachments.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {Array.from(formData.attachments).map((file, index) => (
                          <div key={index} className="text-sm">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">No attachments</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Please review all information carefully before submitting your equipment reservation request. Once
                  submitted, you will receive a confirmation with your ER code and further instructions.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded border-gray-300" />
                <Label htmlFor="terms" className="text-sm">
                  I confirm that all information provided is correct and I agree to the equipment usage terms and
                  conditions.
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={() => router.push("/request/new/er/confirmation")}>Submit Reservation</Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Sample Edit Dialog */}
      <Dialog open={editMode && editingSampleIndex !== null} onOpenChange={(open) => {
        if (!open) {
          setEditMode(false)
          setEditingSampleIndex(null)
          setCurrentSample({
            category: "",
            grade: "",
            lot: "",
            sampleIdentity: "",
            type: "",
            form: "",
            tech: "",
            feature: "",
            plant: "",
            samplingDate: "",
            samplingTime: "",
            generatedName: "",
          })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sample</DialogTitle>
            <DialogDescription>
              Update the sample information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={sampleCategory} onValueChange={(value) => setSampleCategory(value as any)}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="commercial">Commercial</TabsTrigger>
                <TabsTrigger value="td">T&D</TabsTrigger>
                <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                <TabsTrigger value="inprocess">In Process</TabsTrigger>
                <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
                <TabsTrigger value="cap">Cap</TabsTrigger>
              </TabsList>

              <TabsContent value={sampleCategory} className="space-y-4">
                <div className="space-y-4">
                  {renderSampleFields()}

                  <div className="space-y-2">
                    <Label htmlFor="sampleIdentity">Sample Identity *</Label>
                    <Input
                      id="sampleIdentity"
                      value={currentSample.sampleIdentity}
                      onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                      placeholder="Enter sample identifier"
                    />
                  </div>

                  {currentSample.generatedName && (
                    <div className="space-y-2">
                      <Label>Generated Sample Name</Label>
                      <div className="p-3 bg-muted rounded-md font-mono text-sm">
                        {currentSample.generatedName}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditMode(false)
              setEditingSampleIndex(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSample}
              disabled={!currentSample.generatedName}
            >
              Update Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Sample Set Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Sample List</DialogTitle>
            <DialogDescription>
              Save your current sample list for future use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listName">List Name *</Label>
              <Input
                id="listName"
                value={sampleListName}
                onChange={(e) => setSampleListName(e.target.value)}
                placeholder="Enter a name for this sample list"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listDescription">Description (Optional)</Label>
              <Textarea
                id="listDescription"
                value={sampleListDescription}
                onChange={(e) => setSampleListDescription(e.target.value)}
                placeholder="Add a description for this sample list"
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will save {formData.samples.length} sample(s) to your sample library.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSampleSet} disabled={!sampleListName.trim()}>
              Save Sample List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Sample Set Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Sample List</DialogTitle>
            <DialogDescription>
              Select a previously saved sample list or upload from file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="saved" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="saved">Saved Lists</TabsTrigger>
                <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="saved" className="space-y-4">
                {savedSampleLists.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No saved sample lists found
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {savedSampleLists.map((list) => (
                      <div
                        key={list._id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleLoadSampleSet(list)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{list.sampleSetName}</h4>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{list.sampleCount} samples</span>
                              <span>Created: {new Date(list.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Delete functionality can be added here
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Label htmlFor="csvFile" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                  </Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      // CSV upload functionality
                      if (e.target.files && e.target.files[0]) {
                        // Handle file upload
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">CSV files only</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
  
  return content
}
