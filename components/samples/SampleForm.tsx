"use client"

import React, { useState, useEffect } from "react"
import { Plus, Save, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { SampleTable } from "./SampleTable"
import { SampleDialog } from "./SampleDialog"
import { SaveSampleDialog } from "./SaveSampleDialog"
import { LoadSampleDialog } from "./LoadSampleDialog"
import { Sample, SampleSet, SampleCategory, AppTechOption, SelectOption, SampleFormProps } from "./types"

// Default options - can be overridden by props
const defaultTypeOptions: SelectOption[] = [
  { value: "HDPE", label: "HDPE" },
  { value: "LDPE", label: "LDPE" },
  { value: "LLDPE", label: "LLDPE" },
  { value: "UHWMPE", label: "UHWMPE" },
  { value: "PP", label: "PP" },
  { value: "PVC", label: "PVC" },
  { value: "Wax", label: "Wax" },
  { value: "Others", label: "Others" },
]

const defaultFormOptions: SelectOption[] = [
  { value: "Pellet", label: "Pellet" },
  { value: "Powder", label: "Powder" },
  { value: "Flake", label: "Flake" },
  { value: "Scrap", label: "Scrap" },
  { value: "Specimen", label: "Specimen" },
  { value: "Liquid", label: "Liquid" },
  { value: "Others", label: "Others" },
]

const defaultPlantOptions: SelectOption[] = [
  { value: "HD1", label: "HD1" },
  { value: "HD2", label: "HD2" },
  { value: "HD3", label: "HD3" },
  { value: "HD4", label: "HD4" },
  { value: "HD(LSP)", label: "HD(LSP)" },
  { value: "PP1", label: "PP1" },
  { value: "PP2", label: "PP2" },
  { value: "PP3", label: "PP3" },
  { value: "4P", label: "4P" },
  { value: "PP(LSP)", label: "PP(LSP)" },
  { value: "LDPE", label: "LDPE" },
  { value: "LLDPE", label: "LLDPE" },
]

interface ExtendedSampleFormProps extends SampleFormProps {
  // Optional props for customization
  gradeOptions?: SelectOption[];
  techCatOptions?: AppTechOption[];
  featureAppOptions?: AppTechOption[];
  typeOptions?: SelectOption[];
  formOptions?: SelectOption[];
  plantOptions?: SelectOption[];
  appTechs?: any[];
  loadingGrades?: boolean;
  loadingAppTechs?: boolean;
  gradeError?: string | null;
  appTechError?: string | null;
  onFetchGradeDetails?: (gradeName: string) => Promise<{ polymerType?: string }>;
  allowLoadFromFile?: boolean;
  allowSaveToDatabase?: boolean;
}

export function SampleForm({
  formData,
  onSamplesChange,
  user,
  gradeOptions = [],
  techCatOptions = [],
  featureAppOptions = [],
  typeOptions = defaultTypeOptions,
  formOptions = defaultFormOptions,
  plantOptions = defaultPlantOptions,
  appTechs = [],
  loadingGrades = false,
  loadingAppTechs = false,
  gradeError = null,
  appTechError = null,
  onFetchGradeDetails,
  allowLoadFromFile = true,
  allowSaveToDatabase = true,
}: ExtendedSampleFormProps) {
  // State for sample management
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false)
  const [currentSample, setCurrentSample] = useState<Sample>({
    category: "",
    grade: "",
    lot: "",
    sampleIdentity: "",
    type: "",
    form: "",
    tech: "",
    feature: "",
    plant: "",
    samplingDate: "",
    samplingTime: "",
    generatedName: "",
  })
  const [sampleCategory, setSampleCategory] = useState<SampleCategory>("commercial")
  const [editMode, setEditMode] = useState(false)
  const [editingSampleIndex, setEditingSampleIndex] = useState<number | null>(null)

  // State for dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [sampleListName, setSampleListName] = useState("")
  const [sampleListDescription, setSampleListDescription] = useState("")
  const [savedSampleLists, setSavedSampleLists] = useState<SampleSet[]>([])
  const [loadingSampleLists, setLoadingSampleLists] = useState(false)
  const [savingSampleList, setSavingSampleList] = useState(false)

  // Fetch sample sets when load dialog opens
  useEffect(() => {
    const fetchSampleSets = async () => {
      if (showLoadDialog && user?.email && allowSaveToDatabase) {
        try {
          setLoadingSampleLists(true)
          
          const params = new URLSearchParams({
            requesterEmail: user.email,
            ioNumber: formData.ioNumber || ''
          })
          
          const res = await fetch(`/api/sample-sets?${params}`)
          if (!res.ok) throw new Error(`Error fetching sample sets: ${res.statusText}`)
          
          const data = await res.json()
          
          if (data.success && data.data) {
            setSavedSampleLists(data.data)
            console.log(`Loaded ${data.data.length} sample sets from database`)
          } else {
            console.error("Failed to fetch sample sets:", data.error)
            toast({
              title: "Failed to load sample sets",
              description: data.error || "Unknown error",
              variant: "destructive"
            })
          }
        } catch (error: any) {
          console.error("Failed to fetch sample sets:", error)
          toast({
            title: "Failed to load sample sets",
            description: error.message,
            variant: "destructive"
          })
        } finally {
          setLoadingSampleLists(false)
        }
      }
    }

    fetchSampleSets()
  }, [showLoadDialog, user?.email, formData.ioNumber, allowSaveToDatabase])

  const handleSampleChange = async (name: string, value: string) => {
    // If grade is being changed in commercial category, fetch polymer type
    if (name === "grade" && sampleCategory === "commercial" && value && onFetchGradeDetails) {
      try {
        const details = await onFetchGradeDetails(value)
        if (details.polymerType) {
          // Update both grade and type
          setCurrentSample((prev) => {
            const updatedSample = { 
              ...prev, 
              grade: value,
              type: details.polymerType 
            }
            
            // Generate the sample name
            if (updatedSample.grade && updatedSample.lot && updatedSample.sampleIdentity) {
              updatedSample.generatedName = `${updatedSample.grade}-${updatedSample.lot}-${updatedSample.sampleIdentity}`
            }
            
            return updatedSample
          })
          return
        }
      } catch (error) {
        console.error("Failed to fetch grade details:", error)
      }
    }

    setCurrentSample((prev) => {
      const updatedSample = { ...prev, [name]: value }

      // Generate the sample name without category prefixes
      if (sampleCategory === "commercial" && updatedSample.grade && updatedSample.lot && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.grade}-${updatedSample.lot}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "td" && updatedSample.tech && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short codes from the options arrays
        const techOption = techCatOptions.find((option) => option.value === updatedSample.tech)
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const techShortCode = techOption ? techOption.shortText : updatedSample.tech
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${techShortCode}-${featureShortCode}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "benchmark" && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short code from the options array
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${featureShortCode}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "inprocess" && updatedSample.plant && updatedSample.samplingDate && updatedSample.samplingTime && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.plant}-${updatedSample.samplingDate}-${updatedSample.samplingTime}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "chemicals" && updatedSample.plant && updatedSample.samplingDate && updatedSample.samplingTime && updatedSample.sampleIdentity) {
        updatedSample.generatedName = `${updatedSample.plant}-${updatedSample.samplingDate}-${updatedSample.samplingTime}-${updatedSample.sampleIdentity}`
      } else if (sampleCategory === "cap" && updatedSample.feature && updatedSample.sampleIdentity) {
        // Get short code from the options array
        const featureOption = featureAppOptions.find((option) => option.value === updatedSample.feature)

        // Use shortText if available, otherwise fallback to ID
        const featureShortCode = featureOption ? featureOption.shortText : updatedSample.feature

        updatedSample.generatedName = `${featureShortCode}-${updatedSample.sampleIdentity}`
      } else {
        updatedSample.generatedName = ""
      }

      return updatedSample
    })
  }

  const isDuplicateSampleName = (name: string, excludeIndex?: number) => {
    return formData.samples.some(
      (sample, index) => sample.generatedName === name && (excludeIndex === undefined || index !== excludeIndex),
    )
  }

  const handleAddSample = () => {
    if (currentSample.generatedName) {
      // Check for duplicate sample names
      const isDuplicate = isDuplicateSampleName(
        currentSample.generatedName,
        editMode && editingSampleIndex !== null ? editingSampleIndex : undefined
      )

      if (isDuplicate) {
        toast({
          title: "Duplicate sample name",
          description: "A sample with this name already exists. Please modify the sample details.",
        })
        return
      }

      if (editMode && editingSampleIndex !== null) {
        // Update existing sample (preserve the ID)
        const updatedSamples = [...formData.samples]
        updatedSamples[editingSampleIndex] = { 
          ...currentSample,
          id: formData.samples[editingSampleIndex].id || currentSample.id
        }

        onSamplesChange(updatedSamples)

        // Exit edit mode
        setEditMode(false)
        setEditingSampleIndex(null)

        toast({
          title: "Sample updated",
          description: `Sample "${currentSample.generatedName}" has been updated.`,
        })
      } else {
        // Add new sample with unique ID
        const newSample = {
          ...currentSample,
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        onSamplesChange([...formData.samples, newSample])

        toast({
          title: "Sample added",
          description: `Sample "${currentSample.generatedName}" has been added.`,
        })
      }

      // Don't reset the form completely, just clear identity fields to prepare for next sample
      setCurrentSample((prev) => ({
        ...prev,
        sampleIdentity: "",
        generatedName: "",
      }))

      // Close the dialog
      setSampleDialogOpen(false)
    }
  }

  const handleRemoveSample = (index: number) => {
    onSamplesChange(formData.samples.filter((_, i) => i !== index))
    
    toast({
      title: "Sample removed",
      description: "The sample has been removed from your request.",
    })
  }

  const handleCopySample = (sample: Sample) => {
    // Set current sample to the copied sample (without the ID so it gets a new one)
    const { id, ...sampleWithoutId } = sample
    setCurrentSample({ ...sampleWithoutId })
    setSampleCategory(sample.category as SampleCategory)

    // Exit edit mode if it was active
    setEditMode(false)
    setEditingSampleIndex(null)

    // Open the sample dialog for editing
    setSampleDialogOpen(true)

    toast({
      title: "Sample copied",
      description: "Sample details copied. Make changes and add as a new sample.",
    })
  }

  const handleEditSample = (sample: Sample, index: number) => {
    setCurrentSample({ ...sample })
    setSampleCategory(sample.category as SampleCategory)
    setEditMode(true)
    setEditingSampleIndex(index)
    setSampleDialogOpen(true)
  }

  const handleSaveSampleSet = async () => {
    if (!sampleListName.trim() || formData.samples.length === 0) {
      toast({
        title: "Cannot save",
        description: "Please provide a name and have at least one sample.",
      })
      return
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save sample sets.",
        variant: "destructive"
      })
      return
    }

    if (!allowSaveToDatabase) {
      // If database saving is disabled, just close the dialog
      setShowSaveDialog(false)
      setSampleListName("")
      setSampleListDescription("")
      toast({
        title: "Sample set saved",
        description: "Sample set saved locally.",
      })
      return
    }

    try {
      setSavingSampleList(true)
      
      const response = await fetch('/api/sample-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sampleSetName: sampleListName,
          description: sampleListDescription,
          samples: formData.samples,
          ioNumber: formData.ioNumber || null,
          requesterName: user.name,
          requesterEmail: user.email,
          sampleCount: formData.samples.length
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sample set saved",
          description: `${sampleListName} has been saved to the database.`,
        })
        
        setShowSaveDialog(false)
        setSampleListName("")
        setSampleListDescription("")
      } else {
        toast({
          title: "Failed to save",
          description: data.error || "An error occurred while saving the sample set.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error saving sample set:", error)
      toast({
        title: "Failed to save",
        description: error.message || "An error occurred while saving the sample set.",
        variant: "destructive"
      })
    } finally {
      setSavingSampleList(false)
    }
  }

  const handleLoadSampleSet = (list: SampleSet) => {
    if (list) {
      // Ensure each sample has a unique ID when loading
      const samplesWithIds = list.samples.map((sample, index) => ({
        ...sample,
        id: sample.id || `sample-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
      }))
      
      onSamplesChange(samplesWithIds)
      setShowLoadDialog(false)
      
      toast({
        title: "Samples loaded",
        description: `Loaded ${samplesWithIds.length} samples from "${list.sampleSetName}".`,
      })
    }
  }

  const handleDeleteSampleSet = async (sampleSetId: string, sampleSetName: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to delete sample sets.",
        variant: "destructive"
      })
      return
    }

    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete "${sampleSetName}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const params = new URLSearchParams({
        id: sampleSetId,
        requesterEmail: user.email
      })

      const response = await fetch(`/api/sample-sets?${params}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sample set deleted",
          description: `${sampleSetName} has been deleted.`,
        })
        
        // Remove from local state
        setSavedSampleLists(prev => prev.filter(list => list._id !== sampleSetId))
      } else {
        toast({
          title: "Failed to delete",
          description: data.error || "An error occurred while deleting the sample set.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error deleting sample set:", error)
      toast({
        title: "Failed to delete",
        description: error.message || "An error occurred while deleting the sample set.",
        variant: "destructive"
      })
    }
  }

  const convertSamplesToCSV = (samples: Sample[]) => {
    if (samples.length === 0) return ''

    // Get all possible headers from all samples
    const allKeys = new Set<string>()
    samples.forEach(sample => {
      Object.keys(sample).forEach(key => allKeys.add(key))
    })

    // Convert Set to Array and join with commas for the header row
    const headers = Array.from(allKeys)
    const headerRow = headers.join(',')

    // Create data rows
    const dataRows = samples.map(sample => {
      return headers.map(header => {
        // Handle fields that might contain commas by wrapping in quotes
        const value = sample[header as keyof Sample] || ''
        return value.toString().includes(',') ? `"${value}"` : value
      }).join(',')
    })

    // Combine header and data rows
    return [headerRow, ...dataRows].join('\n')
  }

  const handleSaveCSV = () => {
    if (formData.samples.length === 0) {
      toast({
        title: "No samples to save",
        description: "Please add samples before saving.",
      })
      return
    }

    const csvContent = convertSamplesToCSV(formData.samples)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // Create a link element to trigger the download
    const link = document.createElement('a')
    const fileName = `samples_${new Date().toISOString().slice(0,10)}`
    link.setAttribute('href', url)
    link.setAttribute('download', `${fileName}.csv`)
    link.style.display = 'none'

    // Append the link to the body, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV file saved",
      description: `${formData.samples.length} samples saved as CSV file.`,
    })
  }

  const parseCSVToSamples = (csvText: string) => {
    const lines = csvText.split('\n')
    if (lines.length <= 1) return []

    const headers = lines[0].split(',')
    const samples = lines.slice(1).map((line, lineIndex) => {
      const values = line.split(',')
      const sample: any = {}

      headers.forEach((header, index) => {
        // Handle quoted values
        let value = values[index] || ''
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1)
        }
        sample[header] = value
      })

      // Add unique ID if not present
      if (!sample.id) {
        sample.id = `sample-${Date.now()}-${lineIndex}-${Math.random().toString(36).substr(2, 9)}`
      }

      return sample
    })

    return samples.filter(sample => sample.generatedName) // Filter out empty rows
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const samples = parseCSVToSamples(csvText)

        if (samples.length === 0) {
          toast({
            title: "Invalid CSV format",
            description: "Could not parse any valid samples from the file.",
          })
          return
        }

        onSamplesChange([...samples])
        setShowLoadDialog(false)

        toast({
          title: "Samples loaded",
          description: `${samples.length} samples loaded from CSV file.`,
        })
      } catch (error) {
        console.error("Error parsing CSV:", error)
        toast({
          title: "Error loading samples",
          description: "Failed to parse the CSV file. Please check the format.",
        })
      }
    }

    reader.readAsText(file)
  }

  const openAddSampleDialog = () => {
    setEditMode(false)
    setEditingSampleIndex(null)
    setCurrentSample({
      category: "",
      grade: "",
      lot: "",
      sampleIdentity: "",
      type: "",
      form: "",
      tech: "",
      feature: "",
      plant: "",
      samplingDate: "",
      samplingTime: "",
      generatedName: "",
    })
    setSampleCategory("commercial")
    setSampleDialogOpen(true)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Sample Information</CardTitle>
              <CardDescription>Add one or more samples for testing</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)}>
              <Upload className="mr-1 h-3 w-3" />
              Load Sample List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">No samples added yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Click the button below to start adding samples to your request. You'll be guided through the
                  process step by step.
                </p>
                <Button
                  onClick={openAddSampleDialog}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Click to start adding samples
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Samples</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.samples.length} sample(s) added
                  </p>
                </div>
                <div className="flex space-x-2">
                  {allowSaveToDatabase && (
                    <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                      <Save className="mr-1 h-3 w-3" />
                      Save Sample List
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSaveCSV}>
                    <Save className="mr-1 h-3 w-3" />
                    Save CSV
                  </Button>
                  <Button
                    onClick={openAddSampleDialog}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Sample
                  </Button>
                </div>
              </div>

              <SampleTable
                samples={formData.samples}
                onCopySample={handleCopySample}
                onEditSample={handleEditSample}
                onRemoveSample={handleRemoveSample}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SampleDialog
        open={sampleDialogOpen}
        onOpenChange={setSampleDialogOpen}
        currentSample={currentSample}
        sampleCategory={sampleCategory}
        editMode={editMode}
        onSampleChange={handleSampleChange}
        onSampleCategoryChange={setSampleCategory}
        onAddSample={handleAddSample}
        appTechs={appTechs}
        gradeOptions={gradeOptions}
        techCatOptions={techCatOptions}
        featureAppOptions={featureAppOptions}
        typeOptions={typeOptions}
        formOptions={formOptions}
        plantOptions={plantOptions}
        loadingGrades={loadingGrades}
        loadingAppTechs={loadingAppTechs}
        gradeError={gradeError}
        appTechError={appTechError}
      />

      <SaveSampleDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        sampleListName={sampleListName}
        onSampleListNameChange={setSampleListName}
        sampleListDescription={sampleListDescription}
        onSampleListDescriptionChange={setSampleListDescription}
        samples={formData.samples}
        ioNumber={formData.ioNumber}
        onSave={handleSaveSampleSet}
        saving={savingSampleList}
      />

      <LoadSampleDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        savedSampleLists={savedSampleLists}
        loading={loadingSampleLists}
        onLoadSampleSet={handleLoadSampleSet}
        onDeleteSampleSet={allowSaveToDatabase ? handleDeleteSampleSet : undefined}
        onFileUpload={allowLoadFromFile ? handleFileUpload : undefined}
      />
    </>
  )
}