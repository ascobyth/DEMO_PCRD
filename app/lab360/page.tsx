"use client"
import {
  Microscope,
  Package,
  Wrench,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  Info,
  Settings,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function LAB360Page() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <Link href="/dashboard" passHref>
        <Button variant="outline" size="sm" className="mb-4">
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">LAB360</h1>
          <p className="text-muted-foreground">Complete laboratory equipment lifecycle management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-blue-700">Equipment</CardTitle>
              <Microscope className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">42</div>
            <p className="text-sm text-blue-600">Total equipment items</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="p-0 h-auto text-blue-700 flex items-center">
              Manage Equipment
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-green-700">Spare Parts</CardTitle>
              <Package className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">156</div>
            <p className="text-sm text-green-600">Parts in inventory</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="p-0 h-auto text-green-700 flex items-center">
              View Inventory
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-orange-50 border-orange-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-orange-700">Maintenance</CardTitle>
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">8</div>
            <p className="text-sm text-orange-600">Scheduled this month</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="p-0 h-auto text-orange-700 flex items-center">
              View Schedule
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-red-700">Issues</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">3</div>
            <p className="text-sm text-red-600">Open troubleshooting tickets</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" className="p-0 h-auto text-red-700 flex items-center">
              View Issues
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Equipment Status Overview</CardTitle>
            <CardDescription>Current status of laboratory equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>
                  <span className="text-sm font-medium">35 equipment items</span>
                </div>
                <span className="text-sm text-muted-foreground">83%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "83%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
                  <span className="text-sm font-medium">4 equipment items</span>
                </div>
                <span className="text-sm text-muted-foreground">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "10%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Service</Badge>
                  <span className="text-sm font-medium">3 equipment items</span>
                </div>
                <span className="text-sm text-muted-foreground">7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "7%" }}></div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Calibration Due</div>
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-xs text-muted-foreground">Next 30 days</div>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">PM Due</div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-muted-foreground">Next 30 days</div>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Low Inventory</div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Parts below threshold</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>Scheduled in the next 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">GC-MS System</div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Calibration
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">Equipment ID: EQ-2023-005</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                  <span>Oct 25, 2023</span>
                  <Clock className="h-4 w-4 ml-3 mr-1 text-blue-500" />
                  <span>09:00 AM</span>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">Tensile Tester</div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    PM
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">Equipment ID: EQ-2023-012</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                  <span>Oct 27, 2023</span>
                  <Clock className="h-4 w-4 ml-3 mr-1 text-orange-500" />
                  <span>02:00 PM</span>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">DSC Analyzer</div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Inspection
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">Equipment ID: EQ-2023-008</div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-green-500" />
                  <span>Nov 02, 2023</span>
                  <Clock className="h-4 w-4 ml-3 mr-1 text-green-500" />
                  <span>10:30 AM</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2">
                View All Scheduled Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Recent Equipment Activity</CardTitle>
              <CardDescription>Latest usage and maintenance records</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search equipment..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">FTIR Spectrometer</div>
                <div className="text-sm text-muted-foreground">Equipment ID: EQ-2023-001</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="text-sm font-medium">Sample Analysis</div>
                <div className="text-sm text-muted-foreground">Operator: John Doe</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Oct 20, 2023 - 11:30 AM</div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">SEM Microscope</div>
                <div className="text-sm text-muted-foreground">Equipment ID: EQ-2023-003</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="text-sm font-medium">Preventive Maintenance</div>
                <div className="text-sm text-muted-foreground">Technician: Sarah Lee</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="flex items-center">
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">In Progress</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Oct 19, 2023 - 09:15 AM</div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">Rheometer</div>
                <div className="text-sm text-muted-foreground">Equipment ID: EQ-2023-007</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="text-sm font-medium">Calibration</div>
                <div className="text-sm text-muted-foreground">Technician: Mike Johnson</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Oct 18, 2023 - 02:45 PM</div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">GPC System</div>
                <div className="text-sm text-muted-foreground">Equipment ID: EQ-2023-009</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="text-sm font-medium">Troubleshooting</div>
                <div className="text-sm text-muted-foreground">Technician: David Chen</div>
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <div className="flex items-center">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Issue Reported</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Oct 17, 2023 - 10:20 AM</div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline">View All Activity</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

