"use client"

import React, { useEffect, useState, useRef } from "react"
import { HelpCircle } from "lucide-react"
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
import { Sample, SampleCategory, AppTechOption, SelectOption } from "./types"

interface SampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSample: Sample;
  sampleCategory: SampleCategory;
  editMode: boolean;
  onSampleChange: (name: string, value: string) => void;
  onSampleCategoryChange: (category: SampleCategory) => void;
  onAddSample: () => void;
  appTechs?: any[];
  gradeOptions?: SelectOption[];
  techCatOptions?: AppTechOption[];
  featureAppOptions?: AppTechOption[];
  typeOptions?: SelectOption[];
  formOptions?: SelectOption[];
  plantOptions?: SelectOption[];
  loadingGrades?: boolean;
  loadingAppTechs?: boolean;
  gradeError?: string | null;
  appTechError?: string | null;
}

export function SampleDialog({
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
  loadingGrades = false,
  loadingAppTechs = false,
  gradeError = null,
  appTechError = null,
}: SampleDialogProps) {
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
        return ["grade", "lot", "sampleIdentity", "type", "form"]
      case "td":
        return ["tech", "feature", "sampleIdentity", "type", "form"]
      case "benchmark":
        return ["feature", "sampleIdentity", "type", "form"]
      case "inprocess":
      case "chemicals":
        return ["plant", "samplingDate", "samplingTime", "sampleIdentity", "type", "form"]
      case "cap":
        return ["feature", "sampleIdentity", "type", "form"]
      default:
        return []
    }
  }

  const focusOnNamingSystem = () => {
    if (automaticNamingRef.current) {
      automaticNamingRef.current.scrollIntoView({ behavior: "smooth" })
      setFocusedSection("naming")
      setTimeout(() => setFocusedSection(null), 2000)
    }
  }

  const renderSampleCategoryForm = () => {
    switch (sampleCategory) {
      case "commercial":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
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
                <Label htmlFor="lot">Lot</Label>
                <Input
                  id="lot"
                  value={currentSample.lot || ""}
                  onChange={(e) => onSampleChange("lot", e.target.value)}
                  className={`${highlightedField === "lot" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
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
                    placeholder="Search Tech/CAT"
                    allowCustomValue={appTechError !== null}
                    className={`${highlightedField === "tech" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Tech/CAT options: {appTechError}</p>
                )}
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
                    placeholder="Search Feature/App"
                    allowCustomValue={appTechError !== null}
                    className={`${highlightedField === "feature" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  />
                )}
                {appTechError && (
                  <p className="text-xs text-red-500 mt-1">Error loading Feature/App options: {appTechError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
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
                <Label htmlFor="sample-identity">Sample Identity</Label>
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
      case "chemicals":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant</Label>
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
                <Label htmlFor="samplingDate">Sampling Date</Label>
                <Input
                  id="samplingDate"
                  value={currentSample.samplingDate || ""}
                  onChange={(e) => onSampleChange("samplingDate", e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className={`${highlightedField === "samplingDate" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="samplingTime">Sampling Time</Label>
                <Input
                  id="samplingTime"
                  value={currentSample.samplingTime || ""}
                  onChange={(e) => onSampleChange("samplingTime", e.target.value)}
                  placeholder="HH:MM"
                  className={`${highlightedField === "samplingTime" ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sample-identity">Sample Identity</Label>
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

      case "cap":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <Label htmlFor="sample-identity">Sample Identity</Label>
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
                <Select value={currentSample.type} onValueChange={(value) => onSampleChange("type", value)}>
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
                <Select value={currentSample.form} onValueChange={(value) => onSampleChange("form", value)}>
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
                    Inprocess/Chemicals
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
              <div
                ref={automaticNamingRef}
                className={`p-4 rounded-md bg-blue-50 transition-all duration-500 ${
                  focusedSection === "naming" ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Automatic Sample Naming System</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Sample names are automatically generated based on the fields you fill in. The format depends
                          on the sample category you've selected.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sampleCategory === "commercial" && "Format: [Grade]-[Lot]-[Sample Identity]"}
                  {sampleCategory === "td" && "Format: [Tech/CAT]-[Feature/App]-[Sample Identity]"}
                  {sampleCategory === "benchmark" && "Format: [Feature/App]-[Sample Identity]"}
                  {(sampleCategory === "inprocess" || sampleCategory === "chemicals") &&
                    "Format: [Plant]-[Sampling Date]-[Sampling Time]-[Sample Identity]"}
                  {sampleCategory === "cap" && "Format: [Feature/App]-[Sample Identity]"}
                </p>
              </div>

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