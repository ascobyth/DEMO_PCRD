"use client"

import { DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Search, Filter, Plus, Download, Calendar, FileText, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EquipmentManagementPage() {
  // Mock data for equipment
  const equipment = [
    {
      id: "EQ-2023-001",
      name: "FTIR Spectrometer",
      model: "Spectrum Two",
      manufacturer: "PerkinElmer",
      location: "Lab A-101",
      status: "operational",
      lastCalibration: "2023-09-15",
      nextCalibration: "2024-03-15",
      purchaseDate: "2020-05-12",
      category: "Analytical",
    },
    {
      id: "EQ-2023-002",
      name: "Universal Testing Machine",
      model: "Instron 5967",
      manufacturer: "Instron",
      location: "Lab B-203",
      status: "operational",
      lastCalibration: "2023-08-22",
      nextCalibration: "2024-02-22",
      purchaseDate: "2019-11-05",
      category: "Mechanical",
    },
    {
      id: "EQ-2023-003",
      name: "SEM Microscope",
      model: "TM4000Plus",
      manufacturer: "Hitachi",
      location: "Lab A-105",
      status: "maintenance",
      lastCalibration: "2023-07-10",
      nextCalibration: "2024-01-10",
      purchaseDate: "2021-03-18",
      category: "Microscopy",
    },
    {
      id: "EQ-2023-004",
      name: "DSC Analyzer",
      model: "DSC 250",
      manufacturer: "TA Instruments",
      location: "Lab C-110",
      status: "operational",
      lastCalibration: "2023-09-05",
      nextCalibration: "2024-03-05",
      purchaseDate: "2020-08-30",
      category: "Thermal",
    },
    {
      id: "EQ-2023-005",
      name: "GC-MS System",
      model: "GCMS-QP2020 NX",
      manufacturer: "Shimadzu",
      location: "Lab A-102",
      status: "operational",
      lastCalibration: "2023-06-20",
      nextCalibration: "2023-10-25",
      purchaseDate: "2021-01-15",
      category: "Analytical",
    },
    {
      id: "EQ-2023-006",
      name: "Rheometer",
      model: "MCR 302",
      manufacturer: "Anton Paar",
      location: "Lab B-205",
      status: "out-of-service",
      lastCalibration: "2023-05-12",
      nextCalibration: "2023-11-12",
      purchaseDate: "2019-09-22",
      category: "Rheological",
    },
    {
      id: "EQ-2023-007",
      name: "HPLC System",
      model: "Nexera XR",
      manufacturer: "Shimadzu",
      location: "Lab A-103",
      status: "operational",
      lastCalibration: "2023-08-18",
      nextCalibration: "2024-02-18",
      purchaseDate: "2020-11-10",
      category: "Analytical",
    },
    {
      id: "EQ-2023-008",
      name: "TGA Analyzer",
      model: "TGA 5500",
      manufacturer: "TA Instruments",
      location: "Lab C-112",
      status: "operational",
      lastCalibration: "2023-07-25",
      nextCalibration: "2023-11-02",
      purchaseDate: "2021-02-08",
      category: "Thermal",
    },
    {
      id: "EQ-2023-009",
      name: "GPC System",
      model: "Alliance GPC 2000",
      manufacturer: "Waters",
      location: "Lab A-104",
      status: "out-of-service",
      lastCalibration: "2023-04-30",
      nextCalibration: "2023-10-30",
      purchaseDate: "2019-12-15",
      category: "Analytical",
    },
  ]

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      case "out-of-service":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Service</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Equipment Management</h1>
          <p className="text-muted-foreground">Manage and track all laboratory equipment</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search equipment..." className="pl-10" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Equipment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
                <DropdownMenuItem>Operational</DropdownMenuItem>
                <DropdownMenuItem>Maintenance</DropdownMenuItem>
                <DropdownMenuItem>Out of Service</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Category</DropdownMenuLabel>
                <DropdownMenuItem>Analytical</DropdownMenuItem>
                <DropdownMenuItem>Mechanical</DropdownMenuItem>
                <DropdownMenuItem>Thermal</DropdownMenuItem>
                <DropdownMenuItem>Microscopy</DropdownMenuItem>
                <DropdownMenuItem>Rheological</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Locations</SelectLabel>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="lab-a">Lab A</SelectItem>
                <SelectItem value="lab-b">Lab B</SelectItem>
                <SelectItem value="lab-c">Lab C</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Calibration Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Calibration Status</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="due-soon">Due Soon (30 days)</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Recently Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm mt-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Calibration</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>{item.manufacturer}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{item.nextCalibration}</TableCell>
                  <TableCell>{item.category}</TableCell>
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Equipment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Documentation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Equipment
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
    </div>
  )
}

