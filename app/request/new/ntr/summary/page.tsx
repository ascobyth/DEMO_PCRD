"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronDown, ChevronUp, CalendarIcon, Plus, X, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { SampleSelectionList } from "@/components/sample-selection-list"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RequestSummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editRequestId = searchParams.get('edit')
  const duplicateRequestId = searchParams.get('duplicate')
  const isEditMode = !!editRequestId
  const isDuplicateMode = !!duplicateRequestId
  const { user } = useAuth()

  // State for form data
  const [formData, setFormData] = useState({
    requestTitle: "",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "",
    costCenter: ""
  })

  // State for samples
  const [samples, setSamples] = useState<any[]>([])

  // State for test methods
  const [testMethods, setTestMethods] = useState<any[]>([])

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for expanded methods - all expanded by default
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(new Set())

  // State for deselected samples
  const [deselectedSamples, setDeselectedSamples] = useState<Record<string, string[]>>({})

  // State for sample priorities and requirements
  const [samplePriorities, setSamplePriorities] = useState<Record<string, Record<string, 'normal' | 'urgent'>>>({})
  const [sampleRequirements, setSampleRequirements] = useState<Record<string, Record<string, string>>>({})

  // State for global priority
  const [globalPriority, setGlobalPriority] = useState<'normal' | 'urgent'>('normal')
  
  // State for urgent completion date
  const [urgentCompletionDate, setUrgentCompletionDate] = useState<Date>()

  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // State for keywords
  const [keywords, setKeywords] = useState<Array<{id: string, text: string, active: boolean}>>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [showKeywordInput, setShowKeywordInput] = useState(false)

  // State for urgent memo dialog
  const [showUrgentMemoDialog, setShowUrgentMemoDialog] = useState(false)
  const [urgentMemo, setUrgentMemo] = useState({
    urgencyType: '',
    urgencyReason: '',
    approver: ''
  })
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null)
  
  // State for approvers
  const [approvers, setApprovers] = useState<Array<{value: string, label: string}>>([])
  const [loadingApprovers, setLoadingApprovers] = useState(false)


  // Load data from localStorage
  useEffect(() => {
    // Load form data
    const savedFormData = localStorage.getItem("ntrFormData")
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData)
      setFormData(parsedFormData)
    }

    // Load samples
    const savedSamples = localStorage.getItem("ntrSamples")
    if (savedSamples) {
      setSamples(JSON.parse(savedSamples))
    }

    // Load test methods
    const savedTestMethods = localStorage.getItem("ntrTestMethods")
    if (savedTestMethods) {
      const parsedMethods = JSON.parse(savedTestMethods)
      setTestMethods(parsedMethods)
      
      // Expand all methods by default
      const allMethodIds = new Set(parsedMethods.map((m: any) => m.id))
      setExpandedMethods(allMethodIds)
    }

    // Load deselected samples
    const savedDeselectedSamples = localStorage.getItem("ntrDeselectedSamples")
    if (savedDeselectedSamples) {
      setDeselectedSamples(JSON.parse(savedDeselectedSamples))
    }

    // Load sample priorities
    const savedPriorities = localStorage.getItem("ntrSamplePriorities")
    if (savedPriorities) {
      setSamplePriorities(JSON.parse(savedPriorities))
    }

    // Load sample requirements
    const savedRequirements = localStorage.getItem("ntrSampleRequirements")
    if (savedRequirements) {
      setSampleRequirements(JSON.parse(savedRequirements))
    }

    // Load global priority
    const savedGlobalPriority = localStorage.getItem("ntrGlobalPriority")
    if (savedGlobalPriority) {
      setGlobalPriority(savedGlobalPriority as 'normal' | 'urgent')
    }

    // Load urgent completion date
    const savedUrgentDate = localStorage.getItem("ntrUrgentCompletionDate")
    if (savedUrgentDate) {
      setUrgentCompletionDate(new Date(savedUrgentDate))
    }

    // Load keywords
    const savedKeywords = localStorage.getItem("ntrKeywords")
    if (savedKeywords) {
      setKeywords(JSON.parse(savedKeywords))
    }
  }, [])

  // Check if any sample has urgent priority
  const hasAnyUrgentSample = () => {
    if (globalPriority === 'urgent') return true
    
    for (const method of testMethods) {
      if (method.selected || method.instances.length > 0) {
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

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoadingApprovers(true)
        const res = await fetch("/api/admin/users")
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`)
        const data = await res.json()
        
        // Check if data is an array or has a data property
        const users = Array.isArray(data) ? data : data.data || []
        
        // Filter users who are approvers
        const approversList = users
          .filter((user: any) => user.isApprover === true)
          .map((user: any) => ({
            value: user.email,
            label: user.name
          }))
        
        setApprovers(approversList)
      } catch (error) {
        console.error("Failed to fetch approvers:", error)
      } finally {
        setLoadingApprovers(false)
      }
    }

    // Only fetch if showing urgent dialog
    if (showUrgentMemoDialog) {
      fetchApprovers()
    }
  }, [showUrgentMemoDialog])

  // Count selected methods
  const selectedMethodsCount = testMethods.filter(
    method => method.selected || method.instances.length > 0
  ).length

  // Handle submit
  const handleSubmit = async () => {
    // Check if there are any urgent items and urgent memo not filled
    if (hasAnyUrgentSample() && (!urgentMemo.urgencyType || !urgentMemo.urgencyReason || !urgentMemo.approver)) {
      // Show urgent memo dialog
      setShowUrgentMemoDialog(true)
      return
    }

    // Proceed with submission
    await submitRequest()
  }

  // Actual submission function
  const submitRequest = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare request data matching the API expectations
      const requestPayload = pendingSubmitData || {
        // Core request information
        requestTitle: formData.requestTitle,
        priority: globalPriority || formData.priority || 'normal',
        useIONumber: formData.useIONumber,
        ioNumber: formData.ioNumber,
        costCenter: formData.costCenter,
        
        // Samples and test methods
        samples: samples,
        testMethods: testMethods.filter(m => m.selected || m.instances.length > 0),
        
        // Priority and requirements
        samplePriorities,
        sampleRequirements,
        urgentCompletionDate,
        
        // Urgent request details - use urgentMemo state if available
        urgentType: urgentMemo.urgencyType || formData.urgencyType || '',
        urgencyReason: urgentMemo.urgencyReason || formData.urgencyReason || '',
        approver: urgentMemo.approver || formData.approver || null,
        
        // Requester information
        requesterName: user?.name || user?.username || '[Unknown User]',
        requesterEmail: user?.email || '[no-email-provided]',
        
        // On behalf information
        isOnBehalf: formData.isOnBehalf || false,
        onBehalfOfName: formData.onBehalfOfName || '',
        onBehalfOfEmail: formData.onBehalfOfEmail || '',
        onBehalfOfCostCenter: formData.onBehalfOfCostCenter || '',
        
        // Additional data
        keywords: keywords.filter(k => k.active),
        userId: user?.id,
        userDepartment: user?.department,
      }

      // Make API call
      const response = await fetch('/api/requests/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to submit request'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit request')
      }

      // Clear localStorage
      localStorage.removeItem("ntrFormData")
      localStorage.removeItem("ntrFormData_persistent")
      localStorage.removeItem("ntrSamples")
      localStorage.removeItem("ntrTestMethods")
      localStorage.removeItem("ntrDeselectedSamples")
      localStorage.removeItem("ntrSamplePriorities")
      localStorage.removeItem("ntrSampleRequirements")
      localStorage.removeItem("ntrGlobalPriority")
      localStorage.removeItem("ntrUrgentCompletionDate")
      localStorage.removeItem("ntrKeywords")

      // Get the first request number for the toast message
      const firstRequestNumber = result.data.requestNumbers?.[0] || 'N/A'
      const requestCount = result.data.requestNumbers?.length || 1

      toast({
        title: "Request submitted successfully",
        description: requestCount > 1
          ? `Your ${requestCount} requests have been submitted. Primary request: ${firstRequestNumber}`
          : `Your request ${firstRequestNumber} has been submitted.`,
      })

      // Store the request numbers in localStorage for the confirmation page
      if (result.data.requestNumbers) {
        localStorage.setItem('submittedRequestNumbers', JSON.stringify(result.data.requestNumbers))
      }
      if (result.data.requestIds) {
        localStorage.setItem('submittedRequestIds', JSON.stringify(result.data.requestIds))
      }

      // Redirect to confirmation page
      router.push('/request/new/ntr/confirmation')
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => router.push('/request/new/ntr/test-methods')}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Test Methods
          </Button>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-2 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Request Summary</h1>
            <p className="text-muted-foreground">
              Review your request details before submission
            </p>
          </div>
          
          {isSidebarCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Show Summary
            </Button>
          )}
        </div>

        <div className={`grid gap-6 ${isSidebarCollapsed ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
          <div className={`${isSidebarCollapsed ? 'md:col-span-1' : 'md:col-span-2'} space-y-6`}>
            {/* Global Priority Selection */}
            {selectedMethodsCount > 0 && (
              <>
                <div className="mb-6 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="p-5">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Whole Request Prioritization:</Label>
                        <RadioGroup
                          value={globalPriority}
                          disabled={true}
                          className="flex items-center gap-3"
                        >
                          <div className="flex items-center space-x-2 px-3 py-1 rounded-md">
                            <RadioGroupItem value="normal" id="global-normal" className="border-gray-400" disabled />
                            <Label htmlFor="global-normal" className="text-sm font-normal select-none">
                              Normal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 px-3 py-1 rounded-md">
                            <RadioGroupItem value="urgent" id="global-urgent" className="border-red-500 text-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" disabled />
                            <Label htmlFor="global-urgent" className="text-sm font-normal text-red-600 select-none">
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
                                    "w-[180px] h-8 justify-start text-left font-normal border-red-300 bg-white",
                                    !urgentCompletionDate && "text-muted-foreground"
                                  )}
                                  disabled={true}
                                >
                                  <CalendarIcon className="mr-2 h-3 w-3 text-red-500" />
                                  {urgentCompletionDate ? (
                                    <span className="text-sm">{format(urgentCompletionDate, "PPP")}</span>
                                  ) : (
                                    <span className="text-sm">Not selected</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Selected Test Methods</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
                            <div key={method.id} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                                      {method.methodcode || 'N/A'}
                                    </Badge>
                                    <span className="font-medium">{method.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      ({(() => {
                                        let totalSamples = 0;
                                        
                                        if (method.selected) {
                                          totalSamples += method.samples.filter(
                                            sample => !deselectedSamples[method.id]?.includes(sample)
                                          ).length;
                                        }
                                        
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
                                      let hasUrgent = false;
                                      
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
                                        const normalPrice = typeof method.price === 'string' 
                                          ? parseFloat(method.price.replace(/,/g, '')) 
                                          : Number(method.price) || 0;
                                        const urgentPrice = method.priorityPrice 
                                          ? (typeof method.priorityPrice === 'string' 
                                            ? parseFloat(method.priorityPrice.replace(/,/g, '')) 
                                            : Number(method.priorityPrice))
                                          : normalPrice;
                                        
                                        let totalCost = 0;
                                        
                                        if (method.selected) {
                                          const activeSamples = method.samples.filter(
                                            sample => !deselectedSamples[method.id]?.includes(sample)
                                          );
                                          
                                          activeSamples.forEach(sample => {
                                            const sampleKey = `${method.id}-${sample}`;
                                            const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                                            const samplePrice = samplePriority === 'urgent' ? urgentPrice : normalPrice;
                                            totalCost += samplePrice;
                                          });
                                        }
                                        
                                        method.instances.forEach((instance, index) => {
                                          const instanceKey = `${method.id}-instance-${index}`;
                                          const activeSamples = instance.samples.filter(
                                            sample => !deselectedSamples[instanceKey]?.includes(sample)
                                          );
                                          
                                          activeSamples.forEach(sample => {
                                            const sampleKey = `${method.id}-instance-${index}-${sample}`;
                                            const samplePriority = samplePriorities[method.id]?.[sampleKey] || globalPriority;
                                            const samplePrice = samplePriority === 'urgent' ? urgentPrice : normalPrice;
                                            totalCost += samplePrice;
                                          });
                                        });
                                        
                                        return totalCost.toLocaleString('en-US');
                                      })()} THB
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
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (isExpanded) {
                                        expandedMethods.delete(method.id);
                                      } else {
                                        expandedMethods.add(method.id);
                                      }
                                      setExpandedMethods(new Set(expandedMethods));
                                    }}
                                    className="h-8 w-8"
                                    disabled={isSubmitting}
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
                                    className="text-red-500 hover:text-red-700"
                                    disabled={true}
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
                                            disabled={true}
                                            autoComplete="off"
                                          />
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={true}
                                          >
                                            Apply to all
                                          </Button>
                                        </div>
                                      </div>

                                      {method.samples.length > 0 && (
                                        <div className="mt-3">
                                          <SampleSelectionList
                                            methodId={method.id}
                                            samples={samples.map(s => s.name || s.generatedName)}
                                            selectedSamples={method.samples.filter(
                                              sample => !deselectedSamples[method.id]?.includes(sample)
                                            )}
                                            samplePriorities={samplePriorities[method.id] || {}}
                                            sampleRequirements={sampleRequirements[method.id] || {}}
                                            onSampleToggle={() => {}}
                                            onPriorityChange={() => {}}
                                            onRequirementChange={() => {}}
                                            isExpanded={isSidebarCollapsed}
                                            disabled={true}
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
                                              className="text-red-500 -mt-1"
                                              disabled={true}
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
                                                disabled={true}
                                                autoComplete="off"
                                              />
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={true}
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
                                                samples={samples.map(s => s.name || s.generatedName)}
                                                selectedSamples={instance.samples.filter(sample => {
                                                  const sampleName = typeof sample === "string" ? sample : sample.name;
                                                  const instanceKey = `${method.id}-instance-${index}`;
                                                  return !deselectedSamples[instanceKey]?.includes(sampleName);
                                                }).map(sample => typeof sample === "string" ? sample : sample.name)}
                                                samplePriorities={samplePriorities[method.id] || {}}
                                                sampleRequirements={sampleRequirements[method.id] || {}}
                                                onSampleToggle={() => {}}
                                                onPriorityChange={() => {}}
                                                onRequirementChange={() => {}}
                                                isExpanded={isSidebarCollapsed}
                                                disabled={true}
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
                                      className="flex items-center gap-1"
                                      disabled={true}
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

            {/* Action buttons */}
            <div className="flex justify-between gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/request/new/ntr/test-methods')}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Test Methods
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || testMethods.filter((m) => m.selected || m.instances.length > 0).length === 0}
              >
                {isSubmitting ? "Submitting..." : (isEditMode ? "Update Request" : "Submit Request")}
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
                  disabled={isSubmitting}
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

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
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
                              className="text-xs whitespace-nowrap bg-white dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800 shadow-sm"
                            >
                              {method.methodcode || 'N/A'}
                              {repeatCount > 1 && ` (×${repeatCount})`}
                            </Badge>
                          );
                        })
                      }
                      {selectedMethodsCount === 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 italic">No methods selected</p>
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

                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      Keywords
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {keywords.filter(k => k.active).map((keyword) => (
                          <Badge 
                            key={keyword.id} 
                            variant="secondary" 
                            className="text-xs bg-white dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800 shadow-sm"
                          >
                            {keyword.text}
                          </Badge>
                        ))}
                        {keywords.filter(k => k.active).length === 0 && (
                          <p className="text-sm text-purple-600 dark:text-purple-400 italic">No keywords</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-100 dark:border-teal-900">
                    <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                      Request Breakdown
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-teal-700 dark:text-teal-300">Total Requests:</span>
                        <span className="font-medium text-teal-900 dark:text-teal-100">
                          {(() => {
                            const capabilityMap = new Map();
                            testMethods
                              .filter(m => m.selected || m.instances.length > 0)
                              .forEach(method => {
                                const capability = method.capabilityId || method.capability || 'Unknown';
                                const key = `${capability}-${globalPriority}`;
                                if (!capabilityMap.has(key)) {
                                  capabilityMap.set(key, 0);
                                }
                                capabilityMap.set(key, capabilityMap.get(key) + 1);
                              });
                            return capabilityMap.size;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Urgent Memo Dialog */}
      <Dialog open={showUrgentMemoDialog} onOpenChange={setShowUrgentMemoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Urgent Request Details</DialogTitle>
            <DialogDescription>
              This request contains urgent items. Please provide the required information before submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urgency-type">Urgency Type <span className="text-red-500">*</span></Label>
              <Select
                value={urgentMemo.urgencyType}
                onValueChange={(value) => setUrgentMemo(prev => ({ ...prev, urgencyType: value }))}
              >
                <SelectTrigger id="urgency-type">
                  <SelectValue placeholder="Select urgency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claim">Claim & Complaint</SelectItem>
                  <SelectItem value="plant">Plant Problems</SelectItem>
                  <SelectItem value="decision">Decision Making</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-reason">Reason for Urgency <span className="text-red-500">*</span></Label>
              <Textarea
                id="urgency-reason"
                placeholder="Please explain why this request needs urgent processing..."
                value={urgentMemo.urgencyReason}
                onChange={(e) => setUrgentMemo(prev => ({ ...prev, urgencyReason: e.target.value }))}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Approver <span className="text-red-500">*</span></Label>
              <Select
                value={urgentMemo.approver}
                onValueChange={(value) => setUrgentMemo(prev => ({ ...prev, approver: value }))}
                disabled={loadingApprovers}
              >
                <SelectTrigger id="approver">
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  {loadingApprovers ? (
                    <SelectItem value="loading" disabled>Loading approvers...</SelectItem>
                  ) : approvers.length > 0 ? (
                    approvers.map((approver) => (
                      <SelectItem key={approver.value} value={approver.value}>
                        {approver.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No approvers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUrgentMemoDialog(false)
                setUrgentMemo({
                  urgencyType: '',
                  urgencyReason: '',
                  approver: ''
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUrgentMemoDialog(false)
                submitRequest()
              }}
              disabled={!urgentMemo.urgencyType || !urgentMemo.urgencyReason || !urgentMemo.approver}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}