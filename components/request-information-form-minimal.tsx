"use client"

import type React from "react"
import { Paperclip, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RequestInformationFormProps {
  requestType: "NTR" | "ASR" | "ER"
  currentStep: number
  formData: {
    requestTitle: string
    priority: string
    useIONumber: string
    ioNumber: string
    costCenter: string
    isOnBehalf: boolean
    onBehalfOfUser: string
    onBehalfOfName: string
    onBehalfOfEmail: string
    onBehalfOfCostCenter: string
    urgencyType: string
    urgencyReason: string
    approver: string
    urgentMemo: File | null
  }
  isEditMode?: boolean
  editRequestId?: string
  urgencyTypes: Array<{ value: string; label: string }>
  ioOptions: Array<{ value: string; label: string }>
  onBehalfUsers: Array<{ value: string; label: string; email: string; costCenter: string }>
  approvers: Array<{ value: string; label: string }>
  loadingStates: {
    loadingIoOptions: boolean
    loadingCostCenter: boolean
    loadingOnBehalfUsers: boolean
    loadingApprovers: boolean
  }
  errors: {
    ioError: string | null
    costCenterError: string | null
    onBehalfUsersError: string | null
    approversError: string | null
  }
  onFormChange: (name: string, value: string | boolean | File | null) => void
  onSelectChange: (name: string, value: string) => void
  onOnBehalfToggle: (isOnBehalf: boolean) => void
  onOnBehalfUserChange: (userEmail: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function RequestInformationForm({
  requestType,
  currentStep,
  formData,
  isEditMode = false,
  editRequestId = "",
  urgencyTypes,
  ioOptions,
  onBehalfUsers,
  approvers,
  loadingStates,
  errors,
  onFormChange,
  onSelectChange,
  onOnBehalfToggle,
  onOnBehalfUserChange,
  onFileChange,
}: RequestInformationFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    onFormChange(name, value)
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-gray-900">
          New Test Request
          {isEditMode && (
            <Badge variant="outline" className="ml-3 bg-blue-50 text-blue-700 border-blue-200">
              Edit Mode - {editRequestId}
            </Badge>
          )}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Title Field Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-2">
            <Label htmlFor="request-title" className="text-sm font-medium text-gray-700">
              Title
            </Label>
            <Input
              id="request-title"
              name="requestTitle"
              value={formData.requestTitle}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
              placeholder="Enter request title"
              autoFocus
            />
          </div>
        </div>



        {/* Conditional Urgent Section */}
        {formData.priority === "urgent" && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
            <h3 className="text-base font-medium text-gray-900">Urgency Approval Flow</h3>
            
            <div className="space-y-2">
              <Label htmlFor="urgency-type" className="text-sm font-medium text-gray-700">
                Urgency Type
              </Label>
              <Select
                value={formData.urgencyType}
                onValueChange={(value) => onSelectChange("urgencyType", value)}
              >
                <SelectTrigger id="urgency-type" className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Select urgency type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="claim">Claim & Complaint</SelectItem>
                  <SelectItem value="plant">Plant Problems</SelectItem>
                  <SelectItem value="decision">Decision Making</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-reason" className="text-sm font-medium text-gray-700">
                Reason
              </Label>
              <Textarea
                id="urgency-reason"
                name="urgencyReason"
                value={formData.urgencyReason}
                onChange={handleChange}
                placeholder="Explain the reason for urgency"
                className="min-h-[80px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver" className="text-sm font-medium text-gray-700">
                Approver
              </Label>
              <Select
                value={formData.approver}
                onValueChange={(value) => onSelectChange("approver", value)}
                disabled={loadingStates.loadingApprovers}
              >
                <SelectTrigger id="approver" className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {loadingStates.loadingApprovers ? (
                    <SelectItem value="loading" disabled>Loading approvers...</SelectItem>
                  ) : approvers.length > 0 ? (
                    approvers.map((approver) => (
                      <SelectItem key={approver.value} value={approver.value}>
                        {approver.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No approvers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <input 
                id="urgent-memo" 
                type="file" 
                className="hidden" 
                onChange={onFileChange}
                accept=".pdf,.doc,.docx"
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => document.getElementById("urgent-memo")?.click()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              {formData.urgentMemo && (
                <p className="text-sm text-gray-600 mt-2">
                  Attached: {formData.urgentMemo.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cost Allocation Section */}
        <div className="bg-green-50 rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Cost Allocation</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">This information is based on your register. Please contact our admin for changes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Cost Allocation Radio */}
          <div className="space-y-3">
            <div className="flex items-center space-x-6">
              <RadioGroup
                value={formData.useIONumber}
                onValueChange={(value) => onSelectChange("useIONumber", value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="use-io-yes" />
                  <Label htmlFor="use-io-yes" className="font-normal text-gray-700 cursor-pointer">
                    IO
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="use-io-no" />
                  <Label htmlFor="use-io-no" className="font-normal text-gray-700 cursor-pointer">
                    Non-IO
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="flex-1 max-w-xs">
                <Label htmlFor="cost-center" className="text-sm font-medium text-gray-700 mb-1 block">
                  Cost Center
                </Label>
                <Input
                  id="cost-center"
                  value={formData.costCenter}
                  disabled
                  className="bg-gray-100 border-gray-300 text-gray-600"
                  placeholder="Cost Center"
                />
              </div>
            </div>

            {formData.useIONumber === "yes" && (
              <div className="mt-4 max-w-md">
                <Label htmlFor="io-number" className="text-sm font-medium text-gray-700 mb-2 block">
                  IO Number
                </Label>
                <Select
                  value={formData.ioNumber}
                  onValueChange={(value) => onSelectChange("ioNumber", value)}
                  disabled={loadingStates.loadingIoOptions}
                >
                  <SelectTrigger id="io-number" className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Select IO Number" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {loadingStates.loadingIoOptions ? (
                      <SelectItem value="loading" disabled>Loading IO Numbers...</SelectItem>
                    ) : (
                      ioOptions.map((io) => (
                        <SelectItem key={io.value} value={io.value}>
                          {io.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* On Behalf Of Feature */}
          <div className="space-y-3 pt-4 border-t border-green-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="on-behalf"
                checked={formData.isOnBehalf}
                onCheckedChange={(checked) => onOnBehalfToggle(checked as boolean)}
              />
              <Label 
                htmlFor="on-behalf" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Request on behalf of another person
              </Label>
            </div>

            {formData.isOnBehalf && (
              <div className="max-w-md">
                <Label htmlFor="on-behalf-user" className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Person
                </Label>
                <Select
                  value={formData.onBehalfOfUser}
                  onValueChange={onOnBehalfUserChange}
                  disabled={loadingStates.loadingOnBehalfUsers}
                >
                  <SelectTrigger id="on-behalf-user" className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {loadingStates.loadingOnBehalfUsers ? (
                      <SelectItem value="loading" disabled>Loading users...</SelectItem>
                    ) : onBehalfUsers.length > 0 ? (
                      onBehalfUsers.map((user) => (
                        <SelectItem key={user.value} value={user.value}>
                          {user.label} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No users available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}