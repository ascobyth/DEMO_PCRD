"use client"

import React, { useEffect, useState, useRef } from "react"
import { HelpCircle, CalendarIcon } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Sample, SampleCategory, AppTechOption, SelectOption } from "./types"
import { format } from "date-fns"

interface EnhancedSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSample: Sample;
  sampleCategory: SampleCategory;
  editMode: boolean;
  onSampleChange: (name: string, value: string | boolean) => void;
  onSampleCategoryChange: (category: SampleCategory) => void;
  onAddSample: () => void;
  appTechs?: any[];
  gradeOptions?: SelectOption[];
  techCatOptions?: AppTechOption[];
  featureAppOptions?: AppTechOption[];
  typeOptions?: SelectOption[];
  formOptions?: SelectOption[];
  plantOptions?: SelectOption[];
  capabilityOptions?: SelectOption[];
  loadingGrades?: boolean;
  loadingAppTechs?: boolean;
  gradeError?: string | null;
  appTechError?: string | null;
}

export function EnhancedSampleDialog({
  open,
  onOpenChange,
  currentSample,
  sampleCategory,
  editMode,
  onSampleChange,
  onSampleCategoryChange,
  onAddSample,
  appTechs = [],
  gradeOptions = [],
  techCatOptions = [],
  featureAppOptions = [],
  typeOptions = [],
  formOptions = [],
  plantOptions = [],
  capabilityOptions = [],
  loadingGrades = false,
  loadingAppTechs = false,
  gradeError = null,
  appTechError = null,
}: EnhancedSampleDialogProps) {
  const [showSampleSections, setShowSampleSections] = useState(false)
  const [focusedSection, setFocusedSection] = useState<string | null>(null)
  const [highlightedField, setHighlightedField] = useState<string | null>(null)
  const automaticNamingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sampleCategory && open) {
      setShowSampleSections(true)
      setTimeout(() => {
        highlightNextEmptyField()
      }, 100)
    }
  }, [sampleCategory, open])

  useEffect(() => {
    // Generate sample name in real-time whenever any relevant field changes
    generateSampleName()
  }, [
    currentSample.grade,
    currentSample.lot,
    currentSample.tech,
    currentSample.feature,
    currentSample.plant,
    currentSample.samplingDateTime,
    currentSample.chemicalName,
    currentSample.supplier,
    currentSample.capability,
    currentSample.capType,
    currentSample.sampleIdentity,
    sampleCategory,
    capabilityOptions,
    featureAppOptions
  ])

  const generateSampleName = () => {
    let generatedName = ""

    switch (sampleCategory) {
      case "commercial":
        if (currentSample.grade || currentSample.lot || currentSample.sampleIdentity) {
          generatedName = [
            currentSample.grade || "",
            currentSample.lot || "",
            currentSample.sampleIdentity || ""
          ].filter(Boolean).join("-")
        }
        break

      case "td":
        const parts = []
        // Auto-detect which fields are filled
        if (currentSample.tech) {
          // Find the shortText for the selected tech
          const selectedTech = techCatOptions.find(opt => opt.value === currentSample.tech)
          const techName = selectedTech?.shortText || currentSample.tech || ""
          parts.push(techName)
        }
        if (currentSample.feature) {
          // Find the shortText for the selected feature
          const selectedFeature = featureAppOptions.find(opt => opt.value === currentSample.feature)
          const featureName = selectedFeature?.shortText || currentSample.feature || ""
          parts.push(featureName)
        }
        if (currentSample.sampleIdentity) parts.push(currentSample.sampleIdentity)
        generatedName = parts.join("-")
        break

      case "benchmark":
        if (currentSample.feature || currentSample.sampleIdentity) {
          // Find the shortText for the selected feature
          const selectedFeature = featureAppOptions.find(opt => opt.value === currentSample.feature)
          const featureName = selectedFeature?.shortText || currentSample.feature || ""
          generatedName = [featureName, currentSample.sampleIdentity || ""]
            .filter(Boolean).join("-")
        }
        break

      case "inprocess":
        if (currentSample.plant || currentSample.samplingDateTime || currentSample.sampleIdentity) {
          const datePart = currentSample.samplingDateTime ? 
            formatDateTimeForSampleName(currentSample.samplingDateTime) : ""
          generatedName = [
            currentSample.plant || "",
            datePart,
            currentSample.sampleIdentity || ""
          ].filter(Boolean).join("-")
        }
        break

      case "chemicals":
        if (currentSample.chemicalName || currentSample.supplier || currentSample.sampleIdentity) {
          generatedName = [
            currentSample.chemicalName || "",
            currentSample.supplier || "",
            currentSample.sampleIdentity || ""
          ].filter(Boolean).join("-")
        }
        break

      case "cap":
        if (currentSample.capability || currentSample.capType || currentSample.sampleIdentity) {
          // Find the shortname for the selected capability
          const selectedCapability = capabilityOptions.find(opt => opt.value === currentSample.capability)
          const capabilityShortName = selectedCapability?.label.split(' - ')[0] || currentSample.capability || ""
          const typePrefix = currentSample.capType === "Other" ? "OTH" : currentSample.capType || ""
          generatedName = [capabilityShortName, typePrefix, currentSample.sampleIdentity || ""]
            .filter(Boolean).join("-")
        }
        break
    }

    if (generatedName !== currentSample.generatedName) {
      onSampleChange("generatedName", generatedName)
    }
  }

  const formatDateTimeForSampleName = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day}${month}${year}_${hours}:${minutes}`
    } catch {
      return dateTimeString
    }
  }

  const highlightNextEmptyField = () => {
    const requiredFields = getRequiredFieldsForCategory()
    for (const field of requiredFields) {
      if (!currentSample[field as keyof Sample]) {
        setHighlightedField(field)
        const element = document.getElementById(field)
        if (element) {
          element.focus()
        }
        break
      }
    }
  }

  const getRequiredFieldsForCategory = () => {
    switch (sampleCategory) {
      case "commercial":
        return ["grade", "lot", "sampleIdentity"]
      case "td":
        return ["sampleIdentity"]
      case "benchmark":
        return ["feature", "sampleIdentity"]
      case "inprocess":
        return ["plant", "samplingDateTime", "sampleIdentity"]
      case "chemicals":
        return ["chemicalName", "sampleIdentity"]
      case "cap":
        return ["capability", "capType", "sampleIdentity"]
      default:
        return []
    }
  }

  const capTypeOptions: SelectOption[] = [
    { value: "REF", label: "Reference (REF)" },
    { value: "STD", label: "Standard (STD)" },
    { value: "Other", label: "Other (please specify)" },
  ]

  const renderSampleCategoryForm = () => {
    switch (sampleCategory) {
      case "commercial":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                {loadingGrades ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading grades...</span>
                  </div>
                ) : (
                  <SearchableSelect
                    id="grade"
                    options={gradeOptions}
                    value={currentSample.grade || ""}
                    onChange={(value) => onSampleChange("grade", value)}
                    placeholder="Search grade"
                    className={`${highlightedField === "grade" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {gradeError && (
                  <p className="text-xs text-red-500 mt-1">Error loading grades: {gradeError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lot">Lot *</Label>
                <Input
                  id="lot"
                  value={currentSample.lot || ""}
                  onChange={(e) => onSampleChange("lot", e.target.value)}
                  className={`${highlightedField === "lot" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity *</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity || ""}
                  onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={currentSample.type || ""} 
                  onValueChange={(value) => onSampleChange("type", value)}
                >
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sampleCategory === "commercial" && currentSample.grade && !currentSample.type && (
                  <p className="text-xs text-amber-600 mt-1">No polymer type found for this grade</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form || ""} onValueChange={(value) => onSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "td":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tech">Tech/CAT</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Tech/CAT options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="tech"
                    options={techCatOptions.length > 0 ? techCatOptions : [{ value: "", label: "No Tech/CAT options available", shortText: "" }]}
                    value={currentSample.tech || ""}
                    onChange={(value) => onSampleChange("tech", value)}
                    placeholder="Search or enter Tech/CAT"
                    allowCustomValue={true}
                    className={`${highlightedField === "tech" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Tech/CAT options: {appTechError}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tech-future-use"
                    checked={currentSample.techForFutureUse || false}
                    onCheckedChange={(checked) => onSampleChange("techForFutureUse", checked as boolean)}
                  />
                  <Label htmlFor="tech-future-use" className="text-sm font-normal">
                    Add for future use (pending PCRD admin review)
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature">Feature/App</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Feature/App options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="feature"
                    options={featureAppOptions.length > 0 ? featureAppOptions : [{ value: "", label: "No Feature/App options available", shortText: "" }]}
                    value={currentSample.feature || ""}
                    onChange={(value) => onSampleChange("feature", value)}
                    placeholder="Search or enter Feature/App"
                    allowCustomValue={true}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="feature-future-use"
                    checked={currentSample.featureForFutureUse || false}
                    onCheckedChange={(checked) => onSampleChange("featureForFutureUse", checked as boolean)}
                  />
                  <Label htmlFor="feature-future-use" className="text-sm font-normal">
                    Add for future use (pending PCRD admin review)
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity *</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity || ""}
                  onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type || ""} onValueChange={(value) => onSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form || ""} onValueChange={(value) => onSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "benchmark":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature/App *</Label>
                {loadingAppTechs ? (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">Loading Feature/App options...</span>
                  </div>
                ) : (
                  <AutocompleteInput
                    id="feature"
                    options={featureAppOptions.length > 0 ? featureAppOptions : [{ value: "", label: "No Feature/App options available", shortText: "" }]}
                    value={currentSample.feature || ""}
                    onChange={(value) => onSampleChange("feature", value)}
                    placeholder="Search Feature/App"
                    allowCustomValue={appTechError !== null}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity *</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity || ""}
                  onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type || ""} onValueChange={(value) => onSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form || ""} onValueChange={(value) => onSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "inprocess":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant *</Label>
                <Select value={currentSample.plant || ""} onValueChange={(value) => onSampleChange("plant", value)}>
                  <SelectTrigger
                    id="plant"
                    className={`w-full ${highlightedField === "plant" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantOptions.map((plant) => (
                      <SelectItem key={plant.value} value={plant.value}>
                        {plant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="samplingDateTime">Sampling Date/Time *</Label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="samplingDateTime"
                    type="datetime-local"
                    value={currentSample.samplingDateTime || ""}
                    onChange={(e) => onSampleChange("samplingDateTime", e.target.value)}
                    className={`${highlightedField === "samplingDateTime" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity *</Label>
                <Input
                  id="sample-identity"
                  value={currentSample.sampleIdentity || ""}
                  onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                  className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentSample.type || ""} onValueChange={(value) => onSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full ${highlightedField === "type" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form || ""} onValueChange={(value) => onSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full ${highlightedField === "form" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "chemicals":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chemicalName">Chemical/Substance Name *</Label>
                <Input
                  id="chemicalName"
                  value={currentSample.chemicalName || ""}
                  onChange={(e) => onSampleChange("chemicalName", e.target.value)}
                  placeholder="Enter chemical or substance name"
                  className={`${highlightedField === "chemicalName" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier/Sources</Label>
                <Input
                  id="supplier"
                  value={currentSample.supplier || ""}
                  onChange={(e) => onSampleChange("supplier", e.target.value)}
                  placeholder="Enter supplier or source"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sample-identity">Sample Identity *</Label>
              <Input
                id="sample-identity"
                value={currentSample.sampleIdentity || ""}
                onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                autoComplete="off"
              />
            </div>
          </div>
        )

      case "cap":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capability">Capability *</Label>
                <Select value={currentSample.capability || ""} onValueChange={(value) => onSampleChange("capability", value)}>
                  <SelectTrigger
                    id="capability"
                    className={`w-full ${highlightedField === "capability" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select capability" />
                  </SelectTrigger>
                  <SelectContent>
                    {capabilityOptions && capabilityOptions.length > 0 ? (
                      capabilityOptions.map((capability) => (
                        <SelectItem key={capability.value} value={capability.value}>
                          {capability.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-options" disabled>
                        No capabilities available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capType">Type *</Label>
                <Select value={currentSample.capType || ""} onValueChange={(value) => onSampleChange("capType", value)}>
                  <SelectTrigger
                    id="capType"
                    className={`w-full ${highlightedField === "capType" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {capTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sample-identity">Sample Identity *</Label>
              <Input
                id="sample-identity"
                value={currentSample.sampleIdentity || ""}
                onChange={(e) => onSampleChange("sampleIdentity", e.target.value)}
                placeholder={currentSample.capType === "Other" ? "Please specify" : "Enter sample identity"}
                className={`${highlightedField === "sampleIdentity" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Polymer Type</Label>
                <Select value={currentSample.type || ""} onValueChange={(value) => onSampleChange("type", value)}>
                  <SelectTrigger
                    id="type"
                    className={`w-full`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form</Label>
                <Select value={currentSample.form || ""} onValueChange={(value) => onSampleChange("form", value)}>
                  <SelectTrigger
                    id="form"
                    className={`w-full`}
                  >
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Sample" : "Add New Sample"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Modify the sample details below" : "Fill in the sample details to add to your request"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!editMode && (
            <div>
              <Label>Sample Category</Label>
              <Tabs
                value={sampleCategory}
                onValueChange={(value) => onSampleCategoryChange(value as SampleCategory)}
                className="w-full"
              >
                <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3">
                  <Button
                    type="button"
                    variant={sampleCategory === "commercial" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("commercial")}
                    className="justify-start"
                  >
                    Commercial Grade
                  </Button>
                  <Button
                    type="button"
                    variant={sampleCategory === "td" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("td")}
                    className="justify-start"
                  >
                    TD/NPD
                  </Button>
                  <Button
                    type="button"
                    variant={sampleCategory === "benchmark" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("benchmark")}
                    className="justify-start"
                  >
                    Benchmark
                  </Button>
                  <Button
                    type="button"
                    variant={sampleCategory === "inprocess" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("inprocess")}
                    className="justify-start"
                  >
                    Inprocess
                  </Button>
                  <Button
                    type="button"
                    variant={sampleCategory === "chemicals" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("chemicals")}
                    className="justify-start"
                  >
                    Chemicals/Substances
                  </Button>
                  <Button
                    type="button"
                    variant={sampleCategory === "cap" ? "default" : "outline"}
                    onClick={() => onSampleCategoryChange("cap")}
                    className="justify-start"
                  >
                    Cap Development
                  </Button>
                </div>
              </Tabs>
            </div>
          )}

          {sampleCategory && showSampleSections && (
            <div className="space-y-4">
              {renderSampleCategoryForm()}

              <div className="space-y-2">
                <Label htmlFor="generated-name">Generated Sample Name</Label>
                <Input
                  id="generated-name"
                  value={currentSample.generatedName || ""}
                  disabled
                  className="bg-gray-100 font-medium"
                  autoComplete="off"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAddSample}
            disabled={!currentSample.generatedName}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {editMode ? "Update Sample" : "Add Sample"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}