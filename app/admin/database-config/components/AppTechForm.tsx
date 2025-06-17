"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface AppTechFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function AppTechForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: AppTechFormProps) {
  const [formData, setFormData] = useState({
    appTech: "",
    shortText: "",
    appTechType: "",
    isActive: true
  })

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        appTech: initialData.appTech || "",
        shortText: initialData.shortText || "",
        appTechType: initialData.appTechType || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <Label htmlFor="appTech">App Tech Name</Label>
          <Input
            id="appTech"
            name="appTech"
            value={formData.appTech}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortText">Short Text</Label>
          <Input
            id="shortText"
            name="shortText"
            value={formData.shortText}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appTechType">App Tech Type</Label>
          <Input
            id="appTechType"
            name="appTechType"
            value={formData.appTechType}
            onChange={handleChange}
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
