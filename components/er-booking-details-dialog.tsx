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
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Microscope,
  AlertCircle,
  User,
  FileText,
  CalendarDays,
  Timer,
  XCircle,
} from "lucide-react"

interface EquipmentBooking {
  equipmentId: string
  equipmentName: string
  reservationDate: string
  startTime: string
  endTime: string
  duration: number
  status: string
  isApproved: boolean
  operatedBy?: string
  remarks?: string
}

interface ErBookingDetailsDialogProps {
  requestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErBookingDetailsDialog({
  requestId,
  open,
  onOpenChange,
}: ErBookingDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [requestDetails, setRequestDetails] = useState<any>(null)
  const [bookings, setBookings] = useState<EquipmentBooking[]>([])

  useEffect(() => {
    if (open && requestId) {
      fetchBookingDetails()
    }
  }, [open, requestId])

  const fetchBookingDetails = async () => {
    setLoading(true)
    try {
      // Fetch ER request details with booking information
      const response = await fetch(`/api/equipment/${requestId}/bookings`)
      const data = await response.json()
      
      if (data.success) {
        setRequestDetails(data.request)
        
        // Parse equipment bookings
        const equipment = data.request.jsonEquipmentList 
          ? JSON.parse(data.request.jsonEquipmentList) 
          : []
        
        setBookings(equipment.map((eq: any) => ({
          equipmentId: eq.equipmentId,
          equipmentName: eq.equipmentName,
          reservationDate: eq.reservationDate,
          startTime: eq.startTime,
          endTime: eq.endTime,
          duration: eq.duration || calculateDuration(eq.startTime, eq.endTime),
          status: eq.status || 'scheduled',
          isApproved: eq.isApproved || false,
          operatedBy: eq.operatedBy,
          remarks: eq.remarks
        })))
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01 ${startTime}`)
    const end = new Date(`2024-01-01 ${endTime}`)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2024-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Scheduled</Badge>
    }
  }

  // Calculate overall progress
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const totalBookings = bookings.length
  const progressPercentage = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-green-600" />
            <span>Equipment Booking Details</span>
          </DialogTitle>
          <DialogDescription>
            View detailed information about equipment reservations
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Loading booking details...</p>
          </div>
        ) : (
          <>
            {requestDetails && (
              <>
                {/* Request Summary */}
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Request Summary</span>
                      <Badge variant={requestDetails.priority === 'urgent' ? 'destructive' : 'default'}>
                        {requestDetails.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Request ID</p>
                        <p className="font-medium">{requestDetails.requestNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Title</p>
                        <p className="font-medium">{requestDetails.requestTitle}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requester</p>
                        <p className="font-medium flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{requestDetails.requesterName}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant={requestDetails.requestStatus === 'completed' ? 'default' : 'secondary'}>
                          {requestDetails.requestStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {completedBookings} of {totalBookings} completed
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-4" />

                {/* Bookings List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold mb-3">Equipment Bookings</h3>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {bookings.length > 0 ? (
                        bookings.map((booking, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-3">
                              {/* Equipment Info */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Microscope className="h-5 w-5 text-purple-600" />
                                  <div>
                                    <p className="font-medium">{booking.equipmentName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Equipment ID: {booking.equipmentId}
                                    </p>
                                  </div>
                                </div>
                                {getStatusBadge(booking.status)}
                              </div>

                              {/* Booking Details */}
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <span>{formatDate(booking.reservationDate)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <span>
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Timer className="h-4 w-4 text-orange-600" />
                                  <span>{booking.duration} minutes</span>
                                </div>
                              </div>

                              {/* Approval Status */}
                              <div className="flex items-center space-x-2">
                                {booking.isApproved ? (
                                  <Badge className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Slot Approved
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-700 border-orange-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Pending Approval
                                  </Badge>
                                )}
                                
                                {booking.operatedBy && (
                                  <Badge variant="secondary">
                                    <User className="h-3 w-3 mr-1" />
                                    Operated by: {booking.operatedBy}
                                  </Badge>
                                )}
                              </div>

                              {/* Remarks */}
                              {booking.remarks && (
                                <div className="bg-gray-50 p-2 rounded-md">
                                  <p className="text-xs text-muted-foreground">Remarks:</p>
                                  <p className="text-sm">{booking.remarks}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Microscope className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium text-gray-600">No bookings found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}