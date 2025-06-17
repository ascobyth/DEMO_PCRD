"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Loader2,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Pencil, Upload, X } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

// Sample interface from NTR
interface Sample {
  id?: string;
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
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const asrId = searchParams.get('asrId')
  const asrNumber = searchParams.get('asrNumber')
  const isAsrRequest = !!asrId
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100
  
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
  const [sampleListSearchQuery, setSampleListSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Dialog state for the sample editor
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false)
  
  // Add state for grade options
  const [commercialGrades, setCommercialGrades] = useState<Array<{ value: string; label: string }>>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [gradesError, setGradesError] = useState<string | null>(null)
  
  // Add state for booked slots
  const [bookedSlots, setBookedSlots] = useState<Record<string, any[]>>({})
  const [availabilitySummary, setAvailabilitySummary] = useState<Record<string, any>>({})
  const [loadingBookedSlots, setLoadingBookedSlots] = useState(false)
  
  // Add state for app techs
  const [appTechs, setAppTechs] = useState<any[]>([])
  const [loadingAppTechs, setLoadingAppTechs] = useState(false)
  const [appTechError, setAppTechError] = useState<string | null>(null)
  const [techCatOptions, setTechCatOptions] = useState<Array<{ value: string; label: string; shortText: string }>>([])
  const [featureAppOptions, setFeatureAppOptions] = useState<Array<{ value: string; label: string; shortText: string }>>([])

  // State for polymer types from database
  const [polymerTypes, setPolymerTypes] = useState<{ value: string; label: string }[]>([])
  const [loadingPolymerTypes, setLoadingPolymerTypes] = useState(false)
  const [polymerTypesError, setPolymerTypesError] = useState<string | null>(null)

