"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HelpCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ASRInformationFormProps {
  formData: {
    projectCategory: string
    projectCategoryOther: string
    sampleSources: string[]
    sampleSourceOther: string
    requestTitle: string
    priority: string
    useIONumber: string
    ioNumber: string
    costCenter: string
    problemSource: string
    testObjective: string
    expectedResults: string
    businessImpact: string
    desiredCompletionDate: string
  }
  onChange: (data: any) => void
  ioOptions: { value: string; label: string }[]
  loadingIoOptions: boolean
  ioError: string | null
  loadingCostCenter: boolean
  costCenterError: string | null
}

const projectCategories = [
  { value: "NPD", label: "NPD (New Product Development)" },
  { value: "TD", label: "TD (Technology Development)" },
  { value: "Plant Support", label: "Plant Support/Troubleshooting" },
  { value: "Customer Complaint", label: "Customer Complaint/Quality Claim" },
  { value: "IP", label: "IP (Intellectual Property)" },
  { value: "Other", label: "Other" }
]

const sampleSourceOptions = [
  { value: "HD1", label: "HD1" },
  { value: "HD2", label: "HD2" },
  { value: "HD3", label: "HD3" },
  { value: "HD4", label: "HD4" },
  { value: "PP1", label: "PP1" },
  { value: "PP2", label: "PP2" },
  { value: "PP3", label: "PP3" },
  { value: "Pilot PE(PPP)", label: "Pilot PE(PPP)" },
  { value: "Pilot PP(4P)", label: "Pilot PP(4P)" },
  { value: "Catalyst Plant", label: "Catalyst Plant" },
  { value: "Competitor Sample", label: "Competitor Sample" },
  { value: "Reference or standard", label: "Reference or standard" },
  { value: "External", label: "External" },
  { value: "Other", label: "Other" }
]

export function ASRInformationForm({ formData, onChange, ioOptions, loadingIoOptions, ioError, loadingCostCenter, costCenterError }: ASRInformationFormProps) {
  const handleProjectCategoryChange = (value: string) => {
    onChange({
      ...formData,
      projectCategory: value,
      projectCategoryOther: value === "Other" ? formData.projectCategoryOther : ""
    })
  }

  const handleSampleSourcesChange = (sources: string[]) => {
    onChange({
      ...formData,
      sampleSources: sources,
      sampleSourceOther: sources.includes("Other") ? formData.sampleSourceOther : ""
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ASR Information</h2>
        <p className="text-muted-foreground mt-1">
          Provide details about your Application Support Request
        </p>
      </div>
      {/* Project Classification Section */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium">Project Classification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Category */}
          <div>
            <Label htmlFor="projectCategory" className="text-sm font-medium mb-2">
              Project Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.projectCategory}
              onValueChange={handleProjectCategoryChange}
            >
              <SelectTrigger id="projectCategory">
                <SelectValue placeholder="Select project category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {projectCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {formData.projectCategory === "Other" && (
              <Input
                placeholder="Please specify"
                value={formData.projectCategoryOther}
                onChange={(e) => onChange({
                  ...formData,
                  projectCategoryOther: e.target.value
                })}
                className="mt-2"
              />
            )}
          </div>

          {/* Sample Sources */}
          <div>
            <Label className="text-sm font-medium mb-2">
              Sample Sources/Plant(s) <span className="text-red-500">*</span>
            </Label>
            <MultiSelectDropdown
              options={sampleSourceOptions}
              selected={formData.sampleSources}
              onChange={handleSampleSourcesChange}
              placeholder="Select none"
            />
            
            {formData.sampleSources.includes("Other") && (
              <Input
                placeholder="Please specify other sources"
                value={formData.sampleSourceOther}
                onChange={(e) => onChange({
                  ...formData,
                  sampleSourceOther: e.target.value
                })}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </div>


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
              onValueChange={(value) => onChange({
                ...formData,
                useIONumber: value
              })}
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
              {loadingCostCenter && (
                <p className="text-sm text-muted-foreground mt-1">Loading cost center...</p>
              )}
              {costCenterError && (
                <p className="text-sm text-red-500 mt-1">Failed to load cost center: {costCenterError}</p>
              )}
            </div>
          </div>

          {formData.useIONumber === "yes" && (
            <div className="mt-4 max-w-md">
              <Label htmlFor="io-number" className="text-sm font-medium text-gray-700 mb-2 block">
                IO Number
              </Label>
              <Select
                value={formData.ioNumber}
                onValueChange={(value) => onChange({
                  ...formData,
                  ioNumber: value
                })}
                disabled={loadingIoOptions}
              >
                <SelectTrigger id="io-number" className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Select IO Number" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {loadingIoOptions ? (
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
              {ioError && (
                <p className="text-sm text-red-500 mt-1">Failed to load IO Numbers: {ioError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}