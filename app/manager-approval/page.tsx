"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  Loader2,
  Search,
  Filter
} from "lucide-react"
import { format } from "date-fns"

interface PendingRequest {
  id: string
  requestNumber: string
  requestTitle: string
  requesterName: string
  requesterEmail: string
  priority: string
  submissionDate: string
  type: "NTR" | "ASR"
  isApproved: boolean
  urgencyReason?: string
  businessImpact?: string
  expectedResults?: string
}

export default function ManagerApprovalPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "NTR" | "ASR">("all")

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      // Fetch urgent NTR requests
      const ntrResponse = await fetch('/api/requests?priority=urgent&isApproved=false')
      const ntrData = await ntrResponse.json()
      
      console.log('NTR Response:', ntrData)
      
      // Fetch all ASR requests that are not approved
      const asrResponse = await fetch('/api/asrs?isApproved=false')
      const asrData = await asrResponse.json()
      
      console.log('ASR Response:', asrData)
      
      const combinedRequests: PendingRequest[] = []
      
      // Process NTR requests
      if (ntrData.success && ntrData.data) {
        ntrData.data.forEach((request: any) => {
          if (request.priority === 'urgent' && !request.isApproved) {
            combinedRequests.push({
              id: request._id || request.id,
              requestNumber: request.requestNumber,
              requestTitle: request.requestTitle,
              requesterName: request.requesterName,
              requesterEmail: request.requesterEmail,
              priority: request.priority,
              submissionDate: request.createdAt || request.submissionDate,
              type: "NTR",
              isApproved: request.isApproved || false,
              urgencyReason: request.urgencyReason,
              businessImpact: request.businessImpact,
              expectedResults: request.expectedResults
            })
          }
        })
      }
      
      // Process ASR requests
      if (asrData.success && asrData.data) {
        asrData.data.forEach((asr: any) => {
          if (!asr.isApproved) {
            combinedRequests.push({
              id: asr._id || asr.asrId,
              requestNumber: asr.asrNumber,
              requestTitle: asr.asrName,
              requesterName: asr.requesterName,
              requesterEmail: asr.requesterEmail,
              priority: asr.priority || 'normal',
              submissionDate: asr.createdAt || asr.submissionDate,
              type: "ASR",
              isApproved: asr.isApproved || false,
              urgencyReason: asr.urgencyReason,
              businessImpact: asr.businessImpact,
              expectedResults: asr.expectedResults
            })
          }
        })
      }
      
      setPendingRequests(combinedRequests)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      toast({
        title: "Error",
        description: "Failed to load pending requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approve: boolean) => {
    if (!selectedRequest) return
    
    setIsApproving(true)
    
    try {
      const endpoint = selectedRequest.type === "NTR" 
        ? `/api/requests/${selectedRequest.id}/approve`
        : `/api/asrs/${selectedRequest.id}/approve`
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: approve,
          approvedBy: user?.email,
          approvedByName: user?.name,
          approvalNotes: approvalNotes,
          approvedDate: new Date().toISOString()
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: approve ? "Request Approved" : "Request Rejected",
          description: `${selectedRequest.requestNumber} has been ${approve ? 'approved' : 'rejected'} successfully`
        })
        
        setApprovalDialogOpen(false)
        setApprovalNotes("")
        setSelectedRequest(null)
        fetchPendingRequests()
      } else {
        throw new Error(result.error || "Failed to update approval status")
      }
    } catch (error) {
      console.error("Error updating approval:", error)
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === "all" || request.type === filterType
    
    return matchesSearch && matchesType
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Approval Center</h1>
          <p className="text-muted-foreground">
            Review and approve urgent NTR requests and all ASR requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Requests awaiting your approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent NTR</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingRequests.filter(r => r.type === "NTR" && r.priority === "urgent").length}
              </div>
              <p className="text-xs text-muted-foreground">
                High priority requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ASR Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingRequests.filter(r => r.type === "ASR").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Advanced service requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by request number, title, or requester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="NTR">NTR Only</TabsTrigger>
              <TabsTrigger value="ASR">ASR Only</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pending Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approval Requests</CardTitle>
            <CardDescription>
              Click on a request to review details and approve/reject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.requestNumber}</TableCell>
                      <TableCell>
                        <Badge variant={request.type === "NTR" ? "default" : "secondary"}>
                          {request.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{request.requestTitle}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.requesterName}</p>
                          <p className="text-sm text-muted-foreground">{request.requesterEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>
                        {format(new Date(request.submissionDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setApprovalDialogOpen(true)
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Request: {selectedRequest?.requestNumber}</DialogTitle>
            <DialogDescription>
              Review the request details and provide your approval decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Request Type</Label>
                  <p className="font-medium">{selectedRequest.type}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div className="col-span-2">
                  <Label>Request Title</Label>
                  <p className="font-medium">{selectedRequest.requestTitle}</p>
                </div>
                <div>
                  <Label>Requester</Label>
                  <p className="font-medium">{selectedRequest.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.requesterEmail}</p>
                </div>
                <div>
                  <Label>Submission Date</Label>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.submissionDate), 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {selectedRequest.urgencyReason && (
                <div>
                  <Label>Urgency Reason</Label>
                  <p className="mt-1 text-sm">{selectedRequest.urgencyReason}</p>
                </div>
              )}
              
              {selectedRequest.businessImpact && (
                <div>
                  <Label>Business Impact</Label>
                  <p className="mt-1 text-sm">{selectedRequest.businessImpact}</p>
                </div>
              )}
              
              {selectedRequest.expectedResults && (
                <div>
                  <Label>Expected Results</Label>
                  <p className="mt-1 text-sm">{selectedRequest.expectedResults}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="approvalNotes">Approval Notes</Label>
                <Textarea
                  id="approvalNotes"
                  placeholder="Add any notes or comments about this approval decision..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setApprovalDialogOpen(false)
                setApprovalNotes("")
                setSelectedRequest(null)
              }}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApprove(false)}
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => handleApprove(true)}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}