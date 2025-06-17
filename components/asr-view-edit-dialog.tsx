"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  Calendar,
  User,
  FileText,
  Target,
  AlertCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Save,
  X,
  FolderPlus,
  Upload,
  Trash2,
  Beaker,
  Microscope,
  ExternalLink,
  Download
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"

interface AsrViewEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asrId: string
  onUpdate?: () => void
}

interface UserOption {
  value: string
  label: string
}

export function AsrViewEditDialog({ open, onOpenChange, asrId, onUpdate }: AsrViewEditDialogProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [asrData, setAsrData] = useState<any>(null)
  const [editedData, setEditedData] = useState<any>({})
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [folderInitialized, setFolderInitialized] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<string[]>([])
  const [subRequests, setSubRequests] = useState<any[]>([])
  const [subRequestsLoading, setSubRequestsLoading] = useState(false)
  const [subRequestsSummary, setSubRequestsSummary] = useState<any>(null)

  useEffect(() => {
    if (open && asrId) {
      fetchAsrData()
      fetchUsers()
      fetchSubRequests()
    }
  }, [open, asrId])

  const fetchAsrData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/asrs/${asrId}`)
      const result = await response.json()
      
      if (result.success) {
        setAsrData(result.data)
        
        // Check if folder exists
        if (result.data.asrLink) {
          setFolderInitialized(true)
          checkExistingFiles(result.data.asrLink)
        }
        
        // Parse team members if they exist
        let members: string[] = []
        if (result.data.asrPpcMemberList) {
          try {
            members = JSON.parse(result.data.asrPpcMemberList)
          } catch {
            // If not JSON, try splitting by comma
            members = result.data.asrPpcMemberList.split(',').map((m: string) => m.trim()).filter((m: string) => m)
          }
        }
        setSelectedMembers(members)
        
        setEditedData({
          asrMethodology: result.data.asrMethodology || "",
          asrOwnerName: result.data.requesterName || "",
          asrOwnerEmail: result.data.requesterEmail || "",
          asrEstCompletedDate: result.data.asrEstCompletedDate || "",
          asrLink: result.data.asrLink || "",
          asrPpcMemberList: result.data.asrPpcMemberList || "",
          asrStatus: result.data.asrStatus || "Pending Receive",
          completedDate: result.data.completedDate || "",
          approveDate: result.data.approveDate || "",
          sampleReceiveDate: result.data.sampleReceiveDate || "",
          addMemberDate: result.data.addMemberDate || ""
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load ASR data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching ASR:", error)
      toast({
        title: "Error",
        description: "Failed to load ASR data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success && result.data) {
        const userOptions = result.data.map((user: any) => ({
          value: user.email,
          label: `${user.name} (${user.email})`
        }))
        setUsers(userOptions)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchSubRequests = async () => {
    setSubRequestsLoading(true)
    try {
      const response = await fetch(`/api/asrs/${asrId}/sub-requests`)
      const result = await response.json()
      
      if (result.success) {
        setSubRequests(result.data.subRequests || [])
        setSubRequestsSummary(result.data.summary || null)
      }
    } catch (error) {
      console.error("Error fetching sub-requests:", error)
    } finally {
      setSubRequestsLoading(false)
    }
  }

  const checkExistingFiles = async (folderPath: string) => {
    try {
      const response = await fetch(`/api/asrs/files?folder=${encodeURIComponent(folderPath)}`)
      const result = await response.json()
      
      if (result.success && result.files) {
        setExistingFiles(result.files)
      }
    } catch (error) {
      console.error("Error checking existing files:", error)
    }
  }

  const initializeFolder = async () => {
    if (!asrData?.asrNumber) return
    
    const currentYear = new Date().getFullYear()
    const folderPath = `asrresults/${currentYear}/${asrData.asrNumber}`
    
    try {
      const response = await fetch('/api/asrs/initialize-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          asrId: asrData.asrId,
          asrNumber: asrData.asrNumber,
          folderPath 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFolderInitialized(true)
        setEditedData({...editedData, asrLink: folderPath})
        toast({
          title: "Success",
          description: "Folder initialized successfully"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to initialize folder",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error initializing folder:", error)
      toast({
        title: "Error",
        description: "Failed to initialize folder",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setUploadedFiles(Array.from(files))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!uploadedFiles.length || !editedData.asrLink) return
    
    const formData = new FormData()
    uploadedFiles.forEach(file => {
      formData.append('files', file)
    })
    formData.append('folderPath', editedData.asrLink)
    formData.append('asrId', asrData.asrId)
    
    try {
      const response = await fetch('/api/asrs/upload-files', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Files uploaded successfully"
        })
        setUploadedFiles([])
        checkExistingFiles(editedData.asrLink)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload files",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Prepare team members as JSON array
    const teamMembersJson = JSON.stringify(selectedMembers)
    
    try {
      const response = await fetch(`/api/asrs/${asrId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedData,
          asrPpcMemberList: teamMembersJson,
          // Don't send owner fields as they're now read-only
          asrOwnerName: undefined,
          asrOwnerEmail: undefined,
          asrStatus: undefined // Status is also read-only
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "ASR updated successfully"
        })
        setEditMode(false)
        fetchAsrData()
        if (onUpdate) onUpdate()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update ASR",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving ASR:", error)
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
      case "terminated":
        return <XCircle className="h-4 w-4" />
      case "in-progress":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "Pending Receive":
      case "pending receive":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
      case "terminated":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "Pending Receive":
      case "pending receive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">ASR Details</DialogTitle>
              <DialogDescription>
                View and manage ASR request information
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {!loading && (
                <>
                  {editMode ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditMode(false)
                          fetchAsrData() // Reset data
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : asrData ? (
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="samples">Samples</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ASR Number</Label>
                      <p className="font-medium">{asrData.asrNumber}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(asrData.asrStatus)}>
                        {getStatusIcon(asrData.asrStatus)}
                        <span className="ml-1 capitalize">{asrData.asrStatus}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge variant={asrData.priority === 'urgent' ? 'destructive' : 'default'}>
                        {asrData.priority || 'Normal'}
                      </Badge>
                    </div>
                    <div>
                      <Label>Capability</Label>
                      <p className="font-medium">
                        {asrData.capability ? 
                          `${asrData.capability.name} (${asrData.capability.shortName})` : 
                          'Not assigned'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>ASR Name/Title</Label>
                    <p className="font-medium">{asrData.asrName}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Details</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {asrData.asrDetail || "No details provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Test Objective</Label>
                      <p className="text-sm">{asrData.problemSource || "Not specified"}</p>
                    </div>
                    <div>
                      <Label>Expected Results</Label>
                      <p className="text-sm">{asrData.expectedResults || "Not specified"}</p>
                    </div>
                  </div>

                  {asrData.businessImpact && (
                    <div className="space-y-2">
                      <Label>Business Impact</Label>
                      <p className="text-sm text-muted-foreground">
                        {asrData.businessImpact}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requester Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{asrData.requesterName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{asrData.requesterEmail}</p>
                    </div>
                    <div>
                      <Label>Cost Center</Label>
                      <p className="font-medium">{asrData.requesterCostCenter || "Not specified"}</p>
                    </div>
                    <div>
                      <Label>IO Number</Label>
                      <p className="font-medium">
                        {asrData.useIoNumber && asrData.ioCostCenter ? 
                          asrData.ioCostCenter : 
                          "Not using IO"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {asrData.urgencyType && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Urgent Request Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Urgency Type</Label>
                        <p className="font-medium capitalize">
                          {asrData.urgencyType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <Label>Approver</Label>
                        <p className="font-medium">{asrData.approver || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Urgency Reason</Label>
                      <p className="text-sm text-muted-foreground">
                        {asrData.urgencyReason || "Not specified"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="samples" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {asrData.samples && asrData.samples.length > 0 ? (
                    <div className="space-y-2">
                      {asrData.samples.map((sample: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{sample.generatedName || sample.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {sample.category} • {sample.type} • {sample.form}
                              </p>
                            </div>
                            <Badge variant="outline">Sample {index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No samples added</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="asrOwnerName">Project Owner Name</Label>
                      <p className="font-medium">{asrData?.requesterName || "Not assigned"}</p>
                    </div>
                    <div>
                      <Label htmlFor="asrOwnerEmail">Project Owner Email</Label>
                      <p className="font-medium">{asrData?.requesterEmail || "Not assigned"}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="asrMethodology">Methodology</Label>
                    {editMode ? (
                      <Textarea
                        id="asrMethodology"
                        value={editedData.asrMethodology}
                        onChange={(e) => setEditedData({...editedData, asrMethodology: e.target.value})}
                        placeholder="Enter methodology to be used"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="mt-1">{asrData?.asrMethodology || "Not specified"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="asrPpcMemberList">Team Members</Label>
                    {editMode ? (
                      <div className="space-y-2">
                        <SearchableSelect
                          options={users}
                          value=""
                          onChange={(value) => {
                            if (value && !selectedMembers.includes(value)) {
                              setSelectedMembers([...selectedMembers, value])
                            }
                          }}
                          placeholder="Search and select team members..."
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedMembers.map((member) => {
                            const user = users.find(u => u.value === member)
                            return (
                              <Badge key={member} variant="secondary">
                                {user?.label || member}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 h-4 w-4 p-0"
                                  onClick={() => setSelectedMembers(prev => prev.filter(m => m !== member))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedMembers.length > 0 ? (
                          selectedMembers.map((member) => {
                            const user = users.find(u => u.value === member)
                            return (
                              <Badge key={member} variant="outline">
                                {user?.label || member}
                              </Badge>
                            )
                          })
                        ) : (
                          <p className="text-muted-foreground">No team members assigned</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Results Folder</Label>
                    {!folderInitialized ? (
                      editMode ? (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={initializeFolder}
                          >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Initialize Folder
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-1 text-muted-foreground">No folder initialized</p>
                      )
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-sm font-medium">
                          /public/{editedData.asrLink || asrData.asrLink}
                        </p>
                        
                        {editMode && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="flex-1"
                                accept="*/*"
                              />
                              <Button
                                size="sm"
                                onClick={uploadFiles}
                                disabled={uploadedFiles.length === 0}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload
                              </Button>
                            </div>
                            
                            {uploadedFiles.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Files to upload:</p>
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span>{file.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {existingFiles.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Existing files:</p>
                            {existingFiles.map((file, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                {file}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Badge className={`mt-2 ${getStatusColor(asrData.asrStatus)}`}>
                      {getStatusIcon(asrData.asrStatus)}
                      <span className="ml-1 capitalize">{asrData.asrStatus}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sub-Requests</CardTitle>
                  <CardDescription>
                    NTR and ER requests created under this ASR project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subRequestsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : subRequests.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary stats */}
                      {subRequestsSummary && (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold">{subRequestsSummary.totalRequests}</p>
                            <p className="text-sm text-muted-foreground">Total Requests</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold">{subRequestsSummary.ntrCount}</p>
                            <p className="text-sm text-muted-foreground">NTR</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold">{subRequestsSummary.erCount}</p>
                            <p className="text-sm text-muted-foreground">ER</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <p className="text-2xl font-bold">{subRequestsSummary.statusCounts.completed || 0}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                          </div>
                        </div>
                      )}

                      {/* Request list */}
                      <div className="space-y-2">
                        {subRequests.map((request: any) => (
                          <div key={request.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {request.type === 'NTR' ? (
                                    <Beaker className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <Microscope className="h-4 w-4 text-purple-500" />
                                  )}
                                  <span className="font-medium">{request.requestNumber}</span>
                                  <Badge variant={request.type === 'NTR' ? 'default' : 'secondary'}>
                                    {request.type}
                                  </Badge>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                  {request.priority === 'urgent' && (
                                    <Badge variant="destructive">Urgent</Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-1">{request.requestTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted on {format(new Date(request.submissionDate), 'PPP')}
                                </p>
                                {request.type === 'NTR' && request.samples && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {request.samples.length} sample{request.samples.length !== 1 ? 's' : ''} • 
                                    {request.testMethods.length} test method{request.testMethods.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                                {request.type === 'ER' && request.equipment && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {request.equipment.length} equipment reservation{request.equipment.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {request.datapool && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/public/${request.datapool}`, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Results
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/request-management?search=${request.requestNumber}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sub-requests created yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create NTR or ER requests from the request management page
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline & Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Submission Date</Label>
                      <p className="font-medium">
                        {asrData.submissionDate ? 
                          format(new Date(asrData.submissionDate), 'PPP') : 
                          'Not available'}
                      </p>
                    </div>
                    <div>
                      <Label>Required Date</Label>
                      <p className="font-medium">
                        {asrData.asrRequireDate ? 
                          format(new Date(asrData.asrRequireDate), 'PPP') : 
                          'Not specified'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="asrEstCompletedDate">Estimated Completion Date</Label>
                      {editMode ? (
                        <Input
                          id="asrEstCompletedDate"
                          type="date"
                          value={editedData.asrEstCompletedDate}
                          onChange={(e) => setEditedData({...editedData, asrEstCompletedDate: e.target.value})}
                        />
                      ) : (
                        <p className="font-medium">
                          {asrData.asrEstCompletedDate ? 
                            format(new Date(asrData.asrEstCompletedDate), 'PPP') : 
                            'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sampleReceiveDate">Sample Receive Date</Label>
                      {editMode ? (
                        <Input
                          id="sampleReceiveDate"
                          type="date"
                          value={editedData.sampleReceiveDate}
                          onChange={(e) => setEditedData({...editedData, sampleReceiveDate: e.target.value})}
                        />
                      ) : (
                        <p className="font-medium">
                          {asrData.sampleReceiveDate ? 
                            format(new Date(asrData.sampleReceiveDate), 'PPP') : 
                            'Not received'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="approveDate">Approval Date</Label>
                      {editMode ? (
                        <Input
                          id="approveDate"
                          type="date"
                          value={editedData.approveDate}
                          onChange={(e) => setEditedData({...editedData, approveDate: e.target.value})}
                        />
                      ) : (
                        <p className="font-medium">
                          {asrData.approveDate ? 
                            format(new Date(asrData.approveDate), 'PPP') : 
                            'Not approved'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addMemberDate">Team Assignment Date</Label>
                      {editMode ? (
                        <Input
                          id="addMemberDate"
                          type="date"
                          value={editedData.addMemberDate}
                          onChange={(e) => setEditedData({...editedData, addMemberDate: e.target.value})}
                        />
                      ) : (
                        <p className="font-medium">
                          {asrData.addMemberDate ? 
                            format(new Date(asrData.addMemberDate), 'PPP') : 
                            'Not assigned'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="completedDate">Completion Date</Label>
                      {editMode ? (
                        <Input
                          id="completedDate"
                          type="date"
                          value={editedData.completedDate}
                          onChange={(e) => setEditedData({...editedData, completedDate: e.target.value})}
                        />
                      ) : (
                        <p className="font-medium">
                          {asrData.completedDate ? 
                            format(new Date(asrData.completedDate), 'PPP') : 
                            'Not completed'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {asrData.experts && asrData.experts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Experts</CardTitle>
                    <CardDescription>
                      Based on capability requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {asrData.experts.map((expert: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{expert.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {expert.position} • {expert.department}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}