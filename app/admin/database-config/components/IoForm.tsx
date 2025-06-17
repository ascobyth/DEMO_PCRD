"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface IoFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function IoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: IoFormProps) {
  const [formData, setFormData] = useState({
    ioNo: "",
    ioName: "",
    responsible: "",
    costCenter: "",
    costCenterNo: "",
    company: "",
    status: "Active",
    ioMapping: "",
    ioNoMappingWithName: "",
    ioType: "",
    member: "",
    testSpending: 0,
    isTechsprint: false,
    asset: "",
    techProgram: ""
  })

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ioNo: initialData.ioNo || "",
        ioName: initialData.ioName || "",
        responsible: initialData.responsible || "",
        costCenter: initialData.costCenter || "",
        costCenterNo: initialData.costCenterNo || "",
        company: initialData.company || "",
        status: initialData.status || "Active",
        ioMapping: initialData.ioMapping || "",
        ioNoMappingWithName: initialData.ioNoMappingWithName || "",
        ioType: initialData.ioType || "",
        member: initialData.member || "",
        testSpending: initialData.testSpending || 0,
        isTechsprint: initialData.isTechsprint || false,
        asset: initialData.asset || "",
        techProgram: initialData.techProgram || ""
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    // Handle number inputs
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ioNo">IO Number</Label>
          <Input
            id="ioNo"
            name="ioNo"
            value={formData.ioNo}
            onChange={handleChange}
            disabled={isEditing} // Disable editing of ID if in edit mode
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ioName">IO Name</Label>
          <Input
            id="ioName"
            name="ioName"
            value={formData.ioName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsible">Responsible</Label>
          <Input
            id="responsible"
            name="responsible"
            value={formData.responsible}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costCenter">Cost Center</Label>
          <Input
            id="costCenter"
            name="costCenter"
            value={formData.costCenter}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costCenterNo">Cost Center No</Label>
          <Input
            id="costCenterNo"
            name="costCenterNo"
            value={formData.costCenterNo}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ioMapping">IO Mapping</Label>
          <Input
            id="ioMapping"
            name="ioMapping"
            value={formData.ioMapping}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ioNoMappingWithName">IO No Mapping With Name</Label>
          <Input
            id="ioNoMappingWithName"
            name="ioNoMappingWithName"
            value={formData.ioNoMappingWithName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ioType">IO Type</Label>
          <Input
            id="ioType"
            name="ioType"
            value={formData.ioType}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member">Member</Label>
          <Input
            id="member"
            name="member"
            value={formData.member}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testSpending">Test Spending</Label>
          <Input
            id="testSpending"
            name="testSpending"
            type="number"
            value={formData.testSpending}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset">Asset</Label>
          <Input
            id="asset"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="techProgram">Tech Program</Label>
          <Input
            id="techProgram"
            name="techProgram"
            value={formData.techProgram}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 flex items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="isTechsprint"
              checked={formData.isTechsprint}
              onCheckedChange={(checked) => handleSwitchChange("isTechsprint", checked)}
            />
            <Label htmlFor="isTechsprint">Is Techsprint</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update" : "Create"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
