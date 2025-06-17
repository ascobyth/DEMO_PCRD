"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface SampleCommercialFormProps {
  initialData?: any
  onSubmit: (formData: any) => void
  onCancel: () => void
  isLoading: boolean
  isEditing?: boolean
}

export default function SampleCommercialForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false
}: SampleCommercialFormProps) {
  const [appTechs, setAppTechs] = useState<any[]>([])
  const [plantReactors, setPlantReactors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    gradeName: "",
    application: "",
    polymerType: "",
    isActive: true,
    properties: [],
    appTechId: null,
    plantReactorId: null
  })

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        gradeName: initialData.gradeName || "",
        application: initialData.application || "",
        polymerType: initialData.polymerType || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        properties: initialData.properties || [],
        appTechId: initialData.appTechId || null,
        plantReactorId: initialData.plantReactorId || null
      })
    }
  }, [initialData])

  // Fetch AppTechs for dropdown
  useEffect(() => {
    const fetchAppTechs = async () => {
      try {
        const response = await fetch('/api/app-techs')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setAppTechs(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching app techs:', error)
      }
    }

    fetchAppTechs()
  }, [])

  // Fetch PlantReactors for dropdown
  useEffect(() => {
    const fetchPlantReactors = async () => {
      try {
        const response = await fetch('/api/plant-reactors')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setPlantReactors(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching plant reactors:', error)
      }
    }

    fetchPlantReactors()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // If "none" is selected, set it to null in the form data
    if (value === "none") {
      setFormData((prev) => ({
        ...prev,
        [name]: null
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
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
          <Label htmlFor="gradeName">Grade Name</Label>
          <Input
            id="gradeName"
            name="gradeName"
            value={formData.gradeName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application">Application</Label>
          <Input
            id="application"
            name="application"
            value={formData.application}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="polymerType">Polymer Type</Label>
          <Input
            id="polymerType"
            name="polymerType"
            value={formData.polymerType}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appTechId">App Tech</Label>
          <Select
            value={formData.appTechId === null ? "none" : formData.appTechId}
            onValueChange={(value) => handleSelectChange("appTechId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select App Tech" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {appTechs.map((appTech) => (
                <SelectItem key={appTech._id} value={appTech._id}>
                  {appTech.appTech} - {appTech.shortText}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plantReactorId">Plant Reactor</Label>
          <Select
            value={formData.plantReactorId === null ? "none" : formData.plantReactorId}
            onValueChange={(value) => handleSelectChange("plantReactorId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Plant Reactor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {plantReactors.map((reactor) => (
                <SelectItem key={reactor._id} value={reactor._id}>
                  {reactor.reactorPlantName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
