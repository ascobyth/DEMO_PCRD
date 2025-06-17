"use client"

import { useState } from "react"
import {
  Search,
  Download,
  BarChart3,
  Star,
  ArrowUpDown,
  Eye,
  FileDown,
  Bookmark,
  Share2,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export default function ResultsRepositoryPage() {
  const [activeTab, setActiveTab] = useState("all")

  // Mock data for test results
  const results = [
    {
      id: "RES-2023-001",
      title: "Polymer Mechanical Properties Analysis",
      requestId: "REQ-2023-001",
      polymerGrade: "HD5000B",
      testMethod: "ASTM D638",
      capability: "Mechanical",
      date: "2023-10-15",
      operator: "Mary Johnson",
      status: "completed",
      favorite: true,
    },
    {
      id: "RES-2023-002",
      title: "PP Copolymer DSC Analysis",
      requestId: "REQ-2023-002",
      polymerGrade: "PP4220",
      testMethod: "ASTM E1269",
      capability: "Thermal",
      date: "2023-10-16",
      operator: "David Chen",
      status: "completed",
      favorite: false,
    },
    {
      id: "RES-2023-003",
      title: "LLDPE SEM Imaging",
      requestId: "REQ-2023-003",
      polymerGrade: "LL2420",
      testMethod: "Internal Method",
      capability: "Microscopy",
      date: "2023-10-17",
      operator: "Lisa Wong",
      status: "completed",
      favorite: true,
    },
    {
      id: "RES-2023-004",
      title: "PET Bottle Oxygen Permeability",
      requestId: "REQ-2023-004",
      polymerGrade: "PET9921",
      testMethod: "ASTM D3985",
      capability: "Physical",
      date: "2023-10-18",
      operator: "Alex Martinez",
      status: "completed",
      favorite: false,
    },
    {
      id: "RES-2023-005",
      title: "LDPE Film FTIR Analysis",
      requestId: "REQ-2023-005",
      polymerGrade: "LD0220",
      testMethod: "ASTM E1252",
      capability: "Analytical",
      date: "2023-10-19",
      operator: "Thomas Anderson",
      status: "completed",
      favorite: false,
    },
    {
      id: "RES-2023-006",
      title: "PS GPC Analysis",
      requestId: "REQ-2023-006",
      polymerGrade: "PS1340",
      testMethod: "ASTM D6474",
      capability: "Analytical",
      date: "2023-10-20",
      operator: "Sarah Lee",
      status: "completed",
      favorite: true,
    },
    {
      id: "RES-2023-007",
      title: "ABS Impact Strength Testing",
      requestId: "REQ-2023-007",
      polymerGrade: "ABS5510",
      testMethod: "ASTM D256",
      capability: "Mechanical",
      date: "2023-10-21",
      operator: "James Wilson",
      status: "completed",
      favorite: false,
    },
  ]

  // Filter results based on active tab
  const filteredResults =
    activeTab === "all"
      ? results
      : activeTab === "favorites"
        ? results.filter((result) => result.favorite)
        : results.filter((result) => result.capability.toLowerCase() === activeTab)

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <Link href="/dashboard" passHref>
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Results Repository</h1>
          <p className="text-muted-foreground">
            Search, visualize, and export test results from across the PCRD system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visualize
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Advanced Search</CardTitle>
          <CardDescription>Find specific test results using multiple search criteria</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by title, ID, or polymer grade..." className="pl-10" />
              </div>
            </div>

            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="test-methods">
                  <AccordionTrigger className="py-2">Test Methods</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-d638" className="rounded border-gray-300" />
                        <label htmlFor="astm-d638">ASTM D638 (Tensile)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-e1269" className="rounded border-gray-300" />
                        <label htmlFor="astm-e1269">ASTM E1269 (DSC)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-d3985" className="rounded border-gray-300" />
                        <label htmlFor="astm-d3985">ASTM D3985 (O2 Permeability)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-e1252" className="rounded border-gray-300" />
                        <label htmlFor="astm-e1252">ASTM E1252 (FTIR)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-d6474" className="rounded border-gray-300" />
                        <label htmlFor="astm-d6474">ASTM D6474 (GPC)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="astm-d256" className="rounded border-gray-300" />
                        <label htmlFor="astm-d256">ASTM D256 (Impact)</label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="polymer-grades">
                  <AccordionTrigger className="py-2">Polymer Grades</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="hdpe" className="rounded border-gray-300" />
                        <label htmlFor="hdpe">HDPE Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="ldpe" className="rounded border-gray-300" />
                        <label htmlFor="ldpe">LDPE Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="lldpe" className="rounded border-gray-300" />
                        <label htmlFor="lldpe">LLDPE Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pp" className="rounded border-gray-300" />
                        <label htmlFor="pp">PP Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="pet" className="rounded border-gray-300" />
                        <label htmlFor="pet">PET Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="ps" className="rounded border-gray-300" />
                        <label htmlFor="ps">PS Grades</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="abs" className="rounded border-gray-300" />
                        <label htmlFor="abs">ABS Grades</label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="date-range" className="text-sm font-medium">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Input type="date" id="date-from" className="w-full" />
                  <span>to</span>
                  <Input type="date" id="date-to" className="w-full" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="w-full">Search Results</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="mechanical">Mechanical</TabsTrigger>
            <TabsTrigger value="thermal">Thermal</TabsTrigger>
            <TabsTrigger value="analytical">Analytical</TabsTrigger>
            <TabsTrigger value="microscopy">Microscopy</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="favorites">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                Favorites
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Polymer Grade</TableHead>
                      <TableHead>Test Method</TableHead>
                      <TableHead>Capability</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {result.title}
                            {result.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </TableCell>
                        <TableCell>{result.polymerGrade}</TableCell>
                        <TableCell>{result.testMethod}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.capability}</Badge>
                        </TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>{result.operator}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Visualize
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bookmark className="mr-2 h-4 w-4" />
                                {result.favorite ? "Remove from Favorites" : "Add to Favorites"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mechanical">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Polymer Grade</TableHead>
                      <TableHead>Test Method</TableHead>
                      <TableHead>Capability</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {result.title}
                            {result.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </TableCell>
                        <TableCell>{result.polymerGrade}</TableCell>
                        <TableCell>{result.testMethod}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.capability}</Badge>
                        </TableCell>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>{result.operator}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Visualize
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bookmark className="mr-2 h-4 w-4" />
                                {result.favorite ? "Remove from Favorites" : "Add to Favorites"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Other tabs follow the same pattern */}
        </Tabs>
      </div>
    </div>
  )
}

