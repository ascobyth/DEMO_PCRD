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
import { SampleStatusBadge } from "./sample-status-badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpDown, Beaker, User } from "lucide-react"
import { toast } from "sonner"

interface Sample {
  id: string
  sampleId: string
  name: string
  status: string
  description: string
  receivedDate: string
  testingStartDate: string
  testingCompletedDate: string
  assignedTo: string
  testMethod: string
}

interface SampleStatusDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSampleStatusChange?: () => void
}

export function SampleStatusDialog({
  requestId,
  open,
  onOpenChange,
  onSampleStatusChange,
}: SampleStatusDialogProps) {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)

  // Load samples when dialog opens
  const loadSamples = async () => {
    if (!requestId || !open) return

    setLoading(true)
    try {
      const response = await fetch(`/api/requests/samples?requestId=${requestId}`)
      const data = await response.json()

      if (data.success) {
        setSamples(data.data || [])
      } else {
        console.error("Failed to load samples:", data.error)
      }
    } catch (error) {
      console.error("Error loading samples:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle updating sample status
  const handleUpdateStatus = async () => {
    if (!selectedSample || !newStatus) return

    setUpdateLoading(true)
    try {
      const response = await fetch("/api/requests/samples", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sampleId: selectedSample.id,
          status: newStatus,
          note: statusNote,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the local state
        setSamples(
          samples.map((sample) =>
            sample.id === selectedSample.id ? { ...sample, status: newStatus } : sample
          )
        )
        setSelectedSample(null)
        setNewStatus("")
        setStatusNote("")
        toast.success("Sample status updated successfully")
        
        // Notify parent component
        if (onSampleStatusChange) {
          onSampleStatusChange()
        }
      } else {
        toast.error(data.error || "Failed to update sample status")
      }
    } catch (error) {
      console.error("Error updating sample status:", error)
      toast.error("An error occurred while updating sample status")
    } finally {
      setUpdateLoading(false)
    }
  }

  // Load samples when dialog opens
  useState(() => {
    if (open) {
      loadSamples()
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sample Status Management</DialogTitle>
          <DialogDescription>
            View and update the status of all samples for this request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : samples.length === 0 ? (
            <div className="text-center p-8">
              <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Samples Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                There are no samples associated with this request or they haven't been added to the system yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {samples.map((sample) => (
                  <Card key={sample.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{sample.name}</h3>
                              <p className="text-sm text-muted-foreground">ID: {sample.sampleId}</p>
                            </div>
                            <SampleStatusBadge status={sample.status} />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                            {sample.description && (
                              <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-sm">{sample.description}</p>
                              </div>
                            )}
                            
                            {sample.testMethod && (
                              <div>
                                <p className="text-xs text-muted-foreground">Test Method</p>
                                <p className="text-sm">{sample.testMethod}</p>
                              </div>
                            )}
                            
                            {sample.assignedTo && (
                              <div>
                                <p className="text-xs text-muted-foreground">Assigned To</p>
                                <div className="flex items-center gap-1 text-sm">
                                  <User className="h-3 w-3" />
                                  <span>{sample.assignedTo}</span>
                                </div>
                              </div>
                            )}
                            
                            {(sample.receivedDate || sample.testingStartDate || sample.testingCompletedDate) && (
                              <div className="col-span-2 mt-1">
                                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                  {sample.receivedDate && (
                                    <div>
                                      <span className="text-muted-foreground">Received:</span> {sample.receivedDate}
                                    </div>
                                  )}
                                  {sample.testingStartDate && (
                                    <div>
                                      <span className="text-muted-foreground">Testing Started:</span>{" "}
                                      {sample.testingStartDate}
                                    </div>
                                  )}
                                  {sample.testingCompletedDate && (
                                    <div>
                                      <span className="text-muted-foreground">Testing Completed:</span>{" "}
                                      {sample.testingCompletedDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 p-4 flex flex-col justify-center items-center min-w-[150px]">
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                              setSelectedSample(sample)
                              setNewStatus(sample.status)
                            }}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSample && (
                <div className="border rounded-md p-4 mt-4 bg-muted/20">
                  <h3 className="font-medium mb-2">Update Status for {selectedSample.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Current Status</label>
                      <SampleStatusBadge status={selectedSample.status} />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">New Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status Options</SelectLabel>
                            <SelectItem value="Pending Receive">Pending Receive</SelectItem>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="In Queue">In Queue</SelectItem>
                            <SelectItem value="In Testing">In Testing</SelectItem>
                            <SelectItem value="Testing Completed">Testing Completed</SelectItem>
                            <SelectItem value="Result Analysis">Result Analysis</SelectItem>
                            <SelectItem value="Verified">Verified</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Insufficient">Insufficient</SelectItem>
                            <SelectItem value="Contaminated">Contaminated</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                            <SelectItem value="Disposed">Disposed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status Note (Optional)</label>
                      <Textarea
                        placeholder="Add details about this status change..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedSample(null)
                          setNewStatus("")
                          setStatusNote("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateStatus} 
                        disabled={selectedSample.status === newStatus || updateLoading}
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={loadSamples}>
            Refresh Samples
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
