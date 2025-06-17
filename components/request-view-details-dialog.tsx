"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { RequestStatusBadge } from "./request-status-badge"
import { SampleStatusBadge } from "./sample-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Users,
  Beaker,
  Microscope,
  FlaskConical,
  Layers,
  BarChart3,
  Info,
  Printer,
  XCircle,
  MonitorSmartphone,
  Clipboard,
  CircleDollarSign,
  Building,
  Mail,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

interface RequestViewDetailsDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestViewDetailsDialog({
  requestId,
  open,
  onOpenChange,
}: RequestViewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [requestData, setRequestData] = useState<any>(null)
  const [samplesData, setSamplesData] = useState<any[]>([])
  const [testsData, setTestsData] = useState<any[]>([])
  const [asrData, setAsrData] = useState<any>(null)
  const [erData, setErData] = useState<any>(null)

  // Load request details
  const loadRequestDetails = async () => {
    if (!requestId || !open) return

    setLoading(true)
    try {
      // Fetch request details
      const requestResponse = await fetch(`/api/requests/details?requestId=${requestId}`)
      const requestResult = await requestResponse.json()

      if (requestResult.success) {
        setRequestData(requestResult.data)

        // Check request type and fetch additional data
        if (requestResult.data?.type === "ASR") {
          try {
            // Fetch ASR data
            const asrResponse = await fetch(`/api/asrs/${requestResult.data.id}`)
            const asrResult = await asrResponse.json()

            if (asrResult.success) {
              setAsrData(asrResult.data)
            } else {
              console.error("Failed to load ASR details:", asrResult.error)
            }
          } catch (error) {
            console.error("Error fetching ASR details:", error)
          }
        } else if (requestResult.data?.type === "ER") {
          try {
            // Fetch ER data
            const erResponse = await fetch(`/api/equipment/er-details?erRequestId=${requestResult.data.id}`)
            const erResult = await erResponse.json()

            if (erResult.success) {
              setErData(erResult.data)
            } else {
              console.error("Failed to load ER details:", erResult.error)
            }
          } catch (error) {
            console.error("Error fetching ER details:", error)
          }
        }
      } else {
        console.error("Failed to load request details:", requestResult.error)
        toast.error("Failed to load request details")
      }

      try {
        // Fetch samples
        const samplesResponse = await fetch(`/api/requests/samples?requestId=${requestId}`)
        const samplesResult = await samplesResponse.json()

        if (samplesResult.success) {
          setSamplesData(samplesResult.data || [])
        } else {
          console.error("Failed to load samples:", samplesResult.error)
        }
      } catch (error) {
        console.error("Error fetching samples:", error)
      }

      try {
        // Fetch testing methods
        const testsResponse = await fetch(`/api/requests/methods?requestId=${requestId}`)
        const testsResult = await testsResponse.json()

        if (testsResult.success) {
          setTestsData(testsResult.data || [])
        } else {
          console.error("Failed to load tests:", testsResult.error)
        }
      } catch (error) {
        console.error("Error fetching testing methods:", error)
      }
    } catch (error) {
      console.error("Error loading request details:", error)
      toast.error("An error occurred while loading request details")
    } finally {
      setLoading(false)
    }
  }

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadRequestDetails()
    }
  }, [open, requestId])

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return dateString
    }
  }

  // Get Capability Icon
  const CapabilityIcon = ({ capability }: { capability: string | undefined }) => {
    if (!capability) return <Beaker className="h-4 w-4 text-gray-600" />

    const lowerCapability = capability.toLowerCase()

    if (lowerCapability.includes("mechanical") || lowerCapability.includes("rheology")) {
      return <Layers className="h-4 w-4 text-blue-600" />
    } else if (lowerCapability.includes("micro") || lowerCapability.includes("microscopy")) {
      return <Microscope className="h-4 w-4 text-purple-600" />
    } else if (lowerCapability.includes("thermal") || lowerCapability.includes("meso")) {
      return <FlaskConical className="h-4 w-4 text-orange-600" />
    } else if (lowerCapability.includes("analy")) {
      return <BarChart3 className="h-4 w-4 text-green-600" />
    } else {
      return <Beaker className="h-4 w-4 text-gray-600" />
    }
  }

  // Get priority badge
  const PriorityBadge = ({ priority }: { priority: string | undefined }) => {
    if (!priority) return null

    switch (priority.toLowerCase()) {
      case "urgent":
        return <Badge className="bg-red-500 text-white hover:bg-red-600 font-medium px-3">Urgent</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium px-3">Normal</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  // Get request type badge
  const RequestTypeBadge = ({ type }: { type: string | undefined }) => {
    if (!type) return null

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

  // Get tabs based on request type
  const getTabsForRequestType = () => {
    const commonTabs = [
      { id: "overview", label: "Overview" },
      { id: "samples", label: `Samples (${samplesData.length})` },
    ];

    if (requestData?.type === "ASR") {
      return [
        ...commonTabs,
        { id: "asr", label: "ASR Details" },
        { id: "methods", label: `Testing Methods (${testsData.length})` }
      ];
    } else if (requestData?.type === "ER") {
      return [
        ...commonTabs,
        { id: "er", label: "Equipment Details" }
      ];
    } else {
      return [
        ...commonTabs,
        { id: "methods", label: `Testing Methods (${testsData.length})` }
      ];
    }
  };

  // Get cost center display
  const getCostCenterDisplay = (data: any) => {
    if (!data) return "Not specified";

    if (data.useIoNumber) {
      if (data.ioNumber && data.ioCostCenter) {
        return `${data.ioNumber} (${data.ioCostCenter})`;
      } else if (data.ioNumber) {
        return data.ioNumber;
      } else if (data.ioCostCenter) {
        return data.ioCostCenter;
      } else {
        return "IO Number - Not specified";
      }
    } else if (data.requesterCostCenter) {
      return data.requesterCostCenter;
    } else {
      return "Not specified";
    }
  };

  const tabs = getTabsForRequestType();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Request Summary {requestData?.id && <span className="text-muted-foreground">#{requestData.id}</span>}
          </DialogTitle>
          <DialogDescription>
            Detailed information about this request and its associated elements
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !requestData ? (
          <div className="text-center p-8">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Request Not Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              We couldn't find details for this request. It may have been deleted or you may not have permission to view it.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[65vh]">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Request Basic Info */}
                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Request Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <RequestTypeBadge type={requestData.type} />
                        <RequestStatusBadge status={requestData.status} />
                        <PriorityBadge priority={requestData.priority} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Request Number</h4>
                        <p className="text-base font-medium">{requestData.requestNumber || requestData.id || "Unknown"}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                        <p className="text-base font-medium">{requestData.title || "No Title"}</p>
                      </div>

                      {requestData.description && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                          <p className="text-sm">{requestData.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Request Type</h4>
                          <div className="flex items-center gap-2">
                            <RequestTypeBadge type={requestData.type} />
                            <span>{requestData.type}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Capability</h4>
                          <div className="flex items-center gap-2">
                            <CapabilityIcon capability={requestData.capability} />
                            <span>{requestData.capability ||
                              (testsData && testsData.length > 0 ? testsData[0].capability : "Not specified")}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Department</h4>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm">{requestData.department || "Not specified"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Cost Center</h4>
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getCostCenterDisplay(requestData)}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Request Date</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(requestData.requestDate)}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{requestData.dueDate ? formatDate(requestData.dueDate) : "Not specified"}</span>
                          </div>
                        </div>

                        {requestData.priority?.toLowerCase() === "urgent" && (
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Urgency Reason</h4>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{requestData.urgencyReason || "No reason provided"}</span>
                            </div>
                          </div>
                        )}

                        {requestData.isAsrRequest && (
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">ASR Project</h4>
                            <div className="flex items-center gap-2">
                              <Clipboard className="h-4 w-4 text-purple-600" />
                              <span className="text-sm">{requestData.asrId || "Not specified"}</span>
                            </div>
                          </div>
                        )}

                        {requestData.isTechsprint && (
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Tech Sprint</h4>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              Tech Sprint Project
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* People & Status Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">People & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Requester</h4>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{requestData.requester || "Unknown"}</span>
                        </div>
                        {requestData.requesterEmail && (
                          <div className="flex items-center gap-2 mt-1 ml-6">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{requestData.requesterEmail}</span>
                          </div>
                        )}
                      </div>

                      {requestData.isOnBehalf && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">On Behalf Of</h4>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{requestData.onBehalfOfName || "Not specified"}</span>
                          </div>
                          {requestData.onBehalfOfEmail && (
                            <div className="flex items-center gap-2 mt-1 ml-6">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{requestData.onBehalfOfEmail}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {requestData.supportStaff && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Support Staff</h4>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{requestData.supportStaff}</span>
                          </div>
                        </div>
                      )}

                      {requestData.ppcMemberList && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">PPC Members</h4>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{requestData.ppcMemberList}</span>
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h4>
                        <RequestStatusBadge status={requestData.status} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Progress</h4>
                        <div className="w-full flex items-center gap-2">
                          <Progress value={requestData.progress} className="h-2 w-20" />
                          <span className="text-xs">{requestData.progress}%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Sample Status</h4>
                        <div className="text-sm">
                          <p>{samplesData.filter(s => s.status === "Received" || s.status === "received").length} of {samplesData.length} received</p>
                          <p>{samplesData.filter(s => ["Testing Completed", "test-results-completed", "completed", "operation-completed", "Result Analysis", "Verified"].some(status =>
                            s.status?.toLowerCase() === status.toLowerCase())).length} of {samplesData.length} completed</p>
                        </div>
                      </div>

                      {/* Status Timeline if available */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Timeline</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span>{formatDate(requestData.requestDate || requestData.createdAt)}</span>
                          </div>
                          {requestData.receiveDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Samples Received:</span>
                              <span>{formatDate(requestData.receiveDate)}</span>
                            </div>
                          )}
                          {requestData.completeDate && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-muted-foreground">Completed:</span>
                              <span>{formatDate(requestData.completeDate)}</span>
                            </div>
                          )}
                          {requestData.terminateDate && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="text-muted-foreground">Terminated:</span>
                              <span>{formatDate(requestData.terminateDate)}</span>
                            </div>
                          )}
                          {requestData.cancelDate && (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-3 w-3 text-orange-600" />
                              <span className="text-muted-foreground">Cancelled:</span>
                              <span>{formatDate(requestData.cancelDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Samples Tab */}
              <TabsContent value="samples" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Sample Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {samplesData.length === 0 ? (
                      <div className="text-center p-4">
                        <p className="text-muted-foreground">No samples found for this request</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sample ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Received Date</TableHead>
                            <TableHead>Testing Method</TableHead>
                            <TableHead>Assigned To</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {samplesData.map((sample) => (
                            <TableRow key={sample.id || sample.sampleId || sample.testingListId}>
                              <TableCell className="font-medium">{sample.sampleId || sample.testingListId}</TableCell>
                              <TableCell>
                                <div>
                                  <div>{sample.name || sample.sampleName || sample.fullSampleName || "Unknown"}</div>
                                  {sample.remark && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {sample.remark}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <SampleStatusBadge status={sample.status || sample.sampleStatus} />
                              </TableCell>
                              <TableCell>
                                {sample.receivedDate ||
                                 (sample.receiveDate ? formatDate(sample.receiveDate) : "-")}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{sample.testMethod || sample.methodCode || "-"}</span>
                                  {sample.testingRemark && (
                                    <span className="text-xs text-muted-foreground mt-1">
                                      {sample.testingRemark}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {sample.assignedTo || sample.receiveBy || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Methods Tab */}
              {requestData?.type !== "ER" && (
                <TabsContent value="methods" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Testing Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testsData.length === 0 ? (
                        <div className="text-center p-4">
                          <p className="text-muted-foreground">No testing methods found for this request</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Method Code</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Capability</TableHead>
                              <TableHead>Equipment</TableHead>
                              <TableHead>Samples</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {testsData.map((test) => (
                              <TableRow key={test.id || test.methodCode || test.testingId}>
                                <TableCell className="font-medium">{test.methodCode}</TableCell>
                                <TableCell>{test.name || test.methodName}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <CapabilityIcon capability={test.capability || test.capabilityName} />
                                    <span>{test.capability || test.capabilityName || "-"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <MonitorSmartphone className="h-4 w-4 text-blue-600" />
                                    <span>{test.equipment || test.equipmentName || "-"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {test.samples && test.samples.length > 0 ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                      {test.samples.length} sample{test.samples.length > 1 ? 's' : ''}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">No samples</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <SampleStatusBadge status={test.status || "Pending"} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* ASR Details Tab */}
              {requestData?.type === "ASR" && (
                <TabsContent value="asr" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">ASR Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!asrData ? (
                        <div className="text-center p-4">
                          <p className="text-muted-foreground">No ASR details found for this request</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">ASR Number</h4>
                            <p className="text-base font-medium">{asrData.asrNumber}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">ASR Name</h4>
                            <p className="text-sm">{asrData.asrName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">ASR Type</h4>
                              <p className="text-sm capitalize">{asrData.asrType || "Not specified"}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">ASR Status</h4>
                              <RequestStatusBadge status={asrData.asrStatus} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Required Date</h4>
                              <p className="text-sm">{asrData.asrRequireDate ? formatDate(asrData.asrRequireDate) : "Not specified"}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Estimated Completion</h4>
                              <p className="text-sm">{asrData.asrEstCompletedDate ? formatDate(asrData.asrEstCompletedDate) : "Not specified"}</p>
                            </div>
                          </div>
                          {asrData.asrDetail && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Project Details</h4>
                              <p className="text-sm">{asrData.asrDetail}</p>
                            </div>
                          )}
                          {asrData.asrMethodology && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Methodology</h4>
                              <p className="text-sm">{asrData.asrMethodology}</p>
                            </div>
                          )}
                          {asrData.asrOwnerName && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Project Owner</h4>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{asrData.asrOwnerName}</span>
                              </div>
                              {asrData.asrOwnerEmail && (
                                <div className="flex items-center gap-2 mt-1 ml-6">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{asrData.asrOwnerEmail}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* ER Details Tab */}
              {requestData?.type === "ER" && (
                <TabsContent value="er" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Equipment Reservation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!erData ? (
                        <div className="text-center p-4">
                          <p className="text-muted-foreground">No equipment reservation details found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Reservation Start</h4>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{erData.reservationStartDate ? formatDate(erData.reservationStartDate) : "Not specified"}</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Reservation End</h4>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{erData.reservationEndDate ? formatDate(erData.reservationEndDate) : "Not specified"}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Reserved Equipment</h4>
                            {erData.jsonEquipmentList ? (
                              <div className="space-y-2 mt-2">
                                {(() => {
                                  try {
                                    const equipmentList = JSON.parse(erData.jsonEquipmentList);
                                    return equipmentList.map((item, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                                        <div className="flex items-center gap-2">
                                          <MonitorSmartphone className="h-4 w-4 text-blue-600" />
                                          <div>
                                            <p className="font-medium">{item.name || `Equipment ${index + 1}`}</p>
                                            <p className="text-xs text-muted-foreground">
                                              ID: {item.id || "N/A"} • Location: {item.location || "Not specified"}
                                            </p>
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                          {item.status || "Reserved"}
                                        </Badge>
                                      </div>
                                    ));
                                  } catch (e) {
                                    return (
                                      <div className="text-sm text-muted-foreground">
                                        Error parsing equipment data
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No equipment information available
                              </div>
                            )}
                          </div>

                          {erData.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</h4>
                              <p className="text-sm bg-muted/20 p-2 rounded-md">{erData.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </ScrollArea>
        )}

        <DialogFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
