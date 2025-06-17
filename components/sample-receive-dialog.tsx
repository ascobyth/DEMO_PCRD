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
import { Checkbox } from "@/components/ui/checkbox"
import { SampleStatusBadge } from "./sample-status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Beaker, CheckCircle2, PackageOpen, Loader2, FlaskConical, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface Sample {
  id: string
  sampleId: string
  name: string
  status: string
  description: string
  testMethod?: string
  receivedDate?: string
  testingStartDate?: string
  testingCompletedDate?: string
  assignedTo?: string
  fullSampleName?: string
  testingRemark?: string
}

interface SampleReceiveDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSamplesReceived?: (requestId: string, newStatus: string) => void
}

export function SampleReceiveDialog({
  requestId,
  open,
  onOpenChange,
  onSamplesReceived,
}: SampleReceiveDialogProps) {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [receivedCount, setReceivedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Load testing samples when dialog opens
  const loadSamples = async () => {
    if (!requestId || !open) return

    setLoading(true)
    try {
      console.log(`Loading testing samples for request ${requestId}`);
      const response = await fetch(`/api/testing-samples?requestNumber=${requestId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`Loaded ${data.data ? data.data.length : 0} testing samples`);
        const samplesData = data.data || [];
        
        // Transform testing samples to match our interface
        const transformedSamples = samplesData.map((testingSample: any) => ({
          id: testingSample.testingListId,
          sampleId: testingSample.sampleId,
          name: testingSample.sampleName,
          status: testingSample.sampleStatus,
          description: testingSample.remark || "",
          testMethod: testingSample.methodCode || "Unknown",
          receivedDate: testingSample.receiveDate ? new Date(testingSample.receiveDate).toLocaleDateString() : null,
          testingStartDate: testingSample.operationCompleteDate ? new Date(testingSample.operationCompleteDate).toLocaleDateString() : null,
          testingCompletedDate: testingSample.entryResultDate ? new Date(testingSample.entryResultDate).toLocaleDateString() : null,
          assignedTo: testingSample.operationCompleteBy || "Unassigned",
          fullSampleName: testingSample.fullSampleName,
          testingRemark: testingSample.testingRemark
        }));
        
        setSamples(transformedSamples);
        
        // Count samples that are already received or in progress
        const received = transformedSamples.filter(
          (sample: Sample) => sample.status !== "Pending Receive" && sample.status !== "draft" && sample.status !== "submitted"
        ).length;
        
        setReceivedCount(received);
        setTotalCount(transformedSamples.length);
        
        // Pre-select samples that are pending receive
        setSelectedSamples(
          transformedSamples
            .filter((sample: Sample) => sample.status === "Pending Receive")
            .map((sample: Sample) => sample.id)
        );
      } else {
        console.error("Failed to load testing samples:", data.error);
        setSamples([]);
      }
    } catch (error) {
      console.error("Error loading testing samples:", error);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle receiving selected samples
  const handleReceiveSelected = async () => {
    if (selectedSamples.length === 0) {
      toast.error("Please select at least one sample to receive")
      return
    }

    setReceiveLoading(true)
    try {
      const response = await fetch("/api/testing-samples/receive", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestNumber: requestId,
          testingSampleIds: selectedSamples,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the sample statuses locally
        setSamples(samples.map(sample => 
          selectedSamples.includes(sample.id) 
            ? { ...sample, status: "In Progress" } 
            : sample
        ))
        
        // Update counts
        setReceivedCount(data.data.receivedSamplesCount)
        setTotalCount(data.data.totalSamplesCount)
        
        // Clear selection
        setSelectedSamples([])
        
        // Notify parent component about status change if all samples received
        if (onSamplesReceived && data.data.allSamplesReceived) {
          onSamplesReceived(requestId, "in-progress")
        }
        
        toast.success(`Successfully received ${selectedSamples.length} sample(s)`)
        
        // If all samples have been received, close the dialog
        if (data.data.allSamplesReceived) {
          setTimeout(() => {
            onOpenChange(false)
          }, 1500)
        }
      } else {
        toast.error(data.error || "Failed to receive samples")
      }
    } catch (error) {
      console.error("Error receiving samples:", error)
      toast.error("An error occurred while receiving samples")
    } finally {
      setReceiveLoading(false)
    }
  }

  // Handle receiving all samples
  const handleReceiveAll = async () => {
    setReceiveLoading(true)
    try {
      const response = await fetch("/api/testing-samples/receive", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestNumber: requestId,
          receiveAll: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update all sample statuses locally
        setSamples(samples.map(sample => 
          sample.status === "Pending Receive" || sample.status === "draft" || sample.status === "submitted"
            ? { ...sample, status: "In Progress" } 
            : sample
        ))
        
        // Update counts
        setReceivedCount(data.data.receivedSamplesCount)
        setTotalCount(data.data.totalSamplesCount)
        
        // Clear selection
        setSelectedSamples([])
        
        // Notify parent component
        if (onSamplesReceived) {
          onSamplesReceived(requestId, "in-progress")
        }
        
        toast.success("Successfully received all samples")
        
        // Close the dialog
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      } else {
        toast.error(data.error || "Failed to receive samples")
      }
    } catch (error) {
      console.error("Error receiving samples:", error)
      toast.error("An error occurred while receiving samples")
    } finally {
      setReceiveLoading(false)
    }
  }

  // Toggle sample selection
  const toggleSampleSelection = (sampleId: string) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId)
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    )
  }

  // Load samples when dialog opens
  useEffect(() => {
    if (open) {
      loadSamples()
    }
  }, [open, requestId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testing Samples for Request {requestId}</DialogTitle>
          <DialogDescription>
            View and receive testing samples for this request ({receivedCount} of {totalCount} received)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : samples.length === 0 ? (
            <div className="text-center p-8">
              <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Testing Samples Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                There are no testing samples associated with this request. Testing samples will appear here once they are created from the request details.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted/20 p-3 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Sample Status:</span>
                  <span className="font-medium">{receivedCount} of {totalCount} received</span>
                </div>
                {receivedCount < totalCount && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleReceiveAll}
                    disabled={receiveLoading}
                  >
                    {receiveLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Receive All
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {samples.map((sample) => (
                  <Card key={sample.id} className={`overflow-hidden ${sample.status === "In Progress" || sample.status === "Completed" || sample.status === "Received" ? "border-green-200 bg-green-50" : ""}`}>
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            {(sample.status === "Pending Receive" || sample.status === "draft" || sample.status === "submitted") && (
                              <Checkbox
                                checked={selectedSamples.includes(sample.id)}
                                onCheckedChange={() => toggleSampleSelection(sample.id)}
                                disabled={receiveLoading}
                                id={`sample-${sample.id}`}
                                className="mt-1"
                              />
                            )}
                            {(sample.status === "In Progress" || sample.status === "Completed" || sample.status === "Received") && (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`sample-${sample.id}`}
                                  className="font-medium cursor-pointer text-base"
                                >
                                  {sample.name}
                                </label>
                                {sample.fullSampleName?.match(/_R(\d+)$/) && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                    #{sample.fullSampleName.match(/_R(\d+)$/)?.[1]}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Sample ID: {sample.sampleId}</p>
                              {sample.testingRemark && (
                                <p className="text-sm text-muted-foreground mt-1">Additional Requirements: {sample.testingRemark}</p>
                              )}
                              {sample.description && (
                                <p className="text-sm text-muted-foreground mt-1">{sample.description}</p>
                              )}
                            </div>
                          </div>
                          <SampleStatusBadge status={sample.status} />
                        </div>
                        
                        {/* Additional Information */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Test Method</p>
                              <p className="text-sm font-medium">{sample.testMethod || "Not specified"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Assigned To</p>
                              <p className="text-sm font-medium">{sample.assignedTo || "Unassigned"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Received Date</p>
                              <p className="text-sm font-medium">{sample.receivedDate || "Not received"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Completion Date</p>
                              <p className="text-sm font-medium">{sample.testingCompletedDate || "In progress"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center pt-2">
          <div>
            <span className="text-sm text-muted-foreground">
              {selectedSamples.length} samples selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReceiveSelected}
              disabled={selectedSamples.length === 0 || receiveLoading}
            >
              {receiveLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PackageOpen className="h-4 w-4 mr-2" />
              )}
              Receive Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
