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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Microscope,
  AlertCircle,
} from "lucide-react"

interface EquipmentSlot {
  equipmentId: string
  equipmentName: string
  requestedDate: string
  startTime: string
  endTime: string
  duration: number
  isApproved?: boolean
}

interface ErSlotApprovalDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlotsApproved: (requestId: string) => void
}

export function ErSlotApprovalDialog({
  requestId,
  open,
  onOpenChange,
  onSlotsApproved,
}: ErSlotApprovalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>([])
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [requestDetails, setRequestDetails] = useState<any>(null)

  useEffect(() => {
    if (open && requestId) {
      fetchRequestDetails()
    }
  }, [open, requestId])

  const fetchRequestDetails = async () => {
    setLoading(true)
    try {
      // Fetch ER request details
      const response = await fetch(`/api/equipment/${requestId}/details`)
      const data = await response.json()
      
      if (data.success) {
        setRequestDetails(data.request)
        
        // Parse equipment list from JSON
        const equipment = data.request.jsonEquipmentList 
          ? JSON.parse(data.request.jsonEquipmentList) 
          : []
        
        // Convert to slot format
        const slots: EquipmentSlot[] = equipment.map((eq: any) => ({
          equipmentId: eq.equipmentId,
          equipmentName: eq.equipmentName,
          requestedDate: eq.reservationDate,
          startTime: eq.startTime,
          endTime: eq.endTime,
          duration: eq.duration || calculateDuration(eq.startTime, eq.endTime),
          isApproved: eq.isApproved || false
        }))
        
        setEquipmentSlots(slots)
        
        // Pre-select all non-approved slots
        const unapprovedSlots = slots
          .filter(slot => !slot.isApproved)
          .map((_, index) => index.toString())
        setSelectedSlots(new Set(unapprovedSlots))
      }
    } catch (error) {
      console.error('Error fetching request details:', error)
      toast.error('Failed to load equipment reservation details')
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01 ${startTime}`)
    const end = new Date(`2024-01-01 ${endTime}`)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // Duration in minutes
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSlotToggle = (index: string) => {
    const newSelected = new Set(selectedSlots)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSlots(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedSlots.size === equipmentSlots.filter(s => !s.isApproved).length) {
      setSelectedSlots(new Set())
    } else {
      const allUnapproved = equipmentSlots
        .map((slot, index) => !slot.isApproved ? index.toString() : null)
        .filter(index => index !== null) as string[]
      setSelectedSlots(new Set(allUnapproved))
    }
  }

  const handleApproveSlots = async () => {
    if (selectedSlots.size === 0) {
      toast.error('Please select at least one time slot to approve')
      return
    }

    setSubmitting(true)
    try {
      // Get selected slot indices
      const approvedIndices = Array.from(selectedSlots).map(index => parseInt(index))
      
      // Update equipment list with approved status
      const updatedEquipment = equipmentSlots.map((slot, index) => ({
        ...slot,
        isApproved: approvedIndices.includes(index) ? true : slot.isApproved
      }))

      // Update request status to in-progress if all slots are approved
      const allApproved = updatedEquipment.every(slot => slot.isApproved)
      
      const response = await fetch(`/api/equipment/${requestId}/approve-slots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedSlots: approvedIndices,
          updateStatus: allApproved,
          equipmentList: updatedEquipment
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully approved ${selectedSlots.size} time slot(s)`)
        onSlotsApproved(requestId)
        onOpenChange(false)
      } else {
        throw new Error(data.error || 'Failed to approve slots')
      }
    } catch (error) {
      console.error('Error approving slots:', error)
      toast.error('Failed to approve time slots')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>Approve Equipment Time Slots</span>
          </DialogTitle>
          <DialogDescription>
            Review and approve requested equipment reservation time slots
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading reservation details...</p>
          </div>
        ) : (
          <>
            {requestDetails && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Request Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Request ID:</span>
                      <span className="ml-2 font-medium">{requestDetails.requestNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requester:</span>
                      <span className="ml-2 font-medium">{requestDetails.requesterName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <span className="ml-2 font-medium">{requestDetails.requestTitle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge 
                        variant={requestDetails.priority === 'urgent' ? 'destructive' : 'default'}
                        className="ml-2"
                      >
                        {requestDetails.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {equipmentSlots.length > 0 ? (
                  <>
                    {/* Select all checkbox */}
                    {equipmentSlots.some(s => !s.isApproved) && (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Checkbox
                          checked={
                            selectedSlots.size === equipmentSlots.filter(s => !s.isApproved).length &&
                            selectedSlots.size > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <label className="text-sm font-medium">
                          Select all unapproved slots ({equipmentSlots.filter(s => !s.isApproved).length})
                        </label>
                      </div>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time Slot</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipmentSlots.map((slot, index) => (
                          <TableRow key={index} className={slot.isApproved ? 'opacity-60' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={selectedSlots.has(index.toString())}
                                onCheckedChange={() => handleSlotToggle(index.toString())}
                                disabled={slot.isApproved}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Microscope className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">{slot.equipmentName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>{formatDate(slot.requestedDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </Badge>
                            </TableCell>
                            <TableCell>{slot.duration} min</TableCell>
                            <TableCell>
                              {slot.isApproved ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Microscope className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">No equipment slots found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This request might not have equipment reservations
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproveSlots} 
            disabled={submitting || loading || selectedSlots.size === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Selected ({selectedSlots.size})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}