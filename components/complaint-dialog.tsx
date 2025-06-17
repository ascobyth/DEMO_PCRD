"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Loader2, AlertCircle } from "lucide-react"

interface ComplaintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  requestNumber: string
  requestType: "NTR" | "ASR" | "ER"
  onComplaintSubmitted?: () => void
}

export function ComplaintDialog({
  open,
  onOpenChange,
  requestId,
  requestNumber,
  requestType,
  onComplaintSubmitted
}: ComplaintDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [complaintType, setComplaintType] = useState("")
  const [complaintDescription, setComplaintDescription] = useState("")
  const [severity, setSeverity] = useState("medium")
  const [initialAction, setInitialAction] = useState("")
  const [actionNotes, setActionNotes] = useState("")
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [estimatedResolutionDate, setEstimatedResolutionDate] = useState("")

  const complaintTypes = [
    { value: "quality_issue", label: "Quality Issue" },
    { value: "delay", label: "Delay in Delivery" },
    { value: "incorrect_results", label: "Incorrect Results" },
    { value: "sample_damage", label: "Sample Damage" },
    { value: "communication_issue", label: "Communication Issue" },
    { value: "cost_dispute", label: "Cost Dispute" },
    { value: "method_concern", label: "Testing Method Concern" },
    { value: "other", label: "Other" }
  ]

  const initialActions = [
    { value: "re-test", label: "Re-test Required" },
    { value: "need_discussion", label: "Need Discussion" },
    { value: "review_method", label: "Review Testing Method" },
    { value: "additional_analysis", label: "Additional Analysis" },
    { value: "refund_requested", label: "Refund Requested" },
    { value: "escalate_to_manager", label: "Escalate to Manager" },
    { value: "provide_clarification", label: "Provide Clarification" },
    { value: "sample_replacement", label: "Sample Replacement" },
    { value: "expedite_process", label: "Expedite Process" },
    { value: "no_action_needed", label: "No Action Needed" }
  ]

  const handleSubmit = async () => {
    if (!complaintType || !complaintDescription || !initialAction) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const complaintData = {
        requestNumber,
        requestType,
        complaintType,
        complaintDescription,
        severity,
        initialAction,
        actionNotes,
        complainantName: user?.name || "",
        complainantEmail: user?.email || "",
        complainantPhone: user?.phone || "",
        followUpRequired,
        estimatedResolutionDate: estimatedResolutionDate || null,
        createdBy: user?.email || "",
        createdByName: user?.name || ""
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Complaint Submitted",
          description: `Complaint ${result.data.complaintId} has been registered successfully`
        })
        
        // Reset form
        setComplaintType("")
        setComplaintDescription("")
        setSeverity("medium")
        setInitialAction("")
        setActionNotes("")
        setFollowUpRequired(false)
        setEstimatedResolutionDate("")
        
        onOpenChange(false)
        if (onComplaintSubmitted) {
          onComplaintSubmitted()
        }
      } else {
        throw new Error(result.error || "Failed to submit complaint")
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Complaint</DialogTitle>
          <DialogDescription>
            File a complaint for request {requestNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Complaint Type */}
          <div className="space-y-2">
            <Label htmlFor="complaintType">Complaint Type *</Label>
            <Select value={complaintType} onValueChange={setComplaintType}>
              <SelectTrigger>
                <SelectValue placeholder="Select complaint type" />
              </SelectTrigger>
              <SelectContent>
                {complaintTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <RadioGroup value={severity} onValueChange={setSeverity}>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="critical" />
                  <Label htmlFor="critical" className="font-normal">Critical</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Complaint Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Complaint Description *</Label>
            <Textarea
              id="description"
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="min-h-[100px]"
            />
          </div>

          {/* Initial Action */}
          <div className="space-y-2">
            <Label htmlFor="initialAction">Initial Action Required *</Label>
            <Select value={initialAction} onValueChange={setInitialAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select initial action" />
              </SelectTrigger>
              <SelectContent>
                {initialActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Notes */}
          <div className="space-y-2">
            <Label htmlFor="actionNotes">Action Notes</Label>
            <Textarea
              id="actionNotes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Additional notes about the action to be taken..."
              className="min-h-[80px]"
            />
          </div>

          {/* Follow-up Required */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="followUp"
              checked={followUpRequired}
              onChange={(e) => setFollowUpRequired(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="followUp" className="font-normal">
              Follow-up required
            </Label>
          </div>

          {/* Estimated Resolution Date */}
          <div className="space-y-2">
            <Label htmlFor="resolutionDate">Estimated Resolution Date</Label>
            <Input
              id="resolutionDate"
              type="date"
              value={estimatedResolutionDate}
              onChange={(e) => setEstimatedResolutionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Severity Warning */}
          {(severity === "high" || severity === "critical") && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">High Priority Complaint</p>
                <p>This complaint will be escalated to management for immediate attention.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}