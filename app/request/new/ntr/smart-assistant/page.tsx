"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check, ArrowRight, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"

export default function SmartAssistantPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    property: "",
    accuracy: "medium",
    urgency: 50,
    budget: [500],
    sampleType: "",
    application: "",
    recommendations: [],
  })

  // Mock parameters for the autocomplete
  const parameters = [
    { value: "tensile-strength", label: "Tensile Strength" },
    { value: "flexural-modulus", label: "Flexural Modulus" },
    { value: "impact-strength", label: "Impact Strength" },
    { value: "melt-flow-rate", label: "Melt Flow Rate" },
    { value: "density", label: "Density" },
    { value: "thermal-stability", label: "Thermal Stability" },
    { value: "crystallinity", label: "Crystallinity" },
    { value: "molecular-weight", label: "Molecular Weight" },
    { value: "viscosity", label: "Viscosity" },
    { value: "hardness", label: "Hardness" },
  ]

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Generate recommendations based on selections
      const recommendations = generateRecommendations()
      setFormData((prev) => ({ ...prev, recommendations }))
    }
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Mock function to generate recommendations based on user selections
  const generateRecommendations = () => {
    // In a real implementation, this would use more sophisticated logic
    // based on the user's selections
    const recommendations = [
      {
        id: "TM-MECH-001",
        name: "Tensile Strength (ASTM D638)",
        category: "Mechanical",
        description: "Measures how much stress a material can withstand while being stretched before breaking.",
        price: 350,
        turnaround: 5,
        match: 95,
        selected: true,
      },
      {
        id: "TM-THERM-001",
        name: "DSC Analysis (ASTM D3418)",
        category: "Thermal",
        description: "Measures heat flow into or out of a sample as a function of temperature or time.",
        price: 400,
        turnaround: 7,
        match: 90,
        selected: true,
      },
      {
        id: "TM-RHEO-001",
        name: "Melt Flow Rate (ASTM D1238)",
        category: "Rheological",
        description: "Measures the rate of extrusion of thermoplastics through an orifice under prescribed conditions.",
        price: 250,
        turnaround: 3,
        match: 85,
        selected: true,
      },
      {
        id: "TM-MORPH-001",
        name: "SEM Analysis",
        category: "Morphological",
        description: "Examines the surface morphology and composition of polymer samples at high magnification.",
        price: 500,
        turnaround: 8,
        match: 70,
        selected: false,
      },
      {
        id: "TM-CHEM-001",
        name: "FTIR Analysis",
        category: "Chemical",
        description: "Identifies chemical bonds and functional groups in polymer samples.",
        price: 350,
        turnaround: 5,
        match: 65,
        selected: false,
      },
    ]

    return recommendations
  }

  const toggleRecommendation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((rec) => (rec.id === id ? { ...rec, selected: !rec.selected } : rec)),
    }))
  }

  const getSelectedCount = () => {
    return formData.recommendations.filter((rec) => rec.selected).length
  }

  const getTotalCost = () => {
    return formData.recommendations.filter((rec) => rec.selected).reduce((sum, rec) => sum + rec.price, 0)
  }

  const getMaxTurnaround = () => {
    const selected = formData.recommendations.filter((rec) => rec.selected)
    return selected.length > 0 ? Math.max(...selected.map((rec) => rec.turnaround)) : 0
  }

  // Function to apply recommendations and navigate to test methods page
  const applyRecommendations = () => {
    // Get selected recommendations
    const selectedRecommendations = formData.recommendations.filter((rec) => rec.selected)

    // Save to localStorage for the test methods page to use
    try {
      localStorage.setItem("smartAssistantRecommendations", JSON.stringify(selectedRecommendations))

      // Navigate to test methods page after saving to localStorage
      router.push("/request/new/ntr/test-methods")
    } catch (error) {
      console.error("Error saving recommendations to localStorage:", error)
      // Still navigate even if there's an error
      router.push("/request/new/ntr/test-methods")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/request/new/ntr/test-methods">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Test Methods
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Smart Assistant</h1>
          <p className="text-muted-foreground">Let us help you find the right test methods for your samples</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your testing needs</CardTitle>
              <CardDescription>
                Answer a few questions to help us recommend the most appropriate test methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="property">Which testing parameter would you like to search for?</Label>
                <AutocompleteInput
                  id="property"
                  options={parameters}
                  value={formData.property}
                  onChange={(value) => handleSelectChange("property", value)}
                  placeholder="Search parameters..."
                  allowCustomValue={false}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="sample-type">What type of polymer do you have?</Label>
                <Select value={formData.sampleType} onValueChange={(value) => handleSelectChange("sampleType", value)}>
                  <SelectTrigger id="sample-type">
                    <SelectValue placeholder="Select polymer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDPE">HDPE</SelectItem>
                    <SelectItem value="LDPE">LDPE</SelectItem>
                    <SelectItem value="LLDPE">LLDPE</SelectItem>
                    <SelectItem value="UHWMPE">UHWMPE</SelectItem>
                    <SelectItem value="PP">PP</SelectItem>
                    <SelectItem value="PVC">PVC</SelectItem>
                    <SelectItem value="Wax">Wax</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="application">What is the physical form of your sample?</Label>
                <Select
                  value={formData.application}
                  onValueChange={(value) => handleSelectChange("application", value)}
                >
                  <SelectTrigger id="application">
                    <SelectValue placeholder="Select sample form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pellet">Pellet</SelectItem>
                    <SelectItem value="Powder">Powder</SelectItem>
                    <SelectItem value="Flake">Flake</SelectItem>
                    <SelectItem value="Scrap">Scrap</SelectItem>
                    <SelectItem value="Specimen">Specimen</SelectItem>
                    <SelectItem value="Liquid">Liquid</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>What level of accuracy do you need?</Label>
                <RadioGroup
                  defaultValue={formData.accuracy}
                  onValueChange={(value) => handleRadioChange("accuracy", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="accuracy-low" />
                    <Label htmlFor="accuracy-low" className="font-normal">
                      Low (Screening/Qualitative)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="accuracy-medium" />
                    <Label htmlFor="accuracy-medium" className="font-normal">
                      Medium (Standard Testing)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="accuracy-high" />
                    <Label htmlFor="accuracy-high" className="font-normal">
                      High (Research/Publication Quality)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>How urgent are your results?</Label>
                <div className="pt-2">
                  <Slider
                    defaultValue={[formData.urgency]}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleSliderChange("urgency", value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Not Urgent</span>
                    <span>Standard</span>
                    <span>Very Urgent</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>What is your appropriate budget? (THB)</Label>
                <div className="pt-2">
                  <Slider
                    defaultValue={formData.budget}
                    max={2000}
                    step={100}
                    onValueChange={(value) => handleSliderChange("budget", value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 THB</span>
                    <span>{formData.budget[0] >= 2000 ? "more than 70000" : `${formData.budget[0] * 35} THB`}</span>
                    <span>70,000 THB</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={nextStep}
                disabled={!formData.property || !formData.sampleType || !formData.application}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Test Methods</CardTitle>
              <CardDescription>Based on your requirements, we recommend the following test methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">Recommendations Ready</h3>
                    <p className="text-sm text-green-700 mt-1">
                      We've analyzed your requirements and found {formData.recommendations.length} suitable test
                      methods. Review and select the ones you want to include in your request.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {formData.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`border rounded-lg p-4 transition-all ${
                      rec.selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <Button
                            variant={rec.selected ? "default" : "outline"}
                            size="sm"
                            className={rec.selected ? "bg-primary" : ""}
                            onClick={() => toggleRecommendation(rec.id)}
                          >
                            {rec.selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-base font-medium">{rec.name}</h3>
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                              {rec.match}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {rec.category}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {rec.price * 35} THB
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {rec.turnaround} days
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={nextStep}
                disabled={getSelectedCount() === 0}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review and Confirm</CardTitle>
              <CardDescription>Review your selected test methods and confirm your choices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Your Requirements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Property of Interest:</span>
                      <span className="text-sm font-medium capitalize">
                        {parameters.find((p) => p.value === formData.property)?.label || formData.property}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sample Type:</span>
                      <span className="text-sm font-medium capitalize">{formData.sampleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Application:</span>
                      <span className="text-sm font-medium capitalize">{formData.application}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Accuracy Level:</span>
                      <span className="text-sm font-medium capitalize">{formData.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budget:</span>
                      <span className="text-sm font-medium">
                        {formData.budget[0] >= 2000 ? "more than 70000" : `${formData.budget[0] * 35} THB`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Selected Methods:</span>
                      <span className="text-sm font-medium">{getSelectedCount()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Cost:</span>
                      <span className="text-sm font-medium">{getTotalCost() * 35} THB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Turnaround:</span>
                      <span className="text-sm font-medium">{getMaxTurnaround()} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budget Status:</span>
                      <span
                        className={`text-sm font-medium ${
                          getTotalCost() <= formData.budget[0] ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {getTotalCost() <= formData.budget[0] ? "Within Budget" : "Exceeds Budget"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Selected Test Methods</h3>
                <div className="space-y-2">
                  {formData.recommendations
                    .filter((rec) => rec.selected)
                    .map((rec) => (
                      <div key={rec.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{rec.name}</p>
                          <p className="text-sm text-muted-foreground">{rec.category}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {rec.price * 35} THB
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={applyRecommendations}
              >
                Apply Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

