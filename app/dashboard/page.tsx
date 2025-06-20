"use client"

import { Plus, Search, Filter, ChevronRight, ChevronLeft, MoreVertical, Star, FileText, Copy, ThumbsUp, Calendar, Clock, BarChart4, CreditCard, DollarSign, CalendarDays, CalendarRange, CalendarCheck, Loader2, ChevronDown, ChevronUp, Printer, MessageSquare, Edit, Bell, CheckCircle, AlertCircle, Info, X, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RequestStatusBadge from "@/components/request-status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { RequestViewDetailsDialog } from "@/components/request-view-details-dialog"
import { AsrViewDetailsDialog } from "@/components/asr-view-details-dialog"
import { AsrEvaluationDialog } from "@/components/asr-evaluation-dialog"
import { EvaluationDialog } from "@/components/evaluation-dialog"
import { ComplaintDialog } from "@/components/complaint-dialog"
import { TerminateRequestDialog } from "@/components/terminate-request-dialog"
import { useAuth } from "@/components/auth-provider"
import { UserInfoCard } from "@/components/user-header"

// Interface for request data from MongoDB
interface RequestData {
  _id: string
  requestNumber: string
  requestTitle: string
  requestStatus: string
  requestType?: string
  priority: string
  useIoNumber: boolean
  ioNumber?: string
  ioCostCenter?: string
  requesterCostCenter?: string
  jsonSampleList?: string
  jsonTestingList?: string
  createdAt: string
  updatedAt: string
  completeDate?: string
  terminateDate?: string
  cancelDate?: string
  isEvaluated?: boolean
  evaluationScore?: number
  evaluationComment?: string
  evaluationDate?: string
  capability?: string
  // ASR-specific fields
  asrType?: string
  asrOwnerName?: string
  asrOwnerEmail?: string
  problemSource?: string
  expectedResults?: string
  businessImpact?: string
  urgencyType?: string
  urgencyReason?: string
  asrEstCompletedDate?: string
  asrMethodology?: string
  approver?: string
  asrRequireDate?: string
}

// Interface for transformed request data for UI
interface UIRequest {
  id: string
  requestNumber: string
  title: string
  type: string
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed" | "draft" | "submitted" | "Pending Receive" | "terminated" | "cancelled"
  priority: string
  submittedDate: string
  createdDate: Date
  dueDate: string
  capability: string
  progress: number
  samples: string[]
  equipment: string[]
  evaluated: boolean
  completedDate?: string
  ioNumber?: string
  useIoNumber: boolean
  // ASR-specific fields
  asrType?: string
  asrOwnerName?: string
  asrOwnerEmail?: string
  problemSource?: string
  expectedResults?: string
  businessImpact?: string
  urgencyType?: string
  urgencyReason?: string
  asrEstCompletedDate?: string
  asrMethodology?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  
  // State for real request data
  const [requests, setRequests] = useState<UIRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCapability, setSelectedCapability] = useState("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 3 // Show 3 requests per page

  // State for expanded samples and equipment
  const [expandedSamples, setExpandedSamples] = useState<Record<string, boolean>>({})
  const [expandedEquipment, setExpandedEquipment] = useState<Record<string, boolean>>({})

  // State for view details dialog
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<UIRequest | null>(null)
  const [asrDetailsDialogOpen, setAsrDetailsDialogOpen] = useState(false)
  const [selectedAsrForDetails, setSelectedAsrForDetails] = useState<UIRequest | null>(null)

  // State for collapsible filter sections
  const [ioFilterExpanded, setIoFilterExpanded] = useState(false)
  const [periodFilterExpanded, setPeriodFilterExpanded] = useState(false)

  // State for capabilities from database
  const [capabilities, setCapabilities] = useState([
    { id: "all", label: "All" }
  ])
  const [loadingCapabilities, setLoadingCapabilities] = useState(true)

  // State for IO filter
  const [ioNumbers, setIoNumbers] = useState<string[]>([])
  const [selectedIOs, setSelectedIOs] = useState<Set<string>>(new Set(['all']))

  // State for period filter
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // State for expense data
  const [expenseData, setExpenseData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRequestCost: 0,
    loading: true
  })

  // State for evaluation dialog
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)
  const [selectedRequestForEvaluation, setSelectedRequestForEvaluation] = useState<UIRequest | null>(null)
  const [asrEvaluationDialogOpen, setAsrEvaluationDialogOpen] = useState(false)
  const [selectedAsrForEvaluation, setSelectedAsrForEvaluation] = useState<UIRequest | null>(null)

  // State for complaint dialog
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [selectedRequestForComplaint, setSelectedRequestForComplaint] = useState<UIRequest | null>(null)

  // State for terminate dialog
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false)
  const [selectedRequestForTerminate, setSelectedRequestForTerminate] = useState<UIRequest | null>(null)

  // State for user score - Initialize from localStorage if available
  const [userScore, setUserScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedScore = localStorage.getItem('userScore_admin@admin.com')
      return storedScore ? parseInt(storedScore, 10) : 0
    }
    return 0
  })
  const [loadingScore, setLoadingScore] = useState(true)

  // State for notifications
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationLoading, setNotificationLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Functions to toggle expanded state
  const toggleSamples = (requestId: string) => {
    setExpandedSamples(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }))
  }

  const toggleEquipment = (requestId: string) => {
    setExpandedEquipment(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }))
  }

  // Functions for menu actions
  const handlePrintTag = (requestId: string) => {
    toast.success(`Print Tag initiated for ${requestId}`)
    // TODO: Implement actual print tag functionality
  }

  // Print functions adapted from confirmation page
  const handlePrintAllRequest = async (requestId: string) => {
    try {
      // Fetch request details from API
      const response = await fetch(`/api/requests/details?requestNumber=${encodeURIComponent(requestId)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch request details')
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch request details')
      }

      // Transform the data to match confirmation page format
      const requestData = result.data
      
      // Debug: log the received data
      console.log('Print request - received data:', requestData)
      console.log('Test methods:', requestData.testMethods)
      console.log('Samples:', requestData.samples)
      console.log('Test methods structure:')
      requestData.testMethods?.forEach((method, index) => {
        console.log(`  Method ${index}:`, method)
      })
      
      const mockRequest = {
        requestId: requestData.requestNumber,
        capability: requestData.capability || "General Testing",
        estimatedCompletion: requestData.completeDate || "7 days",
        methods: requestData.testMethods || [],
        capabilityInfo: {
          address: "Building 3, Floor 2, Lab 205, Research Center, 123 Science Park",
          contactPerson: "Laboratory Staff",
          contactEmail: "lab@pcrd.com",
          contactPhone: "123-456-7890"
        }
      }

      // Open print window with request tag
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(generateRequestTagHTML(mockRequest, requestData))
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
      
      toast.success(`Request tag for ${requestId} opened for printing`)
    } catch (error) {
      console.error('Error printing request tag:', error)
      toast.error('Failed to print request tag')
    }
  }

  const handlePrintSampleTag = async (requestId: string) => {
    try {
      // Fetch request details from API
      const response = await fetch(`/api/requests/details?requestNumber=${encodeURIComponent(requestId)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch request details')
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch request details')
      }

      // Transform the data to match confirmation page format
      const requestData = result.data
      
      // Debug: log the received data
      console.log('Print sample tags - received data:', requestData)
      console.log('Test methods:', requestData.testMethods)
      console.log('Samples:', requestData.samples)
      
      const mockRequest = {
        requestId: requestData.requestNumber,
        capability: requestData.capability || "General Testing",
        methods: requestData.testMethods || []
      }

      // Open print window with sample tags
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(generateSampleTagsHTML(mockRequest))
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }
      
      toast.success(`Sample tags for ${requestId} opened for printing`)
    } catch (error) {
      console.error('Error printing sample tags:', error)
      toast.error('Failed to print sample tags')
    }
  }


  const handleEditRequest = (request: UIRequest) => {
    // Navigate to edit page based on request type
    const requestType = request.type.toLowerCase()
    const editUrl = `/request/new/${requestType}?edit=${request.id}`

    toast.info(`Opening ${request.type} request for editing: ${request.id}`)

    // Navigate to the edit page
    window.location.href = editUrl
  }

  const handleDuplicateRequest = (request: UIRequest) => {
    // Navigate to duplicate page based on request type
    const requestType = request.type.toLowerCase()
    const duplicateUrl = `/request/new/${requestType}?duplicate=${request.id}`

    toast.info(`Duplicating ${request.type} request: ${request.id}`)

    // Navigate to the duplicate page
    window.location.href = duplicateUrl
  }

  // Handle opening request details view
  const handleOpenRequestDetails = (request: UIRequest) => {
    if (request.type === 'ASR') {
      setSelectedAsrForDetails(request)
      setAsrDetailsDialogOpen(true)
    } else {
      setSelectedRequestForDetails(request)
      setViewDetailsDialogOpen(true)
    }
  }

  // Handle evaluation request
  const handleEvaluateRequest = (request: UIRequest) => {
    if (request.type === 'ASR') {
      setSelectedAsrForEvaluation(request)
      setAsrEvaluationDialogOpen(true)
    } else {
      setSelectedRequestForEvaluation(request)
      setEvaluationDialogOpen(true)
    }
  }

  // Handle complaint
  const handleComplaint = (request: UIRequest) => {
    setSelectedRequestForComplaint(request)
    setComplaintDialogOpen(true)
  }

  // Handle terminate request
  const handleTerminateRequest = (request: UIRequest) => {
    setSelectedRequestForTerminate(request)
    setTerminateDialogOpen(true)
  }

  // Handle evaluation completion
  const handleEvaluationComplete = () => {
    if (!user?.email) return
    
    // Increment score locally as immediate feedback
    const userEmail = user.email
    const currentScore = userScore
    const newScore = currentScore + 1
    setUserScore(newScore)
    // Store in localStorage
    localStorage.setItem(`userScore_${userEmail}`, newScore.toString())
    
    // Refresh requests to update evaluation status
    fetchRequests()
    // Refresh user score from API (will update if database is available)
    fetchUserScore()
  }

  // Fetch expense data from IO and calculate request costs
  const fetchExpenseData = useCallback(async () => {
    try {
      console.log('fetchExpenseData called with:', {
        userEmail: user?.email,
        requestsCount: requests.length,
        selectedIOs: Array.from(selectedIOs),
        startDate,
        endDate
      })
      
      setExpenseData(prev => ({ ...prev, loading: true }))
      
      if (!user?.email) {
        console.log('Skipping expense calculation - no user')
        setExpenseData({
          totalBudget: 0,
          totalSpent: 0,
          totalRequestCost: 0,
          loading: false
        })
        return
      }

      // Get unique IO numbers from user's requests
      const userIONumbers = new Set<string>()
      requests.forEach(req => {
        if (req.useIoNumber && req.ioNumber) {
          userIONumbers.add(req.ioNumber)
        }
      })

      let totalSpent = 0
      let totalBudget = 0

      // Fetch spending data for each IO
      if (userIONumbers.size > 0) {
        const ioPromises = Array.from(userIONumbers).map(async (ioNumber) => {
          try {
            const response = await fetch(`/api/ios?ioNo=${encodeURIComponent(ioNumber)}`)
            const result = await response.json()
            if (result.success && result.data && result.data.length > 0) {
              const ioData = result.data[0]
              const spending = parseFloat(ioData.testSpending) || 0
              return { spending, budget: spending * 1.2 } // Assume budget is 20% more than current spending
            }
          } catch (error) {
            console.warn(`Failed to fetch IO data for ${ioNumber}:`, error)
          }
          return { spending: 0, budget: 0 }
        })

        const ioResults = await Promise.all(ioPromises)
        totalSpent = ioResults.reduce((sum, io) => sum + io.spending, 0)
        totalBudget = ioResults.reduce((sum, io) => sum + io.budget, 0)
      }

      // Calculate IO Budget used by summing testingCost from TestingSampleList
      // Filter by selected IO and period
      let totalRequestCost = 0
      let filteredSamples: any[] = []
      try {
        // Get all testing samples for the user
        const allSamplesResponse = await fetch(`/api/testing-samples`)
        if (allSamplesResponse.ok) {
          const allSamplesData = await allSamplesResponse.json()
          if (allSamplesData.success && allSamplesData.data) {
            // Filter testing samples based on user's requests and filters
            filteredSamples = allSamplesData.data.filter((sample: any) => {
              // Check if sample belongs to user's requests
              const isUserRequest = requests.some(req => req.id === sample.requestNumber)
              if (!isUserRequest) return false

              // Apply IO filter
              if (!selectedIOs.has('all')) {
                const sampleRequest = requests.find(req => req.id === sample.requestNumber)
                if (sampleRequest) {
                  if (!sampleRequest.useIoNumber || !sampleRequest.ioNumber) {
                    // This is a Non-IO request
                    if (!selectedIOs.has('Non-IO')) return false
                  } else {
                    // This is an IO request
                    if (!selectedIOs.has(sampleRequest.ioNumber)) return false
                  }
                }
              }

              // Apply period filter
              if (startDate || endDate) {
                const sampleRequest = requests.find(req => req.id === sample.requestNumber)
                if (sampleRequest) {
                  const requestDate = new Date(sampleRequest.createdDate)
                  if (startDate && requestDate < new Date(startDate)) return false
                  if (endDate && requestDate > new Date(endDate)) return false
                }
              }

              return true
            })

            // Sum testingCost from filtered samples
            console.log('Filtered samples for expense calculation:', filteredSamples.length)
            console.log('Sample testingCost values:', filteredSamples.map((s: any) => ({ 
              requestNumber: s.requestNumber, 
              testingCost: s.testingCost,
              methodCode: s.methodCode
            })))
            
            totalRequestCost = filteredSamples.reduce((sum: number, sample: any) => {
              const cost = parseFloat(sample.testingCost) || 0
              console.log(`Sample ${sample.testingListId}: testingCost = ${sample.testingCost}, parsed = ${cost}`)
              return sum + cost
            }, 0)
            
            console.log('Total request cost calculated:', totalRequestCost)
          }
        }
      } catch (requestError) {
        console.warn('Failed to calculate request costs from TestingSampleList:', requestError)
      }

      console.log('Final expense data:', {
        totalBudget: totalBudget || (totalRequestCost * 1.5),
        totalSpent,
        totalRequestCost,
        filteredSamplesCount: filteredSamples.length
      })
      
      setExpenseData({
        totalBudget: totalBudget || (totalRequestCost * 1.5), // Fallback: assume budget is 50% more than request cost
        totalSpent,
        totalRequestCost,
        loading: false
      })

    } catch (error) {
      console.error('Error fetching expense data:', error)
      setExpenseData({
        totalBudget: 0,
        totalSpent: 0,
        totalRequestCost: 0,
        loading: false
      })
    }
  }, [user?.email, requests, selectedIOs, startDate, endDate])

  // Fetch user score from API
  const fetchUserScore = async () => {
    try {
      setLoadingScore(true)
      
      if (!user?.email) return
      
      const userEmail = user.email
      const response = await fetch(`/api/users/score?email=${userEmail}`)
      const result = await response.json()

      console.log('User score API response:', result)

      if (result.success && result.data) {
        setUserScore(result.data.score || 0) // score = totalEvaluations from UserScore table
        console.log('Updated user score:', result.data.score)
        // Store in localStorage for offline access
        localStorage.setItem(`userScore_${userEmail}`, result.data.score.toString())
      } else if (result.fallback && result.data) {
        // Handle fallback when database is not available
        console.warn('Database not available, using fallback:', result.error)
        // Try to get score from localStorage first
        const storedScore = localStorage.getItem(`userScore_${userEmail}`)
        if (storedScore) {
          setUserScore(parseInt(storedScore, 10))
          console.log('Using stored evaluation count:', storedScore)
        } else {
          // Count evaluations from current requests as last resort
          const evaluatedRequestsCount = requests.filter(req => req.evaluated).length
          setUserScore(evaluatedRequestsCount)
          console.log('Using fallback evaluation count:', evaluatedRequestsCount)
        }
      } else {
        console.warn('Failed to fetch user score:', result.error)
        // Try localStorage fallback
        const storedScore = localStorage.getItem(`userScore_${userEmail}`)
        setUserScore(storedScore ? parseInt(storedScore, 10) : 0)
      }
    } catch (err) {
      console.error('Error fetching user score - Database may not be connected:', err)
      // Try localStorage fallback
      if (user?.email) {
        const userEmail = user.email
        const storedScore = localStorage.getItem(`userScore_${userEmail}`)
        if (storedScore) {
          setUserScore(parseInt(storedScore, 10))
        } else {
          // Count evaluations from current requests as last resort
          const evaluatedRequestsCount = requests.filter(req => req.evaluated).length
          setUserScore(evaluatedRequestsCount)
        }
      }
    } finally {
      setLoadingScore(false)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedCapability, selectedIOs, startDate, endDate])

  // Refresh expense data when filters change
  useEffect(() => {
    fetchExpenseData()
  }, [fetchExpenseData])

  // Function to transform MongoDB data to UI format
  const transformRequestData = async (dbRequest: RequestData): Promise<UIRequest> => {
    // Parse samples from JSON string
    let samples: string[] = []
    try {
      if (dbRequest.jsonSampleList) {
        const sampleData = JSON.parse(dbRequest.jsonSampleList)
        samples = sampleData.map((sample: any) => sample.generatedName || sample.name || sample.sampleIdentity || 'Unknown Sample')
      }
    } catch (e) {
      console.warn('Failed to parse sample list:', e)
    }

    // Get capability from request data or parse from testing methods
    let capability = dbRequest.capability || "General Testing"
    if (!dbRequest.capability) {
      try {
        if (dbRequest.jsonTestingList) {
          const testingData = JSON.parse(dbRequest.jsonTestingList)
          if (testingData.length > 0) {
            capability = testingData[0].capabilityName || "General Testing"
          }
        }
      } catch (e) {
        console.warn('Failed to parse testing list:', e)
      }
    }

    // Calculate progress and get equipment names from Testing Sample List
    let progress = 0
    let equipment: string[] = []
    try {
      const testingSamplesRes = await fetch(`/api/testing-samples?requestNumber=${encodeURIComponent(dbRequest.requestNumber)}`)
      if (testingSamplesRes.ok) {
        const testingSamplesData = await testingSamplesRes.json()
        if (testingSamplesData.success && testingSamplesData.data && testingSamplesData.data.length > 0) {
          // Get unique equipment names from testing samples
          const equipmentSet = new Set<string>()
          testingSamplesData.data.forEach((sample: any) => {
            if (sample.equipmentName && sample.equipmentName.trim() !== '') {
              equipmentSet.add(sample.equipmentName)
            }
          })
          equipment = Array.from(equipmentSet).sort()

          // Filter out terminated and cancelled samples for progress calculation
          const validSamples = testingSamplesData.data.filter((sample: any) => 
            sample.sampleStatus !== 'terminated' && 
            sample.sampleStatus !== 'cancelled' &&
            sample.sampleStatus !== 'Terminated' &&
            sample.sampleStatus !== 'Cancelled' &&
            sample.sampleStatus !== 'rejected' &&
            sample.sampleStatus !== 'Rejected'
          )
          
          if (validSamples.length > 0) {
            const completedSamples = validSamples.filter((sample: any) => 
              sample.sampleStatus === 'completed' || 
              sample.sampleStatus === 'Completed'
            )
            progress = Math.round((completedSamples.length / validSamples.length) * 100)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch testing samples for progress calculation:', e)
      // Fallback to status-based progress if API call fails
      const getProgress = (status: string): number => {
        switch (status.toLowerCase()) {
          case 'draft': return 5
          case 'submitted': return 15
          case 'pending receive': return 25
          case 'in-progress': return 60
          case 'completed': return 100
          case 'rejected': return 0
          case 'terminated': return 0
          case 'cancelled': return 0
          default: return 10
        }
      }
      progress = getProgress(dbRequest.requestStatus)
    }

    // Determine request type from request data or request number
    const getRequestType = (dbRequest: RequestData): string => {
      // Use requestType from API if available
      if (dbRequest.requestType) return dbRequest.requestType
      // Fallback to parsing request number
      const requestNumber = dbRequest.requestNumber
      if (requestNumber.includes('RE-N')) return 'NTR'
      if (requestNumber.includes('ASR')) return 'ASR'
      if (requestNumber.includes('ER')) return 'ER'
      return 'NTR'
    }

    return {
      id: dbRequest.requestNumber,
      requestNumber: dbRequest.requestNumber,
      title: dbRequest.requestTitle,
      type: getRequestType(dbRequest),
      status: dbRequest.requestStatus as any,
      priority: dbRequest.priority || 'normal',
      submittedDate: new Date(dbRequest.createdAt).toLocaleDateString(),
      createdDate: new Date(dbRequest.createdAt),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Default 7 days from creation
      capability,
      progress,
      samples,
      equipment,
      evaluated: dbRequest.isEvaluated || false,
      completedDate: dbRequest.completeDate ? new Date(dbRequest.completeDate).toLocaleDateString() : undefined,
      ioNumber: dbRequest.ioNumber,
      useIoNumber: dbRequest.useIoNumber,
      // ASR-specific fields
      asrType: dbRequest.asrType,
      asrOwnerName: dbRequest.asrOwnerName,
      asrOwnerEmail: dbRequest.asrOwnerEmail,
      problemSource: dbRequest.problemSource,
      expectedResults: dbRequest.expectedResults,
      businessImpact: dbRequest.businessImpact,
      urgencyType: dbRequest.urgencyType,
      urgencyReason: dbRequest.urgencyReason,
      asrEstCompletedDate: dbRequest.asrEstCompletedDate ? new Date(dbRequest.asrEstCompletedDate).toLocaleDateString() : undefined,
      asrMethodology: dbRequest.asrMethodology
    }
  }

  // Fetch capabilities from API
  const fetchCapabilities = async () => {
    try {
      setLoadingCapabilities(true)
      const response = await fetch('/api/capabilities')
      const result = await response.json()

      if (result.success && result.data) {
        console.log('Capabilities data from API:', result.data)
        // Transform capabilities data to dropdown format
        const transformedCapabilities = [
          { id: "all", label: "All" },
          ...result.data.map((capability: any) => ({
            id: capability._id,
            label: capability.capabilityName
          }))
        ]
        setCapabilities(transformedCapabilities)
      } else {
        throw new Error(result.error || 'Failed to fetch capabilities')
      }
    } catch (err) {
      console.error('Error fetching capabilities:', err)
      // Show error - no fallback
      setCapabilities([
        { id: "all", label: "All" }
      ])
      toast.error('Failed to load capabilities')
    } finally {
      setLoadingCapabilities(false)
    }
  }

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Only fetch if user is available
      if (!user?.email) {
        setRequests([])
        return
      }

      // Add user email filter and timestamp to prevent caching
      const response = await fetch(`/api/requests/all?requesterEmail=${encodeURIComponent(user.email)}&t=${Date.now()}`)
      const result = await response.json()

      if (result.success && result.data) {
        console.log('Raw data from API:', result.data)
        const transformedRequests = await Promise.all(
          result.data.map((req: RequestData) => transformRequestData(req))
        )
        console.log('Transformed requests:', transformedRequests)
        setRequests(transformedRequests)
      } else {
        throw new Error(result.error || 'Failed to fetch requests')
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
      toast.error('Failed to load requests from database')
      // Use sample data as fallback
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Load requests, capabilities, and user score on component mount
  useEffect(() => {
    fetchCapabilities()
    
    // Only fetch user-specific data when user is available
    if (user) {
      fetchRequests()
      fetchUserScore()
    }
  }, [user])

  // Update user score when requests are loaded (fallback for when database is unavailable)
  useEffect(() => {
    if (!loading && requests.length > 0) {
      // Only use fallback if we haven't successfully loaded score from API
      if (loadingScore || userScore === 0) {
        fetchUserScore()
      }
    }
  }, [requests, loading])

  // Extract unique IO numbers from requests and fetch expense data
  useEffect(() => {
    if (requests.length > 0) {
      const uniqueIOs = new Set<string>()
      requests.forEach(req => {
        if (req.useIoNumber && req.ioNumber) {
          uniqueIOs.add(req.ioNumber)
        }
      })
      setIoNumbers(Array.from(uniqueIOs).sort())
      
      // Fetch expense data when requests are loaded
      fetchExpenseData()
    }
  }, [requests])

  // Refresh data when returning from edit
  useEffect(() => {
    const handleFocus = () => {
      // Refresh requests when window gains focus (returning from edit)
      fetchRequests()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Calculate summary statistics from real data
  const calculateSummary = () => {
    const currentYear = new Date().getFullYear()
    // Parse dates more carefully and handle different date formats
    const ytdRequests = requests.filter(req => {
      try {
        const reqDate = new Date(req.createdDate)
        return reqDate.getFullYear() === currentYear
      } catch (e) {
        console.warn('Failed to parse date:', req.createdDate)
        return false // Exclude if we can't parse the date for YTD
      }
    })

    return {
      ytdTotal: ytdRequests.length, // Show only current year requests
      inProgress: requests.filter(req => req.status === 'in-progress' || req.status === 'Pending Receive').length,
      completed: requests.filter(req => req.status === 'completed').length,
      terminated: requests.filter(req => req.status === 'terminated' || req.status === 'cancelled' || req.status === 'rejected').length
    }
  }

  const summary = calculateSummary()

  // Filter and search logic
  const filteredRequests = requests.filter(request => {
    // Search filter - search in ID, title, and samples
    const matchesSearch = searchTerm === "" ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.samples.some(sample => sample.toLowerCase().includes(searchTerm.toLowerCase()))

    // Type filter
    const matchesType = selectedType === "all" ||
      request.type.toLowerCase() === selectedType.toLowerCase()

    // Capability filter - match by capability name
    const matchesCapability = selectedCapability === "all" || (() => {
      // Find the selected capability object to get its label
      const selectedCapabilityObj = capabilities.find(cap => cap.id === selectedCapability)
      if (!selectedCapabilityObj) return true

      // Match by capability name (case insensitive)
      return request.capability.toLowerCase().includes(selectedCapabilityObj.label.toLowerCase())
    })()

    // IO filter
    const matchesIO = selectedIOs.has('all') || (() => {
      if (request.useIoNumber && request.ioNumber) {
        return selectedIOs.has(request.ioNumber)
      } else {
        return selectedIOs.has('non-io')
      }
    })()

    // Date filter
    const matchesDate = (() => {
      if (!startDate && !endDate) return true
      const requestDate = request.createdDate
      if (startDate && new Date(startDate) > requestDate) return false
      if (endDate && new Date(endDate) < requestDate) return false
      return true
    })()

    return matchesSearch && matchesType && matchesCapability && matchesIO && matchesDate
  })

  // Pagination functions
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const startIndex = (currentPage - 1) * requestsPerPage
  const endIndex = startIndex + requestsPerPage
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedCapability("all")
    setSelectedIOs(new Set(['all']))
    setStartDate("")
    setEndDate("")
  }

  // Get filter counts for display
  const getFilterCounts = () => {
    return {
      all: requests.length,
      ntr: requests.filter(r => r.type === 'NTR').length,
      asr: requests.filter(r => r.type === 'ASR').length,
      er: requests.filter(r => r.type === 'ER').length
    }
  }

  const filterCounts = getFilterCounts()

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-500"
      case "in-progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "delayed":
        return "bg-red-500"
      case "terminated":
        return "bg-gray-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Handle IO filter changes
  const handleIOFilterChange = (ioId: string, checked: boolean) => {
    const newSelectedIOs = new Set(selectedIOs)
    
    if (ioId === 'all') {
      if (checked) {
        // Select all
        newSelectedIOs.clear()
        newSelectedIOs.add('all')
      } else {
        // Deselect all - select nothing
        newSelectedIOs.clear()
      }
    } else {
      // Remove 'all' if selecting specific IOs
      newSelectedIOs.delete('all')
      
      if (checked) {
        newSelectedIOs.add(ioId)
      } else {
        newSelectedIOs.delete(ioId)
      }
      
      // If all specific IOs are selected, switch to 'all'
      const allSpecificSelected = ioNumbers.every(io => newSelectedIOs.has(io)) && 
                                  newSelectedIOs.has('non-io')
      if (allSpecificSelected) {
        newSelectedIOs.clear()
        newSelectedIOs.add('all')
      }
    }
    
    setSelectedIOs(newSelectedIOs)
  }

  // Handle date range presets
  const handleDatePreset = (preset: string) => {
    const today = new Date()
    let start: Date | null = null
    
    switch (preset) {
      case '30days':
        start = new Date(today)
        start.setDate(start.getDate() - 30)
        break
      case '3months':
        start = new Date(today)
        start.setMonth(start.getMonth() - 3)
        break
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1)
        break
    }
    
    if (start) {
      setStartDate(start.toISOString().split('T')[0])
      setEndDate(today.toISOString().split('T')[0])
    }
  }

  // Notification functions
  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return
    
    try {
      setNotificationLoading(true)
      const response = await fetch(`/api/notifications?userEmail=${encodeURIComponent(user.email)}&limit=10`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationLoading(false)
    }
  }, [user?.email])

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user?.email) return
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'markAsRead'
        })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!user?.email) return
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'markAllAsRead'
        })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const archiveNotification = async (notificationId: string) => {
    if (!user?.email) return
    
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          action: 'archive'
        })
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId))
        // If the archived notification was unread, decrease unread count
        const notification = notifications.find(n => n._id === notificationId)
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error archiving notification:', error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return <AlertCircle className="h-4 w-4 text-red-500" />
    
    switch (type) {
      case 'status_change': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'assignment': return <FileText className="h-4 w-4 text-green-500" />
      case 'deadline': return <Clock className="h-4 w-4 text-orange-500" />
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50'
      case 'high': return 'border-l-orange-500 bg-orange-50'
      case 'medium': return 'border-l-blue-500 bg-blue-50'
      case 'low': return 'border-l-gray-500 bg-gray-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  // Load notifications when user changes
  useEffect(() => {
    if (user?.email) {
      fetchNotifications()
    }
  }, [user?.email, fetchNotifications])

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (user?.email) {
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.email, fetchNotifications])

  // Capabilities are now loaded from database via state

  // HTML generation functions from confirmation page
  const generateRequestTagHTML = (request: any, requestData: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Request Tag - ${request.requestId}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.3; color: #333; background: white; }
            .request-tag { width: 100%; min-height: 100vh; padding: 15px; border: 2px solid #000; display: flex; flex-direction: column; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #333; }
            .logo-section { flex: 1; }
            .logo-section h1 { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 3px; }
            .logo-section p { font-size: 11px; color: #666; }
            .qr-section { width: 80px; height: 80px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 8px; color: #666; }
            .request-info { margin-bottom: 12px; }
            .section-title { font-size: 13px; font-weight: bold; color: #1f2937; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { margin-bottom: 5px; }
            .info-label { color: #6b7280; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .info-value { font-weight: 600; font-size: 11px; margin-top: 1px; }
            .test-methods { margin-bottom: 12px; flex: 1; }
            .method-item { border: 1px solid #d1d5db; border-radius: 3px; padding: 6px; margin-bottom: 6px; background: #f9fafb; }
            .method-name { font-weight: bold; margin-bottom: 3px; font-size: 10px; }
            .sample-list { margin-top: 3px; }
            .sample-item { font-size: 9px; color: #4b5563; margin-bottom: 1px; }
            .lab-info { margin-bottom: 10px; }
            .instructions { margin-bottom: 10px; background: #fef3c7; border: 1px solid #f59e0b; padding: 8px; border-radius: 3px; }
            .instructions-title { font-weight: bold; color: #92400e; margin-bottom: 3px; font-size: 10px; }
            .instructions-text { font-size: 9px; color: #78350f; }
            .footer { border-top: 1px solid #333; padding-top: 6px; margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
            .footer-text { font-size: 8px; color: #666; }
            @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="request-tag">
            <div class="header">
              <div class="logo-section">
                <h1>${request.capability} Laboratory</h1>
                <p>Smart Request Management System</p>
                <p style="margin-top: 10px; font-weight: bold; font-size: 16px;">REQUEST TAG</p>
              </div>
              <div class="qr-section">
                <div>
                  <div style="font-weight: bold; margin-bottom: 5px;">QR CODE</div>
                  <div>${request.requestId}</div>
                </div>
              </div>
            </div>
            
            <div class="request-info">
              <h2 class="section-title">Request Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Request ID</div>
                  <div class="info-value">${request.requestId}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Capability</div>
                  <div class="info-value">${request.capability}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Submission Date</div>
                  <div class="info-value">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Estimated Completion</div>
                  <div class="info-value">${request.estimatedCompletion}</div>
                </div>
              </div>
            </div>
            
            <div class="request-info">
              <h2 class="section-title">Requester Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">${user?.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Department</div>
                  <div class="info-value">${user?.department || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${user?.email || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">User ID</div>
                  <div class="info-value">${user?.id || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div class="test-methods">
              <h2 class="section-title">Test Methods and Samples</h2>
              ${request.methods.map((method: any) => `
                <div class="method-item">
                  <div class="method-name">${method.name}</div>
                  <div class="sample-list">
                    ${method.samples?.map((sample: string) => `
                      <div class="sample-item"><strong>Sample:</strong> ${sample}</div>
                    `).join('') || '<div class="sample-item">No samples specified</div>'}
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="lab-info">
              <h2 class="section-title">Laboratory Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Laboratory</div>
                  <div class="info-value">${request.capability} Laboratory</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Contact</div>
                  <div class="info-value">${request.capabilityInfo?.contactEmail || 'lab@pcrd.com'}</div>
                </div>
              </div>
              <div class="info-item" style="margin-top: 10px;">
                <div class="info-label">Address</div>
                <div class="info-value">${request.capabilityInfo?.address || '123 Laboratory Street, Science District, Bangkok 10400'}</div>
              </div>
            </div>
            
            <div class="instructions">
              <div class="instructions-title">Sample Submission Instructions</div>
              <div class="instructions-text">
                1. Print and attach sample tags to each sample<br>
                2. Package samples securely to prevent damage<br>
                3. Submit samples to the laboratory address above<br>
                4. Contact the laboratory if you have any questions
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
              </div>
              <div class="footer-text">
                ${request.capability} Laboratory Management System
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const generateSampleTagsHTML = (request: any) => {
    // Collect all unique samples with their test methods
    const sampleData: any[] = []
    
    request.methods.forEach((method: any) => {
      method.samples?.forEach((sample: string) => {
        // Find existing sample entry or create new one
        let existingSample = sampleData.find(s => s.fullSampleName === sample)
        if (!existingSample) {
          existingSample = {
            fullSampleName: sample,
            baseSampleName: sample,
            methods: []
          }
          sampleData.push(existingSample)
        }
        
        // Add method to this sample
        existingSample.methods.push(method.name)
      })
    })

    // Remove duplicate methods for each sample
    sampleData.forEach(sample => {
      sample.methods = [...new Set(sample.methods)]
    })

    // Group samples into pages (6 per page)
    const tagsPerPage = 6
    const pages = []
    for (let i = 0; i < sampleData.length; i += tagsPerPage) {
      pages.push(sampleData.slice(i, i + tagsPerPage))
    }

    const pageHTML = pages.map((samplesOnPage, pageIndex) => {
      const currentPageSamples = [...samplesOnPage]
      // Fill remaining slots with empty cards if needed
      while (currentPageSamples.length < tagsPerPage) {
        currentPageSamples.push(null)
      }

      return `
        <div class="tags-page" style="page-break-after: ${pageIndex < pages.length - 1 ? 'always' : 'auto'};">
          <div class="tags-grid">
            ${currentPageSamples.map((sample, index) => {
              if (!sample) {
                return '<div class="tag-card empty-card"></div>'
              }
              
              return `
                <div class="tag-card">
                  <div class="tag-content">
                    <div class="tag-header">
                      <div class="header-left">
                        <div class="lab-name">${request.capability} Lab</div>
                        <div class="request-id">${request.requestId}</div>
                      </div>
                      <div class="qr-section">
                        <div class="qr-placeholder">
                          <div class="qr-text">QR</div>
                          <div class="qr-code">${sample.fullSampleName}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="sample-info">
                      <div class="sample-name">${sample.baseSampleName}</div>
                    </div>
                    
                    <div class="test-methods">
                      <div class="methods-title">Tests:</div>
                      <div class="methods-list">
                        ${sample.methods.slice(0, 4).map((method: string) => `<div class="method-item">${method}</div>`).join('')}
                        ${sample.methods.length > 4 ? `<div class="method-item">+${sample.methods.length - 4} more</div>` : ''}
                      </div>
                    </div>
                    
                    <div class="tag-footer">
                      <div class="generated-date">${new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sample Tags - ${request.requestId}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; color: #333; }
            .tags-page { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .tags-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 5mm; width: 100%; height: 100%; padding: 5mm; }
            .tag-card { position: relative; border: 1px solid #ccc; border-radius: 8px; background: white; display: flex; flex-direction: column; overflow: hidden; aspect-ratio: 1; }
            .empty-card { border: 1px dashed #ddd; }
            .tag-content { padding: 3mm; height: 100%; display: flex; flex-direction: column; }
            .tag-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; padding-bottom: 1mm; border-bottom: 1px solid #eee; }
            .header-left { flex: 1; display: flex; flex-direction: column; }
            .lab-name { font-size: 8px; font-weight: bold; color: #2563eb; margin-bottom: 1mm; }
            .request-id { font-size: 7px; color: #666; font-weight: bold; }
            .qr-section { flex-shrink: 0; }
            .qr-placeholder { width: 18mm; height: 18mm; border: 1px solid #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .qr-text { font-size: 6px; font-weight: bold; color: #666; }
            .qr-code { font-size: 5px; color: #333; margin-top: 1px; word-break: break-all; }
            .sample-info { text-align: center; margin-bottom: 2mm; }
            .sample-name { font-size: 10px; font-weight: bold; color: #333; margin-bottom: 1mm; word-break: break-word; line-height: 1.2; }
            .test-methods { flex: 1; margin-bottom: 2mm; }
            .methods-title { font-size: 8px; font-weight: bold; color: #666; margin-bottom: 1mm; text-transform: uppercase; }
            .methods-list { display: flex; flex-direction: column; gap: 1px; }
            .method-item { font-size: 7px; color: #333; background: #f8f9fa; padding: 1px 3px; border-radius: 2px; line-height: 1.3; text-align: left; }
            .tag-footer { margin-top: auto; text-align: center; padding-top: 1mm; border-top: 1px solid #eee; }
            .generated-date { font-size: 5px; color: #999; }
            @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } .tags-page { height: auto; min-height: 90vh; } }
          </style>
        </head>
        <body>
          ${pageHTML}
        </body>
      </html>
    `
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Optional: Uncomment to use the colorful user info card */}
        {/* <UserInfoCard 
          user={user}
          score={userScore}
          loadingScore={loadingScore}
        /> */}
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2 text-lg font-medium">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span>Score:</span>
            {loadingScore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-bold text-yellow-600">
                {userScore} Evaluations
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-4">
            {/* Filter Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IO Filter Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 overflow-hidden">
                <CardHeader 
                  className="pb-2 flex flex-row items-center justify-between cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => setIoFilterExpanded(!ioFilterExpanded)}
                >
                  <div className="flex flex-row items-center">
                    <div className="mr-2 p-1.5 rounded-full bg-blue-100">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-blue-800">My IO Filter</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-800 hover:bg-blue-200">
                    {ioFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {ioFilterExpanded && (
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {/* Select all option */}
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                          selectedIOs.has('all')
                            ? "bg-blue-500 text-white"
                            : "bg-white hover:bg-blue-100 border border-blue-200"
                        } transition-colors cursor-pointer`}
                      >
                        <Checkbox
                          id="io-all"
                          checked={selectedIOs.has('all')}
                          onCheckedChange={(checked) => handleIOFilterChange('all', checked as boolean)}
                          className={selectedIOs.has('all') ? "text-white border-white" : ""}
                        />
                        <label
                          htmlFor="io-all"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Select all
                        </label>
                      </div>
                      
                      {/* Non-IO option */}
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                          selectedIOs.has('non-io')
                            ? "bg-blue-500 text-white"
                            : "bg-white hover:bg-blue-100 border border-blue-200"
                        } transition-colors cursor-pointer`}
                      >
                        <Checkbox
                          id="io-non-io"
                          checked={selectedIOs.has('non-io')}
                          onCheckedChange={(checked) => handleIOFilterChange('non-io', checked as boolean)}
                          className={selectedIOs.has('non-io') ? "text-white border-white" : ""}
                        />
                        <label
                          htmlFor="io-non-io"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Non-IO
                        </label>
                      </div>
                      
                      {/* Dynamic IO numbers from requests */}
                      {ioNumbers.map((io) => (
                        <div
                          key={io}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                            selectedIOs.has(io)
                              ? "bg-blue-500 text-white"
                              : "bg-white hover:bg-blue-100 border border-blue-200"
                          } transition-colors cursor-pointer`}
                        >
                          <Checkbox
                            id={`io-${io}`}
                            checked={selectedIOs.has(io)}
                            onCheckedChange={(checked) => handleIOFilterChange(io, checked as boolean)}
                            className={selectedIOs.has(io) ? "text-white border-white" : ""}
                          />
                          <label
                            htmlFor={`io-${io}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {io}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Date Period Filter Card */}
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 overflow-hidden">
                <CardHeader 
                  className="pb-2 flex flex-row items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-colors"
                  onClick={() => setPeriodFilterExpanded(!periodFilterExpanded)}
                >
                  <div className="flex flex-row items-center">
                    <div className="mr-2 p-1.5 rounded-full bg-amber-100">
                      <CalendarRange className="h-5 w-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-amber-800">Select Period</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-amber-800 hover:bg-amber-200">
                    {periodFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {periodFilterExpanded && (
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-amber-200">
                          <CalendarDays className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">From</span>
                          <Input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40 border-amber-200 focus-visible:ring-amber-400" 
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-amber-200">
                          <CalendarCheck className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">To</span>
                          <Input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40 border-amber-200 focus-visible:ring-amber-400" 
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleDatePreset('30days')}
                          className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Past 30 days
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDatePreset('3months')}
                          className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Past 3 months
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDatePreset('thisYear')}
                          className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                        >
                          <BarChart4 className="mr-2 h-4 w-4" />
                          This Year
                        </Button>
                        {(startDate || endDate) && (
                          <Button 
                            variant="outline" 
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="bg-white border-red-200 text-red-800 hover:bg-red-100 hover:text-red-900"
                          >
                            Clear Dates
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Request Summary */}
              <div className="md:col-span-4">
                <Card className="h-full bg-gradient-to-r from-green-50 to-teal-50 border-green-200 overflow-hidden">
                  <CardHeader className="pb-2 flex flex-row items-center">
                    <div className="mr-2 p-1.5 rounded-full bg-green-100">
                      <BarChart4 className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-green-800">My REQUEST SUMMARY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-white border border-green-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-lg font-medium text-green-800">YTD {new Date().getFullYear()}</div>
                        <div className="text-3xl font-bold text-green-900">{loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : summary.ytdTotal}</div>
                        <div className="text-sm text-green-700">Total Requests</div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-lg font-medium text-yellow-800">In-progress</div>
                        <div className="text-3xl font-bold text-yellow-900">{loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : summary.inProgress}</div>
                        <div className="text-sm text-yellow-700">Active Requests</div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-lg font-medium text-blue-800">Complete</div>
                        <div className="text-3xl font-bold text-blue-900">{loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : summary.completed}</div>
                        <div className="text-sm text-blue-700">Finished</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-lg font-medium text-gray-800">Terminate</div>
                        <div className="text-3xl font-bold text-gray-900">{loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : summary.terminated}</div>
                        <div className="text-sm text-gray-700">Closed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Card - Compact Design */}
              <div className="md:col-span-1">
                <Card className="h-full bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 overflow-hidden">
                  <CardHeader className="pb-1.5 pt-3 px-3 flex flex-row items-center">
                    <div className="mr-1.5 p-1 rounded-full bg-purple-100">
                      <DollarSign className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <CardTitle className="text-sm font-bold text-purple-800">EXPENSE</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {expenseData.loading ? (
                      <div className="flex flex-col items-center justify-center bg-white p-3 rounded border border-purple-200 min-h-[100px]">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                        <span className="mt-1 text-xs text-purple-700">Loading...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Budget & Spending Row */}
                        <div className="bg-white rounded border border-purple-200 p-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[10px] font-medium text-purple-600 uppercase">Budget</div>
                              <div className="text-sm font-bold text-purple-900">
                                {expenseData.totalBudget > 1000000 
                                  ? `${(expenseData.totalBudget / 1000000).toFixed(1)}M` 
                                  : expenseData.totalBudget > 1000 
                                  ? `${(expenseData.totalBudget / 1000).toFixed(0)}K` 
                                  : expenseData.totalBudget.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-medium text-purple-600 uppercase">Spending</div>
                              <div className="text-sm font-bold text-purple-900">
                                {expenseData.totalSpent > 1000000 
                                  ? `${(expenseData.totalSpent / 1000000).toFixed(1)}M` 
                                  : expenseData.totalSpent > 1000 
                                  ? `${(expenseData.totalSpent / 1000).toFixed(0)}K` 
                                  : expenseData.totalSpent.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar Section */}
                        <div className="bg-white rounded border border-purple-200 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-purple-600 uppercase">Used</span>
                            <span className="text-[10px] font-bold text-purple-900">
                              {expenseData.totalBudget > 0 
                                ? Math.round((expenseData.totalRequestCost / expenseData.totalBudget) * 100)
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={expenseData.totalBudget > 0 ? (expenseData.totalRequestCost / expenseData.totalBudget) * 100 : 0} 
                            className="h-2 w-full bg-purple-100" 
                          />
                          <div className="text-[10px] text-purple-700 mt-1 text-center">
                            {expenseData.totalRequestCost > 1000000 
                              ? `${(expenseData.totalRequestCost / 1000000).toFixed(1)}M` 
                              : expenseData.totalRequestCost > 1000 
                              ? `${(expenseData.totalRequestCost / 1000).toFixed(0)}K` 
                              : expenseData.totalRequestCost.toLocaleString()} THB
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="lg:flex-1">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My REQUESTs</CardTitle>
                  <CardDescription>Track and manage your recent test requests</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/request/new">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Plus className="mr-2 h-4 w-4" />
                      New Request
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, title, or samples..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={showAdvancedFilters ? "bg-blue-50 border-blue-200" : ""}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  {(searchTerm || selectedType !== "all" || selectedCapability !== "all" || 
                    !selectedIOs.has('all') || startDate || endDate) && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <Tabs value={selectedType} onValueChange={setSelectedType} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="all">
                        All ({filterCounts.all})
                      </TabsTrigger>
                      <TabsTrigger value="ntr">
                        NTR ({filterCounts.ntr})
                      </TabsTrigger>
                      <TabsTrigger value="asr">
                        ASR ({filterCounts.asr})
                      </TabsTrigger>
                      <TabsTrigger value="er">
                        ER ({filterCounts.er})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Select value={selectedCapability} onValueChange={setSelectedCapability} disabled={loadingCapabilities}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={loadingCapabilities ? "Loading..." : "Select capability"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCapabilities ? (
                        <SelectItem value="loading" disabled>Loading capabilities...</SelectItem>
                      ) : (
                        capabilities.map((capability) => (
                          <SelectItem key={capability.id} value={capability.id}>
                            {capability.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Advanced Filters</h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowAdvancedFilters(false)}>
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="Pending Receive">Pending Receive</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All priorities</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Date Range</label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This week</SelectItem>
                            <SelectItem value="month">This month</SelectItem>
                            <SelectItem value="quarter">This quarter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                {(searchTerm || selectedType !== "all" || selectedCapability !== "all" || 
                  !selectedIOs.has('all') || startDate || endDate) && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm">
                      <span className="font-medium">{filteredRequests.length}</span> of <span className="font-medium">{requests.length}</span> requests match your filters
                    </div>
                    {filteredRequests.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading requests from database...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-2">Failed to load requests</div>
                      <div className="text-sm text-muted-foreground mb-4">{error}</div>
                      <Button onClick={fetchRequests} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  ) : currentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      {(searchTerm || selectedType !== "all" || selectedCapability !== "all" || 
                        !selectedIOs.has('all') || startDate || endDate) ? (
                        <div>
                          <div className="text-muted-foreground mb-4">
                            No requests match your current filters
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" onClick={clearFilters}>
                              Clear Filters
                            </Button>
                            <Link href="/request/new">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Request
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-muted-foreground mb-4">No requests found</div>
                          <Link href="/request/new">
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Your First Request
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    currentRequests.map((request) => {
                      // Check if request has been in Pending Receive status for more than 3 days
                      const isPendingTooLong = request.status === 'Pending Receive' && 
                        new Date().getTime() - new Date(request.createdDate).getTime() > 3 * 24 * 60 * 60 * 1000;
                      
                      const isAsrRequest = request.type === 'ASR';
                      
                      return (
                      <div key={request.id} className={`flex flex-col space-y-2 rounded-lg border p-4 ${
                        isPendingTooLong ? 'bg-red-50 border-red-300 shadow-md' : ''
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{request.id}</span>
                            <RequestStatusBadge status={request.status} />
                            {request.priority === "high" && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                High Priority
                              </span>
                            )}
                            {request.evaluated && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Evaluated</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <span className="text-sm font-medium">{request.title}</span>
                          {/* Show ASR Type for ASR requests */}
                          {isAsrRequest && (
                            <span className="text-xs text-muted-foreground">
                              ASR Type: {request.asrType || 'Project'} | Owner: {request.asrOwnerName || 'N/A'}
                            </span>
                          )}
                          
                          {/* Warning message for pending too long */}
                          {isPendingTooLong && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-red-100 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-xs text-red-800">
                                ทางหน่วยงานยังไม่ได้รับตัวอย่างโปรดตรวจสอบการส่งตัวอย่างของท่าน
                              </span>
                            </div>
                          )}

                          <div className="mt-2 space-y-3">
                            {/* ASR-specific information */}
                            {isAsrRequest && (
                              <div className="space-y-2 p-2 bg-purple-50 rounded-md">
                                <div className="text-xs">
                                  <span className="font-medium text-purple-700">Problem Source:</span>
                                  <span className="ml-1 text-purple-600">{request.problemSource || 'Not specified'}</span>
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium text-purple-700">Expected Results:</span>
                                  <span className="ml-1 text-purple-600">{request.expectedResults || 'Not specified'}</span>
                                </div>
                                {request.urgencyType && (
                                  <div className="text-xs">
                                    <span className="font-medium text-purple-700">Urgency Type:</span>
                                    <span className="ml-1 text-purple-600">{request.urgencyType.replace(/_/g, ' ')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Samples Section with Expandable Button */}
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">{isAsrRequest ? 'ASR Samples' : 'Samples'}</span>
                                {request.samples.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSamples(request.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    {expandedSamples[request.id] ? (
                                      <>
                                        Hide <ChevronUp className="ml-1 h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show All ({request.samples.length}) <ChevronDown className="ml-1 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1 mt-1">
                                {expandedSamples[request.id] ? (
                                  // Show all samples when expanded
                                  request.samples.map((sample, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                    >
                                      {sample}
                                    </span>
                                  ))
                                ) : (
                                  // Show limited samples when collapsed
                                  <>
                                    {request.samples.slice(0, 2).map((sample, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                      >
                                        {sample}
                                      </span>
                                    ))}
                                    {request.samples.length > 2 && (
                                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        +{request.samples.length - 2} more
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Equipment Section with Expandable Button */}
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Equipment</span>
                                {request.equipment.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleEquipment(request.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    {expandedEquipment[request.id] ? (
                                      <>
                                        Hide <ChevronUp className="ml-1 h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show All ({request.equipment.length}) <ChevronDown className="ml-1 h-3 w-3" />
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1 mt-1">
                                {expandedEquipment[request.id] ? (
                                  // Show all equipment when expanded
                                  request.equipment.map((equipment, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
                                    >
                                      {equipment}
                                    </span>
                                  ))
                                ) : (
                                  // Show limited equipment when collapsed
                                  <>
                                    {request.equipment.slice(0, 2).map((equipment, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10"
                                      >
                                        {equipment}
                                      </span>
                                    ))}
                                    {request.equipment.length > 2 && (
                                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        +{request.equipment.length - 2} more
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                            <span>Submitted: {request.submittedDate}</span>
                            {isAsrRequest ? (
                              <>
                                <span>Est. Completion: {request.asrEstCompletedDate || request.dueDate}</span>
                                {request.completedDate && <span>Completed: {request.completedDate}</span>}
                                <span>Type: ASR - {request.asrType || 'Project'}</span>
                              </>
                            ) : (
                              <>
                                <span>Due: {request.dueDate}</span>
                                {request.completedDate && <span>Completed: {request.completedDate}</span>}
                                <span>Capability: {request.capability}</span>
                              </>
                            )}
                            {request.useIoNumber && request.ioNumber ? (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                IO: {request.ioNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                Non-IO
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!request.evaluated && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleEvaluateRequest(request)}
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Evaluate
                            </Button>
                          )}

                          {/* Show star icon for evaluated requests */}
                          {request.evaluated && (
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-xs ml-1 text-muted-foreground">Evaluated</span>
                            </div>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                              <DropdownMenuItem onClick={() => handleOpenRequestDetails(request)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {!isAsrRequest && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Tag
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handlePrintAllRequest(request.id)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Print All Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePrintSampleTag(request.id)}>
                                      <Printer className="mr-2 h-4 w-4" />
                                      Print Sample Tag
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}
                              {/* Edit Request - Only show for Pending Receive status */}
                              {request.status === "Pending Receive" && (
                                <DropdownMenuItem onClick={() => handleEditRequest(request)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Request
                                </DropdownMenuItem>
                              )}
                              {!isAsrRequest && (
                                <>
                                  <DropdownMenuItem>
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as a request template
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateRequest(request)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate Request
                                  </DropdownMenuItem>
                                </>
                              )}
                              {/* Evaluate my Request - Show for all requests that haven't been evaluated */}
                              {!request.evaluated && (
                                <DropdownMenuItem onClick={() => handleEvaluateRequest(request)} className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Evaluate my Request
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleComplaint(request)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Complaint
                              </DropdownMenuItem>
                              {/* Terminate Request - Only show for Pending Receive status */}
                              {request.status === "Pending Receive" && (
                                <DropdownMenuItem onClick={() => handleTerminateRequest(request)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Terminate Request
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-medium">Progress</span>
                          <span>{request.progress}%</span>
                        </div>
                        <Progress value={request.progress} className="h-2 w-full" />
                      </div>
                    </div>
                    );
                    })
                  )}

                  {/* Pagination Controls */}
                  {!loading && !error && filteredRequests.length > requestsPerPage && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === page
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Show pagination info */}
                  {!loading && !error && filteredRequests.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-96">
            <Card className="h-full sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs hover:bg-gray-100"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <CardDescription>System alerts and status updates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {notificationLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">No notifications</p>
                    <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-3 rounded-lg border transition-all ${
                          !notification.isRead 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium line-clamp-2 ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markNotificationAsRead(notification._id)}
                                  className="h-6 w-6 p-0 ml-1 hover:bg-white/50"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.actionUrl && (
                                  <Link href={notification.actionUrl}>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      {notification.actionText || 'View'}
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => archiveNotification(notification._id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Got it!
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Request details view dialog */}
      {selectedRequestForDetails && (
        <RequestViewDetailsDialog
          requestId={selectedRequestForDetails.id}
          open={viewDetailsDialogOpen}
          onOpenChange={setViewDetailsDialogOpen}
        />
      )}

      {/* ASR details view dialog */}
      {selectedAsrForDetails && (
        <AsrViewDetailsDialog
          asrData={selectedAsrForDetails}
          open={asrDetailsDialogOpen}
          onOpenChange={setAsrDetailsDialogOpen}
        />
      )}

      {/* Evaluation dialog */}
      {selectedRequestForEvaluation && (
        <EvaluationDialog
          open={evaluationDialogOpen}
          onOpenChange={setEvaluationDialogOpen}
          requestId={selectedRequestForEvaluation.id}
          requestTitle={selectedRequestForEvaluation.title}
          userEmail={user?.email}
          onEvaluationComplete={handleEvaluationComplete}
        />
      )}

      {/* ASR Evaluation dialog */}
      {selectedAsrForEvaluation && (
        <AsrEvaluationDialog
          open={asrEvaluationDialogOpen}
          onOpenChange={setAsrEvaluationDialogOpen}
          asrId={selectedAsrForEvaluation.id}
          asrTitle={selectedAsrForEvaluation.title}
          userEmail={user?.email}
          onEvaluationComplete={handleEvaluationComplete}
        />
      )}

      {/* Complaint dialog */}
      {selectedRequestForComplaint && (
        <ComplaintDialog
          open={complaintDialogOpen}
          onOpenChange={setComplaintDialogOpen}
          requestId={selectedRequestForComplaint.id}
          requestNumber={selectedRequestForComplaint.requestNumber}
          requestType={selectedRequestForComplaint.type as "NTR" | "ASR" | "ER"}
          onComplaintSubmitted={() => {
            setComplaintDialogOpen(false)
            toast.success("Complaint submitted successfully")
          }}
        />
      )}

      {/* Terminate dialog */}
      {selectedRequestForTerminate && (
        <TerminateRequestDialog
          open={terminateDialogOpen}
          onOpenChange={setTerminateDialogOpen}
          requestId={selectedRequestForTerminate.id}
          requestNumber={selectedRequestForTerminate.requestNumber}
          onTerminated={() => {
            setTerminateDialogOpen(false)
            toast.success("Request terminated successfully")
            // Refresh the requests
            if (user?.email) {
              fetchUserRequests(user.email)
            }
          }}
        />
      )}
    </DashboardLayout>
  )
}
