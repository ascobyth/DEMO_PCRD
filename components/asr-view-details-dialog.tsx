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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Clock,
  FileText,
  User,
  Briefcase,
  Target,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  FlaskConical,
  FileSearch,
  DollarSign,
  UserCheck,
  CalendarCheck,
  ClipboardList,
  Folder,
  FolderOpen,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Separator as SeparatorImport } from "@/components/ui/separator"

interface SubRequest {
  id: string
  type: 'NTR' | 'ER'
  requestNumber: string
  requestTitle: string
  status: string
  priority: string
  requesterName: string
  requesterEmail: string
  submissionDate: string
  datapool?: boolean
  samples?: string[]
  testMethods?: any[]
  equipment?: string[]
}

interface AsrViewDetailsDialogProps {
  asrData: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AsrViewDetailsDialog({
  asrData,
  open,
  onOpenChange,
}: AsrViewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [subRequests, setSubRequests] = useState<SubRequest[]>([])
  const [loadingSubRequests, setLoadingSubRequests] = useState(false)

  // Fetch sub-requests when dialog opens
  useEffect(() => {
    if (open && asrData?.id) {
      fetchSubRequests()
    }
  }, [open, asrData?.id])

  const fetchSubRequests = async () => {
    if (!asrData?.id) return
    
    setLoadingSubRequests(true)
    try {
      const response = await fetch(`/api/asrs/${asrData.id}/sub-requests`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setSubRequests(result.data.subRequests || [])
      }
    } catch (error) {
      console.error('Error fetching sub-requests:', error)
    } finally {
      setLoadingSubRequests(false)
    }
  }

  // Early return if no data or dialog is not open
  if (!asrData || !open) return null

  const formatDate = (date: string | undefined) => {
    if (!date) return "Not specified"
    return new Date(date).toLocaleDateString()
  }

  const formatProblemSource = (source: string | undefined) => {
    if (!source) return "Not specified"
    return source.charAt(0).toUpperCase() + source.slice(1).replace(/_/g, ' ')
  }

  const formatUrgencyType = (type: string | undefined) => {
    if (!type) return "Not specified"
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSearch className="h-5 w-5 text-purple-600" />
            <span>ASR Details - {asrData.requestNumber || asrData.asrNumber}</span>
          </DialogTitle>
          <DialogDescription>
            Advanced Service Request Information
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="samples">Samples</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="results">Results Folder</TabsTrigger>
              <TabsTrigger value="subrequests">Sub Requests</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-4">
              <TabsContent value="overview" className="space-y-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">ASR Number</p>
                        <p className="font-medium">{asrData.requestNumber || asrData.asrNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <RequestStatusBadge status={asrData.status || asrData.requestStatus || asrData.asrStatus || 'draft'} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ASR Name</p>
                        <p className="font-medium">{asrData.title || asrData.asrName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ASR Type</p>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {asrData.asrType === 'data-analysis' ? 'Data Analysis' : 'Project'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <Badge variant={asrData.priority === 'urgent' ? "destructive" : "default"}>
                          {asrData.priority || 'normal'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Problem Source</p>
                        <p className="font-medium">{formatProblemSource(asrData.problemSource)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requester Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Requester Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Requester Name</p>
                        <p className="font-medium">{asrData.requesterName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{asrData.requesterEmail}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost Center</p>
                        <p className="font-medium">{asrData.requesterCostCenter || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">IO Number</p>
                        <p className="font-medium">
                          {asrData.useIoNumber && asrData.ioNumber ? (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              IO: {asrData.ioNumber}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Non-IO</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ASR Owner Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>ASR Owner</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Owner Name</p>
                        <p className="font-medium">{asrData.asrOwnerName || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Owner Email</p>
                        <p className="font-medium">{asrData.asrOwnerEmail || 'Not assigned'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>Project Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">ASR Details</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
                        {asrData.asrDetail || 'No details provided'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Expected Results</p>
                      <p className="text-sm bg-blue-50 p-3 rounded-md text-blue-800">
                        {asrData.expectedResults || 'No expected results specified'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Business Impact</p>
                      <p className="text-sm bg-amber-50 p-3 rounded-md text-amber-800">
                        {asrData.businessImpact || 'No business impact specified'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Methodology</p>
                      <p className="text-sm bg-green-50 p-3 rounded-md text-green-800">
                        {asrData.asrMethodology || 'No methodology specified'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Urgency Information */}
                {asrData.priority === 'urgent' && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Urgency Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Urgency Type</p>
                        <Badge variant="destructive">{formatUrgencyType(asrData.urgencyType)}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Urgency Reason</p>
                        <p className="text-sm bg-red-50 p-3 rounded-md text-red-800">
                          {asrData.urgencyReason || 'No reason specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Approver</p>
                        <p className="font-medium">{asrData.approver || 'Not specified'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="samples" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FlaskConical className="h-4 w-4" />
                      <span>Sample Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asrData.samples && Array.isArray(asrData.samples) && asrData.samples.length > 0 ? (
                      <div className="space-y-2">
                        {asrData.samples.map((sample: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Sample {index + 1}
                            </Badge>
                            <span className="text-sm">{sample}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No samples specified</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-xs text-muted-foreground">{formatDate(asrData.createdAt)}</p>
                        </div>
                      </div>
                      
                      {asrData.asrRequireDate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Required Date</p>
                            <p className="text-xs text-muted-foreground">{formatDate(asrData.asrRequireDate)}</p>
                          </div>
                        </div>
                      )}

                      {asrData.approveDate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Approved</p>
                            <p className="text-xs text-muted-foreground">{formatDate(asrData.approveDate)}</p>
                          </div>
                        </div>
                      )}

                      {asrData.sampleReceiveDate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Samples Received</p>
                            <p className="text-xs text-muted-foreground">{formatDate(asrData.sampleReceiveDate)}</p>
                          </div>
                        </div>
                      )}

                      {asrData.asrEstCompletedDate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Estimated Completion</p>
                            <p className="text-xs text-muted-foreground">{formatDate(asrData.asrEstCompletedDate)}</p>
                          </div>
                        </div>
                      )}

                      {asrData.completedDate && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Completed</p>
                            <p className="text-xs text-muted-foreground">{formatDate(asrData.completedDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Folder className="h-4 w-4" />
                      <span>Results Folder</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asrData.asrLink ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <FolderOpen className="h-6 w-6 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">ASR Results Folder</p>
                              <p className="text-sm text-blue-700">Contains all analysis results and reports</p>
                            </div>
                          </div>
                          <a 
                            href={asrData.asrLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <span>Open Folder</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>This folder contains:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Analysis reports and presentations</li>
                            <li>Test results and data files</li>
                            <li>Supporting documentation</li>
                            <li>Final project deliverables</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Folder className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">No results folder linked</p>
                        <p className="text-xs text-gray-500 mt-1">Results folder will be available once the ASR is in progress</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subrequests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>Sub Requests</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSubRequests ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Loading sub-requests...</p>
                      </div>
                    ) : subRequests.length > 0 ? (
                      <div className="space-y-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Request ID</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Submitted</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.requestNumber}</TableCell>
                                <TableCell>
                                  <Badge variant={request.type === 'NTR' ? 'default' : 'secondary'}>
                                    {request.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{request.requestTitle}</TableCell>
                                <TableCell>
                                  <RequestStatusBadge status={request.status} />
                                </TableCell>
                                <TableCell>
                                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                                    {request.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(request.submissionDate)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">No sub-requests found</p>
                        <p className="text-xs text-gray-500 mt-1">Sub-requests (NTR/ER) linked to this ASR will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}