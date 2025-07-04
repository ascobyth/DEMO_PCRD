"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SampleSelectionList } from "@/components/sample-selection-list"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Check, AlertCircle, Printer, Trash2, Edit, RefreshCw, ChevronDown, ChevronUp, CalendarIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function ASRSummaryPage() {
  const searchParams = useSearchParams()
  const editRequestId = searchParams.get('edit')
  const duplicateRequestId = searchParams.get('duplicate')
  const isEditMode = !!editRequestId
  const isDuplicateMode = !!duplicateRequestId
  const { user } = useAuth()

  // Initialize with empty data, will be populated from localStorage
  const [requestData, setRequestData] = useState({
    requestId: "Will be assigned upon submission",
    requestTitle: "",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "",
    costCenter: "",
    urgentType: "",
    urgencyReason: "",
    approver: null,
    urgentMemo: null,
    problemSource: "",
    testObjective: "",
    expectedResults: "",
    businessImpact: "",
    desiredCompletionDate: "",
    samples: [],
    selectedCapabilities: [],
    pcrdResponsiblePerson: "",
    pcrdPersonSpecified: false,
    additionalRequirements: "",
    attachments: [],
    estimatedCompletion: "7-14 days",
    estimatedCost: "To be determined",
    requester: {
      name: "",
      department: "",
      email: "",
      phone: "",
    },
    submissionDate: new Date().toISOString().split('T')[0],
    status: "draft",
    isOnBehalf: false,
    onBehalfOfUser: "",
    onBehalfOfName: "",
    onBehalfOfEmail: "",
    onBehalfOfCostCenter: "",
  })

  // State for disabling inputs after submit
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load all form data from localStorage when the component mounts
  useEffect(() => {
    try {
      // Load the main form data
      const savedFormData = localStorage.getItem("asrFormData")
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData)
        console.log("Loaded form data from localStorage:", parsedFormData)

        // Update the request data with the form values
        setRequestData(prev => ({
          ...prev,
          requestTitle: parsedFormData.requestTitle || prev.requestTitle,
          priority: parsedFormData.priority || prev.priority || "normal",
          useIONumber: parsedFormData.useIONumber || prev.useIONumber,
          ioNumber: parsedFormData.ioNumber || prev.ioNumber,
          costCenter: parsedFormData.costCenter || prev.costCenter,
          urgentType: parsedFormData.urgentType || prev.urgentType,
          urgencyReason: parsedFormData.urgencyReason || prev.urgencyReason,
          approver: parsedFormData.approver || prev.approver,
          problemSource: parsedFormData.problemSource || prev.problemSource,
          testObjective: parsedFormData.testObjective || prev.testObjective,
          expectedResults: parsedFormData.expectedResults || prev.expectedResults,
          businessImpact: parsedFormData.businessImpact || prev.businessImpact,
          desiredCompletionDate: parsedFormData.desiredCompletionDate || prev.desiredCompletionDate,
          selectedCapabilities: parsedFormData.selectedCapabilities || prev.selectedCapabilities,
          pcrdResponsiblePerson: parsedFormData.pcrdResponsiblePerson || prev.pcrdResponsiblePerson,
          pcrdPersonSpecified: parsedFormData.pcrdPersonSpecified || prev.pcrdPersonSpecified,
          additionalRequirements: parsedFormData.additionalRequirements || prev.additionalRequirements,
          attachments: parsedFormData.attachments || prev.attachments,
          isOnBehalf: parsedFormData.isOnBehalf || prev.isOnBehalf,
          onBehalfOfName: parsedFormData.onBehalfOfName || prev.onBehalfOfName,
          onBehalfOfEmail: parsedFormData.onBehalfOfEmail || prev.onBehalfOfEmail,
          onBehalfOfCostCenter: parsedFormData.onBehalfOfCostCenter || prev.onBehalfOfCostCenter,
        }))
      }

      // Load requester information from authenticated user
      if (user) {
        setRequestData(prev => ({
          ...prev,
          requester: {
            name: user.name || user.username || prev.requester.name,
            email: user.email || prev.requester.email,
            department: user.department || prev.requester.department,
            phone: user.phone || prev.requester.phone,
          }
        }))
      }

      // Load samples from localStorage
      const savedSamples = localStorage.getItem("asrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        console.log("Loaded samples from localStorage:", parsedSamples)

        setRequestData((prev) => ({
          ...prev,
          samples: parsedSamples,
        }))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      toast({
        title: "Error loading data",
        description: "There was a problem loading your request data. Some information may be missing.",
        variant: "destructive",
      })
    }
  }, [user])

  // State to store capabilities loaded from the API
  const [loadedCapabilities, setLoadedCapabilities] = useState<any[]>([])
  
  // Fetch capabilities from the API
  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const response = await fetch('/api/capabilities')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setLoadedCapabilities(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching capabilities:', error)
      }
    }
    
    fetchCapabilities()
  }, [])

  const handleSubmit = async () => {
    try {
      // Set submitted state to disable inputs
      setIsSubmitted(true)

      // Show loading toast
      toast({
        title: isDuplicateMode ? "Duplicating request..." : isEditMode ? "Updating request..." : "Submitting request...",
        description: "Please wait while we process your submission.",
      })

    // Get the selected capability 
    const selectedCapability = requestData.selectedCapabilities.length > 0 ? 
      requestData.selectedCapabilities[0] : null;
    
    // Find the capability details from loaded capabilities
    let capabilityDetail: any = null;
    
    // Try to find in loaded capabilities
    if (selectedCapability && loadedCapabilities.length > 0) {
      // Try to match by ID if it's a MongoDB ID (24 chars hex)
      if (/^[0-9a-fA-F]{24}$/.test(selectedCapability)) {
        capabilityDetail = loadedCapabilities.find(cap => cap._id === selectedCapability);
      } else {
        // Handle legacy string IDs from old localStorage data
        const legacyMapping: Record<string, string> = {
          'rheology': 'RE',
          'microstructure': 'MC',
          'small-molecule': 'SM',
          'mesostructure': 'ME'
        };
        
        const shortNameToFind = legacyMapping[selectedCapability.toLowerCase()];
        if (shortNameToFind) {
          console.log('Migrating legacy capability ID:', selectedCapability, 'to shortName:', shortNameToFind);
          capabilityDetail = loadedCapabilities.find(cap => 
            cap.shortName === shortNameToFind || 
            cap.shortName === shortNameToFind.toUpperCase()
          );
        }
      }
      
      // If not found, log error - we should only use database capabilities
      if (!capabilityDetail) {
        console.error('Selected capability not found in database:', selectedCapability);
        toast({
          title: 'Error',
          description: 'Selected capability not found. Please go back and select a capability again.',
          variant: 'destructive'
        });
        setIsSubmitted(false);
        return;
      }
    } else if (!selectedCapability) {
      toast({
        title: 'Error',
        description: 'No capability selected. Please select a capability.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    } else if (loadedCapabilities.length === 0) {
      toast({
        title: 'Error',
        description: 'Capabilities not loaded. Please refresh the page.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }
    
    // Get the capability shortName and name for submission
    const capabilityShortName = capabilityDetail?.shortName;
    const capabilityName = capabilityDetail?.capabilityName;
      
    // Prepare the submission data properly formatted for the API
    const submissionData = {
      asrName: requestData.requestTitle,
      asrType: 'project',
      asrDetail: requestData.testObjective,
      requesterName: requestData.requester.name,
      requesterEmail: requestData.requester.email,
      asrRequireDate: requestData.desiredCompletionDate,
      asrSampleList: requestData.samples,
      capabilityId: selectedCapability, // This can be the ID or shortName
      capabilityShortName: capabilityShortName, // Explicitly include the shortName
      capabilityName: capabilityName, // Include the full capability name
      pcrdResponsiblePerson: requestData.pcrdResponsiblePerson,
      pcrdPersonSpecified: requestData.pcrdPersonSpecified,
      useIoNumber: requestData.useIONumber === 'yes',
      ioCostCenter: requestData.useIONumber === 'yes' ? requestData.ioNumber : '',
      requesterCostCenter: requestData.costCenter,
      additionalRequirements: requestData.additionalRequirements,
      expectedResults: requestData.expectedResults,
      businessImpact: requestData.businessImpact,
      problemSource: requestData.problemSource,
      priority: requestData.priority,
      // Add urgency fields if priority is urgent
      urgencyType: requestData.priority === 'urgent' ? requestData.urgencyType : '',
      urgencyReason: requestData.priority === 'urgent' ? requestData.urgencyReason : '',
      approver: requestData.priority === 'urgent' ? requestData.approver : '',
      urgentMemo: requestData.priority === 'urgent' && requestData.urgentMemo ? requestData.urgentMemo.name : '',
      // Add on behalf fields
      isOnBehalf: requestData.isOnBehalf || false,
      onBehalfInformation: {
        name: requestData.isOnBehalf ? requestData.onBehalfOfName : '',
        email: requestData.isOnBehalf ? requestData.onBehalfOfEmail : '',
        costCenter: requestData.isOnBehalf ? requestData.onBehalfOfCostCenter : ''
      },
      // Add attachments
      attachments: requestData.attachments || []
    }

    console.log('Submitting ASR data:', submissionData)

    try {
      const response = await fetch('/api/asrs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('ASR submission failed:', errorData);
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      const result = await response.json()
      console.log('ASR submission response:', result);

      if (result.success && result.data) {
        // Clear the localStorage data to prevent resubmission
        localStorage.removeItem("asrFormData")
        localStorage.removeItem("asrSamples")
        
        // Store the submission details for the confirmation page
        localStorage.setItem('submittedAsrNumber', result.data.asrNumber)
        localStorage.setItem('submittedAsrId', result.data.asrId)
        
        toast({
          title: 'Request submitted successfully',
          description: `Your ASR request ${result.data.asrNumber} has been submitted for review.`,
        })
        
        // Navigate to confirmation page after successful submission
        setTimeout(() => {
          window.location.href = '/request/new/asr/confirmation'
        }, 1000)
      } else {
        // Reset submitted state on error
        setIsSubmitted(false);
        toast({
          title: 'Submission failed',
          description: result.error || 'An error occurred while submitting your request.',
          variant: 'destructive',
        })
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);

      // Reset submitted state on error
      setIsSubmitted(false);
      
      // Show detailed error to user
      toast({
        title: "Network Error",
        description: `Failed to ${isEditMode ? 'update' : 'submit'} request: ${fetchError.message}`,
        variant: "destructive",
      });
    }
    } catch (error) {
      console.error("Error submitting request:", error);
      
      // Reset submitted state on error
      setIsSubmitted(false);

      // Show detailed error
      const errorMessage = error.message || "An unexpected error occurred";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/request/new/asr">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to ASR Form
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit ASR Request" : "ASR Request Summary"}
            </h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {isEditMode ? "Editing" : "Draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Review and update your ASR request details"
              : "Review your ASR request details before submission"
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Request Information */}
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Request ID</Label>
                    <Input value={requestData.requestId} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Submission Date</Label>
                    <Input value={requestData.submissionDate} disabled className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Request Title</Label>
                    <Input value={requestData.requestTitle} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Priority</Label>
                    <Input value={requestData.priority || "normal"} disabled className="mt-1 capitalize" />
                  </div>
                  <div>
                    <Label className="text-sm">Use IO Number</Label>
                    <Input value={requestData.useIONumber === "yes" ? "Yes" : "No"} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">IO Number</Label>
                    <Input value={requestData.ioNumber || "-"} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Cost Center</Label>
                    <Input value={requestData.costCenter || "-"} disabled className="mt-1" />
                  </div>
                  {requestData.priority === "urgent" && (
                    <>
                      <div>
                        <Label className="text-sm">Urgent Type</Label>
                        <Input value={requestData.urgentType || "-"} disabled className="mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm">Urgency Reason</Label>
                        <Input value={requestData.urgencyReason || "-"} disabled className="mt-1" />
                      </div>
                      {requestData.approver && (
                        <div>
                          <Label className="text-sm">Approver</Label>
                          <Input value={requestData.approver} disabled className="mt-1" />
                        </div>
                      )}
                    </>
                  )}
                  {/* ASR-specific fields */}
                  <div>
                    <Label className="text-sm">Problem Source</Label>
                    <Input value={requestData.problemSource || "-"} disabled className="mt-1 capitalize" />
                  </div>
                  <div>
                    <Label className="text-sm">Desired Completion Date</Label>
                    <Input value={requestData.desiredCompletionDate || "-"} disabled className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Backgrounds/Problem Details</Label>
                    <Input value={requestData.testObjective || "-"} disabled className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Specific Questions for PCRD</Label>
                    <Input value={requestData.additionalRequirements || "-"} disabled className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm">Expected Results</Label>
                    <Input value={requestData.expectedResults || "-"} disabled className="mt-1" />
                  </div>
                  {requestData.businessImpact && (
                    <div className="col-span-2">
                      <Label className="text-sm">Business Impact</Label>
                      <Input value={requestData.businessImpact} disabled className="mt-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Samples */}
            <Card>
              <CardHeader>
                <CardTitle>Samples ({requestData.samples.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requestData.samples.map((sample, index) => {
                    // Create a unique key using id or index as fallback
                    const uniqueKey = sample.id || `sample-${index}-${sample.name || sample.generatedName || index}`;

                    return (
                      <div key={uniqueKey} className="border rounded-md p-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Sample Name</Label>
                            <Input value={sample.name || sample.generatedName} disabled className="mt-1 h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <Input value={sample.category} disabled className="mt-1 h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Type</Label>
                            <Input value={sample.type} disabled className="mt-1 h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Form</Label>
                            <Input value={sample.form} disabled className="mt-1 h-8 text-sm" />
                          </div>
                          {sample.remark && (
                            <div className="col-span-2">
                              <Label className="text-xs">Remark</Label>
                              <Input value={sample.remark} disabled className="mt-1 h-8 text-sm" />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" /> Ready
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>


            {/* Selected Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Capabilities ({requestData.selectedCapabilities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requestData.selectedCapabilities.map((capabilityId) => {
                    const capability = loadedCapabilities.find(cap => cap._id === capabilityId);
                    return (
                      <div key={capabilityId} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {capability ? capability.capabilityName : capabilityId}
                            </p>
                            {capability && (
                              <p className="text-sm text-muted-foreground">
                                {capability.shortName} • {capability.description || 'Analysis capability'}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Check className="h-3 w-3 mr-1" /> Selected
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* PCRD Responsible Person */}
            <Card>
              <CardHeader>
                <CardTitle>PCRD Responsible Person</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Assignment Method</Label>
                    <Input 
                      value={requestData.pcrdPersonSpecified ? "Specific person selected" : "Let capability head assign after approval"} 
                      disabled 
                      className="mt-1" 
                    />
                  </div>
                  {requestData.pcrdPersonSpecified && requestData.pcrdResponsiblePerson && (
                    <div>
                      <Label className="text-sm">Selected PCRD Person</Label>
                      <Input 
                        value={(() => {
                          const personMap = {
                            "pcrd.analyst1@company.com": "Dr. Smith (Rheology Specialist)",
                            "pcrd.analyst2@company.com": "Dr. Johnson (Microstructure Expert)",
                            "pcrd.analyst3@company.com": "Dr. Williams (Small Molecule Analysis)",
                            "pcrd.analyst4@company.com": "Dr. Brown (Mesostructure Analysis)",
                            "pcrd.analyst5@company.com": "Dr. Davis (General Analysis)"
                          };
                          return personMap[requestData.pcrdResponsiblePerson] || requestData.pcrdResponsiblePerson;
                        })()} 
                        disabled 
                        className="mt-1" 
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(requestData.additionalRequirements || requestData.attachments.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requestData.additionalRequirements && (
                    <div>
                      <Label className="text-sm">Additional Requirements</Label>
                      <Input 
                        value={requestData.additionalRequirements} 
                        disabled 
                        className="mt-1" 
                      />
                    </div>
                  )}

                  {requestData.attachments.length > 0 && (
                    <div>
                      <Label className="text-sm mb-2">Attachments</Label>
                      <div className="space-y-2 mt-1">
                        {requestData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center p-2 border rounded-md bg-gray-50">
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex justify-end">
              <div className="flex space-x-3">
                <Link href="/request/new/asr">
                  <Button
                    variant="outline"
                    disabled={isSubmitted}
                    onClick={() => {
                      // Save current state to localStorage before navigating
                      try {
                        localStorage.setItem(
                          "asrFormData",
                          JSON.stringify({
                            requestTitle: requestData.requestTitle,
                            priority: requestData.priority,
                            useIONumber: requestData.useIONumber,
                            ioNumber: requestData.ioNumber,
                            costCenter: requestData.costCenter,
                            problemSource: requestData.problemSource,
                            testObjective: requestData.testObjective,
                            expectedResults: requestData.expectedResults,
                            businessImpact: requestData.businessImpact,
                            desiredCompletionDate: requestData.desiredCompletionDate,
                            selectedCapabilities: requestData.selectedCapabilities,
                            pcrdResponsiblePerson: requestData.pcrdResponsiblePerson,
                            pcrdPersonSpecified: requestData.pcrdPersonSpecified,
                            additionalRequirements: requestData.additionalRequirements,
                            attachments: requestData.attachments,
                            isOnBehalf: requestData.isOnBehalf,
                            onBehalfOfName: requestData.onBehalfOfName,
                            onBehalfOfEmail: requestData.onBehalfOfEmail,
                            onBehalfOfCostCenter: requestData.onBehalfOfCostCenter,
                          }),
                        )
                      } catch (error) {
                        console.error("Error saving form data to localStorage:", error)
                      }
                    }}
                  >
                    Back to ASR Form
                  </Button>
                </Link>
                <Button
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                >
                  {isSubmitted ? "Processing..." : isEditMode && !isDuplicateMode ? "Update Request" : isDuplicateMode ? "Duplicate Request" : "Submit Request"}
                </Button>
              </div>
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
                    <p className="text-sm font-medium text-muted-foreground">Requester</p>
                    <p className="font-medium">{requestData.requester.name}</p>
                    <p className="text-sm text-muted-foreground">{requestData.requester.department}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Samples</p>
                    <p className="text-2xl font-bold">{requestData.samples.length}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Selected Capabilities</p>
                    <p className="text-2xl font-bold">{requestData.selectedCapabilities.length}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold">{requestData.estimatedCost}</p>
                    <p className="text-xs text-muted-foreground">Final cost will be determined after review</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Turnaround</p>
                    <p className="text-2xl font-bold">{requestData.estimatedCompletion}</p>
                    <p className="text-xs text-muted-foreground">Subject to capability expert review</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Request Status: Draft</p>
                      <p className="text-xs text-amber-700 mt-1">
                        This request has not been submitted yet. Review the details and click "Submit Request" when
                        ready.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Need help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm mb-4">
                  If you have any questions about your ASR request or need assistance, please contact our support team.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

