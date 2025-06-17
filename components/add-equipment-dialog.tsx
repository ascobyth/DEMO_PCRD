import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Upload, Image as ImageIcon } from "lucide-react"

interface AddEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEquipmentAdded: (equipment: any) => void
}

export function AddEquipmentDialog({ open, onOpenChange, onEquipmentAdded }: AddEquipmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    equipmentCode: "",
    equipmentName: "",
    equipmentFunction: "",
    model: "",
    manufacturer: "",
    usedDate: "",
    equipmentCondition: "",
    typeInEx: "",
    mainMonitor: "",
    serviceTime: 0,
    pmInYear: 0,
    calInYear: 0,
    serviceDayPerWeek: 5,
    aServiceDayPerWeek: 5,
    workloadFactor: 0.8,
    workloadFactorDescription: "",
    serviceTimeStart: 900,
    serviceTimeEnd: 1700,
    capPerDay: 0,
    serviceNormalDuration: 60,
    serviceErDuration: 120,
    equipmentScope: "",
    range: "",
    accuracy: "",
    allowance: "",
    rangeOfUse: "",
    pmBy: "",
    pmFreq: "",
    calBy: "",
    calFreq: "",
    distributor: "",
    location: "",
    operationDocument: "",
    respBy: "",
    respByComplianceAssetId: "",
    equipmentStatus: "Active",
    equipmentType: "",
    primaryId: "",
    primaryCode: "",
    componentId: "",
    componentCode: "",
    accessoryId: "",
    accessoryCode: "",
    equipmentFunctionAll: "",
    obsoleteDate: "",
    remark: "",
    obsoleteReason: "",
    targetDuration: 0,
    equipmentImage: ""
  })

  // State for file upload
  const [equipmentImageFile, setEquipmentImageFile] = useState<File | null>(null)
  const equipmentImageInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value)
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size exceeds 5MB limit",
          variant: "destructive",
        })
        return
      }

      // Check file type (only allow images)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Only image files are allowed",
          variant: "destructive",
        })
        return
      }

      setEquipmentImageFile(file)
    }
  }

  const handleRemoveFile = () => {
    setEquipmentImageFile(null)
    setFormData((prev) => ({
      ...prev,
      equipmentImage: ""
    }))

    // Reset the file input
    if (equipmentImageInputRef.current) {
      equipmentImageInputRef.current.value = ""
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'equipment_img')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      console.log('File upload response:', data)

      // Check for filePath (new system) or fileId (legacy system)
      if (data.filePath) {
        return data.filePath
      } else if (data.fileId) {
        return data.fileId
      } else {
        throw new Error('File upload response missing path or ID')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
      return null
    }
  }

  // Fetch locations for dropdown
  const [locations, setLocations] = useState<any[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setLocations(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }

    if (open) {
      fetchLocations()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.equipmentCode || !formData.equipmentName) {
        toast({
          title: "Validation Error",
          description: "Equipment Code and Name are required fields",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Upload image if selected
      let equipmentImagePath = formData.equipmentImage
      if (equipmentImageFile) {
        const uploadedPath = await uploadFile(equipmentImageFile)
        if (uploadedPath) {
          equipmentImagePath = uploadedPath
        }
      }

      // Create a copy of the form data with the image path
      const dataToSubmit = {
        ...formData,
        equipmentImage: equipmentImagePath
      }

      // Send data to API
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add equipment')
      }

      // Success
      toast({
        title: "Success",
        description: "Equipment added successfully",
      })

      // Reset form and close dialog
      setFormData({
        equipmentCode: "",
        equipmentName: "",
        equipmentFunction: "",
        model: "",
        manufacturer: "",
        usedDate: "",
        equipmentCondition: "",
        typeInEx: "",
        mainMonitor: "",
        serviceTime: 0,
        pmInYear: 0,
        calInYear: 0,
        serviceDayPerWeek: 5,
        aServiceDayPerWeek: 5,
        workloadFactor: 0.8,
        workloadFactorDescription: "",
        serviceTimeStart: 900,
        serviceTimeEnd: 1700,
        capPerDay: 0,
        serviceNormalDuration: 60,
        serviceErDuration: 120,
        equipmentScope: "",
        range: "",
        accuracy: "",
        allowance: "",
        rangeOfUse: "",
        pmBy: "",
        pmFreq: "",
        calBy: "",
        calFreq: "",
        distributor: "",
        location: "",
        operationDocument: "",
        respBy: "",
        respByComplianceAssetId: "",
        equipmentStatus: "Active",
        equipmentType: "",
        primaryId: "",
        primaryCode: "",
        componentId: "",
        componentCode: "",
        accessoryId: "",
        accessoryCode: "",
        equipmentFunctionAll: "",
        obsoleteDate: "",
        remark: "",
        obsoleteReason: "",
        targetDuration: 0,
        equipmentImage: ""
      })

      // Reset file input
      setEquipmentImageFile(null)
      if (equipmentImageInputRef.current) {
        equipmentImageInputRef.current.value = ""
      }
      onOpenChange(false)
      onEquipmentAdded(data.data)
    } catch (error) {
      console.error('Error adding equipment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add equipment",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogDescription>
            Fill in the equipment details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="equipmentCode">Equipment Code *</Label>
                  <Input
                    id="equipmentCode"
                    name="equipmentCode"
                    value={formData.equipmentCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentName">Equipment Name *</Label>
                  <Input
                    id="equipmentName"
                    name="equipmentName"
                    value={formData.equipmentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentFunction">Function</Label>
                  <Textarea
                    id="equipmentFunction"
                    name="equipmentFunction"
                    value={formData.equipmentFunction}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentFunctionAll">All Functions</Label>
                  <Textarea
                    id="equipmentFunctionAll"
                    name="equipmentFunctionAll"
                    value={formData.equipmentFunctionAll}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentStatus">Status</Label>
                  <Select
                    value={formData.equipmentStatus}
                    onValueChange={(value) => handleSelectChange("equipmentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Obsolete">Obsolete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentType">Equipment Type</Label>
                  <Input
                    id="equipmentType"
                    name="equipmentType"
                    value={formData.equipmentType}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeInEx">Type In/Ex</Label>
                  <Input
                    id="typeInEx"
                    name="typeInEx"
                    value={formData.typeInEx}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainMonitor">Main Monitor</Label>
                  <Input
                    id="mainMonitor"
                    name="mainMonitor"
                    value={formData.mainMonitor}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Specifications</h3>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usedDate">Used Date</Label>
                  <Input
                    id="usedDate"
                    name="usedDate"
                    type="date"
                    value={formData.usedDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentCondition">Equipment Condition</Label>
                  <Select
                    value={formData.equipmentCondition}
                    onValueChange={(value) => handleSelectChange("equipmentCondition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentScope">Equipment Scope</Label>
                  <Input
                    id="equipmentScope"
                    name="equipmentScope"
                    value={formData.equipmentScope}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="range">Range</Label>
                  <Input
                    id="range"
                    name="range"
                    value={formData.range}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accuracy">Accuracy</Label>
                  <Input
                    id="accuracy"
                    name="accuracy"
                    value={formData.accuracy}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowance">Allowance</Label>
                  <Input
                    id="allowance"
                    name="allowance"
                    value={formData.allowance}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rangeOfUse">Range of Use</Label>
                  <Input
                    id="rangeOfUse"
                    name="rangeOfUse"
                    value={formData.rangeOfUse}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Maintenance */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Maintenance</h3>

                <div className="space-y-2">
                  <Label htmlFor="pmInYear">PM Frequency (per year)</Label>
                  <Input
                    id="pmInYear"
                    name="pmInYear"
                    type="number"
                    value={formData.pmInYear}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pmBy">PM By</Label>
                  <Input
                    id="pmBy"
                    name="pmBy"
                    value={formData.pmBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pmFreq">PM Frequency</Label>
                  <Input
                    id="pmFreq"
                    name="pmFreq"
                    value={formData.pmFreq}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calInYear">Calibration Frequency (per year)</Label>
                  <Input
                    id="calInYear"
                    name="calInYear"
                    type="number"
                    value={formData.calInYear}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calBy">Calibration By</Label>
                  <Input
                    id="calBy"
                    name="calBy"
                    value={formData.calBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calFreq">Calibration Frequency</Label>
                  <Input
                    id="calFreq"
                    name="calFreq"
                    value={formData.calFreq}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceTime">Service Time</Label>
                  <Input
                    id="serviceTime"
                    name="serviceTime"
                    type="number"
                    value={formData.serviceTime}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>

              {/* Service Capacity */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Service Capacity</h3>

                <div className="space-y-2">
                  <Label htmlFor="serviceDayPerWeek">Service Days Per Week</Label>
                  <Input
                    id="serviceDayPerWeek"
                    name="serviceDayPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.serviceDayPerWeek}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aServiceDayPerWeek">Actual Service Days Per Week</Label>
                  <Input
                    id="aServiceDayPerWeek"
                    name="aServiceDayPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.aServiceDayPerWeek}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceTimeStart">Service Start Time (24h format, e.g. 900 for 9:00)</Label>
                  <Input
                    id="serviceTimeStart"
                    name="serviceTimeStart"
                    type="number"
                    value={formData.serviceTimeStart}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceTimeEnd">Service End Time (24h format, e.g. 1700 for 17:00)</Label>
                  <Input
                    id="serviceTimeEnd"
                    name="serviceTimeEnd"
                    type="number"
                    value={formData.serviceTimeEnd}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capPerDay">Capacity Per Day</Label>
                  <Input
                    id="capPerDay"
                    name="capPerDay"
                    type="number"
                    value={formData.capPerDay}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceNormalDuration">Normal Service Duration (minutes)</Label>
                  <Input
                    id="serviceNormalDuration"
                    name="serviceNormalDuration"
                    type="number"
                    value={formData.serviceNormalDuration}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceErDuration">ER Service Duration (minutes)</Label>
                  <Input
                    id="serviceErDuration"
                    name="serviceErDuration"
                    type="number"
                    value={formData.serviceErDuration}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workloadFactor">Workload Factor</Label>
                  <Input
                    id="workloadFactor"
                    name="workloadFactor"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.workloadFactor}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workloadFactorDescription">Workload Factor Description</Label>
                  <Input
                    id="workloadFactorDescription"
                    name="workloadFactorDescription"
                    value={formData.workloadFactorDescription}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDuration">Target Duration (minutes)</Label>
                  <Input
                    id="targetDuration"
                    name="targetDuration"
                    type="number"
                    value={formData.targetDuration}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>

              {/* Location and Responsibility */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Location and Responsibility</h3>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location._id} value={location.sublocation || location.locationId}>
                          {location.sublocation || location.locationId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respBy">Responsible By</Label>
                  <Input
                    id="respBy"
                    name="respBy"
                    value={formData.respBy}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respByComplianceAssetId">Responsible By Compliance Asset ID</Label>
                  <Input
                    id="respByComplianceAssetId"
                    name="respByComplianceAssetId"
                    value={formData.respByComplianceAssetId}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distributor">Distributor</Label>
                  <Input
                    id="distributor"
                    name="distributor"
                    value={formData.distributor}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationDocument">Operation Document</Label>
                  <Input
                    id="operationDocument"
                    name="operationDocument"
                    value={formData.operationDocument}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Component Information */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Component Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="primaryId">Primary ID</Label>
                  <Input
                    id="primaryId"
                    name="primaryId"
                    value={formData.primaryId}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryCode">Primary Code</Label>
                  <Input
                    id="primaryCode"
                    name="primaryCode"
                    value={formData.primaryCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="componentId">Component ID</Label>
                  <Input
                    id="componentId"
                    name="componentId"
                    value={formData.componentId}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="componentCode">Component Code</Label>
                  <Input
                    id="componentCode"
                    name="componentCode"
                    value={formData.componentCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessoryId">Accessory ID</Label>
                  <Input
                    id="accessoryId"
                    name="accessoryId"
                    value={formData.accessoryId}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessoryCode">Accessory Code</Label>
                  <Input
                    id="accessoryCode"
                    name="accessoryCode"
                    value={formData.accessoryCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Additional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="obsoleteDate">Obsolete Date</Label>
                  <Input
                    id="obsoleteDate"
                    name="obsoleteDate"
                    type="date"
                    value={formData.obsoleteDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obsoleteReason">Obsolete Reason</Label>
                  <Textarea
                    id="obsoleteReason"
                    name="obsoleteReason"
                    value={formData.obsoleteReason}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remark">Remark</Label>
                  <Textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Equipment Image</Label>
                  <div className="flex items-center gap-4" id="equipment-image-input">
                    <div className="flex-1">
                      <Input
                        ref={equipmentImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                    {equipmentImageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {equipmentImageFile && (
                    <div className="mt-2 p-2 border rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{equipmentImageFile.name}</span>
                      </div>
                      {equipmentImageFile && URL.createObjectURL && (
                        <div className="w-full h-32 relative">
                          <img
                            src={URL.createObjectURL(equipmentImageFile)}
                            alt="Equipment preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Equipment"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
