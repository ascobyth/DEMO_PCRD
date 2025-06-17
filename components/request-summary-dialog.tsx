"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  MessageSquare,
  Users,
  Calendar,
  Layers,
  Beaker,
  FlaskConical,
  Microscope,
  FileCheck,
  ClipboardList,
  Download,
  Upload,
  PlusCircle,
  ChevronRight,
  BarChart3,
  ArrowDown,
  MonitorSmartphone,
} from "lucide-react"
import { RequestStatusBadge } from "./request-status-badge"
import { SampleStatusDialog } from "./sample-status-dialog"
import { toast } from "sonner"

interface RequestSummaryDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (requestId: string, newStatus: string) => void
}

export function RequestSummaryDialog({ request, open, onOpenChange, onStatusChange }: RequestSummaryDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [comment, setComment] = useState("")
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  if (!request) return null

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "pending receive sample":
        return "bg-yellow-50 text-yellow-700 border-yellow-300"
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-300"
      case "completed":
        return "bg-green-50 text-green-700 border-green-300"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-300"
      case "approved":
        return "bg-green-50 text-green-700 border-green-300"
      case "terminated":
        return "bg-gray-50 text-gray-700 border-gray-300"
      default:
        return "bg-gray-50 text-gray-700 border-gray-300"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get capability icon
  const CapabilityIcon = ({ capability }: { capability: string }) => {
    switch (capability?.toLowerCase()) {
      case "mechanical":
        return <Layers className="h-4 w-4 text-blue-600" />
      case "thermal":
        return <FlaskConical className="h-4 w-4 text-orange-600" />
      case "microscopy":
        return <Microscope className="h-4 w-4 text-purple-600" />
      case "physical":
        return <Beaker className="h-4 w-4 text-green-600" />
      case "analytical":
        return <FlaskConical className="h-4 w-4 text-red-600" />
      case "r&d":
        return <Beaker className="h-4 w-4 text-indigo-600" />
      case "equipment":
        return <MonitorSmartphone className="h-4 w-4 text-orange-600" />
      default:
        return <Beaker className="h-4 w-4 text-gray-600" />
    }
  }

  // Request type badge component
  const RequestTypeBadge = ({ type }: { type: string }) => {
    switch (type) {
      case "NTR":
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-50 border-blue-200">NTR</Badge>
      case "ASR":
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 hover:bg-purple-50 border-purple-200">ASR</Badge>
      case "ER":
        return <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-50 border-green-200">Equipment Reservation</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const normalizedStatus = status?.toLowerCase() || "";
    
    if (normalizedStatus.includes("pending")) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1 font-medium"
        >
          <Clock3 className="h-3 w-3" /> Pending
        </Badge>
      )
    } else if (normalizedStatus.includes("in-progress")) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1 font-medium"
        >
          <Clock className="h-3 w-3" /> In Progress
        </Badge>
      )
    } else if (normalizedStatus.includes("completed")) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1 font-medium"
        >
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      )
    } else if (normalizedStatus.includes("rejected")) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300 flex items-center gap-1 font-medium"
        >
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      )
    } else if (normalizedStatus.includes("approved")) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300 flex items-center gap-1 font-medium"
        >
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      )
    } else if (normalizedStatus.includes("terminated")) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300 flex items-center gap-1 font-medium"
        >
          <XCircle className="h-3 w-3" /> Terminated
        </Badge>
      )
    } else {
      return <Badge variant="outline">{status}</Badge>
    }
  }

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      const response = await fetch("/api/requests/manage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [request.id],
          status: newStatus,
          note: comment,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Close the dialog
        if (onStatusChange) {
          onStatusChange(request.id, newStatus)
        }
        toast.success(`Request status updated to ${newStatus}`)
        onOpenChange(false)
      } else {
        toast.error(data.error || "Failed to update request status")
      }
    } catch (error) {
      console.error("Error updating request status:", error)
      toast.error("An error occurred while updating request status")
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Display tabs based on request type
  const tabsForRequestType = () => {
    // Common tabs for all request types
    const commonTabs = [
      { value: "overview", label: "Overview" },
      { value: "activity", label: "Activity Log" },
      { value: "documents", label: "Documents" }
    ];
    
    // Custom tabs based on request type
    if (request.type === "NTR" || request.type === "ASR") {
      return [...commonTabs, { value: "results", label: "Results" }];
    } else if (request.type === "ER") {
      return [...commonTabs, { value: "equipment", label: "Equipment" }];
    }
    
    return commonTabs;
  };

  // Mock activity data
  const activities = [
    {
      id: 1,
      user: "System",
      action: `created new ${request.type} request`,
      timestamp: request.requestDate,
      avatar: "",
    },
    {
      id: 2,
      user: "System",
      action: "changed status to In Progress",
      timestamp: "2023-10-16 10:15 AM",
      avatar: "",
    },
    {
      id: 3,
      user: request.assignedTo !== "Unassigned" ? request.assignedTo : "System",
      action: request.assignedTo !== "Unassigned" 
        ? "added a comment: 'Initial assessment complete. Will begin testing tomorrow.'"
        : "waiting for assignment",
      timestamp: "2023-10-16 02:45 PM",
      avatar: "",
    },
  ]

  // Mock documents
  const documents = [
    {
      id: 1,
      name: "Test Protocol.pdf",
      type: "PDF",
      size: "1.2 MB",
      uploadedBy: request.requester,
      uploadedAt: request.requestDate,
    },
    {
      id: 2,
      name: request.type === "ER" ? "Equipment Specifications.pdf" : "Sample Images.zip",
      type: request.type === "ER" ? "PDF" : "ZIP",
      size: "4.5 MB",
      uploadedBy: request.requester,
      uploadedAt: request.requestDate,
    },
  ]

  const tabs = tabsForRequestType();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{request.title}</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Request ID: {request.id} • Submitted on {request.requestDate}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <RequestTypeBadge type={request.type} />
              <StatusBadge status={request.status} />
              <Badge className={`${getPriorityColor(request.priority)} font-medium px-3`}>
                {request.priority?.charAt(0).toUpperCase() + request.priority?.slice(1) || "Normal"} Priority
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-${tabs.length} mb-4`}>
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{request.description || "No description provided."}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Request Type</h4>
                      <div className="flex items-center gap-2">
                        <RequestTypeBadge type={request.type} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Capability</h4>
                      <div className="flex items-center gap-2">
                        <CapabilityIcon capability={request.capability} />
                        <span>{request.capability || "Not specified"}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Department</h4>
                      <p className="text-sm">{request.department || "Not specified"}</p>
                    </div>
                    {request.type !== "ER" && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Number of Samples</h4>
                        <p className="text-sm">{request.samples || 0}</p>
                      </div>
                    )}
                    {request.type === "ER" && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Reservation Period</h4>
                        <p className="text-sm">
                          {request.reservationStartDate && request.reservationEndDate ? 
                            `${request.reservationStartDate} to ${request.reservationEndDate}` : 
                            request.dueDate || "Not specified"}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{request.dueDate || "Not specified"}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Progress</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={request.progress} className="h-2 w-20" />
                        <span className="text-sm">{request.progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">People</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Requester</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {request.requester
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.requester}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h4>
                    <div className="flex items-center gap-2">
                      {request.assignedTo !== "Unassigned" ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {request.assignedTo
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{request.assignedTo}</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                  </div>
                  
                  {(request.type === "NTR" || request.type === "ASR") && (
                    <div className="flex items-center gap-2">
                      <SampleStatusDialog
                        requestId={request.id}
                        open={sampleDialogOpen}
                        onOpenChange={setSampleDialogOpen}
                        onSampleStatusChange={() => {
                          // Optionally, you could refresh the request data here
                          if (onStatusChange) {
                            onStatusChange(request.id, request.status)
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setSampleDialogOpen(true)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Manage Samples
                      </Button>
                    </div>
                  )}

                  {request.type === "ER" && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <MonitorSmartphone className="h-4 w-4 mr-2" />
                        Equipment Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add Comment</CardTitle>
                <CardDescription>Add notes or instructions for the team</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setComment("")}>
                  Cancel
                </Button>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Activity Log</CardTitle>
                <CardDescription>Recent activity on this request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        {activity.avatar ? (
                          <AvatarImage src={activity.avatar} alt={activity.user} />
                        ) : (
                          <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-sm text-muted-foreground">{activity.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Documents</CardTitle>
                <CardDescription>Files associated with this request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {request.type !== "ER" && (
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Test Results</CardTitle>
                  <CardDescription>
                    {request.status === "completed"
                      ? "View the final results and reports"
                      : "Results will be available once testing is complete"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {request.status === "completed" ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Summary of Findings</h3>
                        <p className="text-sm">
                          All tests were completed successfully. The sample met all required specifications with no
                          significant deviations.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-md">
                          <h3 className="font-medium mb-2">Test Parameters</h3>
                          <ul className="text-sm space-y-1">
                            <li>Temperature: 23°C ± 2°C</li>
                            <li>Humidity: 50% ± 5%</li>
                            <li>Test Method: ASTM D638</li>
                            <li>Equipment: Instron 5567</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-md">
                          <h3 className="font-medium mb-2">Key Results</h3>
                          <ul className="text-sm space-y-1">
                            <li>Tensile Strength: 35.2 MPa</li>
                            <li>Elongation at Break: 450%</li>
                            <li>Modulus: 950 MPa</li>
                            <li>Tear Resistance: 120 N/mm</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Download Full Report
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No Results Yet</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        Test results will be available here once the testing process is complete. Check back later or
                        enable notifications to be alerted when results are ready.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {request.type === "ER" && (
            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Equipment Details</CardTitle>
                  <CardDescription>
                    Equipment reserved for this request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Reservation Period</h3>
                      <p className="text-sm">
                        {request.originalData?.reservationStartDate ? 
                          `From ${request.originalData.reservationStartDate} to ${request.originalData.reservationEndDate}` : 
                          request.dueDate ? `Due by ${request.dueDate}` : "No specific period set"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Equipment List</h3>
                        <div className="space-y-2">
                          {request.originalData?.jsonEquipmentList ? (
                            JSON.parse(request.originalData.jsonEquipmentList || "[]").map((equipment: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                                <div className="flex items-center gap-2">
                                  <MonitorSmartphone className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium">{equipment.name || "Equipment " + (index + 1)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      ID: {equipment.id || "N/A"} • Location: {equipment.location || "Not specified"}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                  {equipment.status || "Reserved"}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No equipment information available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/request/${request.id}`} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                View Full Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {request.status.toLowerCase() === "pending receive sample" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={statusUpdateLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleStatusChange("in-progress")}
                  disabled={statusUpdateLoading}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Processing
                </Button>
              </>
            )}
            {request.status.toLowerCase() === "in-progress" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={statusUpdateLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange("completed")}
                  disabled={statusUpdateLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </>
            )}
            {request.status.toLowerCase() === "completed" && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusChange("approved")}
                disabled={statusUpdateLoading}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {request.status.toLowerCase() === "rejected" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleStatusChange("pending receive sample")}
                disabled={statusUpdateLoading}
              >
                <Clock3 className="h-4 w-4 mr-2" />
                Reopen Request
              </Button>
            )}
            {request.status.toLowerCase() === "approved" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleStatusChange("in-progress")}
                disabled={statusUpdateLoading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Follow-up
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
