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
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Beaker,
  Microscope,
  FlaskConical,
  Layers,
  BarChart3,
  Info,
  Download,
  Printer,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

interface RequestDetailsDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailsDialog({
  requestId,
  open,
  onOpenChange,
}: RequestDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [requestData, setRequestData] = useState<any>(null)
  const [samplesData, setSamplesData] = useState<any[]>([])
  const [testsData, setTestsData] = useState<any[]>([])

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
      } else {
        console.error("Failed to load request details:", requestResult.error)
        toast.error("Failed to load request details")
      }

      // Fetch samples
      const samplesResponse = await fetch(`/api/requests/samples?requestId=${requestId}`)
      const samplesResult = await samplesResponse.json()

      if (samplesResult.success) {
        setSamplesData(samplesResult.data || [])
      } else {
        console.error("Failed to load samples:", samplesResult.error)
      }

      // Fetch tests/methods
      const testsResponse = await fetch(`/api/requests/methods?requestId=${requestId}`)
      const testsResult = await testsResponse.json()

      if (testsResult.success) {
        setTestsData(testsResult.data || [])
      } else {
        console.error("Failed to load tests:", testsResult.error)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" /> 
            Request Details {requestId && <span className="text-muted-foreground">#{requestId}</span>}
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about this request, its samples, and testing methods
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
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Request Overview</TabsTrigger>
                <TabsTrigger value="samples">Samples ({samplesData.length})</TabsTrigger>
                <TabsTrigger value="methods">Testing Methods ({testsData.length})</TabsTrigger>
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
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Capability</h4>
                          <div className="flex items-center gap-2">
                            <CapabilityIcon capability={requestData.capability} />
                            <span>{requestData.capability || "Not specified"}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Department</h4>
                          <p className="text-sm">{requestData.department || "Not specified"}</p>
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
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h4>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{requestData.assignedTo || "Unassigned"}</span>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h4>
                        <RequestStatusBadge status={requestData.status} />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Sample Status</h4>
                        <div className="text-sm">
                          <p>{samplesData.filter(s => s.status === "Received").length} of {samplesData.length} received</p>
                          <p>{samplesData.filter(s => ["Testing Completed", "Result Analysis", "Verified"].includes(s.status)).length} of {samplesData.length} completed</p>
                        </div>
                      </div>

                      {/* Status Timeline if available */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Timeline</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span>{formatDate(requestData.requestDate)}</span>
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
                            <TableRow key={sample.id}>
                              <TableCell className="font-medium">{sample.sampleId}</TableCell>
                              <TableCell>{sample.name}</TableCell>
                              <TableCell>
                                <SampleStatusBadge status={sample.status} />
                              </TableCell>
                              <TableCell>{sample.receivedDate || "-"}</TableCell>
                              <TableCell>{sample.testMethod || "-"}</TableCell>
                              <TableCell>{sample.assignedTo || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Methods Tab */}
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
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testsData.map((test) => (
                            <TableRow key={test.id || test.methodCode}>
                              <TableCell className="font-medium">{test.methodCode}</TableCell>
                              <TableCell>{test.name || test.methodName}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <CapabilityIcon capability={test.capability || test.capabilityName} />
                                  <span>{test.capability || test.capabilityName || "-"}</span>
                                </div>
                              </TableCell>
                              <TableCell>{test.equipment || test.equipmentName || "-"}</TableCell>
                              <TableCell>{test.status || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        )}

        <DialogFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
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
