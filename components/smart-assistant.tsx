"use client"

import { useState } from "react"
import { HelpCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function SmartAssistant() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    property: "",
    accuracy: "medium",
    urgency: 50,
    budget: [500],
  })

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
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardTitle>Smart Assistant</CardTitle>
        <CardDescription className="text-white/80">Let us help you find the right test methods</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="property">What property do you want to test?</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-sm">
                        Select the primary property you are interested in measuring. This will help us recommend the
                        most appropriate test methods.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formData.property} onValueChange={(value) => handleSelectChange("property", value)}>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tensile">Tensile Properties</SelectItem>
                  <SelectItem value="thermal">Thermal Properties</SelectItem>
                  <SelectItem value="rheological">Rheological Properties</SelectItem>
                  <SelectItem value="morphological">Morphological Properties</SelectItem>
                  <SelectItem value="barrier">Barrier Properties</SelectItem>
                  <SelectItem value="optical">Optical Properties</SelectItem>
                  <SelectItem value="chemical">Chemical Composition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>What level of accuracy do you need?</Label>
              <RadioGroup
                defaultValue={formData.accuracy}
                onValueChange={(value) => handleRadioChange("accuracy", value)}
                className="flex flex-col space-y-1"
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

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>What is your appropriate budget? (USD)</Label>
              <div className="pt-2">
                <Slider
                  defaultValue={formData.budget}
                  max={2000}
                  step={100}
                  onValueChange={(value) => handleSliderChange("budget", value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>${formData.budget[0]}</span>
                  <span>$2000+</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              onClick={nextStep}
              disabled={!formData.property}
            >
              Get Recommendations
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-3">
              <h3 className="text-sm font-medium text-green-800">Recommendations Ready</h3>
              <p className="mt-1 text-xs text-green-700">
                Based on your requirements, we recommend the following test methods:
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium">Tensile Strength Test (ASTM D638)</h4>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Recommended
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Accuracy: High</span>
                    <span>Turnaround: 3-5 days</span>
                    <span>Cost: $350</span>
                  </div>
                </div>
                <p className="mt-2 text-xs">
                  Standard test method for determining tensile properties of plastics, including strength, elongation,
                  and modulus.
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Select Method
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium">Dynamic Mechanical Analysis (DMA)</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Alternative
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Accuracy: High</span>
                    <span>Turnaround: 5-7 days</span>
                    <span>Cost: $500</span>
                  </div>
                </div>
                <p className="mt-2 text-xs">
                  Advanced method for measuring viscoelastic properties of polymers under dynamic loading conditions.
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Select Method
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium">Quick Tensile Test (Modified)</h4>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Economy
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Accuracy: Medium</span>
                    <span>Turnaround: 1-2 days</span>
                    <span>Cost: $200</span>
                  </div>
                </div>
                <p className="mt-2 text-xs">
                  Simplified tensile test with fewer data points, suitable for quick screening or quality control.
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Select Method
                </Button>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={prevStep}>
                Back to Questions
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                Add Selected Methods
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

