"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface LocationFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function LocationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: LocationFormProps) {
  const [formData, setFormData] = useState({
    locationId: "",
    sublocation: "",
    contactPerson: "",
    sendingAddress: "",
    contactNumber: "",
    isActive: true,
    address: ""
  })

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        locationId: initialData.locationId || "",
        sublocation: initialData.sublocation || "",
        contactPerson: initialData.contactPerson || "",
        sendingAddress: initialData.sendingAddress || "",
        contactNumber: initialData.contactNumber || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        address: initialData.address || ""
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
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
          <Label htmlFor="locationId">Location ID</Label>
          <Input
            id="locationId"
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            disabled={isEditing} // Disable editing of ID if in edit mode
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sublocation">Sublocation</Label>
          <Input
            id="sublocation"
            name="sublocation"
            value={formData.sublocation}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sendingAddress">Sending Address</Label>
          <Textarea
            id="sendingAddress"
            name="sendingAddress"
            value={formData.sendingAddress}
            onChange={handleChange}
            rows={3}
          />
        </div>



        <div className="space-y-2 flex items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
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
