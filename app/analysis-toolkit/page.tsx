"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calculator,
  BarChart3,
  BookOpen,
  Save,
  Download,
  Share2,
  LineChart,
  Sigma,
  Dices,
  Layers,
  Atom,
  HelpCircle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AnalysisToolkitPage() {
  const [activeTab, setActiveTab] = useState("molecular")

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <Link href="/dashboard" passHref>
        <Button variant="outline" className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analysis Toolkit</h1>
          <p className="text-muted-foreground">
            Online analysis tools for polymer characterization and data processing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Session
          </Button>
          <Button className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-blue-700">Molecular Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Atom className="h-8 w-8 text-blue-500" />
              <div className="text-sm text-blue-700">Distribution analysis and calculations</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-green-700">Rheological</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Layers className="h-8 w-8 text-green-500" />
              <div className="text-sm text-green-700">Flow behavior and viscosity analysis</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-purple-700">Statistical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sigma className="h-8 w-8 text-purple-500" />
              <div className="text-sm text-purple-700">Advanced statistical analysis tools</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-orange-700">Structure-Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Dices className="h-8 w-8 text-orange-500" />
              <div className="text-sm text-orange-700">Relationship modeling and prediction</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="molecular" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="molecular">Molecular Weight</TabsTrigger>
            <TabsTrigger value="rheological">Rheological</TabsTrigger>
            <TabsTrigger value="statistical">Statistical</TabsTrigger>
            <TabsTrigger value="structure">Structure-Property</TabsTrigger>
          </TabsList>

          <TabsContent value="molecular">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Molecular Weight Distribution Calculator</CardTitle>
                <CardDescription>Calculate molecular weight averages and polydispersity from GPC data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="data-input" className="text-sm font-medium">
                          Input Data
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Help</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Enter GPC data as comma-separated values with molecular weight and detector response.
                                Format: MW, Response (one pair per line)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="data-input"
                        placeholder="Enter GPC data (MW, Response)..."
                        className="h-[200px] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="calibration" className="text-sm font-medium block mb-2">
                          Calibration Standard
                        </label>
                        <Select defaultValue="ps">
                          <SelectTrigger>
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Standards</SelectLabel>
                              <SelectItem value="ps">Polystyrene</SelectItem>
                              <SelectItem value="pmma">PMMA</SelectItem>
                              <SelectItem value="pe">Polyethylene</SelectItem>
                              <SelectItem value="pp">Polypropylene</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="method" className="text-sm font-medium block mb-2">
                          Calculation Method
                        </label>
                        <Select defaultValue="universal">
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Methods</SelectLabel>
                              <SelectItem value="universal">Universal Calibration</SelectItem>
                              <SelectItem value="conventional">Conventional Calibration</SelectItem>
                              <SelectItem value="markHouwink">Mark-Houwink Parameters</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Button className="w-full flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Calculate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-3">Results</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Number Average (Mn):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Weight Average (Mw):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Z Average (Mz):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Polydispersity (PDI):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Molecular weight distribution plot will appear here
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rheological">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Rheological Property Analyzer</CardTitle>
                <CardDescription>Analyze flow behavior and calculate rheological parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="rheo-data" className="text-sm font-medium">
                          Rheology Data
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Help</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Enter rheology data as comma-separated values with shear rate and viscosity. Format:
                                Shear Rate (1/s), Viscosity (Pa.s) (one pair per line)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="rheo-data"
                        placeholder="Enter rheology data (Shear Rate, Viscosity)..."
                        className="h-[200px] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="temperature" className="text-sm font-medium block mb-2">
                          Temperature (°C)
                        </label>
                        <Input id="temperature" type="number" placeholder="190" />
                      </div>

                      <div>
                        <label htmlFor="model" className="text-sm font-medium block mb-2">
                          Flow Model
                        </label>
                        <Select defaultValue="powerLaw">
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Models</SelectLabel>
                              <SelectItem value="powerLaw">Power Law</SelectItem>
                              <SelectItem value="crossModel">Cross Model</SelectItem>
                              <SelectItem value="carreauModel">Carreau Model</SelectItem>
                              <SelectItem value="herschelBulkley">Herschel-Bulkley</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Button className="w-full flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Analyze
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-3">Model Parameters</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Flow Consistency Index (K):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Flow Behavior Index (n):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Zero Shear Viscosity (η₀):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Activation Energy (Ea):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Viscosity vs. shear rate plot will appear here</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistical">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Statistical Analysis Tools</CardTitle>
                <CardDescription>Perform statistical analysis on test data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="stat-data" className="text-sm font-medium">
                          Data Input
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Help</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Enter data as comma-separated values, one value per line. For multiple datasets,
                                separate with blank lines.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="stat-data"
                        placeholder="Enter data values (one per line)..."
                        className="h-[200px] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="analysis-type" className="text-sm font-medium block mb-2">
                          Analysis Type
                        </label>
                        <Select defaultValue="descriptive">
                          <SelectTrigger>
                            <SelectValue placeholder="Select analysis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Analysis Types</SelectLabel>
                              <SelectItem value="descriptive">Descriptive Statistics</SelectItem>
                              <SelectItem value="ttest">T-Test</SelectItem>
                              <SelectItem value="anova">ANOVA</SelectItem>
                              <SelectItem value="regression">Regression Analysis</SelectItem>
                              <SelectItem value="correlation">Correlation Analysis</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="confidence" className="text-sm font-medium block mb-2">
                          Confidence Level
                        </label>
                        <Select defaultValue="95">
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Confidence Levels</SelectLabel>
                              <SelectItem value="90">90%</SelectItem>
                              <SelectItem value="95">95%</SelectItem>
                              <SelectItem value="99">99%</SelectItem>
                              <SelectItem value="99.9">99.9%</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Button className="w-full flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Analyze
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-3">Statistical Results</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Mean:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Median:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Standard Deviation:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Coefficient of Variation:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">95% Confidence Interval:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Statistical visualization will appear here</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Results
                      </Button>
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Structure-Property Relationship Modeler</CardTitle>
                <CardDescription>Model relationships between polymer structure and physical properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="structure-data" className="text-sm font-medium">
                          Structure-Property Data
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Help</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Enter data in CSV format with headers. First column should be the structural parameter,
                                and subsequent columns should be properties.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="structure-data"
                        placeholder="Enter structure-property data in CSV format..."
                        className="h-[200px] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="model-type" className="text-sm font-medium block mb-2">
                          Model Type
                        </label>
                        <Select defaultValue="linear">
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Model Types</SelectLabel>
                              <SelectItem value="linear">Linear Regression</SelectItem>
                              <SelectItem value="polynomial">Polynomial Regression</SelectItem>
                              <SelectItem value="multivariate">Multivariate Analysis</SelectItem>
                              <SelectItem value="neural">Neural Network</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="prediction-mode" className="text-sm font-medium block mb-2">
                          Prediction Mode
                        </label>
                        <Select defaultValue="structure">
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Prediction Modes</SelectLabel>
                              <SelectItem value="structure">Structure → Property</SelectItem>
                              <SelectItem value="property">Property → Structure</SelectItem>
                              <SelectItem value="optimization">Property Optimization</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Button className="w-full flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Generate Model
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-3">Model Results</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Model Equation:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">R² Value:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">RMSE:</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Significance (p-value):</span>
                          <span className="text-sm font-medium">-</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border p-4 h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Structure-property relationship plot will appear here
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Model
                      </Button>
                      <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Card className="shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Recently Used Tools</CardTitle>
          <CardDescription>Quick access to your most frequently used analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Molecular Weight Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground">Last used: 2 days ago</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Open Tool
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Statistical T-Test Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground">Last used: 5 days ago</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Open Tool
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Viscosity vs. Temperature</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground">Last used: 1 week ago</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Open Tool
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