  // Required fields for each sample category
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
  }, [sampleCategory, showSampleSections]);

  // Default type options (fallback if database fetch fails)
  const defaultTypeOptions = [
    { value: "HDPE", label: "HDPE" },
    { value: "LDPE", label: "LDPE" },
    { value: "LLDPE", label: "LLDPE" },
    { value: "UHWMPE", label: "UHWMPE" },
    { value: "PP", label: "PP" },
    { value: "PVC", label: "PVC" },
    { value: "Wax", label: "Wax" },
    { value: "Others", label: "Others" },
  ]

  // Use polymer types from database if available, otherwise use default
  const typeOptions = polymerTypes.length > 0 ? polymerTypes : defaultTypeOptions

  // Equipment costs (mock data for now)
  const equipmentCosts: Record<string, number> = {
    "eq1": 2000,
    "eq2": 2500,
    "eq3": 3000,
    "eq4": 1500,
    "eq5": 3500,
    "eq6": 2800
  }

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
  
  // States for testing methods from database
  const [testingMethods, setTestingMethods] = useState<any[]>([])
  const [loadingTestingMethods, setLoadingTestingMethods] = useState(true)
  const [testingMethodsError, setTestingMethodsError] = useState<string | null>(null)
  const [methodSearchQuery, setMethodSearchQuery] = useState("")
  const [methodPopoverOpen, setMethodPopoverOpen] = useState(false)
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

  const handleOnBehalfUserChange = (value: string) => {
    const selectedUser = onBehalfUsers.find(user => user.value === value)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        onBehalfOfUser: value, // This will now be the email
        onBehalfOfName: selectedUser.label,
        onBehalfOfEmail: selectedUser.email,
        onBehalfOfCostCenter: selectedUser.costCenter
      }))
    }
  }

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }))
  }

  // Handler for original select change (for ER specific fields)
  const handleSelectChangeOrig = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handler for input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handler for attachment change
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setFormData((prev) => ({ ...prev, attachments: Array.from(files) }))
    }
  }

  // Open the sample dialog
  const openAddSampleDialog = () => {
    setEditMode(false)
    setEditingSampleIndex(null)
    setCurrentSample({
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  }

  // Handle sample field changes
  const handleSampleChange = async (name: string, value: string) => {
    console.log("handleSampleChange called:", { name, value, sampleCategory })
    
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
                updatedSample.generatedName = `${updatedSample.grade}-${updatedSample.lot}-${updatedSample.sampleIdentity}`;
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
      const updatedSample = { ...prev, [name]: value }

      // Generate the sample name without category prefixes
      if (sampleCategory === "commercial" && updatedSample.grade && updatedSample.lot && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.grade}-${updatedSample.lot}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "td" && updatedSample.tech && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short codes from the options arrays
        const techOption = techCatOptions.find((option) => option.value === updatedSample.tech)
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const techShortCode = techOption ? techOption.shortText : updatedSample.tech
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${techShortCode}-${featureShortCode}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "benchmark" && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short code from the options array
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${featureShortCode}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "inprocess" && updatedSample.plant && updatedSample.samplingDate && updatedSample.samplingTime && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.plant}-${updatedSample.samplingDate}-${updatedSample.samplingTime}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "chemicals" && updatedSample.plant && updatedSample.samplingDate && updatedSample.samplingTime && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.plant}-${updatedSample.samplingDate}-${updatedSample.samplingTime}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "cap" && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short code from the options array
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${featureShortCode}-${updatedSample.sampleIdentity}`
      } else {
        updatedSample.generatedName = ""
      }

      return updatedSample
    })
  }

  // Check for duplicate sample names
  const isDuplicateSampleName = (name: string, excludeIndex?: number) => {
    return formData.samples.some(
      (sample, index) => sample.generatedName === name && (excludeIndex === undefined || index !== excludeIndex),
    )
  }

  // Handle adding a sample
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

      // Close the dialog
      setSampleDialogOpen(false)

      // Reset the form but keep the category
      setCurrentSample({
        id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: sampleCategory,
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

      // After adding, highlight the first empty required field
      setTimeout(() => {
        highlightNextEmptyField()
      }, 2100)
    }
  }



  // Handle removing a sample
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

  // Handle copying a sample
  const handleCopySample = (sample: any) => {
    // Set current sample to the copied sample with a new ID
    setCurrentSample({ 
      ...sample,
      id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })
    setSampleCategory(sample.category)

    // Exit edit mode if it was active
    setEditMode(false)
    setEditingSampleIndex(null)

    // Open the dialog
    setSampleDialogOpen(true)

    toast({
      title: "Sample copied",
      description: "Sample details copied. Make changes and add as a new sample.",
    })
  }

  // Handle editing a sample
  const handleEditSample = (sample: any, index: number) => {
    // Set current sample to this sample for editing
    setCurrentSample({ ...sample })
    setSampleCategory(sample.category)

    // Enter edit mode
    setEditMode(true)
    setEditingSampleIndex(index)

    // Open the dialog
    setSampleDialogOpen(true)
  }

  // Generate time slots for a date
  const generateTimeSlotsForDate = (date: string) => {
    const selectedMethod = testingMethods.find(m => m._id === formData.selectedMethod)
    if (!selectedMethod) return []
    
    // Get ER time configuration from the method
    const erTimeStart = selectedMethod.erTimeStart || 9
    const erTimeEnd = selectedMethod.erTimeEnd || 16
    const erSlotTime = selectedMethod.erSlotTime || 1
    
    const slots = []
    // Get booked slots for this date from the fetched data
    const bookedSlotsForDate = bookedSlots[date] || []
    
    // Generate slots based on equipment configuration
    for (let hour = erTimeStart; hour < erTimeEnd; hour += erSlotTime) {
      const endHour = Math.min(hour + erSlotTime, erTimeEnd)
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${endHour.toString().padStart(2, '0')}:00`
      const timeRange = `${startTime} - ${endTime}`
      
      // Check if this slot is booked
      const isBooked = bookedSlotsForDate.some((bookedSlot: any) => {
        return bookedSlot.timeRange === timeRange || bookedSlot.startTime === startTime
      })
      
      slots.push({
        id: hour - erTimeStart + 1,
        time: timeRange,
        available: !isBooked
      })
    }
    
    return slots
  }

  // Navigation functions
  const nextStep = () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!formData.requestTitle) {
        toast({
          title: "Request title required",
          description: "Please enter a title for your request.",
          variant: "destructive",
        })
        return
      }

      if (formData.useIONumber === "yes" && !formData.ioNumber) {
        toast({
          title: "IO Number required",
          description: "Please select an IO Number.",
          variant: "destructive",
        })
        return
      }
    }

    // Save samples to localStorage when leaving step 3
    if (currentStep === 3) {
      try {
        localStorage.setItem("erSamples", JSON.stringify(formData.samples))
        localStorage.setItem("erFormData", JSON.stringify({
          ...formData,
          urgentMemo: null // Can't store files in localStorage
        }))
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

      // Generate time slots for the selected date
      const generatedTimeSlots = generateTimeSlotsForDate(date)
      setTimeSlots(generatedTimeSlots)

      toast({
        title: "Date selected",
        description: `Showing available time slots for ${date}`,
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
  const handleTimeSlotSelect = (slot: any, date: string) => {
    if (!slot.available) return

    const [start, end] = slot.time.split(" - ")

    setFormData((prev) => {
      // Create a copy of the current reservation schedule and selected dates
      const updatedSchedule = { ...prev.reservationSchedule }
      let updatedSelectedDates = [...prev.selectedDates]

      // Get the time slots for the selected date
      const dateSchedule = updatedSchedule[date] || { timeSlots: [] }

      // Check if this slot is already selected
      const isSelected = dateSchedule.timeSlots.some((selectedSlot) => selectedSlot.time === slot.time)

      let updatedTimeSlots

      if (isSelected) {
        // Remove the slot if already selected
        updatedTimeSlots = dateSchedule.timeSlots.filter((selectedSlot) => selectedSlot.time !== slot.time)
        
        // If no more time slots for this date, remove it from selected dates
        if (updatedTimeSlots.length === 0) {
          updatedSelectedDates = updatedSelectedDates.filter(d => d !== date)
        }
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
        
        // Add date to selected dates if not already there
        if (!updatedSelectedDates.includes(date)) {
          updatedSelectedDates.push(date)
        }
      }

      // Sort the time slots by their id (which corresponds to time order)
      updatedTimeSlots.sort((a, b) => a.id - b.id)

      // Update the schedule for this date
      updatedSchedule[date] = {
        ...dateSchedule,
        timeSlots: updatedTimeSlots,
      }

      return {
        ...prev,
        selectedDates: updatedSelectedDates,
        reservationSchedule: updatedSchedule,
      }
    })

    const dateSchedule = formData.reservationSchedule[date] || { timeSlots: [] }

    toast({
      title: dateSchedule?.timeSlots.some((s) => s.time === slot.time) ? "Time slot removed" : "Time slot selected",
      description: `${dateSchedule?.timeSlots.some((s) => s.time === slot.time) ? "Removed" : "Selected"} time: ${slot.time} on ${date}`,
    })
  }

  // Load cost center from user data
  useEffect(() => {
    const loadCostCenter = async () => {
      if (!user?.email) {
        setLoadingCostCenter(false)
        return
      }

      try {
        const res = await fetch("/api/admin/users")
        const data = await res.json()

        // Check if data is an array or has a data property (for API compatibility)
        const users = Array.isArray(data) ? data : data.data || []
        const currentUser = users.find((u: any) => u.email === user.email)
        
        if (currentUser?.costCenter) {
          setFormData(prev => ({ ...prev, costCenter: currentUser.costCenter }))
        } else {
          setCostCenterError("No cost center found for this user")
        }
      } catch (error) {
        console.error("Failed to load cost center:", error)
        setCostCenterError("Failed to load cost center")
      } finally {
        setLoadingCostCenter(false)
      }
    }

    loadCostCenter()
  }, [user?.email])

  // Fetch booked slots when testing method is selected
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.selectedMethod) {
        setBookedSlots({})
        setAvailabilitySummary({})
        setAvailableDates({})
        return
      }

      try {
        setLoadingBookedSlots(true)
        
        // Get date range for next 30 days
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        
        const response = await fetch(
          `/api/equipment/booked-slots?methodId=${formData.selectedMethod}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
        )
        
        const result = await response.json()
        
        if (result.success) {
          setBookedSlots(result.data.bookedSlots || {})
          setAvailabilitySummary(result.data.availabilitySummary || {})
          console.log('Loaded booked slots:', result.data.bookedSlots)
          
          // Update available dates based on availability summary
          const dates: any = {}
          for (const [dateString, summary] of Object.entries(result.data.availabilitySummary || {})) {
            const date = new Date(dateString)
            dates[dateString] = {
              available: (summary as any).hasAvailability && date.getDay() !== 0 && date.getDay() !== 6,
              partiallyAvailable: (summary as any).hasAvailability && (summary as any).availableSlots < (summary as any).totalSlots,
              slots: (summary as any).availableSlots || 0,
              totalSlots: (summary as any).totalSlots || 7,
              isFullyBooked: (summary as any).isFullyBooked || false
            }
          }
          setAvailableDates(dates)
        } else {
          console.error('Failed to fetch booked slots:', result.error)
          // Fallback to all available
          const dates: any = {}
          const today = new Date()
          for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateString = date.toISOString().split('T')[0]
            dates[dateString] = {
              available: date.getDay() !== 0 && date.getDay() !== 6,
              partiallyAvailable: false,
              slots: 7,
              totalSlots: 7
            }
          }
          setAvailableDates(dates)
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error)
        // Fallback to all available
        const dates: any = {}
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateString = date.toISOString().split('T')[0]
          dates[dateString] = {
            available: date.getDay() !== 0 && date.getDay() !== 6,
            partiallyAvailable: false,
            slots: 7,
            totalSlots: 7
          }
        }
        setAvailableDates(dates)
      } finally {
        setLoadingBookedSlots(false)
      }
    }

    fetchBookedSlots()
  }, [formData.selectedMethod])

  // Fetch IO numbers from the API
  useEffect(() => {
    const fetchIoOptions = async () => {
      if (!user?.email || !user?.name) return

      try {
        setLoadingIoOptions(true)
        const res = await fetch("/api/admin/ios")
        const data = await res.json()

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
        console.error("Failed to fetch IO options:", error)
        setIoError("Failed to load IO numbers")
      } finally {
        setLoadingIoOptions(false)
      }
    }

    fetchIoOptions()
  }, [user?.email, user?.name])

  // Fetch on behalf users
  useEffect(() => {
    const fetchOnBehalfUsers = async () => {
      if (!user?.email) return

      try {
        setLoadingOnBehalfUsers(true)
        const res = await fetch(`/api/users/on-behalf?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()

        if (data.success && data.data) {
          const formattedUsers = data.data.map((u: any) => ({
            value: u.email,
            label: u.name || u.username || u.email,
            email: u.email,
            costCenter: u.costCenter || u.department || ""
          }))
          setOnBehalfUsers(formattedUsers)
        } else {
          setOnBehalfUsersError("No users available")
          setOnBehalfUsers([])
        }
      } catch (error) {
        console.error("Failed to fetch on behalf users:", error)
        setOnBehalfUsersError("Failed to load users")
      } finally {
        setLoadingOnBehalfUsers(false)
      }
    }

    if (formData.isOnBehalf) {
      fetchOnBehalfUsers()
    }
  }, [user?.email, formData.isOnBehalf])

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      if (!user) return

      try {
        setLoadingApprovers(true)
        
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
        console.error("Failed to fetch approvers:", error)
        setApproversError("Failed to load approvers")
        setApprovers([])
      } finally {
        setLoadingApprovers(false)
      }
    }

    if (formData.priority === 'urgent') {
      fetchApprovers()
    }
  }, [user, formData.priority])

  // Update cost center when on behalf mode changes
  useEffect(() => {
    if (formData.isOnBehalf && formData.onBehalfOfCostCenter) {
      setFormData(prev => ({ ...prev, costCenter: formData.onBehalfOfCostCenter }))
    } else if (!formData.isOnBehalf && user) {
      const costCenter = user.costCenter || user.department || ''
      setFormData(prev => ({ ...prev, costCenter }))
    }
  }, [formData.isOnBehalf, formData.onBehalfOfCostCenter, user])

  // Fetch polymer types when commercial category is selected
  useEffect(() => {
    const fetchPolymerTypes = async () => {
      if (sampleCategory === "commercial") {
        try {
          setLoadingPolymerTypes(true)
          setPolymerTypesError(null)
          
          const res = await fetch("/api/commercial-samples/polymer-types")
          if (!res.ok) throw new Error(`Error fetching polymer types: ${res.statusText}`)
          
          const data = await res.json()
          
          if (data.success && data.data) {
            setPolymerTypes(data.data)
            console.log(`Loaded ${data.data.length} polymer types from database`)
          } else {
            console.error("Failed to fetch polymer types:", data.error)
            setPolymerTypesError(data.error || "Unknown error")
          }
        } catch (error: any) {
          console.error("Failed to fetch polymer types:", error)
          setPolymerTypesError(error.message)
        } finally {
          setLoadingPolymerTypes(false)
        }
      }
    }

    fetchPolymerTypes()
  }, [sampleCategory]);

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
          const gradeOptions = data.data
            .filter((sample: any) => sample.isActive !== false) // Only include active samples
            .map((sample: any) => ({
              value: sample.gradeName,
              label: sample.gradeName
            }))

          // Remove duplicates (in case there are multiple entries with the same grade name)
          const uniqueGrades = Array.from(
            new Map(gradeOptions.map((item: any) => [item.value, item])).values()
          )

          setCommercialGrades(uniqueGrades)
          console.log(`Loaded ${uniqueGrades.length} commercial grades from database:`, uniqueGrades)
        } else {
          console.error("Commercial samples data is not in expected format:", data)
          setGradesError("Data format error. Please contact support.")
        }
      } catch (error: any) {
        console.error("Failed to fetch commercial grades:", error)
        setGradesError(error.message)
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

          // Format for AutocompleteInput with shortText included
          setTechCatOptions(techCatData.map((item: any) => ({
            value: item._id,
            label: `${item.appTech} (${item.shortText})`,
            shortText: item.shortText // Include shortText for easy access
          })))

          setFeatureAppOptions(featureAppData.map((item: any) => ({
            value: item._id,
            label: `${item.appTech} (${item.shortText})`,
            shortText: item.shortText // Include shortText for easy access
          })))

          // Log success for debugging
          console.log(`Loaded ${techCatData.length} Tech/CAT options and ${featureAppData.length} Feature/App options`)
        } else {
          // Handle case where data is not in expected format
          console.error("AppTechs data is not in expected format:", data)
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

  // Fetch testing methods on component mount
  useEffect(() => {
    const fetchTestingMethods = async () => {
      console.log("Starting to fetch testing methods...")
      try {
        setLoadingTestingMethods(true)
        
        // Fetch testing methods with cache busting
        const methodsRes = await fetch("/api/test-methods", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        console.log("Methods response status:", methodsRes.status)
        
        if (!methodsRes.ok) {
          throw new Error(`Methods API failed with status: ${methodsRes.status}`)
        }
        
        const methodsData = await methodsRes.json()
        console.log("Methods data:", methodsData)
        console.log("Number of methods:", methodsData.data?.length || 0)
        
        if (methodsData.success && methodsData.data) {
          // Filter for ER methods only
          const erMethods = methodsData.data.filter((method: any) => 
            method.serviceType && Array.isArray(method.serviceType) && method.serviceType.includes("ER")
          ) || []
          
          console.log("Number of ER methods found:", erMethods.length)
          console.log("ER methods:", erMethods)
          
          // Add more detailed logging
          if (erMethods.length > 0) {
            console.log("Sample ER method data:", erMethods[0])
            console.log("All ER method codes:", erMethods.map(m => m.methodcode))
          }
          
          setTestingMethods(erMethods)
          console.log("State updated with ER testing methods:", erMethods.length)
        } else {
          console.error("Invalid data structure from methods API:", methodsData)
          setTestingMethodsError("Invalid data from server")
        }
      } catch (error) {
        console.error("Failed to fetch testing methods:", error)
        setTestingMethodsError("Failed to load testing methods")
      } finally {
        setLoadingTestingMethods(false)
        console.log("Loading completed")
      }
    }

    fetchTestingMethods()
  }, [])

  // Fetch equipment data on component mount
  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        setLoadingEquipment(true)
        const res = await fetch("/api/equipment")
        const data = await res.json()

        if (data.success && data.data) {
          setEquipmentData(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch equipment:", error)
      } finally {
        setLoadingEquipment(false)
      }
    }

    fetchEquipmentData()
  }, [])

  // Fetch sample sets when load dialog opens
  useEffect(() => {
    const fetchSampleSets = async () => {
      if (showLoadDialog && user?.email) {
        try {
          setLoadingSampleLists(true)
          
          const params = new URLSearchParams({
            requesterEmail: user.email,
            ioNumber: formData.ioNumber || ''
          })
          
          const res = await fetch(`/api/sample-sets?${params}`)
          if (!res.ok) throw new Error(`Error fetching sample sets: ${res.statusText}`)
          
          const data = await res.json()
          
          if (data.success && data.data) {
            setSavedSampleLists(data.data)
            console.log(`Loaded ${data.data.length} sample sets from database`)
          } else {
            console.error("Failed to fetch sample sets:", data.error)
            toast({
              title: "Failed to load sample sets",
              description: data.error || "Unknown error",
              variant: "destructive"
            })
          }
        } catch (error: any) {
          console.error("Failed to fetch sample sets:", error)
          toast({
            title: "Failed to load sample sets",
            description: error.message,
            variant: "destructive"
          })
        } finally {
          setLoadingSampleLists(false)
        }
      }
    }

    fetchSampleSets()
  }, [showLoadDialog, user?.email, formData.ioNumber]);

  // Removed old fetchReservations - now using fetchBookedSlots above
  /* useEffect(() => {
    const fetchReservations = async () => {
      if (!formData.equipment || !formData.selectedMethod) return
      
      try {
        // Get the selected method to find equipment name
        const selectedMethod = testingMethods.find(m => m._id === formData.selectedMethod)
        if (!selectedMethod?.equipmentName) return
        
        // Fetch existing reservations for this equipment
        const res = await fetch(`/api/time-reservations?equipmentName=${encodeURIComponent(selectedMethod.equipmentName)}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          // Generate next 30 days availability
          const dates: any = {}
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          // Get ER time slots configuration from the selected method
          const erTimeStart = selectedMethod.erTimeStart || 9
          const erTimeEnd = selectedMethod.erTimeEnd || 16
          const erSlotTime = selectedMethod.erSlotTime || 1
          const totalSlots = Math.floor((erTimeEnd - erTimeStart) / erSlotTime)
          
          for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dateString = date.toISOString().split('T')[0]
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
              dates[dateString] = { available: false, partiallyAvailable: false, slots: 0, totalSlots: 0 }
            } else {
              // Check reservations for this date
              const dayStart = new Date(dateString)
              const dayEnd = new Date(dateString)
              dayEnd.setDate(dayEnd.getDate() + 1)
              
              const reservationsForDay = data.data.filter((res: any) => {
                const resStart = new Date(res.startTime)
                const resEnd = new Date(res.endTime)
                return resStart < dayEnd && resEnd > dayStart
              })
              
              // Calculate available slots
              const bookedSlots = reservationsForDay.reduce((total: number, res: any) => {
                const resStart = new Date(res.startTime)
                const resEnd = new Date(res.endTime)
                const startHour = Math.max(resStart.getHours(), erTimeStart)
                const endHour = Math.min(resEnd.getHours(), erTimeEnd)
                return total + Math.ceil((endHour - startHour) / erSlotTime)
              }, 0)
              
              const availableSlots = totalSlots - bookedSlots
              
              dates[dateString] = {
                available: availableSlots > 0,
                partiallyAvailable: availableSlots > 0 && availableSlots < totalSlots,
                slots: availableSlots,
                totalSlots: totalSlots,
                reservations: reservationsForDay
              }
            }
          }
          
          setAvailableDates(dates)
        }
      } catch (error) {
        console.error("Failed to fetch reservations:", error)
        // Fallback to all available
        const dates: any = {}
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateString = date.toISOString().split('T')[0]
          dates[dateString] = {
            available: date.getDay() !== 0 && date.getDay() !== 6,
            partiallyAvailable: false,
            slots: 9,
            totalSlots: 9
          }
        }
        setAvailableDates(dates)
      }
    }
    
    fetchReservations()
  }, [formData.equipment, formData.selectedMethod, testingMethods]) */

  // Click outside handler for method dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-method-dropdown]')) {
        setMethodPopoverOpen(false)
      }
    }

    if (methodPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [methodPopoverOpen])

  // Render sample fields based on category
  const renderSampleFields = () => {
    switch (sampleCategory) {
      case "commercial":
        return (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade {isFieldRequired("grade") && "*"}</Label>
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
              <Label htmlFor="lot">Lot {isFieldRequired("lot") && "*"}</Label>
              <Input
                id="lot"
                value={currentSample.lot || ""}
                onChange={(e) => handleSampleChange("lot", e.target.value)}
                className={highlightedField === "lot" ? "ring-2 ring-blue-500 border-blue-500" : ""}
                autoComplete="off"
              />
            </div>
          </div>
        )
      case "td":
        return (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tech">Tech/CAT {isFieldRequired("tech") && "*"}</Label>
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
              <Label htmlFor="feature">Feature/App {isFieldRequired("feature") && "*"}</Label>
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
        )
      case "benchmark":
        return (
          <div className="space-y-2">
            <Label htmlFor="feature">Feature/App {isFieldRequired("feature") && "*"}</Label>
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
        )
      case "inprocess":
      case "chemicals":
        return (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="plant">Plant {isFieldRequired("plant") && "*"}</Label>
              <Select
                value={currentSample.plant || ""}
                onValueChange={(value) => handleSampleChange("plant", value)}
              >
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
              <Label htmlFor="samplingDate">Sampling Date {isFieldRequired("samplingDate") && "*"}</Label>
              <Input
                id="samplingDate"
                value={currentSample.samplingDate || ""}
                onChange={(e) => handleSampleChange("samplingDate", e.target.value)}
                placeholder="MM/DD/YYYY"
                className={`${highlightedField === "samplingDate" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="samplingTime">Sampling Time {isFieldRequired("samplingTime") && "*"}</Label>
              <Input
                id="samplingTime"
                value={currentSample.samplingTime || ""}
                onChange={(e) => handleSampleChange("samplingTime", e.target.value)}
                placeholder="HH:MM"
                className={`${highlightedField === "samplingTime" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                autoComplete="off"
              />
            </div>
          </div>
        )
      case "cap":
        return (
          <div className="space-y-2">
            <Label htmlFor="feature">Feature/App {isFieldRequired("feature") && "*"}</Label>
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
        )
      default:
        return null
    }
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

  // Define urgency types
  const urgencyTypes = [
    { value: "research", label: "Research Development", description: "Critical research project deadline" },
    { value: "customer", label: "Customer Complaint", description: "Urgent customer issue resolution" },
    { value: "pilot", label: "Pilot Trial", description: "Time-sensitive pilot production run" },
    { value: "regulatory", label: "Regulatory Compliance", description: "Required for regulatory submission" },
    { value: "production", label: "Production Issue", description: "Production line is down or at risk" },
    { value: "quality", label: "Quality Control", description: "Urgent quality verification needed" },
    { value: "competitive", label: "Competitive Analysis", description: "Time-sensitive market analysis" },
    { value: "other", label: "Other", description: "Other urgent requirement" }
  ]

  // Initialize time slots when equipment is selected
  useEffect(() => {
    if (formData.equipment) {
      // Generate time slots from 8 AM to 5 PM
      const slots = Array.from({ length: 9 }, (_, i) => {
        const hour = i + 8
        const startTime = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`
        const endTime = `${hour + 1}:00 ${hour + 1 < 12 ? 'AM' : hour + 1 === 12 ? 'PM' : 'PM'}`
        return {
          id: i + 1,
          time: `${startTime} - ${endTime}`,
          available: true // This can be updated based on actual availability
        }
      })
      setTimeSlots(slots)
    }
  }, [formData.equipment])

  // Update cost when reservation schedule changes
  useEffect(() => {
    const totalHours = getTotalTimeSlots()
    const hourlyRate = equipmentCosts[formData.equipment] || 2000
    setFormData(prev => ({ ...prev, cost: totalHours * hourlyRate }))
  }, [formData.reservationSchedule, formData.equipment])

  // Enhanced Calendar Component
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
      const isFullyBooked = dateAvailability?.isFullyBooked

      // Determine the appropriate class based on availability
      let bgColorClass = "bg-gray-100 text-gray-400" // default/unavailable
      let hoverClass = ""

      if (isFullyBooked) {
        bgColorClass = "bg-red-50 text-red-600 border border-red-200"
        hoverClass = "" // Not clickable when fully booked
      } else if (isAvailable) {
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
          onClick={() => (!isPastDate && isAvailable && !isFullyBooked ? handleDateSelect(dateString) : null)}
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

  // Main render
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
              <CardTitle>Testing Method Selection</CardTitle>
              <CardDescription>Search and select a testing method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Search Testing Method</Label>
                {loadingTestingMethods ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading testing methods...</span>
                  </div>
                ) : testingMethodsError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{testingMethodsError}</AlertDescription>
                  </Alert>
                ) : testingMethods.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No ER testing methods found in the database. Please ensure testing methods with serviceType "ER" are configured in the testing_methods collection.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="relative" data-method-dropdown>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMethodPopoverOpen(!methodPopoverOpen)}
                      className="w-full justify-between text-left font-normal"
                    >
                      <span className={formData.selectedMethod ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                        {formData.selectedMethod
                          ? testingMethods.find((method) => method._id === formData.selectedMethod)?.methodcode + " - " + 
                            testingMethods.find((method) => method._id === formData.selectedMethod)?.testingName
                          : "Select testing method..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    
                    {methodPopoverOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-md border bg-white dark:bg-gray-950 shadow-lg">
                        <div className="p-2">
                          <Input
                            type="text"
                            placeholder="Search testing methods..."
                            value={methodSearchQuery}
                            onChange={(e) => setMethodSearchQuery(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        
                        <div className="max-h-[300px] overflow-y-auto">
                          {testingMethods
                            .filter((method) => {
                              if (!methodSearchQuery) return true
                              const searchLower = methodSearchQuery.toLowerCase()
                              return (
                                method.methodcode?.toLowerCase().includes(searchLower) ||
                                method.testingName?.toLowerCase().includes(searchLower) ||
                                method.detailEng?.toLowerCase().includes(searchLower) ||
                                method.detailTh?.toLowerCase().includes(searchLower)
                              )
                            })
                            .length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No testing method found.
                              </div>
                            ) : (
                              testingMethods
                                .filter((method) => {
                                  if (!methodSearchQuery) return true
                                  const searchLower = methodSearchQuery.toLowerCase()
                                  return (
                                    method.methodcode?.toLowerCase().includes(searchLower) ||
                                    method.testingName?.toLowerCase().includes(searchLower) ||
                                    method.detailEng?.toLowerCase().includes(searchLower) ||
                                    method.detailTh?.toLowerCase().includes(searchLower)
                                  )
                                })
                                .map((method) => (
                                  <div
                                    key={method._id}
                                    className={cn(
                                      "flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                                      formData.selectedMethod === method._id && "bg-gray-100 dark:bg-gray-800"
                                    )}
                                    onClick={() => {
                                      handleSelectChange("selectedMethod", method._id)
                                      // Set cost from method's price
                                      setFormData(prev => ({ ...prev, cost: method.price || 0 }))
                                      
                                      if (method.equipmentName) {
                                        const equipment = equipmentData.find((e: any) => e.equipmentName === method.equipmentName)
                                        if (equipment) {
                                          handleSelectChange("equipment", equipment._id)
                                        }
                                      }
                                      setMethodPopoverOpen(false)
                                      setMethodSearchQuery("")
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.selectedMethod === method._id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {method.methodcode} - {method.testingName}
                                      </div>
                                      {(method.detailEng || method.detailTh) && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                          {method.detailEng || method.detailTh}
                                        </div>
                                      )}
                                      {method.equipmentName && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Equipment: {method.equipmentName}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {formData.selectedMethod && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Testing Method:</strong> {
                        (() => {
                          const method = testingMethods.find((m: any) => m._id === formData.selectedMethod)
                          return method ? `${method.methodcode} - ${method.testingName}` : "Not selected"
                        })()
                      }</p>
                      {(() => {
                        const method = testingMethods.find((m: any) => m._id === formData.selectedMethod)
                        if (method) {
                          return (
                            <>
                              {method.equipmentName && <p><strong>Equipment:</strong> {method.equipmentName}</p>}
                              <p><strong>Price:</strong> ฿{(method.price || 0).toLocaleString()}</p>
                            </>
                          )
                        }
                        return null
                      })()}
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

        {/* Save Sample List Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Sample List</DialogTitle>
              <DialogDescription>
                Save this sample list for future use. You can load it later to quickly add the same samples.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="listName">List Name</Label>
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
                  placeholder="Add a description to help identify this list"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!sampleListName.trim()) {
                    toast({
                      title: "Name required",
                      description: "Please enter a name for the sample list.",
                      variant: "destructive",
                    })
                    return
                  }

                  try {
                    setSavingSampleList(true)
                    const response = await fetch('/api/sample-sets', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: sampleListName,
                        description: sampleListDescription,
                        samples: formData.samples,
                        userEmail: user?.email || '',
                      }),
                    })

                    const data = await response.json()

                    if (data.success) {
                      toast({
                        title: "Sample list saved",
                        description: "Your sample list has been saved successfully.",
                      })
                      setShowSaveDialog(false)
                      setSampleListName("")
                      setSampleListDescription("")
                    } else {
                      throw new Error(data.error || 'Failed to save sample list')
                    }
                  } catch (error) {
                    console.error('Error saving sample list:', error)
                    toast({
                      title: "Error",
                      description: "Failed to save sample list. Please try again.",
                      variant: "destructive",
                    })
                  } finally {
                    setSavingSampleList(false)
                  }
                }}
                disabled={savingSampleList || !sampleListName.trim()}
              >
                {savingSampleList ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save List'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Load Sample List Dialog */}
        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Load Sample List</DialogTitle>
              <DialogDescription>
                Select a previously saved sample list to load the samples.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {loadingSampleLists ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedSampleLists.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No saved sample lists found.
                </div>
              ) : (
                savedSampleLists.map((list) => (
                  <Card
                    key={list._id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        samples: list.samples,
                        sampleCount: list.samples.length,
                      }))
                      setShowLoadDialog(false)
                      toast({
                        title: "Sample list loaded",
                        description: `Loaded ${list.samples.length} samples from "${list.name}".`,
                      })
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{list.name}</CardTitle>
                          {list.description && (
                            <CardDescription className="mt-1">{list.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary">{list.samples.length} samples</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground">
                        Created on {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                      onClick={openAddSampleDialog}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Click to start adding samples
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
                          <TableRow key={sample.id || `sample-fallback-${index}-${Date.now()}`}>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button onClick={nextStep} disabled={formData.samples.length === 0}>
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
                    <div className="border rounded-md p-4 bg-white relative">
                      {loadingBookedSlots && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-md">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      )}
                      <EnhancedCalendar />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDate && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {timeSlots.filter(s => s.available).length} slots available
                          </Badge>
                        </div>
                        <div className="border rounded-lg p-3 bg-white shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => {
                              const isSelected = formData.reservationSchedule[selectedDate]?.timeSlots.some(
                                (s) => s.time === slot.time,
                              )
                              
                              // Find booked slot info if this slot is not available
                              const bookedSlotInfo = selectedDate && bookedSlots[selectedDate]?.find(
                                (booked: any) => booked.timeRange === slot.time || booked.startTime === slot.time.split(' - ')[0]
                              )

                              const buttonContent = (
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold">{slot.time.split(' - ')[0]}</span>
                                  {!slot.available && (
                                    <span className="text-[10px] mt-0.5 font-medium">Booked</span>
                                  )}
                                  {slot.available && isSelected && (
                                    <Check className="h-3 w-3 mt-0.5" />
                                  )}
                                </div>
                              )

                              const button = (
                                <button
                                  key={slot.id}
                                  className={`
                                    relative px-2 py-1.5 text-xs font-medium rounded-md transition-all
                                    ${!slot.available
                                      ? "bg-red-50 text-red-600 cursor-not-allowed border border-red-200"
                                      : isSelected
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                                    }
                                  `}
                                  onClick={() => slot.available && handleTimeSlotSelect(slot, selectedDate)}
                                  disabled={!slot.available}
                                >
                                  {buttonContent}
                                </button>
                              )

                              // Add tooltip for booked slots
                              if (!slot.available && bookedSlotInfo) {
                                return (
                                  <TooltipProvider key={slot.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {button}
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-xs">
                                          <p className="font-semibold">Reserved by:</p>
                                          <p>{bookedSlotInfo.reservedBy}</p>
                                          <p className="text-gray-400">{bookedSlotInfo.requestNumber}</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )
                              }

                              return button
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
                        Green dates have full availability, yellow dates have partial availability, red dates are fully booked
                      </p>
                    </div>
                  )}

                  {/* Selected Dates Summary */}
                  {formData.selectedDates.length > 0 && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Selected Reservations</h3>
                        <Badge>{formData.selectedDates.length} date(s)</Badge>
                      </div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {formData.selectedDates.map((date) => {
                          const dateSchedule = formData.reservationSchedule[date] || { timeSlots: [] }
                          const timeSlotCount = dateSchedule.timeSlots.length

                          return (
                            <div key={date} className="bg-white p-2.5 rounded-md border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {new Date(date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}
                                    </span>
                                    <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                                      {timeSlotCount} slot{timeSlotCount !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {dateSchedule.timeSlots.map((slot, idx) => (
                                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        {slot.time.split(' - ')[0]}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveDate(date)}
                                  className="h-6 w-6 ml-2"
                                >
                                  <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                                </Button>
                              </div>
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
                      <Label className="text-muted-foreground">Request Title</Label>
                      <p className="font-medium">{formData.requestTitle || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Priority</Label>
                      <p className="font-medium">{formData.priority === "urgent" ? "Urgent" : "Normal"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Funding Source</Label>
                      <p className="font-medium">{formData.useIONumber === "yes" ? "IO Number" : "Non-IO Request"}</p>
                    </div>
                    {formData.useIONumber === "yes" && (
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
                      <Label className="text-muted-foreground">Testing Method</Label>
                      <p className="font-medium">
                        {(() => {
                          const method = testingMethods.find((m: any) => m._id === formData.selectedMethod)
                          return method ? `${method.methodcode} - ${method.testingName}` : "Not selected"
                        })()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Equipment</Label>
                      <p className="font-medium">
                        {(() => {
                          const method = testingMethods.find((m: any) => m._id === formData.selectedMethod)
                          const equipment = equipmentData.find((e: any) => e._id === formData.equipment)
                          return equipment?.equipmentName || method?.equipmentName || "Not selected"
                        })()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Price</Label>
                      <p className="font-medium">
                        ฿{(() => {
                          const method = testingMethods.find((m: any) => m._id === formData.selectedMethod)
                          return (method?.price || 0).toLocaleString()
                        })()}
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
                                    ? "Inprocess/Chemicals"
                                    : sample.category === "chemicals"
                                      ? "Chemicals/Substances"
                                      : "Cap Development"}
                          </p>
                        </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Total Selected Dates</Label>
                      <p className="font-medium">{formData.selectedDates.length}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Time Slots</Label>
                      <p className="font-medium">{getTotalTimeSlots()} hours</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estimated Total Cost</Label>
                      <p className="font-medium">฿{formData.cost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Schedule Details</Label>
                    {formData.selectedDates.map((date) => {
                      const dateSchedule = formData.reservationSchedule[date] || { timeSlots: [] }
                      if (dateSchedule.timeSlots.length === 0) return null

                      return (
                        <div key={date} className="p-3 border rounded-md">
                          <div className="font-medium mb-2">{date}</div>
                          <div className="flex flex-wrap gap-2">
                            {dateSchedule.timeSlots.map((slot: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {slot.time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information carefully before submitting. Once submitted, the equipment reservation
                    request will be processed by the laboratory team.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button
                onClick={async () => {
                  setIsSubmitting(true)
                  try {
                    // Prepare submission data
                    const submissionData = {
                      requestTitle: formData.requestTitle,
                      priority: formData.priority,
                      useIONumber: formData.useIONumber,
                      ioNumber: formData.ioNumber,
                      costCenter: formData.costCenter,
                      urgencyType: formData.urgencyType,
                      urgencyReason: formData.urgencyReason,
                      approver: formData.approver,
                      selectedMethod: formData.selectedMethod,
                      samples: formData.samples,
                      selectedDates: formData.selectedDates,
                      reservationSchedule: formData.reservationSchedule,
                      testingMode: formData.testingMode,
                      specialRequirements: formData.specialRequirements,
                      requester: user ? {
                        name: user.name,
                        email: user.email
                      } : null,
                      isOnBehalf: formData.isOnBehalf,
                      onBehalfOfName: formData.onBehalfOfName,
                      onBehalfOfEmail: formData.onBehalfOfEmail,
                      onBehalfOfCostCenter: formData.onBehalfOfCostCenter,
                      // ASR project reference
                      asrId: asrId || null,
                      isAsrRequest: isAsrRequest || false
                    }

                    // Submit to API
                    const response = await fetch('/api/requests/submit-er', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(submissionData)
                    })

                    const result = await response.json()

                    if (result.success) {
                      // Store response data for confirmation page
                      localStorage.setItem('submittedERData', JSON.stringify({
                        ...submissionData,
                        requests: result.data.requests
                      }))
                      localStorage.setItem('submittedERRequestNumbers', JSON.stringify(result.data.requestNumbers))
                      
                      // Redirect to confirmation page
                      router.push('/request/new/er/confirmation')
                    } else {
                      toast({
                        title: "Submission Failed",
                        description: result.error || "Failed to submit ER request. Please try again.",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error("Error submitting request:", error)
                    toast({
                      title: "Error",
                      description: "An unexpected error occurred. Please try again.",
                      variant: "destructive"
                    })
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Sample Add/Edit Dialog */}
        <Dialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Sample" : "Add New Sample"}</DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Modify the sample details below"
                  : "Fill out the sample details to add a new sample to your request"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Sample Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="sample-category">Sample Category</Label>
                <Select
                  value={sampleCategory}
                  onValueChange={(value) => {
                    setSampleCategory(value)
                    setCurrentSample((prev) => ({
                      ...prev,
                      category: value,
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
                    }))
                  }}
                >
                  <SelectTrigger
                    id="sample-category"
                    className={highlightedField === "sample-category" ? "ring-2 ring-blue-500 border-blue-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial Grade</SelectItem>
                    <SelectItem value="td">TD/NPD</SelectItem>
                    <SelectItem value="benchmark">Benchmark</SelectItem>
                    <SelectItem value="inprocess">Inprocess/Chemicals</SelectItem>
                    <SelectItem value="chemicals">Chemicals/Substances</SelectItem>
                    <SelectItem value="cap">Cap Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Fields based on category */}
              {sampleCategory && (
                <div className="space-y-6">
                  {/* Category-specific fields */}
                  {renderSampleFields()}

                  {/* Common fields for all sample categories */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="sample-identity">Sample Identity</Label>
                      <Input
                        id="sample-identity"
                        value={currentSample.sampleIdentity || ""}
                        onChange={(e) => handleSampleChange("sampleIdentity", e.target.value)}
                        className={highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={currentSample.type || ""} 
                        onValueChange={(value) => handleSampleChange("type", value)}
                      >
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
                      {sampleCategory === "commercial" && currentSample.grade && !currentSample.type && (
                        <p className="text-xs text-amber-600 mt-1">No polymer type found for this grade</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="form">Form</Label>
                      <Select value={currentSample.form || ""} onValueChange={(value) => handleSampleChange("form", value)}>
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

                  <div className="space-y-2">
                    <Label htmlFor="generated-name">Generated Sample Name</Label>
                    <Input
                      id="generated-name"
                      value={currentSample.generatedName || ""}
                      disabled
                      className="bg-gray-100 font-medium"
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSample}
                disabled={!currentSample.generatedName}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {editMode ? "Update Sample" : "Add Sample"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
