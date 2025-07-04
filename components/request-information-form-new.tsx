"use client"

import type React from "react"
import { HelpCircle, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          Request Information
          {isEditMode && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Edit Mode - {editRequestId}
            </Badge>
          )}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEditMode 
            ? `Editing request ${editRequestId} - Make your changes and save`
            : requestType === "NTR"
            ? "Provide basic information about your test request"
            : "Provide basic information about your analysis request"}
        </p>
      </div>

      {/* Basic Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Title */}
          <div className="md:col-span-2">
            <Label htmlFor="request-title" className="text-sm font-medium mb-2">
              Request Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="request-title"
              name="requestTitle"
              value={formData.requestTitle}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your request"
              className={`w-full ${currentStep === 1 && !formData.requestTitle ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
              autoFocus
              autoComplete="off"
            />
            {currentStep === 1 && !formData.requestTitle && (
              <p className="text-sm text-red-500 mt-1">Please enter a request title to continue</p>
            )}
          </div>



          {/* Cost Center */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="cost-center" className="text-sm font-medium">
                Cost Center
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80 text-sm">This is automatically populated based on your profile.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="cost-center"
              name="costCenter"
              value={formData.costCenter}
              disabled
              className="bg-gray-100"
              autoComplete="off"
            />
            {loadingStates.loadingCostCenter && (
              <p className="text-sm text-muted-foreground mt-1">Loading cost center...</p>
            )}
            {errors.costCenterError && (
              <p className="text-sm text-red-500 mt-1">Failed to load cost center: {errors.costCenterError}</p>
            )}
          </div>
        </div>
      </div>

      {/* IO Number Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">IO Number Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Use IO Number? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.useIONumber}
              onValueChange={(value) => onSelectChange("useIONumber", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="use-io-yes" />
                <Label htmlFor="use-io-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="use-io-no" />
                <Label htmlFor="use-io-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.useIONumber === "yes" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="io-number" className="text-sm font-medium">
                  IO Number <span className="text-red-500">*</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-sm">Select the IO Number associated with your project.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.ioNumber}
                onValueChange={(value) => onSelectChange("ioNumber", value)}
                disabled={loadingStates.loadingIoOptions}
              >
                <SelectTrigger
                  id="io-number"
                  className={
                    formData.useIONumber === "yes" && !formData.ioNumber
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : ""
                  }
                >
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
              {errors.ioError && (
                <p className="text-sm text-red-500 mt-1">Failed to load IO Numbers: {errors.ioError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* On Behalf Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Request Ownership</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Create request for
            </Label>
            <RadioGroup
              value={formData.isOnBehalf ? "someone-else" : "myself"}
              onValueChange={(value) => onOnBehalfToggle(value === "someone-else")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="myself" id="on-behalf-no" />
                <Label htmlFor="on-behalf-no" className="font-normal cursor-pointer">
                  Myself
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="someone-else" id="on-behalf-yes" />
                <Label htmlFor="on-behalf-yes" className="font-normal cursor-pointer">
                  Someone else
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.isOnBehalf && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Label htmlFor="on-behalf-user" className="text-sm font-medium mb-2">
                  Select User <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.onBehalfOfUser}
                  onValueChange={onOnBehalfUserChange}
                  disabled={loadingStates.loadingOnBehalfUsers || onBehalfUsers.length === 0}
                >
                  <SelectTrigger id="on-behalf-user">
                    <SelectValue placeholder="Select user" />
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
                {errors.onBehalfUsersError && (
                  <p className="text-sm text-red-500 mt-1">Failed to load users: {errors.onBehalfUsersError}</p>
                )}
              </div>

              {formData.onBehalfOfUser && (
                <div>
                  <Label htmlFor="on-behalf-cost-center" className="text-sm font-medium mb-2">
                    User's Cost Center
                  </Label>
                  <Input
                    id="on-behalf-cost-center"
                    value={formData.onBehalfOfCostCenter}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Urgent Request Details Section */}
      {formData.priority === "urgent" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-orange-900">Urgent Request Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="urgency-type" className="text-sm font-medium mb-2">
                Urgency Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.urgencyType}
                onValueChange={(value) => onSelectChange("urgencyType", value)}
              >
                <SelectTrigger id="urgency-type">
                  <SelectValue placeholder="Select urgency type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {urgencyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="approver" className="text-sm font-medium mb-2">
                Approver <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.approver}
                onValueChange={(value) => onSelectChange("approver", value)}
                disabled={loadingStates.loadingApprovers || approvers.length === 0}
              >
                <SelectTrigger id="approver">
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
              {errors.approversError && (
                <p className="text-sm text-red-500 mt-1">Failed to load approvers: {errors.approversError}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="urgency-reason" className="text-sm font-medium mb-2">
                Reason for Urgency <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="urgency-reason"
                name="urgencyReason"
                value={formData.urgencyReason}
                onChange={handleChange}
                placeholder="Please explain why this request is urgent"
                className="min-h-[100px]"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="urgent-memo" className="text-sm font-medium mb-2">
                Urgent Request Memo (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                <input id="urgent-memo" type="file" className="hidden" onChange={onFileChange} />
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Upload urgent request memo</p>
                <p className="text-xs text-muted-foreground mb-3">
                  PDF or Word document with approval from your manager
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("urgent-memo")?.click()}
                >
                  Select File
                </Button>
                {formData.urgentMemo && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                    <span className="text-sm">{formData.urgentMemo.name}</span>
                    <button
                      type="button"
                      onClick={() => onFormChange("urgentMemo", null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}