"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, HelpCircle, Plus, Upload, Paperclip, Calendar, Copy, Pencil, Trash2, Save } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { RequestInformationForm } from "@/components/request-information-form"

// Import API client for fetching capabilities
import { fetchCapabilities } from "@/lib/api-client"


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

export default function ASRPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    requestTitle: "",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "",
    costCenter: "",
    problemSource: "",
    testObjective: "",
    expectedResults: "",
    businessImpact: "",
    desiredCompletionDate: "",
    samples: [] as Sample[],
    selectedCapabilities: [] as string[],
    additionalRequirements: "",
    attachments: [] as { name: string; size: number; type: string; lastModified: number }[],
    // On behalf fields
    isOnBehalf: false,
    onBehalfOfUser: "",
    onBehalfOfName: "",
    onBehalfOfEmail: "",
    onBehalfOfCostCenter: "",
    // Urgent request fields
    urgencyType: "",
    urgencyReason: "",
    approver: "",
    urgentMemo: null as File | null,
  })

  // Sample category state - reusing from NTR
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

  // Add these new state variables after the existing state declarations
  const [editMode, setEditMode] = useState(false)
  const [editingSampleIndex, setEditingSampleIndex] = useState<number | null>(null)
  const automaticNamingRef = useRef<HTMLDivElement>(null)
  const sampleSummaryRef = useRef<HTMLDivElement>(null)
  const addMoreButtonRef = useRef<HTMLButtonElement>(null)
  const [focusedSection, setFocusedSection] = useState<"naming" | "summary" | "addMore" | null>(null)
  const [showSampleSections, setShowSampleSections] = useState(false)
  const [highlightedField, setHighlightedField] = useState<string | null>("sample-category")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false)

  // Save/Load dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [sampleListName, setSampleListName] = useState("")
  const [sampleListDescription, setSampleListDescription] = useState("")
  const [savedSampleLists, setSavedSampleLists] = useState<any[]>([])
  const [loadingSampleLists, setLoadingSampleLists] = useState(false)
  const [savingSampleList, setSavingSampleList] = useState(false)
  const [sampleListSearchQuery, setSampleListSearchQuery] = useState("")

  // Loading states for API data
  const [loadingIoOptions, setLoadingIoOptions] = useState(false)
  const [ioOptions, setIoOptions] = useState<{ value: string; label: string }[]>([])
  const [ioError, setIoError] = useState<string | null>(null)
  
  const [loadingCostCenter, setLoadingCostCenter] = useState(false)
  const [costCenterError, setCostCenterError] = useState<string | null>(null)
  
  const [loadingOnBehalfUsers, setLoadingOnBehalfUsers] = useState(false)
  const [onBehalfUsers, setOnBehalfUsers] = useState<any[]>([])
  const [onBehalfUsersError, setOnBehalfUsersError] = useState<string | null>(null)
  
  const [loadingApprovers, setLoadingApprovers] = useState(false)
  const [approvers, setApprovers] = useState<{ value: string; label: string }[]>([])
  const [approversError, setApproversError] = useState<string | null>(null)

  // Dynamic data loading states for sample dialog
  const [commercialGrades, setCommercialGrades] = useState<{ value: string; label: string }[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [gradesError, setGradesError] = useState<string | null>(null)
  
  const [techCatOptions, setTechCatOptions] = useState<{ value: string; label: string; shortText: string }[]>([])
  const [featureAppOptions, setFeatureAppOptions] = useState<{ value: string; label: string; shortText: string }[]>([])
  const [loadingAppTechs, setLoadingAppTechs] = useState(false)
  const [appTechError, setAppTechError] = useState<string | null>(null)
  
  const [polymerTypes, setPolymerTypes] = useState<Record<string, string>>({})

  // Required fields for each sample category - reusing from NTR
  const requiredFields = {
    commercial: ["grade", "lot", "sampleIdentity", "type", "form"],
    td: ["tech", "feature", "sampleIdentity", "type", "form"],
    benchmark: ["feature", "sampleIdentity", "type", "form"],
    inprocess: ["plant", "samplingDate", "samplingTime", "sampleIdentity", "type", "form"],
    chemicals: ["plant", "samplingDate", "samplingTime", "sampleIdentity", "type", "form"],
    cap: ["feature", "sampleIdentity", "type", "form"],
  }

  // Function to check if a field is required
  const isFieldRequired = (field: string) => {
    return requiredFields[sampleCategory as keyof typeof requiredFields]?.includes(field) || false
  }

  // Function to find the next empty required field
  const findNextEmptyRequiredField = () => {
    const fields = requiredFields[sampleCategory as keyof typeof requiredFields] || []
    for (const field of fields) {
      if (!currentSample[field as keyof typeof currentSample]) {
        return field
      }
    }
    return null
  }

  // Function to highlight the next empty required field
  const highlightNextEmptyField = () => {
    const nextField = findNextEmptyRequiredField()
    if (nextField) {
      setHighlightedField(nextField)
      // Focus on the field if possible
      const element = document.getElementById(nextField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
          element.focus()
        }, 500)
      }
    } else {
      setHighlightedField(null)
    }
  }

  // Check for empty required fields when sample category changes
  useEffect(() => {
    if (showSampleSections) {
      highlightNextEmptyField()
    }
  }, [sampleCategory, showSampleSections])

  // Load IO Numbers from API
  useEffect(() => {
    const loadIoNumbers = async () => {
      // Don't fetch if user is not loaded yet
      if (!user) return
      
      setLoadingIoOptions(true)
      setIoError(null)
      try {
        const response = await fetch('/api/admin/ios')
        if (!response.ok) throw new Error(`Error fetching IO Numbers: ${response.statusText}`)
        const data = await response.json()
        
        // Check if data is an array or has a data property (for API compatibility)
        const ios = Array.isArray(data) ? data : data.data || []
        
        // Filter IOs based on user's full name being contained in the member field
        const filteredIos = ios.filter((io: any) => {
          if (!io.member || !user.name) return false
          // Check if user's full name is contained in the member field (case-insensitive)
          return io.member.toLowerCase().includes(user.name.toLowerCase())
        })
        
        const formattedOptions = filteredIos.map((io: any) => ({
          value: io.ioNo,
          label: `${io.ioNo} ${io.ioName}`
        }))
        setIoOptions(formattedOptions)
      } catch (error) {
        console.error('Error loading IO numbers:', error)
        setIoError('Error loading IO numbers')
      } finally {
        setLoadingIoOptions(false)
      }
    }

    // Only fetch when user is available
    if (user) {
      loadIoNumbers()
    }
  }, [user])

  // Load cost center based on user
  useEffect(() => {
    if (!user?.email) return
    
    const fetchCostCenter = async () => {
      try {
        setLoadingCostCenter(true)
        const res = await fetch("/api/admin/users")
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`)
        const data = await res.json()
        // Check if data is an array or has a data property (for API compatibility)
        const users = Array.isArray(data) ? data : data.data || []
        const currentUser = users.find((u: any) => u.email === user.email)
        console.log("Current user data:", currentUser)
        if (currentUser?.costCenter) {
          console.log("Found cost center:", currentUser.costCenter)
          setFormData((prev) => ({ ...prev, costCenter: currentUser.costCenter }))
        } else {
          console.log("No cost center found for user:", user.email)
          setCostCenterError("No cost center found for this user")
        }
      } catch (error: any) {
        console.error("Failed to load cost center:", error)
        setCostCenterError(error.message)
      } finally {
        setLoadingCostCenter(false)
      }
    }
    
    fetchCostCenter()
  }, [user?.email])

  // Update cost center when on behalf mode changes
  useEffect(() => {
    if (formData.isOnBehalf && formData.onBehalfOfCostCenter) {
      setFormData(prev => ({ ...prev, costCenter: formData.onBehalfOfCostCenter }))
    } else if (!formData.isOnBehalf && user) {
      const costCenter = user.costCenter || user.department || '0090-01560'
      setFormData(prev => ({ ...prev, costCenter }))
    }
  }, [formData.isOnBehalf, formData.onBehalfOfCostCenter, user])

  // Load approvers based on user
  useEffect(() => {
    const loadApprovers = async () => {
      if (!user) return

      setLoadingApprovers(true)
      setApproversError(null)
      
      try {
        // Check if user has approvers in their data
        if (user.approvers && Array.isArray(user.approvers)) {
          const formattedApprovers = user.approvers.map((approver: any) => ({
            value: approver.email || approver.id,
            label: approver.name || approver.email || 'Unknown Approver'
          }))
          setApprovers(formattedApprovers)
        } else {
          // Use default approvers if none found
          setApprovers([
            { value: "manager1@company.com", label: "Direct Manager" },
            { value: "director1@company.com", label: "Department Director" },
          ])
        }
      } catch (error) {
        console.error('Error loading approvers:', error)
        setApproversError('Failed to load approvers')
        setApprovers([])
      } finally {
        setLoadingApprovers(false)
      }
    }

    if (formData.priority === 'urgent') {
      loadApprovers()
    }
  }, [user, formData.priority])

  // Load on-behalf users
  useEffect(() => {
    const loadOnBehalfUsers = async () => {
      if (!user) return

      setLoadingOnBehalfUsers(true)
      setOnBehalfUsersError(null)
      
      try {
        const response = await fetch(`/api/users/on-behalf?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const formattedUsers = data.data.map((u: any) => ({
            value: u.email,
            label: u.name || u.username || u.email,
            email: u.email,
            costCenter: u.costCenter || u.department || ''
          }))
          setOnBehalfUsers(formattedUsers)
        } else {
          setOnBehalfUsersError('No users available')
          setOnBehalfUsers([])
        }
      } catch (error) {
        console.error('Error loading on-behalf users:', error)
        setOnBehalfUsersError('Failed to load users')
        setOnBehalfUsers([])
      } finally {
        setLoadingOnBehalfUsers(false)
      }
    }

    if (formData.isOnBehalf) {
      loadOnBehalfUsers()
    }
  }, [user, formData.isOnBehalf])

  // Add this useEffect after the existing useEffect hooks
  useEffect(() => {
    // Load form data from localStorage if available
    try {
      const savedFormData = localStorage.getItem("asrFormData")
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData)
        
        // Check if selectedCapabilities contains old string IDs
        if (parsedFormData.selectedCapabilities && Array.isArray(parsedFormData.selectedCapabilities)) {
          const hasLegacyIds = parsedFormData.selectedCapabilities.some((id: string) => 
            ['rheology', 'microstructure', 'small-molecule', 'mesostructure'].includes(id)
          );
          
          if (hasLegacyIds) {
            console.log('Detected legacy capability IDs, clearing selection');
            parsedFormData.selectedCapabilities = [];
          }
        }
        
        setFormData((prev) => ({
          ...prev,
          ...parsedFormData,
        }))
        // Clear the saved form data after loading it
        localStorage.removeItem("asrFormData")
      }

      // Load samples if available
      const savedSamples = localStorage.getItem("asrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        // Ensure all samples have IDs
        const samplesWithIds = parsedSamples.map((sample: Sample, index: number) => ({
          ...sample,
          id: sample.id || `sample-loaded-${Date.now()}-${index}`
        }))
        setFormData((prev) => ({
          ...prev,
          samples: samplesWithIds,
        }))

        // If samples exist, show the sample sections
        if (samplesWithIds.length > 0) {
          setShowSampleSections(true)
        }
      }
    } catch (error) {
      console.error("Error loading saved data from localStorage:", error)
    }
  }, [])

  // Load sample sets when the dialog is opened
  useEffect(() => {
    const loadSampleSets = async () => {
      if (!showLoadDialog || !user?.email) return;

      try {
        setLoadingSampleLists(true);

        const response = await fetch(`/api/sample-sets?requesterEmail=${encodeURIComponent(user.email)}&ioNumber=${encodeURIComponent(formData.ioNumber || '')}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Add isOwner flag to each sample set
          const sampleSetsWithOwner = data.data.map((sampleSet: any) => ({
            ...sampleSet,
            isOwner: sampleSet.requesterEmail === user.email
          }));
          setSavedSampleLists(sampleSetsWithOwner);
        } else {
          setSavedSampleLists([]);
        }
      } catch (error: any) {
        console.error("Error loading sample sets:", error);
        setSavedSampleLists([]);
        toast({
          title: "Failed to load sample sets",
          description: error.message || "An error occurred while loading sample sets.",
          variant: "destructive"
        });
      } finally {
        setLoadingSampleLists(false);
      }
    };

    loadSampleSets();
  }, [showLoadDialog, user?.email, formData.ioNumber]);

  // Fetch commercial grades from API
  useEffect(() => {
    const fetchCommercialGrades = async () => {
      setLoadingGrades(true)
      setGradesError(null)
      try {
        const response = await fetch('/api/commercial-samples')
        if (!response.ok) {
          throw new Error('Failed to fetch grades')
        }
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Get unique grade names
          const uniqueGrades = [...new Set(data.data.map((sample: any) => sample.gradeName).filter(Boolean))];
          const formattedGrades = uniqueGrades.map((gradeName: string) => ({
            value: gradeName,
            label: gradeName
          }))
          setCommercialGrades(formattedGrades)
        } else {
          setCommercialGrades([])
        }
      } catch (error) {
        console.error('Error fetching commercial grades:', error)
        setGradesError('Failed to load grades')
        setCommercialGrades([])
      } finally {
        setLoadingGrades(false)
      }
    }

    fetchCommercialGrades()
  }, [])

  // Fetch polymer types for commercial grades
  useEffect(() => {
    const fetchPolymerTypes = async () => {
      if (sampleCategory === "commercial") {
        try {
          const response = await fetch('/api/commercial-samples/polymer-types')
          if (!response.ok) {
            throw new Error('Failed to fetch polymer types')
          }
          const data = await response.json()
          
          if (data.success && typeof data.data === 'object') {
            setPolymerTypes(data.data)
          } else {
            setPolymerTypes({})
          }
        } catch (error) {
          console.error('Error fetching polymer types:', error)
          setPolymerTypes({})
        }
      }
    }

    fetchPolymerTypes()
  }, [sampleCategory])

  // Fetch app techs from API
  useEffect(() => {
    const fetchAppTechs = async () => {
      setLoadingAppTechs(true)
      setAppTechError(null)
      try {
        const response = await fetch('/api/app-techs')
        if (!response.ok) {
          throw new Error('Failed to fetch app techs')
        }
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          console.log('App Techs loaded from API:', data.data);
          
          // Remove duplicates based on shortText or appTech
          const uniqueTechs = data.data.reduce((acc: any[], tech: any) => {
            const identifier = tech.shortText || tech.appTech;
            if (!acc.find(t => (t.shortText || t.appTech) === identifier)) {
              acc.push(tech);
            }
            return acc;
          }, []);
          
          // Format for Tech/CAT options
          const techOptions = uniqueTechs.map((tech: any, index: number) => ({
            value: tech.shortText || tech.appTech || `tech-${index}`,
            label: `${tech.shortText || tech.appTech || 'Unknown'} - ${tech.appTech || 'No Name'}`,
            shortText: tech.shortText || tech.appTech || '',
            // Use _id if available, otherwise create a unique key
            key: tech._id || tech.id || `tech-${index}-${tech.shortText || index}`
          }))
          setTechCatOptions(techOptions)
          
          // Format for Feature/App options
          const featureOptions = uniqueTechs.map((tech: any, index: number) => ({
            value: tech.shortText || tech.appTech || `feature-${index}`,
            label: `${tech.shortText || tech.appTech || 'Unknown'} - ${tech.appTech || 'No Name'}`,
            shortText: tech.shortText || tech.appTech || '',
            // Use _id if available, otherwise create a unique key
            key: tech._id || tech.id || `feature-${index}-${tech.shortText || index}`
          }))
          setFeatureAppOptions(featureOptions)
          
          console.log('Tech/CAT options:', techOptions);
          console.log('Feature/App options:', featureOptions);
        } else {
          setTechCatOptions([])
          setFeatureAppOptions([])
        }
      } catch (error) {
        console.error('Error fetching app techs:', error)
        setAppTechError('Failed to load Tech/CAT and Feature/App options')
        setTechCatOptions([])
        setFeatureAppOptions([])
      } finally {
        setLoadingAppTechs(false)
      }
    }

    fetchAppTechs()
  }, [])

  // Update polymer type when grade is selected
  useEffect(() => {
    if (sampleCategory === "commercial" && currentSample.grade && polymerTypes[currentSample.grade]) {
      setCurrentSample(prev => ({
        ...prev,
        type: polymerTypes[currentSample.grade]
      }))
    }
  }, [currentSample.grade, sampleCategory, polymerTypes])

  // Mock data for sample fields - reusing from NTR
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

  // Urgency types  
  const urgencyTypes = [
    { value: "customer_complaint", label: "Customer Complaint" },
    { value: "production_stop", label: "Production Stop/Issue" },
    { value: "urgent_development", label: "Urgent Development Project" },
    { value: "management_request", label: "Management Request" },
    { value: "quality_issue", label: "Quality Issue" },
    { value: "other", label: "Other (Please specify)" },
  ]

  // Mock problem sources
  const problemSources = [
    { value: "customer", label: "Customer Complaint" },
    { value: "production", label: "Production Issue" },
    { value: "development", label: "New Product Development" },
    { value: "research", label: "Research Project" },
    { value: "quality", label: "Quality Control" },
    { value: "other", label: "Other" },
  ]

  // State for capabilities fetched from the database
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [isLoadingCapabilities, setIsLoadingCapabilities] = useState(true)

  // Fetch capabilities from the API when the component mounts
  useEffect(() => {
    const getCapabilities = async () => {
      setIsLoadingCapabilities(true)
      try {
        const capabilitiesData = await fetchCapabilities()
        console.log("Fetched capabilities:", capabilitiesData)
        if (capabilitiesData.length > 0) {
          setCapabilities(capabilitiesData)
        } else {
          console.warn("No capabilities fetched from database")
          // Try to seed capabilities if none exist
          try {
            const seedResponse = await fetch('/api/seed-capabilities')
            if (seedResponse.ok) {
              const seedResult = await seedResponse.json()
              console.log("Seeded capabilities:", seedResult)
              // Fetch capabilities again after seeding
              const newCapabilitiesData = await fetchCapabilities()
              if (newCapabilitiesData.length > 0) {
                setCapabilities(newCapabilitiesData)
              }
            }
          } catch (seedError) {
            console.error("Error seeding capabilities:", seedError)
          }
        }
      } catch (error) {
        console.error("Error fetching capabilities:", error)
        toast({
          title: "Error loading capabilities",
          description: "Unable to load capabilities from database. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingCapabilities(false)
      }
    }

    getCapabilities()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOnBehalfToggle = (isOnBehalf: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isOnBehalf,
      onBehalfOfUser: "",
      onBehalfOfName: "",
      onBehalfOfEmail: "",
      onBehalfOfCostCenter: "",
      costCenter: isOnBehalf ? "" : (user?.costCenter || user?.department || "0090-01560")
    }))
  }

  const handleOnBehalfUserChange = (userEmail: string) => {
    const selectedUser = onBehalfUsers.find(u => u.value === userEmail)
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        onBehalfOfUser: userEmail,
        onBehalfOfName: selectedUser.label,
        onBehalfOfEmail: selectedUser.email,
        onBehalfOfCostCenter: selectedUser.costCenter,
        costCenter: selectedUser.costCenter
      }))
    }
  }

  const handleSampleChange = (name: string, value: string) => {
    setCurrentSample((prev) => {
      const updated = { ...prev, [name]: value }

      // Generate sample name based on category and fields
      let generatedName = ""

      if (updated.category === "commercial" && updated.grade && updated.lot && updated.sampleIdentity) {
        generatedName = `${updated.grade}_${updated.lot}_${updated.sampleIdentity}`
      } else if (updated.category === "td" && updated.tech && updated.feature && updated.sampleIdentity) {
        // Get abbreviations from the dynamic data
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

      // After changing a field, check for the next empty required field
      setTimeout(() => {
        highlightNextEmptyField()
      }, 100)

      return { ...updated, generatedName }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, urgentMemo: e.target.files?.[0] || null }))
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }))

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }))

      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) added successfully.`,
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleCapabilityToggle = (capabilityId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedCapabilities.includes(capabilityId)

      if (isSelected) {
        return {
          ...prev,
          selectedCapabilities: [],
        }
      }

      return {
        ...prev,
        selectedCapabilities: [capabilityId],
      }
    })
  }

  // Check for duplicate sample names
  const isDuplicateSampleName = (name: string, excludeIndex?: number) => {
    return formData.samples.some(
      (sample, index) => sample.generatedName === name && (excludeIndex === undefined || index !== excludeIndex),
    )
  }

  // Modify the handleAddSample function to retain form data and check for duplicates
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
        // Preserve the existing ID when updating
        updatedSamples[editingSampleIndex] = { 
          ...currentSample,
          id: formData.samples[editingSampleIndex].id 
        }

        setFormData((prev) => ({
          ...prev,
          samples: updatedSamples,
        }))

        // Exit edit mode
        setEditMode(false)
        setEditingSampleIndex(null)

        toast({
          title: "Sample updated",
          description: `Sample "${currentSample.generatedName}" has been updated.`,
        })
      } else {
        // Add new sample with unique ID
        const newSample = {
          ...currentSample,
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        setFormData((prev) => ({
          ...prev,
          samples: [...prev.samples, newSample],
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

      setSampleDialogOpen(false)

      // Reset highlighted field
      setHighlightedField(null)

    }
  }

  const openAddSampleDialog = () => {
    setEditMode(false)
    setEditingSampleIndex(null)
    setCurrentSample({
      id: undefined, // Will be generated when adding
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
    setSampleCategory("")
    setShowSampleSections(true)
    setSampleDialogOpen(true)
    setTimeout(() => {
      highlightNextEmptyField()
    }, 100)
  }

  const openEditSampleDialog = (sample: any, index: number) => {
    setCurrentSample({ ...sample })
    setSampleCategory(sample.category)
    setEditMode(true)
    setEditingSampleIndex(index)
    setSampleDialogOpen(true)
  }

  // Update the handleRemoveSample function
  const handleRemoveSample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      samples: prev.samples.filter((_, i) => i !== index),
    }))

    // Keep focus on the Sample Summary section
    if (sampleSummaryRef.current) {
      setFocusedSection("summary")
      setTimeout(() => setFocusedSection(null), 2000) // Remove highlight after 2 seconds
    }
  }

  // Update the handleCopySample function
  const handleCopySample = (sample: any) => {
    // Copy sample but remove the ID so a new one will be generated
    const { id, ...sampleWithoutId } = sample
    setCurrentSample({ ...sampleWithoutId })
    setSampleCategory(sample.category)
    setEditMode(false)
    setEditingSampleIndex(null)
    setSampleDialogOpen(true)

    toast({
      title: "Sample copied",
      description: "Sample details copied. Make changes and add as a new sample.",
    })
  }

  // Update the handleEditSample function
  const handleEditSample = (sample: any, index: number) => {
    openEditSampleDialog(sample, index)
  }

  // Add a function to convert samples to CSV format
  const convertSamplesToCSV = (samples: Sample[]) => {
    if (samples.length === 0) return '';

    // Get all possible headers from all samples
    const allKeys = new Set<string>();
    samples.forEach(sample => {
      Object.keys(sample).forEach(key => allKeys.add(key));
    });

    // Convert Set to Array and join with commas for the header row
    const headers = Array.from(allKeys);
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = samples.map(sample => {
      return headers.map(header => {
        // Handle fields that might contain commas by wrapping in quotes
        const value = sample[header as keyof Sample] || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(',');
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join('\n');
  };

  // Add a function to handle saving samples as CSV
  const handleSaveCSV = () => {
    if (formData.samples.length === 0) {
      toast({
        title: "No samples to save",
        description: "Please add samples before saving.",
      });
      return;
    }

    const csvContent = convertSamplesToCSV(formData.samples);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const link = document.createElement('a');
    const fileName = `samples_${new Date().toISOString().slice(0,10)}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.display = 'none';

    // Append the link to the body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV file saved",
      description: `${formData.samples.length} samples saved as CSV file.`,
    });
  };


  // Save sample set to database
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
      // Ensure all loaded samples have unique IDs
      const samplesWithIds = sampleSet.samples.map((sample: Sample, index: number) => ({
        ...sample,
        id: sample.id || `sample-loaded-${Date.now()}-${index}`
      }));

      setFormData(prev => ({
        ...prev,
        samples: samplesWithIds
      }));

      // Save to localStorage
      localStorage.setItem('asrSamples', JSON.stringify(samplesWithIds));

      toast({
        title: "Sample set loaded",
        description: `${sampleSet.sampleSetName} (${samplesWithIds.length} samples) has been loaded.`,
      });

      setShowLoadDialog(false);
      setSampleListSearchQuery(""); // Reset search when closing
    }
  };

  // Filter sample lists based on search query
  const filteredSampleLists = savedSampleLists.filter(list => {
    if (!sampleListSearchQuery.trim()) return true;
    
    const searchLower = sampleListSearchQuery.toLowerCase();
    
    // Search in sample set name
    if (list.sampleSetName.toLowerCase().includes(searchLower)) return true;
    
    // Search in description
    if (list.description && list.description.toLowerCase().includes(searchLower)) return true;
    
    // Search in requester name
    if (list.requesterName.toLowerCase().includes(searchLower)) return true;
    
    // Search in IO number
    if (list.ioNumber && list.ioNumber.toLowerCase().includes(searchLower)) return true;
    
    // Search in sample data
    if (list.samples && Array.isArray(list.samples)) {
      return list.samples.some((sample: any) => {
        // Search in all sample fields
        return Object.values(sample).some(value => {
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }
    
    return false;
  });

  // Delete sample set
  const handleDeleteSampleSet = async (sampleSetId: string, sampleSetName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent loading the sample set when clicking delete
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to delete sample sets.",
        variant: "destructive"
      });
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete "${sampleSetName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const params = new URLSearchParams({
        id: sampleSetId,
        requesterEmail: user.email
      });

      const response = await fetch(`/api/sample-sets?${params}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sample set deleted",
          description: `${sampleSetName} has been deleted.`,
        });
        
        // Remove from local state
        setSavedSampleLists(prev => prev.filter(list => list._id !== sampleSetId));
      } else {
        toast({
          title: "Failed to delete",
          description: data.error || "An error occurred while deleting the sample set.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error deleting sample set:", error);
      toast({
        title: "Failed to delete",
        description: error.message || "An error occurred while deleting the sample set.",
        variant: "destructive"
      });
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate Request Information
      if (!formData.requestTitle) {
        toast({
          title: "Required Field Missing",
          description: "Please enter a request title to continue.",
        })
        return
      }

      if (formData.useIONumber === "yes" && !formData.ioNumber) {
        toast({
          title: "Required Field Missing",
          description: "Please select an IO Number to continue.",
        })
        return
      }

      // Save form data to localStorage when moving from step 1
      try {
        const formDataToSave = {
          requestTitle: formData.requestTitle,
          priority: formData.priority,
          useIONumber: formData.useIONumber,
          ioNumber: formData.ioNumber,
          costCenter: formData.costCenter,
          problemSource: formData.problemSource,
          testObjective: formData.testObjective,
          expectedResults: formData.expectedResults,
          businessImpact: formData.businessImpact,
          desiredCompletionDate: formData.desiredCompletionDate,
          selectedCapabilities: formData.selectedCapabilities,
          additionalRequirements: formData.additionalRequirements,
          isOnBehalf: formData.isOnBehalf,
          onBehalfOfUser: formData.onBehalfOfUser,
          onBehalfOfName: formData.onBehalfOfName,
          onBehalfOfEmail: formData.onBehalfOfEmail,
          onBehalfOfCostCenter: formData.onBehalfOfCostCenter,
          urgencyType: formData.urgencyType,
          urgencyReason: formData.urgencyReason,
          approver: formData.approver,
        }
        localStorage.setItem("asrFormData", JSON.stringify(formDataToSave))
        localStorage.setItem("asrFormData_persistent", JSON.stringify(formDataToSave))
      } catch (error) {
        console.error("Error saving form data to localStorage:", error)
      }
    } else if (currentStep === 2) {
      // Validate Problem Description
      if (!formData.problemSource) {
        toast({
          title: "Required Field Missing",
          description: "Please select a problem source to continue.",
        })
        return
      }

      if (!formData.testObjective) {
        toast({
          title: "Required Field Missing",
          description: "Please enter test objectives to continue.",
        })
        return
      }
    } else if (currentStep === 3) {
      // Validate Samples
      if (formData.samples.length === 0) {
        toast({
          title: "Required Field Missing",
          description: "Please add at least one sample to continue.",
        })
        return
      }
    } else if (currentStep === 4) {
      // Validate Expected Results and Timeline
      if (!formData.expectedResults) {
        toast({
          title: "Required Field Missing",
          description: "Please enter expected results to continue.",
        })
        return
      }

      if (!formData.desiredCompletionDate) {
        toast({
          title: "Required Field Missing",
          description: "Please select a desired completion date to continue.",
        })
        return
      }
    } else if (currentStep === 5) {
      // Validate Capability Selection
      if (formData.selectedCapabilities.length === 0) {
        toast({
          title: "Required Field Missing",
          description: "Please select a capability to continue.",
        })
        return
      }
    }

    // If moving from step 3 to step 4, save samples to localStorage
    if (currentStep === 3) {
      try {
        localStorage.setItem("asrSamples", JSON.stringify(formData.samples))
      } catch (error) {
        console.error("Error saving samples to localStorage:", error)
      }
    }

    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleReviewAndSubmit = () => {
    try {
      localStorage.setItem("asrFormData", JSON.stringify(formData))
      localStorage.setItem("asrSamples", JSON.stringify(formData.samples))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
    router.push("/request/new/asr/summary")
  }

  // Function to start adding samples
  const startAddingSamples = () => {
    openAddSampleDialog()
  }

  // Function to render sample form fields based on category
  const renderSampleFields = () => {
    switch (sampleCategory) {
      case "commercial":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                {loadingGrades ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading grades...</span>
                  </div>
                ) : (
                  <SearchableSelect
                    id="grade"
                    options={commercialGrades}
                    value={currentSample.grade || ""}
                    onChange={(value) => handleSampleChange("grade", value)}
                    placeholder="Search grade..."
                    className={highlightedField === "grade" ? "ring-2 ring-blue-500 border-blue-500" : ""}
                  />
                )}
                {gradesError && (
                  <p className="text-xs text-red-500 mt-1">Error loading grades: {gradesError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot">Lot</Label>
                <Input
                  id="lot"
                  value={currentSample.lot}
                  onChange={(e) => handleSampleChange("lot", e.target.value)}
                  placeholder="Enter lot number"
                  className={`w-full ${highlightedField === "lot" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`w-full ${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      case "td":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tech">Tech/CAT</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Tech/CAT options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="tech"
                    options={techCatOptions.length > 0 ? techCatOptions : [{ value: "", label: "No Tech/CAT options available", shortText: "" }]}
                    value={currentSample.tech || ""}
                    onChange={(value) => handleSampleChange("tech", value)}
                    placeholder="Search Tech/CAT"
                    allowCustomValue={true}
                    className={`${highlightedField === "tech" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Tech/CAT options: {appTechError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature">Feature/App</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Feature/App options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="feature"
                    options={featureAppOptions.length > 0 ? featureAppOptions : [{ value: "", label: "No Feature/App options available", shortText: "" }]}
                    value={currentSample.feature || ""}
                    onChange={(value) => handleSampleChange("feature", value)}
                    placeholder="Search Feature/App"
                    allowCustomValue={true}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      case "benchmark":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature/App</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Feature/App options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="feature"
                    options={featureAppOptions.length > 0 ? featureAppOptions : [{ value: "", label: "No Feature/App options available", shortText: "" }]}
                    value={currentSample.feature || ""}
                    onChange={(value) => handleSampleChange("feature", value)}
                    placeholder="Search Feature/App"
                    allowCustomValue={true}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      case "inprocess":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
                <Select value={currentSample.plant} onValueChange={(value) => handleSampleChange("plant", value)}>
                  <SelectTrigger
                    id="plant"
                    className={`w-full ${highlightedField === "plant" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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

              <div className="space-y-2">
                <Label htmlFor="sampling-date">Sampling Date</Label>
                <Input
                  id="sampling-date"
                  type="date"
                  value={currentSample.samplingDate}
                  onChange={(e) => handleSampleChange("samplingDate", e.target.value)}
                  className={`${highlightedField === "samplingDate" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampling-time">Sampling Time</Label>
                <Input
                  id="sampling-time"
                  type="time"
                  value={currentSample.samplingTime}
                  onChange={(e) => handleSampleChange("samplingTime", e.target.value)}
                  className={`${highlightedField === "samplingTime" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      case "chemicals":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
                <Select value={currentSample.plant} onValueChange={(value) => handleSampleChange("plant", value)}>
                  <SelectTrigger
                    id="plant"
                    className={`w-full ${highlightedField === "plant" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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

              <div className="space-y-2">
                <Label htmlFor="sampling-date">Sampling Date</Label>
                <Input
                  id="sampling-date"
                  type="date"
                  value={currentSample.samplingDate}
                  onChange={(e) => handleSampleChange("samplingDate", e.target.value)}
                  className={`${highlightedField === "samplingDate" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampling-time">Sampling Time</Label>
                <Input
                  id="sampling-time"
                  type="time"
                  value={currentSample.samplingTime}
                  onChange={(e) => handleSampleChange("samplingTime", e.target.value)}
                  className={`${highlightedField === "samplingTime" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      case "cap":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature/App</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Feature/App options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="feature"
                    options={featureAppOptions.length > 0 ? featureAppOptions : [{ value: "", label: "No Feature/App options available", shortText: "" }]}
                    value={currentSample.feature || ""}
                    onChange={(value) => handleSampleChange("feature", value)}
                    placeholder="Search Feature/App"
                    allowCustomValue={true}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity}
                  onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                  placeholder="Enter sample identifier"
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type} onValueChange={(value) => handleSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form} onValueChange={(value) => handleSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
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
          </div>
        )

      default:
        return null
    }
  }

  return (
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
          <h1 className="text-3xl font-bold tracking-tight">Create Analysis Solution Request (ASR)</h1>
          <p className="text-muted-foreground">
            Request custom analysis solutions for complex polymer characterization problems
          </p>
        </div>

        <div className="flex justify-between border-b pb-4">
          <div className="flex space-x-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 4 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              4
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 5 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              5
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 6 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              6
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {currentStep === 1 && (
              <RequestInformationForm
                requestType="ASR"
                currentStep={currentStep}
                formData={formData}
                isEditMode={false}
                editRequestId=""
                urgencyTypes={urgencyTypes}
                ioOptions={ioOptions}
                onBehalfUsers={onBehalfUsers}
                approvers={approvers}
                loadingStates={{
                  loadingIoOptions,
                  loadingCostCenter,
                  loadingOnBehalfUsers,
                  loadingApprovers,
                }}
                errors={{
                  ioError,
                  costCenterError,
                  onBehalfUsersError,
                  approversError,
                }}
                onFormChange={(name, value) => {
                  if (typeof value === 'string') {
                    handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>)
                  }
                }}
                onSelectChange={handleSelectChange}
                onOnBehalfToggle={handleOnBehalfToggle}
                onOnBehalfUserChange={handleOnBehalfUserChange}
                onFileChange={handleFileChange}
              />
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Problem Description</CardTitle>
                  <CardDescription>Describe the problem or challenge you need help with</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problem-source">Problem Source</Label>
                    <Select
                      value={formData.problemSource}
                      onValueChange={(value) => handleSelectChange("problemSource", value)}
                    >
                      <SelectTrigger
                        id="problem-source"
                        className={`w-full ${!formData.problemSource ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                      >
                        <SelectValue placeholder="Select problem source" />
                      </SelectTrigger>
                      <SelectContent>
                        {problemSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!formData.problemSource && (
                      <p className="text-sm text-red-500">Please select a problem source to continue</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-objective">Test Objectives</Label>
                    <Textarea
                      id="test-objective"
                      name="testObjective"
                      value={formData.testObjective}
                      onChange={handleChange}
                      placeholder="Describe what you want to achieve with this analysis"
                      className={`min-h-[120px] ${!formData.testObjective ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    />
                    {!formData.testObjective && (
                      <p className="text-sm text-red-500">Please enter test objectives to continue</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

              {currentStep === 3 && (
              <Card className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Sample Information</CardTitle>
                      <CardDescription>Add one or more samples for analysis</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)}>
                      <Upload className="mr-1 h-3 w-3" />
                      Load Sample List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.samples.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-medium">No samples added yet</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Click the button below to start adding samples to your request. You'll be guided through the
                          process step by step.
                        </p>
                        <Button
                          onClick={openAddSampleDialog}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Sample
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium">Samples</h3>
                          <p className="text-sm text-muted-foreground">
                            {formData.samples.length} sample(s) added
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                            <Save className="mr-1 h-3 w-3" />
                            Save Sample List
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleSaveCSV}>
                            <Save className="mr-1 h-3 w-3" />
                            Save CSV
                          </Button>
                          <Button
                            onClick={openAddSampleDialog}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Sample
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Sample Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Form</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.samples.map((sample, index) => (
                              <TableRow key={sample.id || `sample-${index}`}>
                                <TableCell className="font-medium">
                                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs">
                                    {index + 1}
                                  </span>
                                </TableCell>
                                <TableCell className="font-medium">{sample.generatedName}</TableCell>
                                <TableCell>
                                  {sample.category === "commercial"
                                    ? "Commercial Grade"
                                    : sample.category === "td"
                                      ? "TD/NPD"
                                      : sample.category === "benchmark"
                                        ? "Benchmark"
                                        : sample.category === "inprocess"
                                          ? "Inprocess/Chemicals"
                                          : sample.category === "chemicals"
                                            ? "Chemicals/Substances"
                                            : "Cap Development"}
                                </TableCell>
                                <TableCell>{sample.type}</TableCell>
                                <TableCell>{sample.form}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleCopySample(sample)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditSample(sample, index)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSample(index)}>
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Expected Results and Timeline</CardTitle>
                  <CardDescription>Specify what results you expect and when you need them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expected-results">Expected Results</Label>
                    <Textarea
                      id="expected-results"
                      name="expectedResults"
                      value={formData.expectedResults}
                      onChange={handleChange}
                      placeholder="Describe what results or insights you expect to gain from this analysis"
                      className={`min-h-[120px] ${!formData.expectedResults ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    />
                    {!formData.expectedResults && (
                      <p className="text-sm text-red-500">Please enter expected results to continue</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-impact">Business Impact</Label>
                    <Textarea
                      id="business-impact"
                      name="businessImpact"
                      value={formData.businessImpact}
                      onChange={handleChange}
                      placeholder="Describe how this analysis will impact your business operations, decision-making, or product development"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="desired-completion-date">Desired Completion Date</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80 text-sm">
                              Select the date by which you need the results. Note that complex analyses may require more
                              time.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="desired-completion-date"
                        name="desiredCompletionDate"
                        type="date"
                        value={formData.desiredCompletionDate}
                        onChange={handleChange}
                        className={`${!formData.desiredCompletionDate ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                      />
                    </div>
                    {!formData.desiredCompletionDate && (
                      <p className="text-sm text-red-500">Please select a desired completion date to continue</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Capability Selection</CardTitle>
                  <CardDescription>Select the capabilities you need for your analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Capability</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose the capability that best matches your analysis needs. Our experts will
                      review your selection.
                    </p>

                    {isLoadingCapabilities ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="text-center">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Loading capabilities...</p>
                        </div>
                      </div>
                    ) : capabilities.length === 0 ? (
                      <div className="border rounded-md p-4 text-center">
                        <p className="text-sm text-muted-foreground">No capabilities available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {capabilities.map((capability) => (
                          <div
                            key={capability.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              formData.selectedCapabilities.includes(capability.id)
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => handleCapabilityToggle(capability.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={`capability-${capability.id}`}
                                checked={formData.selectedCapabilities.includes(capability.id)}
                                onCheckedChange={() => handleCapabilityToggle(capability.id)}
                                className="mt-1"
                              />
                              <div>
                                <Label
                                  htmlFor={`capability-${capability.id}`}
                                  className="text-base font-medium cursor-pointer"
                                >
                                  {capability.name} ({capability.shortName})
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">{capability.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isLoadingCapabilities && capabilities.length > 0 && formData.selectedCapabilities.length === 0 && (
                      <p className="text-sm text-red-500 mt-2">Please select a capability to continue</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Provide any additional details or attachments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="additional-requirements">Additional Requirements or Comments</Label>
                    <Textarea
                      id="additional-requirements"
                      name="additionalRequirements"
                      value={formData.additionalRequirements}
                      onChange={handleChange}
                      placeholder="Any additional information that might help with the analysis"
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload relevant files such as sample images, previous test results, or specifications
                    </p>

                    <div className="flex items-center space-x-2">
                      <Input id="file-upload" type="file" className="hidden" multiple onChange={handleAttachmentChange} />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Files
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {formData.attachments.length > 0
                          ? `${formData.attachments.length} file(s) attached`
                          : "No files attached"}
                      </p>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 h-8 w-8 p-0"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex justify-between">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
              {currentStep < 6 ? (
                <Button
                  className="ml-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="ml-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  onClick={handleReviewAndSubmit}
                >
                  Review and Submit
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            {/* Summary card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
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
                    <p className="text-sm font-medium text-muted-foreground">Samples</p>
                    <p className="text-2xl font-bold">{formData.samples.length}</p>
                  </div>

                  {formData.priority === "urgent" && formData.approver && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approver</p>
                      <p className="font-medium">
                        {approvers.find(a => a.value === formData.approver)?.label || "Not selected"}
                      </p>
                    </div>
                  )}

                  {formData.isOnBehalf && formData.onBehalfOfName && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">On Behalf Of</p>
                      <p className="font-medium">{formData.onBehalfOfName}</p>
                      <p className="text-xs text-muted-foreground">{formData.onBehalfOfEmail}</p>
                      <p className="text-xs text-muted-foreground">Cost Center: {formData.onBehalfOfCostCenter || "Not available"}</p>
                    </div>
                  )}

                  {formData.selectedCapabilities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Selected Capabilities</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.selectedCapabilities.map((capId) => {
                          const cap = capabilities.find((c) => c.id === capId)
                          return cap ? (
                            <span key={capId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {cap.name} ({cap.shortName})
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {formData.desiredCompletionDate && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Desired Completion</p>
                      <p className="font-medium">{formData.desiredCompletionDate}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">About ASR Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm mb-4">
                  Analysis Solution Requests (ASR) are designed for complex analytical problems that require expert
                  consultation and customized testing approaches.
                </p>
                <p className="text-blue-700 text-sm">
                  Your request will be reviewed by capability experts who will work with you to develop the best
                  analytical approach for your needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Sample" : "Add New Sample"}</DialogTitle>
            <DialogDescription>
              {editMode
                ? "Modify the sample details below"
                : "Fill out the sample details to add a new sample to your request"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="sample-category">Sample Category</Label>
              <Select
                value={sampleCategory}
                onValueChange={(value) => {
                  setSampleCategory(value)
                  setCurrentSample((prev) => ({
                    ...prev,
                    category: value,
                  }))
                }}
              >
                <SelectTrigger id="sample-category" className={highlightedField === "sample-category" ? "ring-2 ring-blue-500 border-blue-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial Grade</SelectItem>
                  <SelectItem value="td">TD/NPD</SelectItem>
                  <SelectItem value="benchmark">Benchmark</SelectItem>
                  <SelectItem value="inprocess">Inprocess</SelectItem>
                  <SelectItem value="chemicals">Chemicals/Substances</SelectItem>
                  <SelectItem value="cap">Cap Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sampleCategory && (
              <div className="space-y-6">
                {renderSampleFields()}
                <div className="space-y-2">
                  <Label htmlFor="generated-name">Generated Sample Name</Label>
                  <Input id="generated-name" value={currentSample.generatedName || ""} disabled className="bg-gray-100 font-medium" autoComplete="off" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSample} disabled={!currentSample.generatedName} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              {editMode ? "Update Sample" : "Add Sample"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Sample Set Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Sample List</DialogTitle>
            <DialogDescription>Save your current samples as a reusable sample set</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sample-set-name">Sample Set Name</Label>
              <Input
                id="sample-set-name"
                value={sampleListName}
                onChange={(e) => setSampleListName(e.target.value)}
                placeholder="e.g., Polymer Film Samples"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample-set-description">Description (optional)</Label>
              <Textarea
                id="sample-set-description"
                value={sampleListDescription}
                onChange={(e) => setSampleListDescription(e.target.value)}
                placeholder="Brief description of this sample set..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>IO Number:</strong> {formData.ioNumber || 'No IO Number'}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Total Samples:</strong> {formData.samples.length}
              </p>
              {formData.ioNumber && (
                <p className="text-xs text-muted-foreground">
                  This sample set will be shared with other users who have access to IO {formData.ioNumber}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSaveDialog(false);
              setSampleListName("");
              setSampleListDescription("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSampleSet}
              disabled={savingSampleList || !sampleListName.trim()}
            >
              {savingSampleList ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Sample Set
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Sample Set Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={(open) => {
        setShowLoadDialog(open);
        if (!open) setSampleListSearchQuery(""); // Reset search when closing
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Sample List</DialogTitle>
            <DialogDescription>Select a saved sample set to load</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Saved Sample Sets Section */}
            <div>
              <h4 className="font-medium mb-2">Choose from saved sample sets</h4>
              {loadingSampleLists ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : savedSampleLists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No saved sample sets found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Save a sample set first or check if you have the correct IO number.
                  </p>
                </div>
              ) : (
                <>
                  {/* Search Box */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="sample-set-search">Search Sample Sets</Label>
                    <Input
                      id="sample-set-search"
                      type="text"
                      placeholder="Search by name, description, IO number, or sample content..."
                      value={sampleListSearchQuery}
                      onChange={(e) => setSampleListSearchQuery(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Search includes sample set names, descriptions, and all sample data fields
                    </p>
                  </div>

                  {/* Results */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredSampleLists.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No sample sets match your search.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try a different search term or clear the search.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Showing {filteredSampleLists.length} of {savedSampleLists.length} sample sets
                        </p>
                        {filteredSampleLists.map((list) => (
                          <div
                            key={list._id}
                            className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleLoadSampleSet(list)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{list.sampleSetName}</h4>
                                {list.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>{list.sampleCount} sample(s)</span>
                                  <span>IO: {list.ioNumber || 'None'}</span>
                                  <span>By: {list.requesterName}</span>
                                  <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center gap-2">
                                {list.isOwner ? (
                                  <>
                                    <Badge variant="outline" className="text-xs">Your Set</Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={(e) => handleDeleteSampleSet(list._id, list.sampleSetName, e)}
                                      title="Delete this sample set"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Shared</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowLoadDialog(false);
              setSampleListSearchQuery("");
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

