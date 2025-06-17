"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  Eye,
  Folder,
  FolderOpen,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
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

interface AttachedFile {
  filename: string
  uploadDate: string
  fileSize: number
  fileId: string
}

interface TestingSample {
  testingListId: string
  sampleName: string
  fullSampleName?: string
  methodCode: string
  sampleStatus: string
  testingRemark?: string
  attachedFiles?: AttachedFile[]
}

interface MethodGroup {
  methodCode: string
  samples: TestingSample[]
  hasFiles: boolean
  isCompleted: boolean
  attachedFiles: AttachedFile[]
  canComplete: boolean
}

export default function EntryResultsPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingSamples, setTestingSamples] = useState<TestingSample[]>([])
  const [requestInfo, setRequestInfo] = useState<any>(null)
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [uploadingMethod, setUploadingMethod] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: { current: number; total: number } }>({})
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [methodGroups, setMethodGroups] = useState<MethodGroup[]>([])
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null)

  // Load testing samples
  const loadTestingSamples = async () => {
    try {
      console.log("Loading testing samples for request:", requestId)
      // Load all testing samples for this request (not just pending entry results)
      const response = await fetch(`/api/testing-samples?requestNumber=${requestId}`)
      const data = await response.json()

      console.log("Testing samples response:", data)

      if (data.success) {
        // Filter samples that are either "Pending Entry Results" or "completed"
        const relevantSamples = (data.data || []).filter((sample: any) => 
          sample.sampleStatus === "Pending Entry Results" || sample.sampleStatus === "completed"
        )
        setTestingSamples(relevantSamples)
        console.log("Loaded testing samples:", relevantSamples)
      } else {
        console.error("Failed to load testing samples:", data)
        toast.error("Failed to load testing samples")
      }
    } catch (error) {
      console.error("Error loading testing samples:", error)
      toast.error("Error loading testing samples")
    }
  }

  // Load request info
  const loadRequestInfo = async () => {
    try {
      const response = await fetch(`/api/requests/${requestId}`)
      const data = await response.json()

      if (data.success) {
        setRequestInfo(data.data)
      }
    } catch (error) {
      console.error("Error loading request info:", error)
    }
  }

  // Group samples by method code
  useEffect(() => {
    const groups = testingSamples.reduce((acc: { [key: string]: TestingSample[] }, sample) => {
      const method = sample.methodCode || "Unknown"
      if (!acc[method]) {
        acc[method] = []
      }
      acc[method].push(sample)
      return acc
    }, {})

    const groupArray: MethodGroup[] = Object.entries(groups).map(([methodCode, samples]) => {
      // Collect all attached files from all samples in this method group
      const allFiles: AttachedFile[] = []
      samples.forEach(sample => {
        if (sample.attachedFiles && sample.attachedFiles.length > 0) {
          allFiles.push(...sample.attachedFiles)
        }
      })
      
      // Remove duplicates based on fileId
      const uniqueFiles = allFiles.filter((file, index, self) =>
        index === self.findIndex(f => f.fileId === file.fileId)
      )

      const completedSamples = samples.filter(s => s.sampleStatus === "completed")
      const pendingSamples = samples.filter(s => s.sampleStatus === "Pending Entry Results")
      
      return {
        methodCode,
        samples,
        hasFiles: uniqueFiles.length > 0,
        isCompleted: samples.every(s => s.sampleStatus === "completed"),
        canComplete: pendingSamples.length > 0 && uniqueFiles.length > 0, // Can complete if has pending samples and files
        attachedFiles: uniqueFiles
      }
    })

    setMethodGroups(groupArray)
  }, [testingSamples])

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadTestingSamples(), loadRequestInfo()])
      setLoading(false)
    }
    loadData()
  }, [requestId])

  // Handle drag events
  const handleDrag = (e: React.DragEvent, methodCode: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(methodCode)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  // Handle file drop
  const handleDrop = async (e: React.DragEvent, methodCode: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Handle multiple files
      const files = Array.from(e.dataTransfer.files)
      console.log(`Dropping ${files.length} files for method ${methodCode}`)
      
      setUploadingMethod(methodCode)
      setUploadProgress({ [methodCode]: { current: 0, total: files.length } })
      
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < files.length; i++) {
        console.log(`Uploading file ${i + 1}/${files.length}: ${files[i].name}`)
        setUploadProgress({ [methodCode]: { current: i + 1, total: files.length } })
        
        try {
          const success = await handleFileUpload(files[i], methodCode, false) // false = don't clear uploading state
          if (success) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error(`Error uploading file ${files[i].name}:`, error)
          errorCount++
        }
        
        // Add a small delay between uploads to prevent overwhelming the server
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      setUploadingMethod(null)
      setUploadProgress({})
      
      // Show summary message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''}, ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`)
      }
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, methodCode: string) => {
    if (e.target.files && e.target.files.length > 0) {
      // Handle multiple files
      const files = Array.from(e.target.files)
      console.log(`Selecting ${files.length} files for method ${methodCode}`)
      
      setUploadingMethod(methodCode)
      setUploadProgress({ [methodCode]: { current: 0, total: files.length } })
      
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < files.length; i++) {
        console.log(`Uploading file ${i + 1}/${files.length}: ${files[i].name}`)
        setUploadProgress({ [methodCode]: { current: i + 1, total: files.length } })
        
        try {
          const success = await handleFileUpload(files[i], methodCode, false) // false = don't clear uploading state
          if (success) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error(`Error uploading file ${files[i].name}:`, error)
          errorCount++
        }
        
        // Add a small delay between uploads to prevent overwhelming the server
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      setUploadingMethod(null)
      setUploadProgress({})
      
      // Show summary message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''}, ${errorCount} failed`)
      } else if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`)
      }
      
      // Clear the input so the same files can be selected again
      e.target.value = ''
    }
  }

  // Upload file for a method
  const handleFileUpload = async (file: File, methodCode: string, clearUploadingState: boolean = true): Promise<boolean> => {
    console.log("Starting file upload for method:", methodCode, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    if (file.size > 10 * 1024 * 1024) {
      if (clearUploadingState) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`)
      }
      return false
    }

    if (clearUploadingState) {
      setUploadingMethod(methodCode)
    }
    
    try {
      // Get the first sample for this method to upload the file
      const methodSamples = testingSamples.filter(s => s.methodCode === methodCode)
      if (methodSamples.length === 0) {
        if (clearUploadingState) {
          toast.error("No samples found for this method")
        }
        return false
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("testingListId", methodSamples[0].testingListId)
      formData.append("requestNumber", requestId)

      console.log("Sending upload request to /api/upload/test-results")

      const response = await fetch("/api/upload/test-results", {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)

      const data = await response.json()
      console.log("Upload response data:", data)

      if (data.success) {
        if (clearUploadingState) {
          toast.success(`File uploaded successfully for ${methodCode}`)
        }
        
        // Add the new file to all samples for this method
        const newFile: AttachedFile = {
          filename: file.name,
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          fileId: data.fileId,
        }

        setTestingSamples(samples =>
          samples.map(sample =>
            sample.methodCode === methodCode
              ? {
                  ...sample,
                  attachedFiles: [...(sample.attachedFiles || []), newFile],
                }
              : sample
          )
        )
        return true
      } else {
        console.error("Upload failed:", data)
        if (clearUploadingState) {
          toast.error(data.error || "Failed to upload file")
        }
        return false
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      if (clearUploadingState) {
        toast.error("Error uploading file")
      }
      return false
    } finally {
      if (clearUploadingState) {
        setUploadingMethod(null)
      }
    }
  }

  // Remove a specific file from a method
  const handleRemoveFile = async (methodCode: string, fileId: string) => {
    console.log("Removing file:", { methodCode, fileId })
    
    const methodSamples = testingSamples.filter(s => s.methodCode === methodCode)
    if (methodSamples.length === 0) {
      console.error("No samples found for method:", methodCode)
      return
    }

    const testingListId = methodSamples[0].testingListId
    console.log("Using testingListId:", testingListId)

    try {
      const response = await fetch(`/api/upload/test-results/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testingListId, methodCode }),
      })

      console.log("Delete response status:", response.status)
      console.log("Delete response headers:", response.headers)
      
      const responseText = await response.text()
      console.log("Delete response text:", responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        toast.error("Invalid response from server")
        return
      }
      
      console.log("Delete response data:", data)

      if (data.success) {
        toast.success("File removed successfully")
        
        // Remove the file from all samples for this method
        setTestingSamples(samples =>
          samples.map(sample =>
            sample.methodCode === methodCode
              ? {
                  ...sample,
                  attachedFiles: (sample.attachedFiles || []).filter(f => f.fileId !== fileId)
                }
              : sample
          )
        )
      } else {
        console.error("Failed to remove file:", data)
        toast.error(data.error || "Failed to remove file")
      }
    } catch (error) {
      console.error("Error removing file:", error)
      toast.error("Error removing file")
    }
  }

  // Toggle method selection
  const toggleMethodSelection = (methodCode: string) => {
    setSelectedMethods(prev =>
      prev.includes(methodCode)
        ? prev.filter(m => m !== methodCode)
        : [...prev, methodCode]
    )
  }

  // Handle complete selected methods
  const handleCompleteSelected = () => {
    const methodsToComplete = selectedMethods.filter(methodCode => {
      const group = methodGroups.find(g => g.methodCode === methodCode)
      return group && group.canComplete
    })

    if (methodsToComplete.length === 0) {
      toast.error("No methods available to complete")
      return
    }

    setConfirmCompleteOpen(true)
  }

  // Handle confirm complete
  const handleConfirmComplete = async () => {
    setSaving(true)
    setConfirmCompleteOpen(false)

    try {
      const currentUser = "Current User" // Should get from auth context
      const entryResultDate = new Date().toISOString()

      // Get only pending samples for selected methods that have files
      const samplesToComplete = testingSamples.filter(
        sample => selectedMethods.includes(sample.methodCode) && 
                 sample.sampleStatus === "Pending Entry Results" &&
                 sample.attachedFiles && sample.attachedFiles.length > 0
      )

      // Update status for each sample
      const updatePromises = samplesToComplete.map(sample =>
        fetch("/api/testing-samples", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testingListId: sample.testingListId,
            status: "completed",
            entryResultDate,
            entryResultBy: currentUser,
          }),
        })
      )

      const results = await Promise.all(updatePromises)
      const allSuccessful = results.every(res => res.ok)

      if (allSuccessful) {
        toast.success(`Completed ${selectedMethods.length} method(s)`)
        
        // Refresh the page to show updated status
        await loadTestingSamples()
        setSelectedMethods([])
        
        // Check if ALL testing samples are now completed
        const response = await fetch(`/api/testing-samples?requestNumber=${requestId}`)
        const allSamplesData = await response.json()
        
        if (allSamplesData.success) {
          const relevantSamples = allSamplesData.data.filter((s: any) => 
            s.sampleStatus === "Pending Entry Results" || s.sampleStatus === "completed"
          )
          const allCompleted = relevantSamples.every((s: any) => s.sampleStatus === "completed")
          
          if (allCompleted && relevantSamples.length > 0) {
            // All samples completed, update request status
            const requestResponse = await fetch(`/api/requests/${requestId}/status`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                requestStatus: "completed",
                completeDate: entryResultDate,
              }),
            })

            if (requestResponse.ok) {
              toast.success("All samples completed! Request marked as completed.")
              setTimeout(() => {
                router.push("/request-management")
              }, 1500)
            }
          }
        }
      } else {
        toast.error("Some samples failed to update")
      }
    } catch (error) {
      console.error("Error completing samples:", error)
      toast.error("Failed to complete samples")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading testing samples...</p>
        </div>
      </div>
    )
  }

  const completedMethods = methodGroups.filter(g => g.isCompleted).length
  const totalMethods = methodGroups.length
  const progressPercentage = totalMethods > 0 ? (completedMethods / totalMethods) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/request-management">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Entry Results - {requestId}</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-6xl">
        {/* Request Info */}
        {requestInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{requestInfo.requestTitle}</CardTitle>
              <CardDescription>
                Request #{requestInfo.requestNumber} • Status: {requestInfo.requestStatus}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Methods completed</span>
                <span>
                  {completedMethods} of {totalMethods}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Method Groups - Folder Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {methodGroups.map((group) => (
            <Card
              key={group.methodCode}
              className={`relative overflow-hidden transition-all ${
                dragActive === group.methodCode ? "ring-2 ring-primary" : ""
              } ${group.isCompleted ? "opacity-75" : ""}`}
            >
              <CardContent className="p-6">
                {/* Checkbox for selection */}
                {group.canComplete && (
                  <div className="absolute top-4 right-4">
                    <Checkbox
                      checked={selectedMethods.includes(group.methodCode)}
                      onCheckedChange={() => toggleMethodSelection(group.methodCode)}
                    />
                  </div>
                )}

                {/* Method Code Header */}
                <div className="flex items-center gap-3 mb-4">
                  {group.isCompleted ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : group.hasFiles ? (
                    <FolderOpen className="h-8 w-8 text-primary" />
                  ) : (
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{group.methodCode}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.samples.length} sample{group.samples.length > 1 ? "s" : ""} • {group.attachedFiles.length} file{group.attachedFiles.length !== 1 ? "s" : ""}
                      {group.isCompleted ? "" : group.samples.filter(s => s.sampleStatus === "completed").length > 0 ? 
                        ` • ${group.samples.filter(s => s.sampleStatus === "completed").length}/${group.samples.length} completed` : ""
                      }
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <Badge
                    variant={
                      group.isCompleted
                        ? "success"
                        : group.samples.filter(s => s.sampleStatus === "completed").length > 0
                        ? "default"
                        : group.hasFiles
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {group.isCompleted
                      ? "All Completed"
                      : group.samples.filter(s => s.sampleStatus === "completed").length > 0
                      ? "Partially Completed"
                      : group.hasFiles
                      ? `${group.attachedFiles.length} File${group.attachedFiles.length !== 1 ? 's' : ''} Uploaded`
                      : "Pending Upload"}
                  </Badge>
                </div>

                {/* File Upload/Display Area */}
                {!group.isCompleted && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive === group.methodCode
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25"
                    }`}
                    onDragEnter={(e) => handleDrag(e, group.methodCode)}
                    onDragLeave={(e) => handleDrag(e, group.methodCode)}
                    onDragOver={(e) => handleDrag(e, group.methodCode)}
                    onDrop={(e) => handleDrop(e, group.methodCode)}
                  >
                    {uploadingMethod === group.methodCode ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">
                          {uploadProgress[group.methodCode] 
                            ? `Uploading ${uploadProgress[group.methodCode].current} of ${uploadProgress[group.methodCode].total}...`
                            : "Uploading..."
                          }
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-1">
                          Drop files here or
                        </p>
                        <p className="text-xs text-muted-foreground/80 mb-2">
                          PDF, Excel, Word, CSV, Images
                        </p>
                        <input
                          type="file"
                          id={`file-${group.methodCode}`}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif"
                          multiple
                          onChange={(e) => handleFileSelect(e, group.methodCode)}
                        />
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                          <label htmlFor={`file-${group.methodCode}`} className="cursor-pointer">
                            browse
                          </label>
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Display uploaded files */}
                {group.hasFiles && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Uploaded Files:</p>
                    {group.attachedFiles.map((file) => (
                      <div key={file.fileId} className="bg-muted/50 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-xs font-medium truncate">
                              {file.filename}
                            </p>
                          </div>
                          {!group.isCompleted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={() => handleRemoveFile(group.methodCode, file.fileId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show sample details on click */}
                {group.samples.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={() => setExpandedMethod(
                      expandedMethod === group.methodCode ? null : group.methodCode
                    )}
                  >
                    {expandedMethod === group.methodCode ? "Hide" : "Show"} samples
                  </Button>
                )}

                {/* Expanded sample details */}
                {expandedMethod === group.methodCode && (
                  <div className="mt-3 space-y-1 text-xs">
                    {group.samples.map((sample) => (
                      <div key={sample.testingListId} className="p-2 bg-muted/30 rounded">
                        <p className="font-medium">{sample.sampleName}</p>
                        {sample.testingRemark && (
                          <p className="text-muted-foreground">{sample.testingRemark}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" asChild>
              <Link href="/request-management">Cancel</Link>
            </Button>
            <Button
              onClick={handleCompleteSelected}
              disabled={selectedMethods.length === 0 || saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Complete Selected ({selectedMethods.length})
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Entry Results</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedMethods.length} method(s) as completed?
              {methodGroups.every(g => g.isCompleted || selectedMethods.includes(g.methodCode)) && (
                <span className="block mt-2 font-medium">
                  This will also mark the entire request as completed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete}>
              Complete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}