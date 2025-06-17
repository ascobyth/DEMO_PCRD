"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  Clock,
  Search,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  Bell,
  Calendar,
  BarChart3,
  Beaker,
  FlaskConical,
  Microscope,
  AlertCircle,
  MessageSquare,
  ClipboardList,
  Layers,
  Users,
  MoreHorizontal,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  PackageOpen,
  Trash2,
  CheckSquare,
  FolderOpen,
} from "lucide-react"

// Import Capability related data
import CAPABILITY_CATEGORIES, {
  getCapabilityIcon,
  matchCapabilityToCategory
} from "@/models/Capability.ts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RequestSummaryDialog } from "@/components/request-summary-dialog"
import { RequestStatusBadge } from "@/components/request-status-badge"
import { SampleReceiveDialog } from "@/components/sample-receive-dialog"
import { RequestViewDetailsDialog } from "@/components/request-view-details-dialog"
import { AsrViewEditDialog } from "@/components/asr-view-edit-dialog"
import { UserHeader } from "@/components/user-header"
import { toast } from "sonner"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Type mapping component
const RequestTypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case "NTR":
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-50 border-blue-200">NTR</Badge>
    case "ASR":
      return <Badge variant="outline" className="bg-purple-50 text-purple-800 hover:bg-purple-50 border-purple-200">ASR</Badge>
    case "ER":
      return <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50 border-green-200">ER</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

