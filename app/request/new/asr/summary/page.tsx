"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Check, AlertCircle, ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function ASRSummaryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [requestData, setRequestData] = useState({
    requestId: "ASR-XXXX-0000",
    requestTitle: "PP Degradation Investigation",
    priority: "normal",
    useIONumber: "yes",
    ioNumber: "0090919391",
    costCenter: "0090-01560",
    problemSource: "production",
    testObjective:
      "Investigate the cause of unexpected degradation in PP products during processing. We need to understand if the issue is related to thermal stability, contamination, or other factors.",
    expectedResults:
      "Identification of the root cause of degradation and recommendations for process adjustments to prevent the issue.",
    businessImpact: "",
    desiredCompletionDate: "2023-11-15",
    samples: [
      {
        generatedName: "PP1100NK_L2023001_A1",
        category: "commercial",
        type: "PP",
        form: "Pellet",
      },
      {
        generatedName: "PP2100JC_L2023002_B1",
        category: "commercial",
        type: "PP",
        form: "Pellet",
      },
      {
        generatedName: "PP1_2023-10-15_14:30_Sample3",
        category: "inprocess",
        type: "PP",
        form: "Pellet",
      },
    ],
    selectedCapabilities: ["rheology", "small-molecule"],
    additionalRequirements:
      "We would like to compare the degraded samples with standard samples to identify differences. Please include thermal stability analysis and check for potential contaminants.",
    attachments: [
      { name: "degradation_images.zip", size: 2560000 },
      { name: "process_conditions.pdf", size: 1240000 },
    ],
    estimatedCompletion: "2023-11-20",
    estimatedCost: "25000-35000 THB",
    requester: {
      name: "John Doe",
      department: "R&D",
      email: "john.doe@example.com",
      phone: "123-456-7890",
    },
    // Urgency fields
    urgencyType: "",
    urgencyReason: "",
    approver: "",
    urgentMemo: null as File | null,
    // On behalf fields
    isOnBehalf: false,
    onBehalfOfUser: "",
    onBehalfOfName: "",
    onBehalfOfEmail: "",
    onBehalfOfCostCenter: "",
  })

  useEffect(() => {
    try {
      const savedForm = localStorage.getItem("asrFormData")
      if (savedForm) {
        const parsed = JSON.parse(savedForm)
        setRequestData((prev) => ({ ...prev, ...parsed }))
      }
      const savedSamples = localStorage.getItem("asrSamples")
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples)
        setRequestData((prev) => ({ ...prev, samples: parsedSamples }))
      }
      const userData = localStorage.getItem("pcrd_user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setRequestData((prev) => ({
          ...prev,
          requester: {
            name: parsedUser.name || parsedUser.username || prev.requester.name,
            email: parsedUser.email || prev.requester.email,
            department: parsedUser.department || prev.requester.department,
            phone: parsedUser.phone || prev.requester.phone,
          },
        }))
      }
    } catch (e) {
      console.error("Error loading ASR data:", e)
    }
  }, [])

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
    setIsSubmitting(true)

    // Notify the user that submission has started
    toast({
      title: 'Submitting request...',
      description: 'Please wait while we process your submission.',
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
        setIsSubmitting(false);
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
        toast({
          title: 'Submission failed',
          description: result.error || 'An error occurred while submitting your request.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error submitting ASR:', error)

      const message = error instanceof Error ? error.message : 'Could not connect to the server. Please try again.'
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
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
            <h1 className="text-3xl font-bold tracking-tight">Review ASR Request</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Draft
            </Badge>
          </div>
          <p className="text-muted-foreground">Review your request details before submission</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Request ID</p>
                    <p className="text-muted-foreground italic">To be confirmed after submit</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <p className="capitalize">{requestData.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Request Title</p>
                    <p>{requestData.requestTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IO Number</p>
                    <p>{requestData.ioNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost Center</p>
                    <p>{requestData.costCenter}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* On Behalf Details - Only show if creating on behalf of someone */}
            {requestData.isOnBehalf && (
              <Card>
                <CardHeader>
                  <CardTitle>On Behalf Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created On Behalf Of</p>
                    <p>{requestData.onBehalfOfName || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{requestData.onBehalfOfEmail || "Not specified"}</p>
                  </div>
                  {requestData.onBehalfOfCostCenter && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cost Center</p>
                      <p>{requestData.onBehalfOfCostCenter}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Urgent Request Details - Only show if priority is urgent */}
            {requestData.priority === "urgent" && (
              <Card>
                <CardHeader>
                  <CardTitle>Urgent Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgency Type</p>
                    <p className="capitalize">
                      {requestData.urgencyType?.replace(/_/g, ' ') || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reason for Urgency</p>
                    <p>{requestData.urgencyReason || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approver</p>
                    <p>{requestData.approver || "Not specified"}</p>
                  </div>
                  {requestData.urgentMemo && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Urgent Request Memo</p>
                      <p>{requestData.urgentMemo.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Problem Description */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Problem Source</p>
                  <p className="capitalize">
                    {requestData.problemSource === "production" ? "Production Issue" : requestData.problemSource}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Objectives</p>
                  <p>{requestData.testObjective}</p>
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
                  {requestData.samples.map((sample, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{sample.generatedName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sample.category} • {sample.type} • {sample.form}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Ready
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expected Results and Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Expected Results and Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Results</p>
                  <p>{requestData.expectedResults}</p>
                </div>
                {requestData.businessImpact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business Impact</p>
                    <p>{requestData.businessImpact}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Desired Completion Date</p>
                  <p>{requestData.desiredCompletionDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {requestData.selectedCapabilities.map((capabilityId) => {
                    const capability = loadedCapabilities.find(cap => cap._id === capabilityId);
                    return (
                      <Badge key={capabilityId} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                        {capability ? `${capability.capabilityName} (${capability.shortName})` : capabilityId}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Additional Requirements</p>
                  <p>{requestData.additionalRequirements}</p>
                </div>

                {requestData.attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                    <div className="space-y-2">
                      {requestData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center p-2 border rounded-md">
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

            {/* Action buttons */}
            <div className="flex justify-between">
              <Link href="/request/new/asr">
                <Button variant="outline">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Edit Request
                </Button>
              </Link>
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
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

                  {requestData.priority === "urgent" && requestData.approver && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Approver</p>
                        <p className="font-medium">{requestData.approver}</p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {requestData.isOnBehalf && requestData.onBehalfOfName && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">On Behalf Of</p>
                        <p className="font-medium">{requestData.onBehalfOfName}</p>
                        <p className="text-xs text-muted-foreground">{requestData.onBehalfOfEmail}</p>
                        <p className="text-xs text-muted-foreground">Cost Center: {requestData.onBehalfOfCostCenter || "Not available"}</p>
                      </div>
                      <Separator />
                    </>
                  )}

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
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost Range</p>
                    <p className="text-2xl font-bold">{requestData.estimatedCost}</p>
                    <p className="text-xs text-muted-foreground">Final cost will be determined after review</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Completion</p>
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

            {/* ASR Process card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">ASR Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start space-x-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs mt-0.5">
                      1
                    </div>
                    <p>Submit your ASR request with all relevant details and samples</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs mt-0.5">
                      2
                    </div>
                    <p>Capability experts review your request and may contact you for clarification</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs mt-0.5">
                      3
                    </div>
                    <p>Once approved, your request is assigned to researchers who will develop a testing plan</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs mt-0.5">
                      4
                    </div>
                    <p>You'll receive regular updates and can collaborate with the research team</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs mt-0.5">
                      5
                    </div>
                    <p>Final results and recommendations are delivered in a comprehensive report</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

