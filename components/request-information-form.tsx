"use client"

import type React from "react"
import { HelpCircle, Upload } from "lucide-react"
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
    <Card>
      <CardHeader>
        <CardTitle>
          Request Information
          {isEditMode && (
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              Edit Mode - {editRequestId}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? `Editing request ${editRequestId} - Make your changes and save`
            : requestType === "NTR"
            ? "Provide basic information about your test request"
            : "Provide basic information about your analysis request"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="request-title">Request Title</Label>
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
            <p className="text-sm text-red-500">Please enter a request title to continue</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <RadioGroup
            value={formData.priority}
            onValueChange={(value) => onSelectChange("priority", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="priority-normal" />
              <Label htmlFor="priority-normal" className="font-normal">
                Normal (Approximately 14 working days)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="urgent" id="priority-urgent" />
              <Label htmlFor="priority-urgent" className="font-normal">
                Urgent (Min. 5 days, higher cost)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Use IO Number</Label>
          <RadioGroup
            value={formData.useIONumber}
            onValueChange={(value) => onSelectChange("useIONumber", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="use-io-yes" />
              <Label htmlFor="use-io-yes" className="font-normal">
                Yes, use IO Number
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="use-io-no" />
              <Label htmlFor="use-io-no" className="font-normal">
                No, don't use IO Number
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formData.useIONumber === "yes" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="io-number">IO Number</Label>
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
                  <p className="text-sm text-red-500">Failed to load IO Numbers: {errors.ioError}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="cost-center">Cost Center</Label>
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
                <p className="text-sm text-muted-foreground">Loading cost center...</p>
              )}
              {errors.costCenterError && (
                <p className="text-sm text-red-500">Failed to load cost center: {errors.costCenterError}</p>
              )}
            </div>
          </div>
        </div>

        {/* On Behalf Of section */}
        <div className="space-y-2">
          <Label>Create Request on Behalf of Someone</Label>
          <RadioGroup
            value={formData.isOnBehalf ? "yes" : "no"}
            onValueChange={(value) => onOnBehalfToggle(value === "yes")}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="on-behalf-no" />
              <Label htmlFor="on-behalf-no" className="font-normal">
                No, create request for myself
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="on-behalf-yes" />
              <Label htmlFor="on-behalf-yes" className="font-normal">
                Yes, create request on behalf of someone else
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.isOnBehalf && (
          <div className="space-y-4 p-4 border rounded-md bg-blue-50">
            <h3 className="font-medium">On Behalf Details</h3>

            <div className="space-y-2">
              <Label htmlFor="on-behalf-user">Select User</Label>
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
              {errors.onBehalfUsersError ? (
                <p className="text-sm text-red-500">Failed to load users: {errors.onBehalfUsersError}</p>
              ) : onBehalfUsers.length === 0 && !loadingStates.loadingOnBehalfUsers ? (
                <div>
                  <p className="text-sm text-amber-600 mb-1">No users found that you can create requests on behalf of.</p>
                  <p className="text-xs text-muted-foreground">This could be because:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1">
                    <li>You don't have any users in your "On Behalf Access" list</li>
                    <li>The database configuration needs to be updated</li>
                    <li>There's a data format issue in the user records</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-1">Please contact an administrator for assistance.</p>
                </div>
              ) : null}
            </div>

            {formData.onBehalfOfUser && (
              <div className="space-y-2">
                <Label htmlFor="on-behalf-cost-center">User's Cost Center</Label>
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

        {formData.priority === "urgent" && (
          <div className="space-y-4 p-4 border rounded-md bg-blue-50">
            <h3 className="font-medium">Urgent Request Details</h3>

            <div className="space-y-2">
              <Label htmlFor="urgency-type">Urgency Type</Label>
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

            <div className="space-y-2">
              <Label htmlFor="urgency-reason">Reason for Urgency</Label>
              <Textarea
                id="urgency-reason"
                name="urgencyReason"
                value={formData.urgencyReason}
                onChange={handleChange}
                placeholder="Please explain why this request is urgent"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver">Approver</Label>
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
              {errors.approversError ? (
                <p className="text-sm text-red-500">Failed to load approvers: {errors.approversError}</p>
              ) : approvers.length === 0 && !loadingStates.loadingApprovers ? (
                <p className="text-sm text-amber-600">You don't have any approvers assigned to your account. Please contact an administrator.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgent-memo">Urgent Request Memo (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input id="urgent-memo" type="file" className="hidden" onChange={onFileChange} />
                <div className="flex-1 rounded-md border border-dashed border-gray-300 p-4 bg-white">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload urgent request memo</p>
                      <p className="text-xs text-muted-foreground">
                        PDF or Word document with approval from your manager
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("urgent-memo")?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              </div>
              {formData.urgentMemo && (
                <p className="text-sm text-muted-foreground">Selected file: {formData.urgentMemo.name}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}