export default function NTRRequestManagementPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [capabilityFilter, setCapabilityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("ntr") // Default to NTR
  const [searchQuery, setSearchQuery] = useState("")
  const [equipmentFilter, setEquipmentFilter] = useState("all") // Equipment filter for Testing View
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [asrViewEditDialogOpen, setAsrViewEditDialogOpen] = useState(false)
  const [selectedAsrId, setSelectedAsrId] = useState<string | null>(null)
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{ requestId: string; newStatus: string; requestTitle?: string } | null>(null)
  
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<{ id: string; title: string } | null>(null)
  
  // Operation completed dialog state
  const [operationCompleteDialogOpen, setOperationCompleteDialogOpen] = useState(false)
  const [selectedRequestForOperation, setSelectedRequestForOperation] = useState<any>(null)
  const [inProgressSamples, setInProgressSamples] = useState<any[]>([])
  const [selectedSamplesForComplete, setSelectedSamplesForComplete] = useState<string[]>([])
  
  // Testing sample receive dialog state
  const [testingReceiveDialogOpen, setTestingReceiveDialogOpen] = useState(false)
  const [pendingTestingReceive, setPendingTestingReceive] = useState<{ testingListId: string; sampleName: string; requestNumber: string } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("request")

  // Loading states
  const [loading, setLoading] = useState(true)
  const [batchActionLoading, setBatchActionLoading] = useState(false)

  // State for storing requests from API
  const [requests, setRequests] = useState<any[]>([])
  
  // State for storing testing samples
  const [testingSamples, setTestingSamples] = useState<any[]>([])
  const [testingLoading, setTestingLoading] = useState(false)
  const [uniqueEquipmentNames, setUniqueEquipmentNames] = useState<string[]>([]) // Unique equipment names

  // Capabilities from API
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [capabilityCounts, setCapabilityCounts] = useState<Record<string, number>>({})
  const [grandTotal, setGrandTotal] = useState(0) // Grand total for "All Capabilities"
  // Status counts
  const [pendingCount, setPendingCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [terminatedCount, setTerminatedCount] = useState(0)

  // Fetch requests from API
  const fetchRequests = async () => {
    setLoading(true)
    try {
      console.log('Fetching requests with filters:', {
        status: statusFilter,
        priority: priorityFilter,
        capability: capabilityFilter,
        type: typeFilter,
        search: searchQuery,
        page: currentPage
      });

      const response = await fetch(
        `/api/requests/manage?status=${encodeURIComponent(statusFilter)}&priority=${priorityFilter}&capability=${capabilityFilter}&type=${typeFilter}&search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`
      )
      const data = await response.json()
      
      console.log('API Response:', data);

      if (data.success) {
        console.log('Processing successful API response:', {
          dataLength: data.data?.length,
          grandTotal: data.grandTotal,
          capabilityCounts: data.capabilityCounts,
          capabilities: data.capabilities?.length
        });
        
        // Get basic request data
        const requestsData = data.data || [];

        // For pending receive requests, fetch the sample counts
        if (statusFilter === "pending receive sample" && requestsData.length > 0) {
          const requestsWithSampleCounts = await Promise.all(
            requestsData.map(async (request) => {
              try {
                const samplesResponse = await fetch(`/api/requests/samples?requestId=${request.id}`);
                const samplesData = await samplesResponse.json();

                if (samplesData.success) {
                  const samples = samplesData.data || [];
                  const totalSamples = samples.length;
                  const receivedSamples = samples.filter(
                    (sample) => sample.status !== "Pending Receive"
                  ).length;

                  return {
                    ...request,
                    samplesReceived: receivedSamples,
                    samplesTotal: totalSamples
                  };
                }
                return request;
              } catch (error) {
                console.error(`Error fetching samples for request ${request.id}:`, error);
                return request;
              }
            })
          );

          setRequests(requestsWithSampleCounts);
        } else {
          setRequests(requestsData);
        }

        setTotalPages(data.pagination.pages || 1)
        setTotalCount(data.pagination.total || 0)

        // Update capabilities data
        if (data.capabilities) {
          setCapabilities(data.capabilities)
        }

        // Update capability counts
        if (data.capabilityCounts) {
          setCapabilityCounts(data.capabilityCounts)
        }

        // Update grand total
        if (data.grandTotal !== undefined) {
          setGrandTotal(data.grandTotal)
        } else {
          setGrandTotal(data.pagination?.total || 0);
        }
      } else {
        console.error("Failed to fetch requests:", data.error)
        toast.error("Failed to fetch requests")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Error fetching requests")
    } finally {
      console.log('Setting loading to false...');
      setLoading(false)
      console.log('fetchRequests completed');
    }
  }

  // Fetch testing samples from API
  const fetchTestingSamples = async () => {
    console.log('Fetching testing samples...');
    setTestingLoading(true)
    try {
      const response = await fetch(
        `/api/testing-samples?status=${encodeURIComponent(statusFilter)}&capability=${capabilityFilter}&search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${pageSize}`
      )
      const data = await response.json()
      
      if (data.success) {
        console.log('Testing samples received:', data.data?.length, 'samples');
        if (data.data?.length > 0) {
          console.log('Sample status example:', data.data[0].sampleStatus);
        }
        
        // Extract unique equipment names
        const allSamples = data.data || []
        const equipmentNames = new Set<string>()
        allSamples.forEach((sample: any) => {
          if (sample.equipmentName && sample.equipmentName.trim() !== '') {
            equipmentNames.add(sample.equipmentName)
          }
        })
        setUniqueEquipmentNames(Array.from(equipmentNames).sort())
        
        // Filter by equipment if not "all"
        let filteredSamples = allSamples
        if (equipmentFilter !== "all") {
          filteredSamples = allSamples.filter((sample: any) => 
            sample.equipmentName === equipmentFilter
          )
        }
        
        setTestingSamples(filteredSamples)
        setTotalPages(data.pagination?.pages || 1)
        setTotalCount(filteredSamples.length)
      } else {
        console.error("Failed to fetch testing samples:", data.error)
        toast.error("Failed to fetch testing samples")
      }
    } catch (error) {
      console.error("Error fetching testing samples:", error)
      toast.error("Error fetching testing samples")
    } finally {
      setTestingLoading(false)
    }
  }

  // Fetch status counts
  const fetchStatusCounts = async () => {
    try {
      const pendingResponse = await fetch(`/api/requests/manage?status=pending receive sample&type=all&limit=1`)
      const inProgressResponse = await fetch(`/api/requests/manage?status=in-progress&type=all&limit=1`)
      const completedResponse = await fetch(`/api/requests/manage?status=completed&type=all&limit=1`)
      const rejectedResponse = await fetch(`/api/requests/manage?status=rejected&type=all&limit=1`)
      const terminatedResponse = await fetch(`/api/requests/manage?status=terminated&type=all&limit=1`)

      const pendingData = await pendingResponse.json()
      const inProgressData = await inProgressResponse.json()
      const completedData = await completedResponse.json()
      const rejectedData = await rejectedResponse.json()
      const terminatedData = await terminatedResponse.json()

      setPendingCount(pendingData.pagination?.total || 0)
      setInProgressCount(inProgressData.pagination?.total || 0)
      setCompletedCount(completedData.pagination?.total || 0)
      setRejectedCount(rejectedData.pagination?.total || 0)
      setTerminatedCount(terminatedData.pagination?.total || 0)
    } catch (error) {
      console.error("Error fetching status counts:", error)
      // If API fails, show counts based on current filtered requests
      if (requests.length > 0) {
        setPendingCount(requests.filter(req => req.status.toLowerCase().includes('pending')).length)
        setInProgressCount(requests.filter(req => req.status.toLowerCase().includes('in-progress')).length)
        setCompletedCount(requests.filter(req => req.status.toLowerCase().includes('completed')).length)
        setRejectedCount(requests.filter(req => req.status.toLowerCase().includes('rejected')).length)
        setTerminatedCount(requests.filter(req => req.status.toLowerCase().includes('terminated')).length)
      }
    }
  }

  // Set default capability filter based on user's capabilities
  useEffect(() => {
    if (user?.capabilities && Array.isArray(user.capabilities)) {
      if (user.capabilities.length === 1) {
        // If user has only one capability, set it as default
        const userCapability = user.capabilities[0]
        if (typeof userCapability === 'string') {
          setCapabilityFilter(userCapability)
        } else if (userCapability._id) {
          setCapabilityFilter(userCapability._id)
        }
      } else if (user.capabilities.length > 1) {
        // If user has multiple capabilities, keep it as "all"
        setCapabilityFilter("all")
      }
    }
  }, [user])

  // Fetch data when filters change or tab changes
  useEffect(() => {
    if (activeTab === "request") {
      fetchRequests()
      fetchStatusCounts()
    } else if (activeTab === "testing") {
      fetchTestingSamples()
    }
  }, [statusFilter, priorityFilter, capabilityFilter, typeFilter, currentPage, pageSize, activeTab, equipmentFilter])

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "request") {
        fetchRequests()
      } else if (activeTab === "testing") {
        fetchTestingSamples()
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Filter requests based on active tab (request type)
  const displayRequests = requests

  // Check if we should show checkboxes (when filtering by pending, in-progress, or completed)
  const showCheckboxes = statusFilter === "pending receive sample" || statusFilter === "in-progress" || statusFilter === "completed"

  // Handle checkbox selection
  const toggleSelectRequest = (id: string) => {
    setSelectedRequests((prev) => (prev.includes(id) ? prev.filter((requestId) => requestId !== id) : [...prev, id]))
  }

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedRequests.length === displayRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(displayRequests.map((req) => req.id))
    }
  }

  // Handle batch actions
  const handleBatchAction = async (action: string) => {
    if (selectedRequests.length === 0) return

    setBatchActionLoading(true)
    try {
      // Determine the new status based on the action
      const newStatus = action === "receive" ? "in-progress" :
                          action === "complete" ? "completed" :
                          action === "approve" ? "approved" :
                          action === "reject" ? "rejected" : ""

      if (!newStatus) {
        toast.error("Invalid action")
        return
      }

      const response = await fetch("/api/requests/manage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedRequests,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully updated ${data.data.totalUpdated} requests to ${newStatus}`)

        // Immediately update local state to reflect the change
        setRequests(
          requests.map(req =>
            selectedRequests.includes(req.id) ? { ...req, status: newStatus } : req
          )
        )

        // Update status counts based on the action
        if (action === "receive") {
          setPendingCount(prev => Math.max(0, prev - selectedRequests.length))
          setInProgressCount(prev => prev + selectedRequests.length)
        } else if (action === "complete") {
          setInProgressCount(prev => Math.max(0, prev - selectedRequests.length))
          setCompletedCount(prev => prev + selectedRequests.length)
        } else if (action === "reject") {
          setRejectedCount(prev => prev + selectedRequests.length)
        }

        setSelectedRequests([])
        fetchRequests()
        fetchStatusCounts()
      } else {
        throw new Error(data.error || "Failed to update requests")
      }
    } catch (error) {
      console.error(`Error performing batch action (${action}):`, error)
      toast.error("An error occurred while updating requests")
    } finally {
      setBatchActionLoading(false)
    }
  }

  const handleReceiveAll = () => handleBatchAction("receive")
  const handleCompleteAll = () => handleBatchAction("complete")
  const handleApproveAll = () => handleBatchAction("approve")
  const handleRejectAll = () => handleBatchAction("reject")

  // Handle opening request summary
  const handleOpenRequestSummary = (request: any) => {
    setSelectedRequest(request)
    setSummaryDialogOpen(true)
  }

  // Handle opening request details view
  const handleOpenRequestDetails = (e: React.MouseEvent, request: any) => {
    e.stopPropagation()
    setSelectedRequest(request)
    setViewDetailsDialogOpen(true)
  }

  // Handle opening ASR view/edit dialog
  const handleOpenAsrViewEdit = (request: any) => {
    setSelectedAsrId(request.id)
    setAsrViewEditDialogOpen(true)
  }

  // Handle status change request (show confirmation dialog)
  const handleStatusChangeRequest = (requestId: string, newStatus: string, requestTitle?: string) => {
    setPendingStatusChange({ requestId, newStatus, requestTitle })
    setConfirmDialogOpen(true)
  }

  // Handle confirmed status change
  const handleConfirmedStatusChange = async () => {
    if (!pendingStatusChange) return
    
    const { requestId, newStatus } = pendingStatusChange
    setConfirmDialogOpen(false)
    
    console.log("Updating status for request:", requestId, "to", newStatus);
    
    try {
      // Call API to update status
      const response = await fetch("/api/requests/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Request ${requestId} status updated to ${newStatus}`)
        
        // Update in local state
        setRequests(requests.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)))

        // Update counts based on status change
        const request = requests.find(req => req.id === requestId)
        if (request) {
          const oldStatus = request.status

          // Decrement old status count
          if (oldStatus.toLowerCase().includes('pending')) {
            setPendingCount(prev => Math.max(0, prev - 1))
          } else if (oldStatus.toLowerCase().includes('in-progress')) {
            setInProgressCount(prev => Math.max(0, prev - 1))
          } else if (oldStatus.toLowerCase().includes('completed')) {
            setCompletedCount(prev => Math.max(0, prev - 1))
          } else if (oldStatus.toLowerCase().includes('rejected')) {
            setRejectedCount(prev => Math.max(0, prev - 1))
          } else if (oldStatus.toLowerCase().includes('terminated')) {
            setTerminatedCount(prev => Math.max(0, prev - 1))
          }

          // Increment new status count
          if (newStatus.toLowerCase().includes('pending')) {
            setPendingCount(prev => prev + 1)
          } else if (newStatus.toLowerCase().includes('in-progress')) {
            setInProgressCount(prev => prev + 1)
          } else if (newStatus.toLowerCase().includes('completed')) {
            setCompletedCount(prev => prev + 1)
          } else if (newStatus.toLowerCase().includes('rejected')) {
            setRejectedCount(prev => prev + 1)
          } else if (newStatus.toLowerCase().includes('terminated')) {
            setTerminatedCount(prev => prev + 1)
          }
        }
        
        // Refresh data to ensure consistency
        fetchRequests()
      } else {
        throw new Error(data.error || "Failed to update request status")
      }
    } catch (error) {
      console.error("Error updating request status:", error)
      toast.error("Failed to update request status")
    } finally {
      setPendingStatusChange(null)
    }
  }

  // Handle status change from the summary dialog (backward compatibility)
  const handleStatusChange = (requestId: string, newStatus: string) => {
    handleStatusChangeRequest(requestId, newStatus)
  }

  // Handle testing sample receive request
  const handleTestingReceiveRequest = (testingListId: string, sampleName: string, requestNumber: string) => {
    setPendingTestingReceive({ testingListId, sampleName, requestNumber })
    setTestingReceiveDialogOpen(true)
  }

  // Handle confirmed testing sample receive
  const handleConfirmedTestingReceive = async () => {
    if (!pendingTestingReceive) return
    
    const { testingListId, requestNumber } = pendingTestingReceive
    setTestingReceiveDialogOpen(false)
    
    try {
      // Call API to update testing sample status
      const response = await fetch("/api/testing-samples", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testingListId,
          status: "in-progress",
          receiveDate: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Testing sample ${testingListId} marked as received and in progress`)
        
        // Update local state
        setTestingSamples(
          testingSamples.map((sample) =>
            sample.testingListId === testingListId
              ? { ...sample, sampleStatus: "in-progress", receiveDate: new Date() }
              : sample
          )
        )
        
        // The API already handles updating the request status if all samples are received
        // Just show a message if all samples are now received
        if (data.allReceived) {
          toast.success(`All samples for request ${requestNumber} have been received. Request status updated to in-progress.`)
        }
        
        // Refresh data
        fetchTestingSamples()
      } else {
        throw new Error(data.error || "Failed to update testing sample status")
      }
    } catch (error) {
      console.error("Error updating testing sample status:", error)
      toast.error("Failed to update testing sample status")
    } finally {
      setPendingTestingReceive(null)
    }
  }

  // Handle delete request
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return
    
    const { id, title } = requestToDelete
    setDeleteConfirmOpen(false)
    
    console.log('Attempting to delete request:', { id, title });
    
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log('Delete response:', data);

      if (data.success) {
        toast.success(data.message || `Request ${title} and all associated testing samples have been deleted`)
        
        // Remove from local state
        setRequests(requests.filter(req => req.id !== id))
        
        // Update counts
        fetchStatusCounts()
        
        // Clear selection if the deleted request was selected
        setSelectedRequests(selectedRequests.filter(reqId => reqId !== id))
        
        // Don't refresh immediately - let the UI update reflect the deletion
        // The next manual refresh or navigation will show the correct state
      } else {
        console.error('Delete failed:', data);
        throw new Error(data.error || "Failed to delete request")
      }
    } catch (error) {
      console.error("Error deleting request:", error)
      toast.error("Failed to delete request")
    } finally {
      setRequestToDelete(null)
    }
  }

  // Load In Progress samples for operation complete
  const loadInProgressSamples = async (requestNumber: string) => {
    try {
      const response = await fetch(`/api/testing-samples?requestNumber=${requestNumber}&status=in-progress`)
      const data = await response.json()
      
      if (data.success) {
        setInProgressSamples(data.data || [])
      }
    } catch (error) {
      console.error('Error loading in progress samples:', error)
      toast.error('Failed to load testing samples')
    }
  }

  // Handle opening operation complete dialog
  const handleOpenOperationComplete = async (e: React.MouseEvent, request: any) => {
    e.stopPropagation()
    setSelectedRequestForOperation(request)
    setSelectedSamplesForComplete([])
    await loadInProgressSamples(request.id)
    setOperationCompleteDialogOpen(true)
  }

  // Handle operation complete confirmation
  const handleOperationComplete = async () => {
    if (selectedSamplesForComplete.length === 0) {
      toast.error('Please select at least one sample to complete')
      return
    }
    
    try {
      // Get current user from auth
      const currentUser = user?.name || 'System'
      
      // Update each selected sample
      const updatePromises = selectedSamplesForComplete.map(sampleId => 
        fetch('/api/testing-samples', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testingListId: sampleId,
            status: 'Pending Entry Results',
            operationCompleteDate: new Date().toISOString(),
            operationCompleteBy: currentUser,
          }),
        })
      )
      
      const results = await Promise.all(updatePromises)
      const allSuccessful = results.every(res => res.ok)
      
      if (allSuccessful) {
        toast.success(`Operation completed for ${selectedSamplesForComplete.length} sample(s)`)
        setOperationCompleteDialogOpen(false)
        
        // Refresh the appropriate view
        if (activeTab === "testing") {
          fetchTestingSamples()
        } else {
          fetchRequests()
        }
      } else {
        toast.error('Some samples failed to update')
      }
    } catch (error) {
      console.error('Error completing operation:', error)
      toast.error('Failed to complete operation')
    }
  }

  // Check if request has pending entry results samples
  const [requestsWithPendingEntry, setRequestsWithPendingEntry] = useState<Set<string>>(new Set())

  // Load pending entry results status for requests
  const loadPendingEntryStatus = async () => {
    try {
      const requestNumbers = requests.map(r => r.id)
      const promises = requestNumbers.map(async (requestNumber) => {
        const response = await fetch(`/api/testing-samples?requestNumber=${requestNumber}&status=Pending Entry Results`)
        const data = await response.json()
        return { requestNumber, hasPending: data.data?.length > 0 }
      })
      
      const results = await Promise.all(promises)
      const pendingSet = new Set<string>()
      results.forEach(result => {
        if (result.hasPending) {
          pendingSet.add(result.requestNumber)
        }
      })
      setRequestsWithPendingEntry(pendingSet)
    } catch (error) {
      console.error('Error loading pending entry status:', error)
    }
  }

  // Load pending entry status when requests change
  useEffect(() => {
    if (requests.length > 0) {
      loadPendingEntryStatus()
    }
  }, [requests])

  // Capability icon component
  const CapabilityIcon = ({ capability }: { capability: string }) => {
    if (!capability) return <Beaker className="h-4 w-4 text-gray-600" />;

    const iconName = getCapabilityIcon(capability);

    switch (iconName) {
      case "Layers":
        return <Layers className="h-4 w-4 text-blue-600" />;
      case "Microscope":
        return <Microscope className="h-4 w-4 text-purple-600" />;
      case "FlaskConical":
        return <FlaskConical className="h-4 w-4 text-orange-600" />;
      case "BarChart3":
        return <BarChart3 className="h-4 w-4 text-orange-600" />;
      case "Beaker":
      default:
        return <Beaker className="h-4 w-4 text-green-600" />;
    }
  }

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return <Badge className="bg-red-500 text-white hover:bg-red-600 font-medium px-3">Urgent</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium px-3">Normal</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex flex-col">
        {/* Top navigation */}
        <UserHeader 
          user={user}
        />

        <div className="container px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Management</h1>
              <p className="text-muted-foreground">Manage and track all test requests in the PCRD system</p>
            </div>

            <Button
              onClick={() => {
                fetchRequests()
                fetchStatusCounts()
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Main content area with sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 space-y-4">
              {/* Capability Filter */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg font-medium">Capability Filter</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 px-1">
                    <Button
                      variant={capabilityFilter === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setCapabilityFilter("all")
                        setCurrentPage(1)
                      }}
                    >
                      <Beaker className="mr-2 h-4 w-4" />
                      All Capabilities
                      <Badge className="ml-auto" variant="secondary">
                        {grandTotal}
                      </Badge>
                    </Button>

                    {/* Map through capabilities from API (prioritized), fallback to predefined if API is empty */}
                    {capabilities.length > 0 ? 
                      capabilities.map((cap) => (
                        <Button
                          key={cap.id}
                          variant={capabilityFilter === cap.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setCapabilityFilter(cap.id)
                            setCurrentPage(1)
                          }}
                        >
                          <CapabilityIcon capability={cap.name} />
                          <span className="ml-2">{cap.name}</span>
                          <Badge className="ml-auto" variant="secondary">
                            {capabilityCounts[cap.name] || 0}
                          </Badge>
                        </Button>
                      )) :
                      CAPABILITY_CATEGORIES.map((cap) => (
                        <Button
                          key={cap.id}
                          variant={capabilityFilter === cap.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setCapabilityFilter(cap.id)
                            setCurrentPage(1)
                          }}
                        >
                          <CapabilityIcon capability={cap.name} />
                          <span className="ml-2">{cap.name}</span>
                          <Badge className="ml-auto" variant="secondary">
                            {capabilityCounts[cap.name] || 0}
                          </Badge>
                        </Button>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Status Filter */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg font-medium">Status Filter</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 px-1">
                    {activeTab === "request" ? (
                      // Request view status filters
                      <>
                        <Button
                          variant={statusFilter === "all" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("all")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          All Requests
                          <Badge className="ml-auto" variant="secondary">
                            {totalCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "pending receive sample" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("pending receive sample")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <Clock3 className="mr-2 h-4 w-4 text-yellow-600" />
                          Pending Receive
                          <Badge className="ml-auto" variant="secondary">
                            {pendingCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "in-progress" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("in-progress")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <Clock className="mr-2 h-4 w-4 text-blue-600" />
                          In Progress
                          <Badge className="ml-auto" variant="secondary">
                            {inProgressCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "completed" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("completed")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Completed
                          <Badge className="ml-auto" variant="secondary">
                            {completedCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "rejected" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("rejected")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Rejected
                          <Badge className="ml-auto" variant="secondary">
                            {rejectedCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "terminated" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("terminated")
                            setSelectedRequests([])
                            setCurrentPage(1)
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                          TERMINATED
                          <Badge className="ml-auto" variant="secondary">
                            {terminatedCount}
                          </Badge>
                        </Button>
                      </>
                    ) : (
                      // Testing view status filters
                      <>
                        <Button
                          variant={statusFilter === "all" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("all")
                            setCurrentPage(1)
                          }}
                        >
                          <FlaskConical className="mr-2 h-4 w-4" />
                          All Samples
                          <Badge className="ml-auto" variant="secondary">
                            {totalCount}
                          </Badge>
                        </Button>
                        <Button
                          variant={statusFilter === "Pending Receive" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("Pending Receive")
                            setCurrentPage(1)
                          }}
                        >
                          <PackageOpen className="mr-2 h-4 w-4 text-yellow-600" />
                          Pending Receive
                        </Button>
                        <Button
                          variant={statusFilter === "in-progress" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("in-progress")
                            setCurrentPage(1)
                          }}
                        >
                          <Clock className="mr-2 h-4 w-4 text-blue-600" />
                          In Progress
                        </Button>
                        <Button
                          variant={statusFilter === "Pending Entry Results" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("Pending Entry Results")
                            setCurrentPage(1)
                          }}
                        >
                          <FolderOpen className="mr-2 h-4 w-4 text-orange-600" />
                          Pending Entry Results
                        </Button>
                        <Button
                          variant={statusFilter === "completed" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("completed")
                            setCurrentPage(1)
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Completed
                        </Button>
                        <Button
                          variant={statusFilter === "rejected" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("rejected")
                            setCurrentPage(1)
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Rejected
                        </Button>
                        <Button
                          variant={statusFilter === "terminated" ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setStatusFilter("terminated")
                            setCurrentPage(1)
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                          Terminated
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg font-medium">Priority Filter</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 px-1">
                    <Button
                      variant={priorityFilter === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setPriorityFilter("all")
                        setCurrentPage(1)
                      }}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      All Priorities
                    </Button>
                    <Button
                      variant={priorityFilter === "urgent" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setPriorityFilter("urgent")
                        setCurrentPage(1)
                      }}
                    >
                      <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                      Urgent
                    </Button>
                    <Button
                      variant={priorityFilter === "normal" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setPriorityFilter("normal")
                        setCurrentPage(1)
                      }}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4 text-blue-600" />
                      Normal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/request-management/assign-due">
                      <Calendar className="mr-2 h-4 w-4" />
                      Assign Due Dates
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <RequestTypeBadge type={typeFilter.toUpperCase()} />
                        {statusFilter === "all"
                          ? "All Requests"
                          : statusFilter === "pending receive sample"
                            ? "Pending Requests"
                            : statusFilter === "in-progress"
                              ? "In Progress Requests"
                              : statusFilter === "completed"
                                ? "Completed Requests"
                                : statusFilter === "rejected"
                                  ? "Rejected Requests"
                                  : statusFilter === "approved"
                                    ? "Approved Requests"
                                    : "Requests"}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search requests..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {activeTab === "testing" && (
                        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Filter by Equipment</SelectLabel>
                              <SelectItem value="all">All Equipment</SelectItem>
                              {uniqueEquipmentNames.map((equipment) => (
                                <SelectItem key={equipment} value={equipment}>
                                  {equipment}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Request Type</SelectLabel>
                            <SelectItem value="ntr">NTR</SelectItem>
                            <SelectItem value="asr">ASR</SelectItem>
                            <SelectItem value="er">ER</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full">
                    <Tabs value={activeTab} onValueChange={(value) => {
                      setActiveTab(value)
                      setCurrentPage(1) // Reset to first page when switching tabs
                      setStatusFilter("all") // Reset status filter when switching tabs
                    }} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mx-6 my-2 w-[400px]">
                        <TabsTrigger value="request">Request View</TabsTrigger>
                        <TabsTrigger value="testing">Testing View</TabsTrigger>
                      </TabsList>
                      <TabsContent value="request" className="m-0">
                      {/* Batch action buttons - only show when filtering by pending, in-progress, or completed */}
                      {showCheckboxes && selectedRequests.length > 0 && (
                        <div className="flex items-center justify-between p-4 bg-muted/10 border-b">
                          <div className="text-sm">
                            <span className="font-medium">{selectedRequests.length}</span> requests selected
                          </div>
                          <div className="flex gap-2">
                            {statusFilter === "pending receive sample" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={handleReceiveAll}
                                  disabled={batchActionLoading}
                                >
                                  {batchActionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Clock className="mr-2 h-4 w-4" />
                                  )}
                                  Receive All
                                </Button>
                              </>
                            )}
                            {statusFilter === "in-progress" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={handleCompleteAll}
                                  disabled={batchActionLoading}
                                >
                                  {batchActionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Complete All
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={handleApproveAll}
                                  disabled={batchActionLoading}
                                >
                                  {batchActionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Approve All
                                </Button>
                              </>
                            )}
                            {statusFilter === "completed" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={handleApproveAll}
                                  disabled={batchActionLoading}
                                >
                                  {batchActionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Approve All
                                </Button>
                              </>
                            )}
                            {(statusFilter === "pending receive sample" ||
                              statusFilter === "in-progress" ||
                              statusFilter === "completed") && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleRejectAll}
                                disabled={batchActionLoading}
                              >
                                {batchActionLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject All
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setSelectedRequests([])}>
                              Clear Selection
                            </Button>
                          </div>
                        </div>
                      )}

                      {loading ? (
                        <div className="flex justify-center items-center p-12">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading requests...</p>
                          </div>
                        </div>
                      ) : typeFilter === "ntr" || typeFilter === "asr" ? (
                        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                              <TableRow className="border-b">
                              {showCheckboxes && (
                                <TableHead className="w-[40px]">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      checked={
                                        selectedRequests.length === displayRequests.length && displayRequests.length > 0
                                      }
                                      onCheckedChange={toggleSelectAll}
                                      aria-label="Select all requests"
                                    />
                                  </div>
                                </TableHead>
                              )}
                              <TableHead className="w-[140px] whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Request ID</TableHead>
                              <TableHead className="min-w-[300px] font-semibold text-gray-700 dark:text-gray-300">{typeFilter === "asr" ? "ASR Name" : "Request Title"}</TableHead>
                              <TableHead className="w-[80px] font-semibold text-gray-700 dark:text-gray-300">Type</TableHead>
                              <TableHead className="w-[150px] font-semibold text-gray-700 dark:text-gray-300">Capability</TableHead>
                              <TableHead className="w-[140px] font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                              <TableHead className="w-[90px] font-semibold text-gray-700 dark:text-gray-300">Priority</TableHead>
                              <TableHead className="w-[100px] font-semibold text-gray-700 dark:text-gray-300">{typeFilter === "asr" ? "Required Date" : "Due Date"}</TableHead>
                              <TableHead className="w-[100px] font-semibold text-gray-700 dark:text-gray-300">Progress</TableHead>
                              <TableHead className="w-[80px] text-right font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayRequests.length > 0 ? (
                              displayRequests.map((request) => (
                                <TableRow
                                  key={request.id}
                                  className="hover:bg-muted/50 cursor-pointer transition-colors border-b"
                                  onClick={() => request.type === "ASR" ? handleOpenAsrViewEdit(request) : handleOpenRequestSummary(request)}
                                >
                                  {showCheckboxes && (
                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center">
                                        <Checkbox
                                          checked={selectedRequests.includes(request.id)}
                                          onCheckedChange={() => toggleSelectRequest(request.id)}
                                          aria-label={`Select request ${request.id}`}
                                        />
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell className="font-medium py-4">
                                    <div className="font-semibold text-sm">{request.id}</div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm line-clamp-2">{request.title}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {request.requester}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <RequestTypeBadge type={request.type} />
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <CapabilityIcon capability={request.capability} />
                                        <span className="text-sm font-medium">{request.capability || "-"}</span>
                                      </div>
                                      {request.status.toLowerCase() === "pending receive sample" && request.samplesReceived !== undefined && (
                                        <span className="text-xs bg-blue-50 px-2 py-0.5 rounded-full text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                                          <PackageOpen className="h-3 w-3" />
                                          {request.samplesReceived} / {request.samplesTotal} received
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <RequestStatusBadge status={request.status} />
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <PriorityBadge priority={request.priority} />
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="text-sm">
                                      {request.dueDate || "-"}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex flex-col gap-1">
                                      <Progress value={request.progress} className="h-2 w-full" />
                                      <span className="text-xs text-muted-foreground text-center">{request.progress}%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                      {/* Status-specific action buttons for NTR only */}
                                      {request.type === "NTR" && (
                                        <>
                                          {/* Show operation complete button for in-progress requests */}
                                          {request.status === "in-progress" && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                              title="Complete Operation"
                                              onClick={(e) => handleOpenOperationComplete(e, request)}
                                            >
                                              <CheckSquare className="h-4 w-4" />
                                              <span className="sr-only">Complete Operation</span>
                                            </Button>
                                          )}
                                          {/* Entry results button for requests with pending entry */}
                                          {requestsWithPendingEntry.has(request.id) && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 rounded-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                              title="Entry Results"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                window.location.href = `/request/${request.id}/entry-results`
                                              }}
                                            >
                                              <FolderOpen className="h-4 w-4" />
                                              <span className="sr-only">Entry Results</span>
                                            </Button>
                                          )}
                                          {/* Receive samples button */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                                            title="View & Receive Testing Samples"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setSelectedRequest(request)
                                              setReceiveDialogOpen(true)
                                            }}
                                          >
                                            <PackageOpen className="h-4 w-4" />
                                            <span className="sr-only">View & Receive Testing Samples</span>
                                          </Button>
                                        </>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                          >
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">More actions</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl">
                                          {request.type === "ASR" ? (
                                            <>
                                              <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenAsrViewEdit(request)
                                              }}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                View & Edit ASR
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuLabel className="text-xs text-muted-foreground">Create Test Request</DropdownMenuLabel>
                                              <DropdownMenuItem asChild>
                                                <Link href={`/request/new/ntr?asrId=${request.id}&asrNumber=${request.asrNumber}`}>
                                                  <Beaker className="h-4 w-4 mr-2" />
                                                  Create NTR
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link href={`/request/new/er?asrId=${request.id}&asrNumber=${request.asrNumber}`}>
                                                  <Microscope className="h-4 w-4 mr-2" />
                                                  Create ER
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleStatusChange(request.id, "rejected")
                                                }}
                                              >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject ASR
                                              </DropdownMenuItem>
                                            </>
                                          ) : (
                                            <>
                                              <DropdownMenuItem onClick={(e) => handleOpenRequestDetails(e, request)}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link href={`/request/${request.id}`}>
                                                  <FileText className="h-4 w-4 mr-2" />
                                                  Edit Request
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem asChild>
                                                <Link href={`/results-repository/${request.id}`}>
                                                  <BarChart3 className="h-4 w-4 mr-2" />
                                                  View Results
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleStatusChange(request.id, "rejected")
                                                }}
                                              >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Request
                                              </DropdownMenuItem>
                                            </>
                                          )}
                                          {isAdmin && (
                                            <>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setRequestToDelete({ id: request.id, title: request.title })
                                                  setDeleteConfirmOpen(true)
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete {request.type}
                                              </DropdownMenuItem>
                                            </>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={showCheckboxes ? 10 : 9} className="text-center py-10">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-lg font-medium">No requests found</p>
                                    <p className="text-muted-foreground">
                                      {searchQuery
                                        ? `No requests match "${searchQuery}"`
                                        : "Try changing your filters to see more requests"}
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        </div>
                      ) : typeFilter === "er" ? (
                        <div className="flex flex-col items-center justify-center py-16 px-8">
                          <div className="rounded-full bg-green-50 p-4 mb-4">
                            <Microscope className="h-12 w-12 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">ER (Equipment Request)</h3>
                          <p className="text-muted-foreground text-center max-w-md mb-4">
                            Equipment reservation management is currently under development. This view will allow you to manage equipment bookings and schedules.
                          </p>
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            Coming Soon
                          </Badge>
                        </div>
                      ) : null}

                      {/* Pagination - show for NTR and ASR types */}
                      {(typeFilter === "ntr" || typeFilter === "asr") && displayRequests.length > 0 && totalPages > 1 && (
                        <div className="py-4 px-6 border-t flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1} to{" "}
                            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} requests
                          </div>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                                />
                              </PaginationItem>

                              {/* Generate page numbers */}
                              {(() => {
                                const pages: number[] = [];
                                const maxNumbers = Math.min(5, totalPages);
                                let start = Math.max(1, currentPage - 2);
                                let end = start + maxNumbers - 1;

                                if (end > totalPages) {
                                  end = totalPages;
                                  start = Math.max(1, end - maxNumbers + 1);
                                }

                                for (let p = start; p <= end; p++) {
                                  pages.push(p);
                                }

                                const items = [] as JSX.Element[];

                                if (start > 1) {
                                  items.push(
                                    <PaginationItem key={1}>
                                      <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
                                        1
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                  if (start > 2) {
                                    items.push(
                                      <PaginationItem key="start-ellipsis">
                                        <span className="p-2">...</span>
                                      </PaginationItem>
                                    );
                                  }
                                }

                                items.push(
                                  ...pages.map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))
                                );

                                if (end < totalPages) {
                                  if (end < totalPages - 1) {
                                    items.push(
                                      <PaginationItem key="end-ellipsis">
                                        <span className="p-2">...</span>
                                      </PaginationItem>
                                    );
                                  }
                                  items.push(
                                    <PaginationItem key={totalPages}>
                                      <PaginationLink
                                        onClick={() => setCurrentPage(totalPages)}
                                        isActive={currentPage === totalPages}
                                      >
                                        {totalPages}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }

                                return items;
                              })()}

                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={currentPage === totalPages}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </TabsContent>

                      <TabsContent value="testing" className="m-0">
                        {testingLoading ? (
                          <div className="flex justify-center items-center p-12">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-muted-foreground">Loading testing samples...</p>
                            </div>
                          </div>
                        ) : typeFilter === "ntr" ? (
                          <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="w-[110px]">Request No.</TableHead>
                                <TableHead className="w-[60px]">Priority</TableHead>
                                <TableHead className="w-[120px]">Sample Name</TableHead>
                                <TableHead className="w-[100px]">Testing Method</TableHead>
                                <TableHead className="w-[180px]">Additional Requirements</TableHead>
                                <TableHead className="w-[90px]">Equipment</TableHead>
                                <TableHead className="w-[90px]">Capability</TableHead>
                                <TableHead className="w-[80px]">Status</TableHead>
                                <TableHead className="w-[80px]">Receive Date</TableHead>
                                <TableHead className="w-[80px]">Due Date</TableHead>
                                <TableHead className="w-[80px]">First Planned</TableHead>
                                <TableHead className="w-[60px] text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testingSamples.length > 0 ? (
                                testingSamples.map((sample) => (
                                  <TableRow key={sample.testingListId} className="hover:bg-muted/30">
                                    <TableCell className="font-medium text-xs">{sample.requestNumber}</TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant={sample.priority === 'urgent' ? 'destructive' : 'secondary'}
                                        className="text-xs px-1.5 py-0"
                                      >
                                        {sample.priority === 'urgent' ? 'URG' : 'NRM'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-medium text-xs truncate max-w-[120px]" title={sample.sampleName}>
                                        {sample.sampleName}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs truncate max-w-[100px]" title={sample.methodCode || "-"}>
                                        {sample.methodCode || "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="max-w-[180px]">
                                        {sample.testingRemark ? (
                                          <div className="flex items-center gap-1">
                                            {sample.fullSampleName && sample.fullSampleName.match(/_R(\d+)$/) && (
                                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1 py-0 shrink-0">
                                                R{sample.fullSampleName.match(/_R(\d+)$/)?.[1]}
                                              </Badge>
                                            )}
                                            <div className="text-xs text-gray-700 truncate" title={sample.testingRemark}>
                                              {sample.testingRemark}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            {sample.fullSampleName && sample.fullSampleName.match(/_R(\d+)$/) && (
                                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1 py-0 shrink-0">
                                                R{sample.fullSampleName.match(/_R(\d+)$/)?.[1]}
                                              </Badge>
                                            )}
                                            <span className="text-muted-foreground text-xs">-</span>
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs truncate max-w-[90px]" title={sample.equipmentName || "-"}>
                                        {sample.equipmentName || "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs truncate max-w-[90px]" title={sample.capabilityName || "-"}>
                                        {sample.capabilityName || "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <RequestStatusBadge status={sample.sampleStatus} />
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs">
                                        {sample.receiveDate ? new Date(sample.receiveDate).toLocaleDateString('en-GB').replace(/\//g, '/') : "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs">
                                        {sample.actualDueDate ? new Date(sample.actualDueDate).toLocaleDateString('en-GB').replace(/\//g, '/') : "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-xs">
                                        {sample.firstDueDate ? new Date(sample.firstDueDate).toLocaleDateString('en-GB').replace(/\//g, '/') : "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        {/* Show receive icon for pending samples */}
                                        {sample.sampleStatus === "Pending Receive" && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded text-green-600 hover:text-green-700 hover:bg-green-50"
                                            title="Receive Test Sample"
                                            onClick={() => {
                                              handleTestingReceiveRequest(sample.testingListId, sample.sampleName, sample.requestNumber)
                                            }}
                                          >
                                            <PackageOpen className="h-3 w-3" />
                                          </Button>
                                        )}
                                        {/* Show operation complete icon for in-progress samples */}
                                        {(sample.sampleStatus === "In Progress" || sample.sampleStatus === "in-progress" || sample.sampleStatus === "In progress") && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title={`Complete Operation`}
                                            onClick={() => {
                                              console.log('Operation complete clicked for sample:', sample.testingListId, 'Status:', sample.sampleStatus);
                                              // Set single sample for operation complete
                                              setSelectedSamplesForComplete([sample.testingListId])
                                              setInProgressSamples([sample])
                                              setOperationCompleteDialogOpen(true)
                                            }}
                                          >
                                            <CheckSquare className="h-3 w-3" />
                                          </Button>
                                        )}
                                        {/* Show entry results icon for pending entry results samples */}
                                        {sample.sampleStatus === "Pending Entry Results" && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            title="Entry Results"
                                            onClick={() => {
                                              window.location.href = `/request/${sample.requestNumber}/entry-results`
                                            }}
                                          >
                                            <FolderOpen className="h-3 w-3" />
                                          </Button>
                                        )}
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded">
                                              <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl">
                                            <DropdownMenuItem>
                                              <FileText className="h-4 w-4 mr-2" />
                                              View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <Clock className="h-4 w-4 mr-2" />
                                              Update Status
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                              <BarChart3 className="h-4 w-4 mr-2" />
                                              Enter Results
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={11} className="text-center py-10">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <FlaskConical className="h-8 w-8 text-muted-foreground" />
                                      <p className="text-lg font-medium">No testing samples found</p>
                                      <p className="text-muted-foreground">
                                        {searchQuery
                                          ? `No testing samples match "${searchQuery}"`
                                          : "Try changing your filters to see more testing samples"}
                                      </p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                          </div>
                        ) : typeFilter === "asr" ? (
                          <div className="flex flex-col items-center justify-center py-16 px-8">
                            <div className="rounded-full bg-purple-50 p-4 mb-4">
                              <FlaskConical className="h-12 w-12 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">ASR Testing View</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-4">
                              Testing sample management for ASR requests is currently under development.
                            </p>
                            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                              Coming Soon
                            </Badge>
                          </div>
                        ) : typeFilter === "er" ? (
                          <div className="flex flex-col items-center justify-center py-16 px-8">
                            <div className="rounded-full bg-green-50 p-4 mb-4">
                              <Beaker className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">ER Testing View</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-4">
                              Equipment testing management is currently under development.
                            </p>
                            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                              Coming Soon
                            </Badge>
                          </div>
                        ) : null}

                        {/* Pagination for testing view - only show for NTR */}
                        {typeFilter === "ntr" && testingSamples.length > 0 && totalPages > 1 && (
                          <div className="py-4 px-6 border-t flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Showing {(currentPage - 1) * pageSize + 1} to{" "}
                              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} testing samples
                            </div>
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                  />
                                </PaginationItem>
                                {/* Reuse the same pagination logic from request view */}
                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Request summary dialog */}
      {selectedRequest && (
        <RequestSummaryDialog
          request={selectedRequest}
          open={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Sample receive dialog */}
      {selectedRequest && (
        <SampleReceiveDialog
          requestId={selectedRequest.id}
          open={receiveDialogOpen}
          onOpenChange={setReceiveDialogOpen}
          onSamplesReceived={handleStatusChange}
        />
      )}

      {/* Request details view dialog */}
      {selectedRequest && (
        <RequestViewDetailsDialog
          requestId={selectedRequest.id}
          open={viewDetailsDialogOpen}
          onOpenChange={setViewDetailsDialogOpen}
        />
      )}

      {/* ASR view/edit dialog */}
      {selectedAsrId && (
        <AsrViewEditDialog
          asrId={selectedAsrId}
          open={asrViewEditDialogOpen}
          onOpenChange={setAsrViewEditDialogOpen}
          onUpdate={() => {
            fetchRequests()
            fetchStatusCounts()
          }}
        />
      )}

      {/* Status change confirmation dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {pendingStatusChange && (
                  <>
                    Are you sure you want to change the status of request <strong>{pendingStatusChange.requestId}</strong>
                    {pendingStatusChange.requestTitle && (
                      <> - "{pendingStatusChange.requestTitle}"</>
                    )}
                    {' '}to <strong>{pendingStatusChange.newStatus}</strong>?
                    {pendingStatusChange.newStatus === "in-progress" && (
                      <div className="mt-2 text-sm">
                        This will also update all testing samples associated with this request to "In Progress" status.
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedStatusChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Testing sample receive confirmation dialog */}
      <AlertDialog open={testingReceiveDialogOpen} onOpenChange={setTestingReceiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Receive Test Sample</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {pendingTestingReceive && (
                  <>
                    Are you sure you want to receive the test sample <strong>{pendingTestingReceive.sampleName}</strong> 
                    {' '}(ID: {pendingTestingReceive.testingListId})?
                    <div className="mt-2 text-sm">
                      This will mark the sample as received and change its status to "In Progress".
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Request: {pendingTestingReceive.requestNumber}
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTestingReceive(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedTestingReceive}>
              Receive Sample
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {requestToDelete && (
                  <>
                    <div className="text-red-600 font-medium">
                      Warning: This action cannot be undone!
                    </div>
                    <div className="mt-2">
                      Are you sure you want to delete the request <strong>"{requestToDelete.title}"</strong>?
                    </div>
                    <div className="mt-2 text-sm">
                      This will permanently delete:
                      <ul className="list-disc pl-5 mt-1">
                        <li>The request record</li>
                        <li>All associated testing samples</li>
                        <li>All related data and history</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Operation Complete Dialog */}
      <Dialog open={operationCompleteDialogOpen} onOpenChange={setOperationCompleteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Operation</DialogTitle>
            <DialogDescription>
              {inProgressSamples.length === 1 
                ? 'Confirm operation completion for this testing sample. This will update its status to "Pending Entry Results".'
                : 'Select testing samples to mark as operation completed. This will update their status to "Pending Entry Results".'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {inProgressSamples.length === 0 ? (
              <div className="text-center py-8">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No in-progress testing samples found for this request.</p>
              </div>
            ) : (
              <>
                <div className="bg-muted/20 p-3 rounded-md flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedSamplesForComplete.length} of {inProgressSamples.length} samples selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedSamplesForComplete.length === inProgressSamples.length) {
                        setSelectedSamplesForComplete([])
                      } else {
                        setSelectedSamplesForComplete(inProgressSamples.map(s => s.testingListId))
                      }
                    }}
                  >
                    {selectedSamplesForComplete.length === inProgressSamples.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {inProgressSamples.map((sample) => (
                    <Card key={sample.testingListId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedSamplesForComplete.includes(sample.testingListId)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSamplesForComplete([...selectedSamplesForComplete, sample.testingListId])
                              } else {
                                setSelectedSamplesForComplete(selectedSamplesForComplete.filter(id => id !== sample.testingListId))
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{sample.sampleName}</p>
                              {sample.fullSampleName?.match(/_R(\d+)$/) && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                  #{sample.fullSampleName.match(/_R(\d+)$/)?.[1]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Test Method: {sample.methodCode} • Sample ID: {sample.sampleId}
                            </p>
                            {sample.testingRemark && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Additional Requirements: {sample.testingRemark}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Received: {sample.receiveDate ? new Date(sample.receiveDate).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Status: {sample.sampleStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOperationCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleOperationComplete}
              disabled={selectedSamplesForComplete.length === 0}
            >
              Complete Operation ({selectedSamplesForComplete.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}