"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Database, Download, Edit, FileUp, FileDown, FileX, Plus, Search, Trash2, X, AlertTriangle, FileText, Image as ImageIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import AddUserDialog from "./components/AddUserDialog"
import EditUserDialog from "./components/EditUserDialog"
import AddCapabilityDialog from "./components/AddCapabilityDialog"
import EditCapabilityDialog from "./components/EditCapabilityDialog"
import AddTestMethodDialog from "./components/AddTestMethodDialog"
import EditTestMethodDialog from "./components/EditTestMethodDialog"
import { AddEquipmentDialog } from "@/components/add-equipment-dialog"
import { EditEquipmentDialog } from "@/components/edit-equipment-dialog"
import AddLocationDialog from "./components/AddLocationDialog"
import EditLocationDialog from "./components/EditLocationDialog"
import AddIoDialog from "./components/AddIoDialog"
import EditIoDialog from "./components/EditIoDialog"
import AddSampleCommercialDialog from "./components/AddSampleCommercialDialog"
import EditSampleCommercialDialog from "./components/EditSampleCommercialDialog"
import AddAppTechDialog from "./components/AddAppTechDialog"
import EditAppTechDialog from "./components/EditAppTechDialog"
import AddPlantReactorDialog from "./components/AddPlantReactorDialog"
import EditPlantReactorDialog from "./components/EditPlantReactorDialog"
import AddRequestDialog from "./components/AddRequestDialog"
import EditRequestDialog from "./components/EditRequestDialog"

export default function DatabaseConfigPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [globalSearchTerm, setGlobalSearchTerm] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [showDropDialog, setShowDropDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showRestoreBackupDialog, setShowRestoreBackupDialog] = useState(false)
  const [lastBackupTime, setLastBackupTime] = useState("Never")
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvExportRef = useRef<HTMLAnchorElement>(null)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentEditItem, setCurrentEditItem] = useState<any>(null)
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showAddEquipmentDialog, setShowAddEquipmentDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // State for filtered data
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [filteredCapabilities, setFilteredCapabilities] = useState<any[]>([])
  const [filteredTestMethods, setFilteredTestMethods] = useState<any[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<any[]>([])
  const [filteredLocations, setFilteredLocations] = useState<any[]>([])
  const [filteredIONumbers, setFilteredIONumbers] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [filteredASRRequests, setFilteredASRRequests] = useState<any[]>([])
  const [filteredSmartAssistant, setFilteredSmartAssistant] = useState<any[]>([])
  const [filteredQueueManagement, setFilteredQueueManagement] = useState<any[]>([])
  const [filteredCommercialSamples, setFilteredCommercialSamples] = useState<any[]>([])
  const [filteredAppTechList, setFilteredAppTechList] = useState<any[]>([])
  const [filteredPlantReactors, setFilteredPlantReactors] = useState<any[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([])
  const [filteredActivityLogs, setFilteredActivityLogs] = useState<any[]>([])

  // State to track whether to show all records or just the latest 15
  const [showAllRecords, setShowAllRecords] = useState(false)

  const [filteredTabs, setFilteredTabs] = useState<string[]>([
    "users",
    "capabilities",
    "test-methods",
    "equipment",
    "locations",
    "io-numbers",
    "requests",
    "asr-requests",
    "smart-assistant",
    "queue-management",
    "commercial-samples",
    "app-tech-list",
    "plant-reactors",
    "notifications",
    "activity-logs",
  ])

  // State for users data
  const [users, setUsers] = useState<any[]>([])

  // Mock data for Capabilities
  const [capabilities, setCapabilities] = useState([
    {
      id: "1",
      name: "Microstructure",
      shortName: "MS",
      description:
        "Specializes in polymer microstructure characterization using advanced microscopy and spectroscopy techniques.",
      contacts: [
        {
          email: "sarah.johnson@example.com",
          name: "Dr. Sarah Johnson",
          isPrimary: true,
        },
        {
          email: "emily.parker@example.com",
          name: "Emily Parker",
          isPrimary: false,
        },
      ],
      head: {
        email: "sarah.johnson@example.com",
        name: "Dr. Sarah Johnson",
      },
      location: {
        locationId: "1",
        name: "Building A, Floor 2, Lab 201",
      },
      requestCounters: {
        ntr: 42,
        asr: 15,
        er: 8,
      },
      methods: ["1", "2"],
      equipment: ["1", "2"],
      isActive: true,
      serviceEnabled: true,
      created: new Date("2022-01-01"),
      updated: new Date("2023-01-15"),
    },
    {
      id: "2",
      name: "Rheology",
      shortName: "RM",
      description:
        "Focuses on rheological properties of polymers and complex fluids using rotational and capillary rheometers.",
      contacts: [
        {
          email: "michael.chen@example.com",
          name: "Dr. Michael Chen",
          isPrimary: true,
        },
        {
          email: "lisa.wong@example.com",
          name: "Dr. Lisa Wong",
          isPrimary: false,
        },
      ],
      head: {
        email: "michael.chen@example.com",
        name: "Dr. Michael Chen",
      },
      location: {
        locationId: "2",
        name: "Building B, Floor 1, Lab 105",
      },
      requestCounters: {
        ntr: 56,
        asr: 23,
        er: 12,
      },
      methods: ["3", "4"],
      equipment: ["3", "4"],
      isActive: true,
      serviceEnabled: true,
      created: new Date("2022-01-15"),
      updated: new Date("2023-02-10"),
    },
  ])

  // State for TestMethods
  const [testMethods, setTestMethods] = useState<any[]>([])

  // State for Equipment
  const [equipment, setEquipment] = useState<any[]>([])

  // Mock data for Locations
  const [locations, setLocations] = useState([
    {
      id: "1",
      name: "Microstructure Lab",
      locationId: "LOC-MS-001",
      contactPerson: "Dr. Sarah Johnson",
      contactNumber: "+66-2-123-4567",
      address: "Building A, Floor 2, Lab 201, 123 Science Park Rd., Pathum Thani 12120",
      isActive: true,
      created: new Date("2020-01-01"),
      updated: new Date("2022-06-15"),
    },
    {
      id: "2",
      name: "Rheology Lab",
      locationId: "LOC-RM-001",
      contactPerson: "Dr. Michael Chen",
      contactNumber: "+66-2-123-4568",
      address: "Building B, Floor 1, Lab 105, 123 Science Park Rd., Pathum Thani 12120",
      isActive: true,
      created: new Date("2020-01-01"),
      updated: new Date("2022-06-15"),
    },
    {
      id: "3",
      name: "Small Molecule Lab",
      locationId: "LOC-SM-001",
      contactPerson: "Dr. Lisa Wong",
      contactNumber: "+66-2-123-4569",
      address: "Building A, Floor 3, Lab 310, 123 Science Park Rd., Pathum Thani 12120",
      isActive: true,
      created: new Date("2020-01-01"),
      updated: new Date("2022-06-15"),
    },
  ])

  // Mock data for IO Numbers
  const [ioNumbers, setIoNumbers] = useState([
    {
      id: "1",
      ioNumber: "0090919390",
      name: "Polymer Characterization Project",
      responsible: "John Smith",
      costCenter: {
        code: "CC-RD-001",
        name: "R&D Department",
      },
      company: "PCRD Co., Ltd.",
      status: "Active",
      mappingInfo: {
        mappingIO: "",
        mappingName: "",
      },
      ioType: "Research",
      members: ["john.smith@example.com", "sarah.johnson@example.com"],
      testSpending: 125000,
      isTechsprint: false,
      techProgram: "Polymer Development",
      asset: "Polymer Lab",
      created: new Date("2022-01-15"),
      updated: new Date("2023-01-10"),
      isArchived: false,
    },
    {
      id: "2",
      ioNumber: "0090919391",
      name: "New Material Development",
      responsible: "Sarah Johnson",
      costCenter: {
        code: "CC-RD-002",
        name: "New Materials",
      },
      company: "PCRD Co., Ltd.",
      status: "Active",
      mappingInfo: {
        mappingIO: "",
        mappingName: "",
      },
      ioType: "Development",
      members: ["sarah.johnson@example.com", "michael.chen@example.com"],
      testSpending: 85000,
      isTechsprint: true,
      techProgram: "Advanced Materials",
      asset: "Materials Lab",
      created: new Date("2022-02-20"),
      updated: new Date("2023-02-15"),
      isArchived: false,
    },
  ])

  // Mock data for Requests
  const [requests, setRequests] = useState([
    {
      id: "1",
      requestNumber: "MS-N-0425-00001",
      requestType: "NTR",
      priority: "Normal",
      capabilityId: "1",
      title: "SEM Analysis of Polymer Blend",
      requester: {
        email: "john.smith@example.com",
        name: "John Smith",
        costCenter: "CC-RD-001",
      },
      onBehalf: {
        isOnBehalf: false,
        name: "",
        email: "",
        costCenter: "",
      },
      billing: {
        ioNumber: "0090919390",
        ioName: "Polymer Characterization Project",
        costCenter: "CC-RD-001",
        company: "PCRD Co., Ltd.",
      },
      status: "InProgress",
      urgentMemo: "",
      dataPool: "https://example.com/datapool/MS-N-0425-00001",
      returnAddress: "Building A, Floor 2, Lab 201",
      samples: [
        {
          sampleId: "S-MS-N-0425-00001-01",
          name: "Polymer Blend A",
          systemName: "PB-A-001",
          fullName: "Polymer Blend A (PB-A-001)",
          remark: "Contains 70% HDPE, 30% LDPE",
        },
        {
          sampleId: "S-MS-N-0425-00001-02",
          name: "Polymer Blend B",
          systemName: "PB-B-001",
          fullName: "Polymer Blend B (PB-B-001)",
          remark: "Contains 50% HDPE, 50% LDPE",
        },
      ],
      testings: [
        {
          testingId: "T-MS-N-0425-00001-01",
          methodId: "1",
          methodCode: "MS-001",
          methodName: "SEM Analysis",
          sampleId: "S-MS-N-0425-00001-01",
          equipmentId: "1",
          equipmentName: "JEOL JSM-7800F SEM",
          cost: 5000,
          remark: "Focus on interface regions",
          status: "InProgress",
          timeline: {
            submitted: new Date("2023-04-25"),
            received: {
              date: new Date("2023-04-26"),
              byEmail: "sarah.johnson@example.com",
            },
            dueDate: new Date("2023-04-29"),
            operationCompleted: {
              date: null,
              byEmail: "",
            },
            resultEntered: {
              date: null,
              byEmail: "",
            },
            approved: {
              date: null,
              byEmail: "",
            },
            completed: {
              date: null,
              byEmail: "",
            },
          },
          reservation: {
            startTime: null,
            endTime: null,
          },
          results: {
            fileUrls: [],
            summary: "",
            notes: "",
          },
        },
        {
          testingId: "T-MS-N-0425-00001-02",
          methodId: "1",
          methodCode: "MS-001",
          methodName: "SEM Analysis",
          sampleId: "S-MS-N-0425-00001-02",
          equipmentId: "1",
          equipmentName: "JEOL JSM-7800F SEM",
          cost: 5000,
          remark: "Focus on interface regions",
          status: "InProgress",
          timeline: {
            submitted: new Date("2023-04-25"),
            received: {
              date: new Date("2023-04-26"),
              byEmail: "sarah.johnson@example.com",
            },
            dueDate: new Date("2023-04-29"),
            operationCompleted: {
              date: null,
              byEmail: "",
            },
            resultEntered: {
              date: null,
              byEmail: "",
            },
            approved: {
              date: null,
              byEmail: "",
            },
            completed: {
              date: null,
              byEmail: "",
            },
          },
          reservation: {
            startTime: null,
            endTime: null,
          },
          results: {
            fileUrls: [],
            summary: "",
            notes: "",
          },
        },
      ],
      timeline: {
        created: new Date("2023-04-24"),
        submitted: new Date("2023-04-25"),
        received: new Date("2023-04-26"),
        completed: null,
        terminated: null,
        cancelled: null,
      },
      supportInfo: {
        staffEmail: "sarah.johnson@example.com",
        staffName: "Dr. Sarah Johnson",
      },
      evaluation: {
        score: null,
        comment: "",
      },
      asrInfo: {
        isAsr: false,
        asrId: "",
        problemSource: "",
        objectives: "",
        desiredCompletionDate: null,
      },
      isTechsprint: false,
      costSpendingType: "Standard",
      created: new Date("2023-04-24"),
      updated: new Date("2023-04-26"),
      isArchived: false,
    },
  ])

  // Mock data for ASR Requests
  const [asrRequests, setASRRequests] = useState([
    {
      id: "1",
      asrId: "MS-A-0425-00001",
      title: "Investigation of Polymer Blend Interface Properties",
      requester: {
        email: "john.smith@example.com",
        name: "John Smith",
        costCenter: "CC-RD-001",
      },
      billing: {
        ioNumber: "0090919390",
        ioName: "Polymer Characterization Project",
        costCenter: "CC-RD-001",
        company: "PCRD Co., Ltd.",
      },
      details: {
        problemSource: "Delamination issues in multilayer films",
        objectives: "Understand interface morphology and adhesion mechanisms",
        availableSamples: "5 different blend compositions available",
        desiredCompletionDate: new Date("2023-05-30"),
      },
      primaryCapability: {
        capabilityId: "1",
        name: "Microstructure",
      },
      status: "InProgress",
      team: [
        {
          email: "sarah.johnson@example.com",
          name: "Dr. Sarah Johnson",
          role: "Lead Investigator",
        },
        {
          email: "michael.chen@example.com",
          name: "Dr. Michael Chen",
          role: "Rheology Expert",
        },
      ],
      relatedRequests: ["MS-N-0425-00001", "RM-N-0425-00002"],
      timeline: {
        submitted: new Date("2023-04-20"),
        approved: new Date("2023-04-22"),
        completed: null,
        cancelled: null,
      },
      report: {
        url: "",
        uploadedByEmail: "",
        uploadDate: null,
      },
      notes: [
        {
          date: new Date("2023-04-22"),
          authorEmail: "sarah.johnson@example.com",
          content: "Initial assessment completed. Will need both SEM and TEM analysis.",
          visibility: "Team",
        },
      ],
      created: new Date("2023-04-20"),
      updated: new Date("2023-04-22"),
      isArchived: false,
    },
  ])

  // Mock data for Smart Assistant
  const [smartAssistant, setSmartAssistant] = useState([
    {
      id: "1",
      propertyName: "Molecular Weight",
      propertyDescription: "Average molecular weight and molecular weight distribution of polymers",
      category: "Molecular Properties",
      recommendedMethods: [
        {
          methodId: "4",
          methodCode: "RM-002",
          methodName: "GPC Analysis",
          capabilityId: "2",
          capabilityName: "Rheology",
          ranking: 1,
          criteria: {
            speed: {
              category: "Normal",
              score: 7,
            },
            accuracy: {
              category: "Absolute",
              score: 9,
            },
            precision: {
              category: "CV<5%",
              score: 8,
            },
            limitations: ["Requires dissolution in appropriate solvent"],
            cost: {
              category: "<5000THB",
              score: 6,
            },
          },
          keyResults: ["Mn", "Mw", "PDI", "Molecular weight distribution curve"],
          suitability: 90,
          description: "Gold standard for molecular weight determination",
        },
      ],
      questionFlow: [
        {
          questionId: "MW-Q1",
          questionText: "What is the expected molecular weight range?",
          answerType: "MultipleChoice",
          choices: ["<10,000 g/mol", "10,000-100,000 g/mol", ">100,000 g/mol", "Unknown"],
          next: {
            condition: "Any",
            questionId: "MW-Q2",
          },
        },
        {
          questionId: "MW-Q2",
          questionText: "Is the polymer soluble in common GPC solvents (THF, chloroform, etc.)?",
          answerType: "YesNo",
          choices: ["Yes", "No"],
          next: {
            condition: "Yes",
            questionId: "MW-Q3",
          },
        },
      ],
      created: new Date("2022-01-15"),
      updated: new Date("2023-01-10"),
      isActive: true,
    },
  ])

  // Mock data for Queue Management
  const [queueManagement, setQueueManagement] = useState([
    {
      id: "1",
      equipmentId: "1",
      capabilityId: "1",
      queueStatus: "Normal",
      estimatedWaitTime: 2,
      pendingTests: 5,
      currentCapacity: 75,
      lastUpdated: new Date("2023-04-26"),
      maintenanceSchedule: [
        {
          type: "PM",
          startDate: new Date("2023-06-15"),
          endDate: new Date("2023-06-16"),
          description: "Regular preventive maintenance",
          scheduledBy: "sarah.johnson@example.com",
        },
      ],
      urgentSlots: 1,
      normalSlots: 3,
      requestHistory: [
        {
          date: new Date("2023-04-25"),
          pendingTests: 6,
          completedTests: 4,
          averageWaitTime: 2.5,
        },
      ],
    },
  ])

  // State for Commercial Samples
  const [commercialSamples, setCommercialSamples] = useState<any[]>([])

  // State for App Tech List
  const [appTechList, setAppTechList] = useState<any[]>([])

  // State for Plant Reactors
  const [plantReactors, setPlantReactors] = useState<any[]>([])

  // Mock data for Notifications
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      userEmail: "john.smith@example.com",
      type: "RequestStatus",
      title: "Request Status Update",
      message: "Your request MS-N-0425-00001 is now in progress",
      relatedTo: {
        type: "Request",
        id: "1",
      },
      status: "Unread",
      priority: "Medium",
      created: new Date("2023-04-26"),
      readDate: null,
      expiryDate: new Date("2023-05-26"),
    },
  ])

  // Mock data for Activity Logs
  const [activityLogs, setActivityLogs] = useState([
    {
      id: "1",
      userEmail: "sarah.johnson@example.com",
      action: "UpdateRequestStatus",
      entityType: "Request",
      entityId: "1",
      details: {
        oldStatus: "Received",
        newStatus: "InProgress",
        timestamp: new Date("2023-04-26T10:30:00"),
      },
      timestamp: new Date("2023-04-26T10:30:00"),
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  ])

  // Filter data based on search term and activeTab
  useEffect(() => {
    console.log('Filtering data based on activeTab:', activeTab, 'searchTerm:', searchTerm);
    
    // Filter users
    if (users.length > 0) {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.position?.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }

    // Filter capabilities
    if (capabilities.length > 0) {
      const filtered = capabilities.filter((capability) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          capability.capabilityName?.toLowerCase().includes(searchLower) ||
          capability.shortName?.toLowerCase().includes(searchLower) ||
          capability.description?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredCapabilities(filtered);
    } else {
      setFilteredCapabilities([]);
    }

    // Filter test methods
    if (testMethods.length > 0) {
      const filtered = testMethods.filter((method) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          method.name?.toLowerCase().includes(searchLower) ||
          method.testingName?.toLowerCase().includes(searchLower) ||
          method.methodCode?.toLowerCase().includes(searchLower) ||
          method.methodcode?.toLowerCase().includes(searchLower) ||
          method.description?.en?.toLowerCase().includes(searchLower) ||
          method.detailEng?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredTestMethods(filtered);
    } else {
      setFilteredTestMethods([]);
    }

    // Filter equipment
    if (equipment.length > 0) {
      const filtered = equipment.filter((equip) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          equip.equipmentName?.toLowerCase().includes(searchLower) ||
          equip.equipmentCode?.toLowerCase().includes(searchLower) ||
          equip.equipmentType?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredEquipment(filtered);
    } else {
      setFilteredEquipment([]);
    }

    // Filter locations
    if (locations.length > 0) {
      const filtered = locations.filter((location) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          location.locationId?.toLowerCase().includes(searchLower) ||
          location.name?.toLowerCase().includes(searchLower) ||
          location.contactPerson?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [users, capabilities, testMethods, equipment, locations, searchTerm])

  // Global search effect for database table names
  useEffect(() => {
    if (globalSearchTerm) {
      // Find if any tab name matches the search term
      const searchLower = globalSearchTerm.toLowerCase()

      // If a specific tab is found, set it as active
      if ("users".includes(searchLower)) {
        setActiveTab("users")
      } else if ("capabilities".includes(searchLower)) {
        setActiveTab("capabilities")
      } else if ("test methods".includes(searchLower) || "test-methods".includes(searchLower)) {
        setActiveTab("test-methods")
      } else if ("equipment".includes(searchLower)) {
        setActiveTab("equipment")
      } else if ("locations".includes(searchLower)) {
        setActiveTab("locations")
      } else if ("io numbers".includes(searchLower) || "io-numbers".includes(searchLower)) {
        setActiveTab("io-numbers")
      } else if ("requests".includes(searchLower)) {
        setActiveTab("requests")
      } else if ("asr requests".includes(searchLower) || "asr-requests".includes(searchLower)) {
        setActiveTab("asr-requests")
      } else if ("smart assistant".includes(searchLower) || "smart-assistant".includes(searchLower)) {
        setActiveTab("smart-assistant")
      } else if ("queue management".includes(searchLower) || "queue-management".includes(searchLower)) {
        setActiveTab("queue-management")
      } else if ("commercial samples".includes(searchLower) || "commercial-samples".includes(searchLower)) {
        setActiveTab("commercial-samples")
      } else if ("app tech list".includes(searchLower) || "app-tech-list".includes(searchLower)) {
        setActiveTab("app-tech-list")
      } else if ("plant reactors".includes(searchLower) || "plant-reactors".includes(searchLower)) {
        setActiveTab("plant-reactors")
      } else if ("notifications".includes(searchLower)) {
        setActiveTab("notifications")
      } else if ("activity logs".includes(searchLower) || "activity-logs".includes(searchLower)) {
        setActiveTab("activity-logs")
      }
    }
  }, [globalSearchTerm])

  // State for capabilities
  const [allCapabilities, setAllCapabilities] = useState<any[]>([]);

  // Fetch users from MongoDB
  const fetchUsers = async (retryCount = 0) => {
    setIsLoading(true);
    try {
      // First fetch capabilities for the dropdown
      try {
        console.log('Fetching capabilities for dropdown...');
        const capResponse = await fetch('/api/capabilities');
        console.log('Capabilities API response status:', capResponse.status);

        if (capResponse.ok) {
          try {
            const capData = await capResponse.json();
            console.log('Capabilities data for dropdown:', capData);
            setAllCapabilities(capData.data || []);
          } catch (jsonError) {
            console.error('Error parsing capabilities JSON response:', jsonError);
          }
        } else {
          console.error('Error fetching capabilities for dropdown:', capResponse.status, capResponse.statusText);
        }
      } catch (capError) {
        console.error('Exception fetching capabilities for dropdown:', capError);
      }

      // Then fetch users
      try {
        console.log('Fetching users...');
        const response = await fetch('/api/users', {
          // Add cache control to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log('Users API response status:', response.status);

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response from server:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        let data;
        try {
          data = await response.json();
          console.log('Users API response data:', data);
        } catch (jsonError) {
          console.error('Error parsing users JSON response:', jsonError);
          throw new Error('Failed to parse server response. The server might be returning HTML instead of JSON.');
        }

        if (response.ok && data && data.data) {
          // Transform MongoDB data to match the expected format
          const formattedUsers = data.data.map((user: any) => {
            console.log('Processing user from API:', user);
            console.log('User approvers from API:', user.approvers);

            return {
              id: user._id,
              _id: user._id, // Keep the original _id as well
              email: user.email,
              name: user.name, // Keep the original name field
              fullName: user.name,
              position: user.position || '',
              department: user.department || '',
              division: user.division || '',
              costCenter: {
                code: user.costCenter || '',
                name: user.costCenter || '',
              },
              role: user.role,
              capabilities: user.capabilities || [],
              approvers: user.approvers || [],
              onBehalfAccess: user.onBehalfAccess || [],
              isActive: user.isActive,
              created: user.createdAt ? new Date(user.createdAt) : new Date(),
              lastLogin: user.updatedAt ? new Date(user.updatedAt) : new Date(),
              username: user.username,
            };
          });

          console.log('Formatted users:', formattedUsers);
          setUsers(formattedUsers);
          // Don't set filteredUsers here - let the filtering useEffect handle it
          // setFilteredUsers(formattedUsers);
        } else {
          console.error('Error in users response:', data?.error || 'Unknown error');
          toast({
            title: "Error",
            description: data?.error || "Failed to fetch users",
            variant: "destructive"
          });
        }
      } catch (userError) {
        console.error('Error fetching users:', userError);
        if (retryCount < 2) {
          setTimeout(() => fetchUsers(retryCount + 1), 1000);
        } else {
          toast({
            title: "Error",
            description: userError instanceof Error ? userError.message : "Failed to fetch users",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchUsers(retryCount + 1), 1000);
      } else {
        // Don't use mock data - just show empty
        console.log('Database not available, showing empty data');
        setUsers([]);
        
        toast({
          title: "Database Connection Error",
          description: "Could not connect to database. Please check MongoDB connection.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize filtered data on component mount
  useEffect(() => {
    console.log('Component mounted or activeTab changed:', activeTab);
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "capabilities") {
      fetchCapabilities();
    } else if (activeTab === "test-methods") {
      console.log('Fetching test methods for activeTab:', activeTab);
      fetchTestMethods();
    } else {
      setFilteredEquipment(equipment)
      setFilteredLocations(locations)
      setFilteredIONumbers(ioNumbers)
      setFilteredRequests(requests)
      setFilteredASRRequests(asrRequests)
      setFilteredSmartAssistant(smartAssistant)
      setFilteredQueueManagement(queueManagement)
      setFilteredCommercialSamples(commercialSamples)
      setFilteredAppTechList(appTechList)
      setFilteredPlantReactors(plantReactors)
      setFilteredNotifications(notifications)
      setFilteredActivityLogs(activityLogs)
    }
  }, [activeTab])

  // Function to fetch requests from the API
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRequests(data.data);
          setFilteredRequests(data.data);
        } else {
          console.error('Error in requests response:', data?.error || 'Unknown error');
          toast({
            title: "Error",
            description: data?.error || "Failed to fetch requests",
            variant: "destructive"
          });
        }
      } else {
        console.error('Error fetching requests:', response.status, response.statusText);
        toast({
          title: "Error",
          description: "Failed to fetch requests",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in fetchRequests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the page loads
  useEffect(() => {
    // Always fetch all data on page load
    fetchTestMethods();
    fetchEquipment();
    fetchLocations();
    fetchIoNumbers();
    fetchRequests();

    // Fetch data for the new tables
    fetchCommercialSamples();
    fetchAppTechs();
    fetchPlantReactors();

    // Fetch initial data based on active tab
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "capabilities") {
      fetchCapabilities();
    }

    // Add a console log to confirm that data is being fetched
    console.log('Fetching initial data on page load');
  }, []);

  // Removed useEffect that was causing infinite loop when testMethods.length === 0

  // Add a function to check if a user is the default admin
  const isDefaultAdmin = (userId: string) => {
    return userId === "0" // The default admin has id "0"
  }

  // Function to handle adding a new item
  const handleAddItem = () => {
    if (activeTab === "users") {
      setShowAddUserDialog(true);
    } else if (activeTab === "capabilities") {
      setShowAddCapabilityDialog(true);
    } else if (activeTab === "test-methods") {
      setShowAddTestMethodDialog(true);
    } else if (activeTab === "equipment") {
      setShowAddEquipmentDialog(true);
    } else if (activeTab === "locations") {
      setShowAddLocationDialog(true);
    } else if (activeTab === "io-numbers") {
      setShowAddIoDialog(true);
    } else if (activeTab === "requests") {
      setShowAddRequestDialog(true);
    } else if (activeTab === "commercial-samples") {
      setShowAddSampleCommercialDialog(true);
    } else if (activeTab === "app-tech-list") {
      setShowAddAppTechDialog(true);
    } else if (activeTab === "plant-reactors") {
      setShowAddPlantReactorDialog(true);
    } else {
      setNewItem(true);
      setEditingId("new");
    }
  }

  // Function to handle user added
  const handleUserAdded = () => {
    // Refresh the users list
    fetchUsers();
    toast({
      title: "Success",
      description: "User added successfully",
    });
  }

  // Function to handle canceling edit/add
  const handleCancelEdit = () => {
    setNewItem(false)
    setEditingId(null)
  }

  // Function to handle saving (would connect to API in real implementation)
  const handleSave = () => {
    // In a real implementation, this would save to the database
    setNewItem(false)
    setEditingId(null)
  }

  // State for edit user dialog
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [currentUserToEdit, setCurrentUserToEdit] = useState<any>(null)

  // State for capability dialogs
  const [showAddCapabilityDialog, setShowAddCapabilityDialog] = useState(false)
  const [showEditCapabilityDialog, setShowEditCapabilityDialog] = useState(false)
  const [currentCapabilityToEdit, setCurrentCapabilityToEdit] = useState<any>(null)

  // State for test method dialogs
  const [showAddTestMethodDialog, setShowAddTestMethodDialog] = useState(false)
  const [showEditTestMethodDialog, setShowEditTestMethodDialog] = useState(false)
  const [currentTestMethodToEdit, setCurrentTestMethodToEdit] = useState<any>(null)

  // State for equipment dialogs
  const [showEditEquipmentDialog, setShowEditEquipmentDialog] = useState(false)
  const [currentEquipmentToEdit, setCurrentEquipmentToEdit] = useState<any>(null)

  // State for location dialogs
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showEditLocationDialog, setShowEditLocationDialog] = useState(false)
  const [currentLocationToEdit, setCurrentLocationToEdit] = useState<any>(null)

  // State for IO Number dialogs
  const [showAddIoDialog, setShowAddIoDialog] = useState(false)
  const [showEditIoDialog, setShowEditIoDialog] = useState(false)
  const [currentIoToEdit, setCurrentIoToEdit] = useState<any>(null)

  // State for Commercial Samples dialogs
  const [showAddSampleCommercialDialog, setShowAddSampleCommercialDialog] = useState(false)
  const [showEditSampleCommercialDialog, setShowEditSampleCommercialDialog] = useState(false)
  const [currentSampleCommercialToEdit, setCurrentSampleCommercialToEdit] = useState<any>(null)

  // State for App Tech List dialogs
  const [showAddAppTechDialog, setShowAddAppTechDialog] = useState(false)
  const [showEditAppTechDialog, setShowEditAppTechDialog] = useState(false)
  const [currentAppTechToEdit, setCurrentAppTechToEdit] = useState<any>(null)

  // State for Plant Reactors dialogs
  const [showAddPlantReactorDialog, setShowAddPlantReactorDialog] = useState(false)
  const [showEditPlantReactorDialog, setShowEditPlantReactorDialog] = useState(false)
  const [currentPlantReactorToEdit, setCurrentPlantReactorToEdit] = useState<any>(null)

  // State for Request dialogs
  const [showAddRequestDialog, setShowAddRequestDialog] = useState(false)
  const [showEditRequestDialog, setShowEditRequestDialog] = useState(false)
  const [currentRequestToEdit, setCurrentRequestToEdit] = useState<any>(null)

  const handleEdit = (item: any) => {
    if (activeTab === "users") {
      console.log('Editing user:', item);
      console.log('User approvers:', item.approvers);
      console.log('User ID:', item._id || item.id);
      setCurrentUserToEdit(item)
      setShowEditUserDialog(true)
    } else if (activeTab === "capabilities") {
      // Fetch the capability data from the API to ensure we have the latest data with populated fields
      const fetchCapabilityData = async () => {
        try {
          console.log('Fetching capability data for edit:', item.id || item._id);
          const response = await fetch(`/api/capabilities/${item.id || item._id}`);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched capability data for edit:', data.data);
              console.log('Capability locationId:', data.data.locationId);

              // Set the capability data for editing
              setCurrentCapabilityToEdit(data.data);
              setShowEditCapabilityDialog(true);
            } else {
              console.error('Error fetching capability data:', data.error);
              // Fall back to using the original data
              setCurrentCapabilityToEdit(item);
              setShowEditCapabilityDialog(true);
            }
          } else {
            console.error('Error response when fetching capability data:', response.status);
            // Fall back to using the original data
            setCurrentCapabilityToEdit(item);
            setShowEditCapabilityDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching capability data:', error);
          // Fall back to using the original data
          setCurrentCapabilityToEdit(item);
          setShowEditCapabilityDialog(true);
        }
      };

      fetchCapabilityData();
    } else if (activeTab === "test-methods") {
      handleEditTestMethod(item)
    } else if (activeTab === "equipment") {
      console.log('Editing equipment item:', item);

      // If the item is in the transformed format, we need to fetch the original data
      if (item.specifications) {
        // Fetch the original equipment data from the API
        const fetchOriginalEquipment = async () => {
          try {
            const response = await fetch(`/api/equipment/${item.id || item._id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                console.log('Fetched original equipment data:', data.data);
                setCurrentEquipmentToEdit(data.data);
                setShowEditEquipmentDialog(true);
              } else {
                console.error('Error fetching original equipment data:', data.error);
                // Fall back to using the transformed data
                setCurrentEquipmentToEdit(item);
                setShowEditEquipmentDialog(true);
              }
            } else {
              console.error('Error response when fetching original equipment data:', response.status);
              // Fall back to using the transformed data
              setCurrentEquipmentToEdit(item);
              setShowEditEquipmentDialog(true);
            }
          } catch (error) {
            console.error('Exception when fetching original equipment data:', error);
            // Fall back to using the transformed data
            setCurrentEquipmentToEdit(item);
            setShowEditEquipmentDialog(true);
          }
        };

        fetchOriginalEquipment();
      } else {
        // Use the item as is
        setCurrentEquipmentToEdit(item);
        setShowEditEquipmentDialog(true);
      }
    } else if (activeTab === "locations") {
      // Fetch the location data from the API
      const fetchLocationData = async () => {
        try {
          const response = await fetch(`/api/locations/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched location data:', data.data);
              setCurrentLocationToEdit(data.data);
              setShowEditLocationDialog(true);
            } else {
              console.error('Error fetching location data:', data.error);
              // Fall back to using the original data
              setCurrentLocationToEdit(item);
              setShowEditLocationDialog(true);
            }
          } else {
            console.error('Error response when fetching location data:', response.status);
            // Fall back to using the original data
            setCurrentLocationToEdit(item);
            setShowEditLocationDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching location data:', error);
          // Fall back to using the original data
          setCurrentLocationToEdit(item);
          setShowEditLocationDialog(true);
        }
      };

      fetchLocationData();
    } else if (activeTab === "io-numbers") {
      // Fetch the IO data from the API
      const fetchIoData = async () => {
        try {
          const response = await fetch(`/api/ios/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched IO data:', data.data);
              setCurrentIoToEdit(data.data);
              setShowEditIoDialog(true);
            } else {
              console.error('Error fetching IO data:', data.error);
              // Fall back to using the original data
              setCurrentIoToEdit(item);
              setShowEditIoDialog(true);
            }
          } else {
            console.error('Error response when fetching IO data:', response.status);
            // Fall back to using the original data
            setCurrentIoToEdit(item);
            setShowEditIoDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching IO data:', error);
          // Fall back to using the original data
          setCurrentIoToEdit(item);
          setShowEditIoDialog(true);
        }
      };

      fetchIoData();
    } else if (activeTab === "requests") {
      // Fetch the Request data from the API
      const fetchRequestData = async () => {
        try {
          const response = await fetch(`/api/requests/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched Request data:', data.data);
              setCurrentRequestToEdit(data.data);
              setShowEditRequestDialog(true);
            } else {
              console.error('Error fetching Request data:', data.error);
              // Fall back to using the original data
              setCurrentRequestToEdit(item);
              setShowEditRequestDialog(true);
            }
          } else {
            console.error('Error response when fetching Request data:', response.status);
            // Fall back to using the original data
            setCurrentRequestToEdit(item);
            setShowEditRequestDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching Request data:', error);
          // Fall back to using the original data
          setCurrentRequestToEdit(item);
          setShowEditRequestDialog(true);
        }
      };

      fetchRequestData();
    } else if (activeTab === "commercial-samples") {
      // Fetch the Commercial Sample data from the API
      const fetchSampleData = async () => {
        try {
          const response = await fetch(`/api/commercial-samples/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched Commercial Sample data:', data.data);
              setCurrentSampleCommercialToEdit(data.data);
              setShowEditSampleCommercialDialog(true);
            } else {
              console.error('Error fetching Commercial Sample data:', data.error);
              // Fall back to using the original data
              setCurrentSampleCommercialToEdit(item);
              setShowEditSampleCommercialDialog(true);
            }
          } else {
            console.error('Error response when fetching Commercial Sample data:', response.status);
            // Fall back to using the original data
            setCurrentSampleCommercialToEdit(item);
            setShowEditSampleCommercialDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching Commercial Sample data:', error);
          // Fall back to using the original data
          setCurrentSampleCommercialToEdit(item);
          setShowEditSampleCommercialDialog(true);
        }
      };

      fetchSampleData();
    } else if (activeTab === "app-tech-list") {
      // Fetch the App Tech data from the API
      const fetchAppTechData = async () => {
        try {
          const response = await fetch(`/api/app-techs/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched App Tech data:', data.data);
              setCurrentAppTechToEdit(data.data);
              setShowEditAppTechDialog(true);
            } else {
              console.error('Error fetching App Tech data:', data.error);
              // Fall back to using the original data
              setCurrentAppTechToEdit(item);
              setShowEditAppTechDialog(true);
            }
          } else {
            console.error('Error response when fetching App Tech data:', response.status);
            // Fall back to using the original data
            setCurrentAppTechToEdit(item);
            setShowEditAppTechDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching App Tech data:', error);
          // Fall back to using the original data
          setCurrentAppTechToEdit(item);
          setShowEditAppTechDialog(true);
        }
      };

      fetchAppTechData();
    } else if (activeTab === "plant-reactors") {
      // Fetch the Plant Reactor data from the API
      const fetchPlantReactorData = async () => {
        try {
          const response = await fetch(`/api/plant-reactors/${item.id || item._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              console.log('Fetched Plant Reactor data:', data.data);
              setCurrentPlantReactorToEdit(data.data);
              setShowEditPlantReactorDialog(true);
            } else {
              console.error('Error fetching Plant Reactor data:', data.error);
              // Fall back to using the original data
              setCurrentPlantReactorToEdit(item);
              setShowEditPlantReactorDialog(true);
            }
          } else {
            console.error('Error response when fetching Plant Reactor data:', response.status);
            // Fall back to using the original data
            setCurrentPlantReactorToEdit(item);
            setShowEditPlantReactorDialog(true);
          }
        } catch (error) {
          console.error('Exception when fetching Plant Reactor data:', error);
          // Fall back to using the original data
          setCurrentPlantReactorToEdit(item);
          setShowEditPlantReactorDialog(true);
        }
      };

      fetchPlantReactorData();
    } else {
      setCurrentEditItem(item)
      setShowEditDialog(true)
    }
  }

  // Function to handle user updated
  const handleUserUpdated = (user: any) => {
    // Refresh the users list
    fetchUsers()
    toast({
      title: "Success",
      description: "User updated successfully",
    })
  }

  // Function to handle capability added
  const handleCapabilityAdded = (capability: any) => {
    // Refresh the capabilities list
    fetchCapabilities()
    toast({
      title: "Success",
      description: "Capability added successfully",
    })
  }

  // Function to handle capability updated
  const handleCapabilityUpdated = (capability: any) => {
    // Refresh the capabilities list
    fetchCapabilities()
    toast({
      title: "Success",
      description: "Capability updated successfully",
    })
  }

  // Function to handle test method added
  const handleTestMethodAdded = (testMethod: any) => {
    // Refresh the test methods list
    fetchTestMethods()
    toast({
      title: "Success",
      description: "Test method added successfully",
    })
  }

  // Function to handle test method updated
  const handleTestMethodUpdated = (testMethod: any) => {
    // Refresh the test methods list
    fetchTestMethods()
    toast({
      title: "Success",
      description: "Test method updated successfully",
    })
  }

  // Function to handle equipment added
  const handleEquipmentAdded = (equipment: any) => {
    // Refresh the equipment list
    fetchEquipment()
    toast({
      title: "Success",
      description: "Equipment added successfully",
    })
  }

  // Function to handle equipment updated
  const handleEquipmentUpdated = (equipment: any) => {
    // Refresh the equipment list
    fetchEquipment()
    toast({
      title: "Success",
      description: "Equipment updated successfully",
    })
  }

  // Function to handle location added
  const handleLocationAdded = (location: any) => {
    // Refresh the locations list
    fetchLocations()
    toast({
      title: "Success",
      description: "Location added successfully",
    })
  }

  // Function to handle location updated
  const handleLocationUpdated = (location: any) => {
    // Refresh the locations list
    fetchLocations()
    toast({
      title: "Success",
      description: "Location updated successfully",
    })
  }

  // Function to handle IO added
  const handleIoAdded = (io: any) => {
    // Refresh the IO numbers list
    fetchIoNumbers()
    toast({
      title: "Success",
      description: "IO Number added successfully",
    })
  }

  // Function to handle IO updated
  const handleIoUpdated = (io: any) => {
    // Refresh the IO numbers list
    fetchIoNumbers()
    toast({
      title: "Success",
      description: "IO Number updated successfully",
    })
  }

  // Function to handle Commercial Sample added
  const handleSampleCommercialAdded = (sample: any) => {
    // Refresh the commercial samples list
    fetchCommercialSamples()
    toast({
      title: "Success",
      description: "Commercial Sample added successfully",
    })
  }

  // Function to handle Commercial Sample updated
  const handleSampleCommercialUpdated = (sample: any) => {
    // Refresh the commercial samples list
    fetchCommercialSamples()
    toast({
      title: "Success",
      description: "Commercial Sample updated successfully",
    })
  }

  // Function to handle App Tech added
  const handleAppTechAdded = (appTech: any) => {
    // Refresh the app tech list
    fetchAppTechs()
    toast({
      title: "Success",
      description: "App Tech added successfully",
    })
  }

  // Function to handle App Tech updated
  const handleAppTechUpdated = (appTech: any) => {
    // Refresh the app tech list
    fetchAppTechs()
    toast({
      title: "Success",
      description: "App Tech updated successfully",
    })
  }

  // Function to handle Plant Reactor added
  const handlePlantReactorAdded = (reactor: any) => {
    // Refresh the plant reactors list
    fetchPlantReactors()
    toast({
      title: "Success",
      description: "Plant Reactor added successfully",
    })
  }

  // Function to handle Plant Reactor updated
  const handlePlantReactorUpdated = (reactor: any) => {
    // Refresh the plant reactors list
    fetchPlantReactors()
    toast({
      title: "Success",
      description: "Plant Reactor updated successfully",
    })
  }

  // Function to handle Request added
  const handleRequestAdded = (request: any) => {
    // Refresh the requests list
    fetchRequests()
    toast({
      title: "Success",
      description: "Request added successfully",
    })
  }

  // Function to handle Request updated
  const handleRequestUpdated = (request: any) => {
    // Refresh the requests list
    fetchRequests()
    toast({
      title: "Success",
      description: "Request updated successfully",
    })
  }

  // Function to handle item deletion
  const handleDelete = async (item: any, itemType: string) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }

    setIsLoading(true);

    try {
      let endpoint = '';
      let refreshFunction;

      switch (itemType) {
        case 'user':
          endpoint = `/api/users/${item.id || item._id}`;
          refreshFunction = fetchUsers;
          break;
        case 'capability':
          endpoint = `/api/capabilities/${item.id || item._id}`;
          refreshFunction = fetchCapabilities;
          break;
        case 'test-method':
          endpoint = `/api/test-methods/${item.id || item._id}`;
          refreshFunction = fetchTestMethods;
          break;
        case 'equipment':
          endpoint = `/api/equipment/${item.id || item._id}`;
          refreshFunction = fetchEquipment;
          break;
        case 'location':
          endpoint = `/api/locations/${item.id || item._id}`;
          refreshFunction = fetchLocations;
          break;
        case 'io-number':
          endpoint = `/api/ios/${item.id || item._id}`;
          refreshFunction = fetchIoNumbers;
          break;
        default:
          console.error('Unknown item type:', itemType);
          setIsLoading(false);
          return;
      }

      console.log(`Deleting ${itemType} with ID:`, item.id || item._id);

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete ${itemType}`);
      }

      // Refresh the data
      if (refreshFunction) {
        refreshFunction();
      }

      toast({
        title: "Success",
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`,
      });
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete ${itemType}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Debug function to log test method data when editing
  const handleEditTestMethod = (item: any) => {
    console.log('Editing test method:', item);
    console.log('Image data before processing:', {
      descriptionImg: item.descriptionImg,
      keyResultImg: item.keyResultImg,
      images: item.images
    });

    // Log capability data
    console.log('Capability data before processing:', {
      capabilityId: item.capabilityId,
      capability: item.capability,
      type: item.capabilityId ? typeof item.capabilityId : 'null/undefined'
    });

    // Log location data
    console.log('Location data before processing:', {
      locationId: item.locationId,
      location: item.location,
      type: item.locationId ? typeof item.locationId : 'null/undefined'
    });

    // Create a clean copy of the item with all image data
    const itemWithImages = { ...item };

    // Ensure image data is properly passed to the edit dialog
    if (item.images) {
      if (!itemWithImages.descriptionImg && item.images.description) {
        itemWithImages.descriptionImg = item.images.description;
        console.log('Setting descriptionImg from images.description:', item.images.description);
      }
      if (!itemWithImages.keyResultImg && item.images.keyResult) {
        itemWithImages.keyResultImg = item.images.keyResult;
        console.log('Setting keyResultImg from images.keyResult:', item.images.keyResult);
      }
    }

    // Ensure capability data is properly passed to the edit dialog
    if (item.capability && typeof item.capability === 'object') {
      console.log('Found capability object:', item.capability);
      // Store the capability object for reference in the form
      itemWithImages.capability = item.capability;

      // If capabilityId is not set but we have a capability object, use its ID
      if ((!itemWithImages.capabilityId || itemWithImages.capabilityId === '') &&
          (item.capability._id || item.capability.id)) {
        itemWithImages.capabilityId = item.capability._id || item.capability.id;
        console.log('Setting capabilityId from capability object:', itemWithImages.capabilityId);
      }
    }

    // Ensure location data is properly passed to the edit dialog
    if (item.location && typeof item.location === 'object') {
      console.log('Found location object:', item.location);
      // Store the location object for reference in the form
      itemWithImages.location = item.location;

      // If locationId is not set but we have a location object, use its ID
      if ((!itemWithImages.locationId || itemWithImages.locationId === '') &&
          (item.location._id || item.location.id)) {
        itemWithImages.locationId = item.location._id || item.location.id;
        console.log('Setting locationId from location object:', itemWithImages.locationId);
      }
    }

    // Log the final image data
    console.log('Final image data after processing:', {
      descriptionImg: itemWithImages.descriptionImg,
      keyResultImg: itemWithImages.keyResultImg,
      images: itemWithImages.images
    });

    // Log the type of the image data
    console.log('Image data types:', {
      descriptionImg: itemWithImages.descriptionImg ? typeof itemWithImages.descriptionImg : 'null/undefined',
      keyResultImg: itemWithImages.keyResultImg ? typeof itemWithImages.keyResultImg : 'null/undefined',
      images: itemWithImages.images ? typeof itemWithImages.images : 'null/undefined'
    });

    // Log the final capability data
    console.log('Final capability data after processing:', {
      capabilityId: itemWithImages.capabilityId,
      capability: itemWithImages.capability,
      type: itemWithImages.capabilityId ? typeof itemWithImages.capabilityId : 'null/undefined'
    });

    // If the image data is an object, log its structure
    if (itemWithImages.descriptionImg && typeof itemWithImages.descriptionImg === 'object') {
      console.log('descriptionImg object structure:', JSON.stringify(itemWithImages.descriptionImg));
    }
    if (itemWithImages.keyResultImg && typeof itemWithImages.keyResultImg === 'object') {
      console.log('keyResultImg object structure:', JSON.stringify(itemWithImages.keyResultImg));
    }

    console.log('Prepared test method data for edit:', itemWithImages);
    setCurrentTestMethodToEdit(itemWithImages);
    setShowEditTestMethodDialog(true);
  }

  // Fetch equipment from MongoDB
  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching equipment...');
      const response = await fetch('/api/equipment');
      console.log('Equipment API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Equipment API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing equipment JSON response:', jsonError);
        // Use empty array if API fails
        setEquipment([]);
        setFilteredEquipment([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedEquipment = data.data.map((eq: any) => {
          // Process equipment image
          let equipmentImagePath = '';
          if (eq.equipmentImage) {
            if (typeof eq.equipmentImage === 'string') {
              // If it's already a string path, use it directly
              equipmentImagePath = eq.equipmentImage;
            } else if (typeof eq.equipmentImage === 'object' && eq.equipmentImage !== null) {
              // If it's an object (like Binary from MongoDB), try to convert it
              console.log('Processing equipment image object:', eq.equipmentImage);
              if (eq.equipmentImage.buffer) {
                try {
                  // Try to convert Binary to string
                  const binaryString = eq.equipmentImage.toString();
                  if (binaryString.startsWith('/uploads/')) {
                    equipmentImagePath = binaryString;
                    console.log('Decoded Binary equipmentImage to path:', binaryString);
                  } else {
                    try {
                      // Try to decode from base64 if it might be encoded
                      const decoded = Buffer.from(binaryString, 'base64').toString();
                      if (decoded.startsWith('/uploads/')) {
                        equipmentImagePath = decoded;
                        console.log('Decoded base64 equipmentImage to path:', decoded);
                      }
                    } catch (decodeError) {
                      console.error('Failed to decode Binary equipmentImage:', decodeError);
                    }
                  }
                } catch (error) {
                  console.error('Error processing Binary equipmentImage:', error);
                }
              }
            }
          }

          console.log(`Equipment ${eq.equipmentName} image path:`, equipmentImagePath);

          return {
            id: eq._id,
            _id: eq._id, // Keep the original _id as well
            code: eq.equipmentCode || '',
            name: eq.equipmentName || '',
            function: eq.equipmentFunction || '',
            specifications: {
              model: eq.model || '',
              manufacturer: eq.manufacturer || '',
              installDate: eq.usedDate ? new Date(eq.usedDate) : null,
              condition: eq.equipmentCondition || '',
              scope: eq.equipmentScope || '',
              range: eq.range || '',
              accuracy: eq.accuracy || '',
              allowance: eq.allowance || '',
              rangeOfUse: eq.rangeOfUse || '',
              type: eq.equipmentType || '',
            },
            maintenance: {
              pmFrequency: eq.pmInYear || 0,
              pmBy: eq.pmBy || '',
              calFrequency: eq.calInYear || 0,
              calBy: eq.calBy || '',
              nextPMDate: null,
              nextCalDate: null,
            },
            serviceCapacity: {
              daysPerWeek: eq.serviceDayPerWeek || 5,
              actualDaysPerWeek: eq.aServiceDayPerWeek || 5,
              startTime: eq.serviceTimeStart || 900,
              endTime: eq.serviceTimeEnd || 1700,
              capacityPerDay: eq.capPerDay || 0,
              normalDuration: eq.serviceNormalDuration || 0,
              erDuration: eq.serviceErDuration || 0,
              workloadFactor: eq.workloadFactor || 0,
              workloadDescription: eq.workloadFactorDescription || '',
            },
            location: {
              locationId: eq.location || '',
              name: eq.location || '',
            },
            responsibleUsers: [eq.respBy || ''],
            documents: eq.operationDocument ? [eq.operationDocument] : [],
            status: eq.equipmentStatus || 'Active',
            obsoleteInfo: {
              date: eq.obsoleteDate ? new Date(eq.obsoleteDate) : null,
              reason: eq.obsoleteReason || '',
            },
            hierarchy: {
              primaryId: eq.primaryId || '',
              primaryCode: eq.primaryCode || '',
              componentId: eq.componentId || '',
              componentCode: eq.componentCode || '',
              accessoryId: eq.accessoryId || '',
              accessoryCode: eq.accessoryCode || '',
            },
            methods: [],
            targetDuration: eq.targetDuration || 0,
            remark: eq.remark || '',
            created: eq.createdAt ? new Date(eq.createdAt) : new Date(),
            updated: eq.updatedAt ? new Date(eq.updatedAt) : new Date(),
            // Additional fields from the database
            typeInEx: eq.typeInEx || '',
            mainMonitor: eq.mainMonitor || '',
            distributor: eq.distributor || '',
            equipmentFunctionAll: eq.equipmentFunctionAll || '',
            respByComplianceAssetId: eq.respByComplianceAssetId || '',
            equipmentImage: equipmentImagePath || eq.equipmentImage || '',
          };
        });

        console.log('Formatted equipment:', formattedEquipment);
        setEquipment(formattedEquipment);
        setFilteredEquipment(formattedEquipment);
      } else {
        console.error('Error in equipment response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setEquipment([]);
        setFilteredEquipment([]);
        toast({
          title: "Warning",
          description: "No equipment found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      // Use empty array if API throws error
      setEquipment([]);
      setFilteredEquipment([]);
      toast({
        title: "Warning",
        description: "Could not connect to equipment API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch test methods from MongoDB
  const fetchTestMethods = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching test methods...');
      const response = await fetch('/api/test-methods');
      console.log('Test Methods API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Test Methods API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing test methods JSON response:', jsonError);
        // Use mock data if API fails
        setTestMethods([]);
        setFilteredTestMethods([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Log raw data from API
        console.log('Raw test methods from API:', data.data);
        if (data.data.length > 0) {
          console.log('First raw method:', data.data[0]);
          console.log('Raw methodcode (lowercase):', data.data[0].methodcode);
          console.log('Raw methodCode (camelCase):', data.data[0].methodCode);
          console.log('Raw price:', data.data[0].price);
          console.log('Raw priorityPrice:', data.data[0].priorityPrice);
        }
        
        // Transform MongoDB data to match the expected format
        const formattedTestMethods = data.data.map((method: any) => {
          // Create a formatted test method object
          // Handle capability data
          let capability = null;
          let capabilityId = method.capabilityId || null;

          // Check if capabilityId is populated as an object
          if (method.capabilityId && typeof method.capabilityId === 'object' && method.capabilityId._id) {
            capability = method.capabilityId;
            capabilityId = method.capabilityId._id;
          }

          // Handle location data
          let location = null;
          let locationId = method.locationId || null;

          // Check if locationId is populated as an object
          if (method.locationId && typeof method.locationId === 'object' && method.locationId._id) {
            location = method.locationId;
            locationId = method.locationId._id;
          }

          console.log('Test method data:', {
            methodName: method.testingName,
            capabilityId,
            capability,
            locationId,
            location,
            rawLocationId: method.locationId,
            rawLocationIdType: typeof method.locationId
          });

          // Keep all original fields from database
          const transformed = {
            ...method,  // Keep all original fields
            id: method._id,
            _id: method._id,
            // Map fields that might have different names
            methodCode: method.methodcode || method.methodCode || '',
            name: method.testingName || '',
            // Parse price fields
            price: method.price,  // Keep original format (string or number)
            priorityPrice: method.priorityPrice,  // Keep original format
            // Create display values for price
            priceDisplay: typeof method.price === 'string' ? method.price : (method.price || 0).toString(),
            priorityPriceDisplay: typeof method.priorityPrice === 'string' ? method.priorityPrice : (method.priorityPrice || 0).toString(),
            // Create numeric values for calculations
            priceNumeric: typeof method.price === 'string' ? parseFloat(method.price.replace(/,/g, '')) : (method.price || 0),
            priorityPriceNumeric: typeof method.priorityPrice === 'string' ? parseFloat(method.priorityPrice.replace(/,/g, '')) : (method.priorityPrice || 0),
            // Description structure
            description: {
              th: method.detailTh || '',
              en: method.detailEng || '',
            },
            keyResults: method.keyResult ? method.keyResult.split(',').map((item: string) => item.trim()) : [],
            pricing: {
              standard: typeof method.price === 'string' ? parseFloat(method.price.replace(/,/g, '')) : (method.price || 0),
              urgent: typeof method.priorityPrice === 'string' ? parseFloat(method.priorityPrice.replace(/,/g, '')) : (method.priorityPrice || 0),
              currency: method.unit || 'THB',
              effectiveDate: method.priceEffectiveDate ? new Date(method.priceEffectiveDate) : new Date(),
            },
            sampleRequirements: {
              minimumAmount: method.sampleAmount || 0,
              unit: method.unit || 'g',
            },
            images: {
              description: method.descriptionImg || '',
              keyResult: method.keyResultImg || '',
            },
            // Keep the original image fields
            descriptionImg: method.descriptionImg || null,
            keyResultImg: method.keyResultImg || null,
            timeEstimates: {
              testing: method.testingTime || 0,
              analysis: method.resultAnalysisTime || 0,
              leadTime: method.analysisLeadtime || 0,
              workingHours: method.workingHour || 8,
            },
            equipment: {
              equipmentId: method.equipmentId || '',
              name: method.equipmentName || '',
            },
            // Add capability information
            capabilityId: capabilityId,
            capability: capability,
            // Add location information
            locationId: locationId,
            location: location,
            // Add raw location information for debugging
            rawLocationId: method.locationId,
            rawLocationIdType: typeof method.locationId,
            serviceType: method.serviceType || [],
            methodType: method.methodType || '',
            limitations: [],
            performance: {
              samplesPerYear: method.noSamplePerYear || 0,
              averageTurnaround: 0,
            },
            manageable: method.managable === 'Yes',
            erSettings: {
              slotDuration: method.erSlotTime || 0,
              startTime: method.erTimeStart || 0,
              endTime: method.erTimeEnd || 0,
            },
            assets: method.methodAsset ? method.methodAsset.split(',').map((item: string) => item.trim()) : [],
            foh: method.methodFoh ? method.methodFoh.split(',').map((item: string) => item.trim()) : [],
            isActive: method.methodStatus === 'Active',
            priceNote: method.priceNote || '',
            statusNote: '',
            created: method.createdAt ? new Date(method.createdAt) : new Date(),
            updated: method.updatedAt ? new Date(method.updatedAt) : new Date(),
          };
          
          return transformed;
        });

        console.log('Formatted test methods:', formattedTestMethods);
        // Log first method to see the structure
        if (formattedTestMethods.length > 0) {
          console.log('First test method structure:', formattedTestMethods[0]);
          console.log('Method code:', formattedTestMethods[0].methodCode);
          console.log('Price:', formattedTestMethods[0].price);
          console.log('Pricing object:', formattedTestMethods[0].pricing);
        }
        setTestMethods(formattedTestMethods);
        setFilteredTestMethods(formattedTestMethods);
      } else {
        console.error('Error in test methods response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setTestMethods([]);
        setFilteredTestMethods([]);
        
        // Check if it's a database connection error
        if (data?.error?.includes('Failed to fetch') || data?.error?.includes('connect')) {
          toast({
            title: "Database Not Connected",
            description: "MongoDB is not running. Please start MongoDB service.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Warning",
            description: "No test methods found or error fetching data",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching test methods:', error);
      // Don't use mock data - just show empty
      setTestMethods([]);
      setFilteredTestMethods([]);
      
      toast({
        title: "Database Connection Error",
        description: "Could not connect to database. Please check MongoDB connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch locations from MongoDB
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching locations...');
      const response = await fetch('/api/locations');
      console.log('Locations API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Locations API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing locations JSON response:', jsonError);
        // Use empty array if API fails
        setLocations([]);
        setFilteredLocations([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedLocations = data.data.map((loc: any) => ({
          id: loc._id,
          _id: loc._id, // Keep the original _id as well
          name: loc.sublocation || loc.locationId,
          locationId: loc.locationId,
          sublocation: loc.sublocation || '',
          contactPerson: loc.contactPerson || '',
          contactNumber: loc.contactNumber || '',
          address: loc.address || '',
          sendingAddress: loc.sendingAddress || '',
          isActive: loc.isActive !== undefined ? loc.isActive : true,
          ioId: loc.ioId || null,
          io: loc.io || null,
          created: loc.createdAt ? new Date(loc.createdAt) : new Date(),
          updated: loc.updatedAt ? new Date(loc.updatedAt) : new Date(),
        }));

        console.log('Formatted locations:', formattedLocations);
        setLocations(formattedLocations);
        setFilteredLocations(formattedLocations);
      } else {
        console.error('Error in locations response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setLocations([]);
        setFilteredLocations([]);
        toast({
          title: "Warning",
          description: "No locations found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Use empty array if API throws error
      setLocations([]);
      setFilteredLocations([]);
      toast({
        title: "Warning",
        description: "Could not connect to locations API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch IO numbers from MongoDB
  const fetchIoNumbers = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching IO numbers...');
      const response = await fetch('/api/ios');
      console.log('IO Numbers API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('IO Numbers API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing IO numbers JSON response:', jsonError);
        // Use empty array if API fails
        setIoNumbers([]);
        setFilteredIONumbers([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedIoNumbers = data.data.map((io: any) => ({
          id: io._id,
          _id: io._id, // Keep the original _id as well
          ioNumber: io.ioNo || '',
          name: io.ioName || '',
          responsible: io.responsible || '',
          costCenter: {
            code: io.costCenterNo || '',
            name: io.costCenter || '',
          },
          company: io.company || '',
          status: io.status || 'Active',
          mappingInfo: {
            mappingIO: io.ioMapping || '',
            mappingName: io.ioNoMappingWithName || '',
          },
          ioType: io.ioType || '',
          members: io.member ? [io.member] : [],
          testSpending: io.testSpending || 0,
          isTechsprint: io.isTechsprint || false,
          techProgram: io.techProgram || '',
          asset: io.asset || '',
          locations: io.locations || [],
          created: io.createdAt ? new Date(io.createdAt) : new Date(),
          updated: io.updatedAt ? new Date(io.updatedAt) : new Date(),
          isArchived: false,
        }));

        console.log('Formatted IO numbers:', formattedIoNumbers);
        setIoNumbers(formattedIoNumbers);
        setFilteredIONumbers(formattedIoNumbers);
      } else {
        console.error('Error in IO numbers response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setIoNumbers([]);
        setFilteredIONumbers([]);
        toast({
          title: "Warning",
          description: "No IO numbers found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching IO numbers:', error);
      // Use empty array if API throws error
      setIoNumbers([]);
      setFilteredIONumbers([]);
      toast({
        title: "Warning",
        description: "Could not connect to IO numbers API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch Commercial Samples
  const fetchCommercialSamples = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching commercial samples...');
      const response = await fetch('/api/commercial-samples');
      console.log('Commercial Samples API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Commercial Samples API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing commercial samples JSON response:', jsonError);
        // Use empty array if API fails
        setCommercialSamples([]);
        setFilteredCommercialSamples([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedSamples = data.data.map((sample: any) => ({
          id: sample._id,
          _id: sample._id, // Keep the original _id as well
          gradeName: sample.gradeName || '',
          application: sample.application || '',
          polymerType: sample.polymerType || '',
          properties: sample.properties || [],
          isActive: sample.isActive !== undefined ? sample.isActive : true,
          appTechId: sample.appTechId || null,
          plantReactorId: sample.plantReactorId || null,
          appTech: sample.appTech || null,
          plantReactor: sample.plantReactor || null,
          created: sample.createdAt ? new Date(sample.createdAt) : new Date(),
          updated: sample.updatedAt ? new Date(sample.updatedAt) : new Date(),
        }));

        console.log('Formatted commercial samples:', formattedSamples);
        setCommercialSamples(formattedSamples);
        setFilteredCommercialSamples(formattedSamples);
      } else {
        console.error('Error in commercial samples response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setCommercialSamples([]);
        setFilteredCommercialSamples([]);
        toast({
          title: "Warning",
          description: "No commercial samples found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching commercial samples:', error);
      // Use empty array if API throws error
      setCommercialSamples([]);
      setFilteredCommercialSamples([]);
      toast({
        title: "Warning",
        description: "Could not connect to commercial samples API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch App Techs
  const fetchAppTechs = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching app techs...');
      const response = await fetch('/api/app-techs');
      console.log('App Techs API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('App Techs API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing app techs JSON response:', jsonError);
        // Use empty array if API fails
        setAppTechList([]);
        setFilteredAppTechList([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedAppTechs = data.data.map((appTech: any) => ({
          id: appTech._id,
          _id: appTech._id, // Keep the original _id as well
          name: appTech.appTech || '',
          shortCode: appTech.shortText || '',
          techType: appTech.appTechType || '',
          description: '',
          isActive: appTech.isActive !== undefined ? appTech.isActive : true,
          commercialSamples: appTech.commercialSamples || [],
          created: appTech.createdAt ? new Date(appTech.createdAt) : new Date(),
          updated: appTech.updatedAt ? new Date(appTech.updatedAt) : new Date(),
        }));

        console.log('Formatted app techs:', formattedAppTechs);
        setAppTechList(formattedAppTechs);
        setFilteredAppTechList(formattedAppTechs);
      } else {
        console.error('Error in app techs response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setAppTechList([]);
        setFilteredAppTechList([]);
        toast({
          title: "Warning",
          description: "No app techs found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching app techs:', error);
      // Use empty array if API throws error
      setAppTechList([]);
      setFilteredAppTechList([]);
      toast({
        title: "Warning",
        description: "Could not connect to app techs API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch Plant Reactors
  const fetchPlantReactors = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching plant reactors...');
      const response = await fetch('/api/plant-reactors');
      console.log('Plant Reactors API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Plant Reactors API response data:', data);
      } catch (jsonError) {
        console.error('Error parsing plant reactors JSON response:', jsonError);
        // Use empty array if API fails
        setPlantReactors([]);
        setFilteredPlantReactors([]);
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedReactors = data.data.map((reactor: any) => ({
          id: reactor._id,
          _id: reactor._id, // Keep the original _id as well
          name: reactor.reactorPlantName || '',
          reactorShortName: reactor.reactorPlantName || '',
          description: '',
          isActive: reactor.isActive !== undefined ? reactor.isActive : true,
          commercialSamples: reactor.commercialSamples || [],
          created: reactor.createdAt ? new Date(reactor.createdAt) : new Date(),
          updated: reactor.updatedAt ? new Date(reactor.updatedAt) : new Date(),
        }));

        console.log('Formatted plant reactors:', formattedReactors);
        setPlantReactors(formattedReactors);
        setFilteredPlantReactors(formattedReactors);
      } else {
        console.error('Error in plant reactors response:', data?.error || 'Unknown error');
        // Use empty array if API returns error
        setPlantReactors([]);
        setFilteredPlantReactors([]);
        toast({
          title: "Warning",
          description: "No plant reactors found or error fetching data",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching plant reactors:', error);
      // Use empty array if API throws error
      setPlantReactors([]);
      setFilteredPlantReactors([]);
      toast({
        title: "Warning",
        description: "Could not connect to plant reactors API",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch capabilities from MongoDB
  const fetchCapabilities = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching capabilities...');
      const response = await fetch('/api/capabilities');
      console.log('Capabilities API response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Capabilities API response data:', data);

        // Log detailed information about the first capability for debugging
        if (data && data.data && data.data.length > 0) {
          const firstCapability = data.data[0];
          console.log('First capability details:', {
            id: firstCapability._id,
            name: firstCapability.capabilityName,
            locationId: firstCapability.locationId,
            locationIdType: firstCapability.locationId ? typeof firstCapability.locationId : 'undefined',
            locationDetails: firstCapability.locationId && typeof firstCapability.locationId === 'object' ?
              {
                _id: firstCapability.locationId._id,
                locationId: firstCapability.locationId.locationId,
                sublocation: firstCapability.locationId.sublocation,
                address: firstCapability.locationId.address
              } : 'Not an object'
          });
        }
      } catch (jsonError) {
        console.error('Error parsing capabilities JSON response:', jsonError);
        throw new Error('Failed to parse server response. The server might be returning HTML instead of JSON.');
      }

      if (response.ok && data && data.data) {
        // Transform MongoDB data to match the expected format
        const formattedCapabilities = data.data.map((capability: any) => {
          // Log the raw capability data for debugging
          console.log('Raw capability data:', {
            id: capability._id,
            name: capability.capabilityName,
            locationId: capability.locationId,
            locationIdType: capability.locationId ? typeof capability.locationId : 'undefined'
          });

          return {
            id: capability._id,
            _id: capability._id, // Keep the original _id as well
            capabilityName: capability.capabilityName,
            shortName: capability.shortName,
            capabilityDesc: capability.capabilityDesc || '',
            // Keep the original locationId object if it exists
            locationId: capability.locationId || '',
            capHeadGroup: capability.capHeadGroup || '',
            reqRunNo: capability.reqRunNo || '',
            reqAsrRunNo: capability.reqAsrRunNo || '',
            createdAt: capability.createdAt ? new Date(capability.createdAt) : new Date(),
            updatedAt: capability.updatedAt ? new Date(capability.updatedAt) : new Date(),
          };
        });

        console.log('Formatted capabilities:', formattedCapabilities);
        setCapabilities(formattedCapabilities);
        setFilteredCapabilities(formattedCapabilities);
      } else {
        console.error('Error in capabilities response:', data?.error || 'Unknown error');
        toast({
          title: "Error",
          description: data?.error || "Failed to fetch capabilities",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch capabilities",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }



  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // State for keyboard navigation in dropdown
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Function to handle global search input change
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchTerm(e.target.value);
    // Reset selected index when search term changes
    setSelectedIndex(-1);
  }

  // Function to handle keyboard navigation in dropdown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!globalSearchTerm) return;

    // Handle arrow down (select next item)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredTabs.length - 1 ? prev + 1 : prev
      );
    }

    // Handle arrow up (select previous item)
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    }

    // Handle Enter (select current item)
    else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < filteredTabs.length) {
      e.preventDefault();
      setActiveTab(filteredTabs[selectedIndex]);
      clearGlobalSearch();
    }

    // Handle Escape (close dropdown)
    else if (e.key === 'Escape') {
      e.preventDefault();
      clearGlobalSearch();
    }
  }

  // Function to clear search
  const clearSearch = () => {
    setSearchTerm("");
  }

  // Function to clear global search
  const clearGlobalSearch = () => {
    setGlobalSearchTerm("");
    setSearchTerm("");
    setSelectedIndex(-1);
  }

  // Function to export table data to CSV
  const exportToCSV = (data: any[], filename: string) => {
    // Get headers from the table headers function
    if (data.length === 0) return

    const headers = getTableHeaders()

    // Create CSV content with BOM for Thai language support
    let csvContent = "\uFEFF" // BOM for UTF-8

    // Add headers
    csvContent += headers.join(",") + "\n"

    // Add data rows
    data.forEach((item) => {
      const row = headers.map((header) => {
        // Handle nested properties using dot notation (e.g., "costCenter.code")
        const parts = header.split(".")
        let value = item

        for (const part of parts) {
          if (value === null || value === undefined) {
            value = ""
            break
          }
          value = value[part]
        }

        // Handle different data types
        if (value === null || value === undefined) {
          return ""
        } else if (value instanceof Date) {
          return value.toISOString()
        } else if (Array.isArray(value)) {
          // Convert arrays to semicolon-separated strings
          return `"${value.join(";").replace(/"/g, '""')}"`
        } else if (typeof value === "object") {
          // Convert objects to JSON strings
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        } else if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          // Escape strings with special characters
          return `"${value.replace(/"/g, '""')}"`
        }

        return value
      })

      csvContent += row.join(",") + "\n"
    })

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    if (csvExportRef.current) {
      csvExportRef.current.href = url
      csvExportRef.current.download = filename
      csvExportRef.current.click()
    }
  }


  // Function to handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseCSV(content)
    }
    reader.readAsText(file, "UTF-8")
  }

  // Function to parse CSV content and import to database
  const parseCSV = async (content: string) => {
    // Remove BOM if present
    const csvContent = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content

    // Split into lines
    const lines = csvContent.split("\n")
    if (lines.length < 2) return // Need at least headers and one data row

    // Parse headers
    const headers = lines[0].split(",").map((h) => h.trim())

    // Parse data rows
    const data = lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line, index) => {
        const values = parseCSVLine(line)
        const row: any = { id: (index + 1).toString() }

        headers.forEach((header, i) => {
          if (i < values.length) {
            // Handle nested properties using dot notation (e.g., "costCenter.code")
            if (header.includes(".")) {
              const parts = header.split(".")
              let current = row

              // Create nested objects as needed
              for (let j = 0; j < parts.length - 1; j++) {
                const part = parts[j]
                if (!current[part]) {
                  current[part] = {}
                }
                current = current[part]
              }

              // Set the value in the deepest level
              const lastPart = parts[parts.length - 1]

              // Handle special data types
              if (values[i].toLowerCase() === "true") {
                current[lastPart] = true
              } else if (values[i].toLowerCase() === "false") {
                current[lastPart] = false
              } else if (!isNaN(Number(values[i])) && values[i].trim() !== "") {
                current[lastPart] = Number(values[i])
              } else if (values[i].startsWith("[") && values[i].endsWith("]")) {
                try {
                  current[lastPart] = JSON.parse(values[i])
                } catch {
                  current[lastPart] = values[i]
                }
              } else if (values[i].includes(";")) {
                // Handle semicolon-separated arrays
                current[lastPart] = values[i].split(";").map((item) => item.trim())
              } else {
                current[lastPart] = values[i]
              }
            } else {
              // Handle non-nested properties
              if (values[i].toLowerCase() === "true") {
                row[header] = true
              } else if (values[i].toLowerCase() === "false") {
                row[header] = false
              } else if (!isNaN(Number(values[i])) && values[i].trim() !== "") {
                row[header] = Number(values[i])
              } else if (values[i].startsWith("[") && values[i].endsWith("]")) {
                try {
                  row[header] = JSON.parse(values[i])
                } catch {
                  row[header] = values[i]
                }
              } else if (values[i].includes(";")) {
                // Handle semicolon-separated arrays
                row[header] = values[i].split(";").map((item) => item.trim())
              } else {
                row[header] = values[i]
              }
            }
          }
        })

        return row
      })

    // Import data to database via API
    try {
      let apiEndpoint = ""
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Determine API endpoint based on active tab
      switch (activeTab) {
        case "users":
          apiEndpoint = "/api/users"
          break
        case "capabilities":
          apiEndpoint = "/api/capabilities"
          break
        case "test-methods":
          apiEndpoint = "/api/test-methods"
          break
        case "equipment":
          apiEndpoint = "/api/equipment"
          break
        case "locations":
          apiEndpoint = "/api/locations"
          break
        case "io-numbers":
          apiEndpoint = "/api/ios"
          break
        case "commercial-samples":
          apiEndpoint = "/api/commercial-samples"
          break
        case "app-tech-list":
          apiEndpoint = "/api/app-techs"
          break
        case "plant-reactors":
          apiEndpoint = "/api/plant-reactors"
          break
        default:
          toast({
            title: "Error",
            description: "Import not supported for this table",
            variant: "destructive"
          })
          return
      }

      // Process each row and send to API
      setIsLoading(true)

      for (const row of data) {
        try {
          // Remove temporary id field
          const { id, ...dataToSend } = row
          
          // Transform data based on the active tab
          let transformedData = dataToSend
          
          if (activeTab === "test-methods") {
            // Simple direct mapping - CSV headers must match exactly
            transformedData = {
              methodCode: dataToSend.methodCode || '',
              testingName: dataToSend.testingName || '',
              detailTh: dataToSend.detailTh || '',
              detailEng: dataToSend.detailEng || '',
              keyResult: dataToSend.keyResult || '',
              price: dataToSend.price || '0',
              priorityPrice: dataToSend.priorityPrice || '0',
              unit: dataToSend.unit || 'THB',
              sampleAmount: Number(dataToSend.sampleAmount) || 0,
              workingHour: Number(dataToSend.workingHour) || 8,
              testingTime: Number(dataToSend.testingTime) || 0,
              resultAnalysisTime: Number(dataToSend.resultAnalysisTime) || 0,
              analysisLeadtime: Number(dataToSend.analysisLeadtime) || 0,
              equipmentName: dataToSend.equipmentName || '',
              equipmentId: Number(dataToSend.equipmentId) || null,
              locationId: dataToSend.locationId || null,
              capabilityId: dataToSend.capabilityId || null,
              serviceType: dataToSend.serviceType ? dataToSend.serviceType.split(',').map(s => s.trim()) : [],
              methodType: dataToSend.methodType || '',
              managable: dataToSend.managable || 'Yes',
              erSlotTime: Number(dataToSend.erSlotTime) || 0,
              erTimeStart: Number(dataToSend.erTimeStart) || 0,
              erTimeEnd: Number(dataToSend.erTimeEnd) || 0,
              noSamplePerYear: Number(dataToSend.noSamplePerYear) || 0,
              methodAsset: dataToSend.methodAsset || '',
              methodFoh: dataToSend.methodFoh || '',
              methodStatus: dataToSend.methodStatus || 'Active',
              priceNote: dataToSend.priceNote || '',
              priceEffectiveDate: dataToSend.priceEffectiveDate || null
            }
          }
          
          // Skip rows with missing required fields
          if (activeTab === "test-methods") {
            if (!transformedData.methodCode || !transformedData.testingName) {
              errorCount++
              errors.push(`Row ${successCount + errorCount}: Missing required fields - methodCode: ${transformedData.methodCode}, testingName: ${transformedData.testingName}`)
              continue;
            }
          }

          // Send to API

          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedData),
          })

          if (response.ok) {
            successCount++
          } else {
            const error = await response.json()
            errorCount++
            errors.push(`Row ${successCount + errorCount}: ${error.error || 'Unknown error'}`)
          }
        } catch (error) {
          errorCount++
          errors.push(`Row ${successCount + errorCount}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Show result
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Success",
          description: `Successfully imported ${successCount} records`,
        })
        
        // Refresh data
        switch (activeTab) {
          case "users":
            fetchUsers()
            break
          case "capabilities":
            fetchCapabilities()
            break
          case "test-methods":
            fetchTestMethods()
            break
          case "equipment":
            fetchEquipment()
            break
          case "locations":
            fetchLocations()
            break
          case "io-numbers":
            fetchIoNumbers()
            break
          case "commercial-samples":
            fetchCommercialSamples()
            break
          case "app-tech-list":
            fetchAppTechList()
            break
          case "plant-reactors":
            fetchPlantReactors()
            break
        }
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `Imported ${successCount} records, ${errorCount} failed`,
          variant: "default"
        })
        console.error('Import errors:', errors)
      } else {
        toast({
          title: "Error",
          description: `Failed to import all ${errorCount} records`,
          variant: "destructive"
        })
        console.error('Import errors:', errors)
      }
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Helper function to parse CSV line (handles quoted values with commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (i < line.length - 1 && line[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote
          current += '"'
          i++ // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    // Add the last field
    result.push(current)

    return result
  }

  // Function to handle drop database
  const handleDropDatabase = async () => {
    if (adminPassword !== "1133557799") {
      setPasswordError(true)
      return
    }

    try {
      setIsLoading(true)
      
      // Determine API endpoint based on active tab
      let apiEndpoint = ""
      let collectionName = ""
      
      switch (activeTab) {
        case "users":
          // Don't allow dropping users table to preserve authentication
          toast({
            title: "Warning",
            description: "Cannot drop users table to preserve authentication",
            variant: "destructive"
          })
          setAdminPassword("")
          setPasswordError(false)
          setShowDropDialog(false)
          return
        case "capabilities":
          apiEndpoint = "/api/capabilities"
          collectionName = "capabilities"
          break
        case "test-methods":
          apiEndpoint = "/api/test-methods"
          collectionName = "testingmethods"
          break
        case "equipment":
          apiEndpoint = "/api/equipment"
          collectionName = "equipment"
          break
        case "locations":
          apiEndpoint = "/api/locations"
          collectionName = "locations"
          break
        case "io-numbers":
          apiEndpoint = "/api/ios"
          collectionName = "ios"
          break
        case "commercial-samples":
          apiEndpoint = "/api/commercial-samples"
          collectionName = "samplecommercials"
          break
        case "app-tech-list":
          apiEndpoint = "/api/app-techs"
          collectionName = "apptechs"
          break
        case "plant-reactors":
          apiEndpoint = "/api/plant-reactors"
          collectionName = "plantreactors"
          break
        default:
          toast({
            title: "Error",
            description: "Drop not supported for this table",
            variant: "destructive"
          })
          return
      }

      // Call API to drop all documents in the collection
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminPassword,
          dropAll: true,
          collection: collectionName 
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Success",
          description: `Dropped all records from ${getTableName()} database`,
        })

        // Clear local state after successful drop
        switch (activeTab) {
          case "capabilities":
            setCapabilities([])
            setFilteredCapabilities([])
            break
          case "test-methods":
            setTestMethods([])
            setFilteredTestMethods([])
            break
          case "equipment":
            setEquipment([])
            setFilteredEquipment([])
            break
          case "locations":
            setLocations([])
            setFilteredLocations([])
            break
          case "io-numbers":
            setIoNumbers([])
            setFilteredIONumbers([])
            break
          case "commercial-samples":
            setCommercialSamples([])
            setFilteredCommercialSamples([])
            break
          case "app-tech-list":
            setAppTechList([])
            setFilteredAppTechList([])
            break
          case "plant-reactors":
            setPlantReactors([])
            setFilteredPlantReactors([])
            break
        }
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to drop database",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error dropping database:', error)
      toast({
        title: "Error",
        description: "Failed to drop database",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setAdminPassword("")
      setPasswordError(false)
      setShowDropDialog(false)
    }
  }

  // Function to get CSV headers for the current table
  const getTableHeaders = (): string[] => {
    switch (activeTab) {
      case "users":
        return [
          "email",
          "fullName",
          "position",
          "department",
          "division",
          "costCenter.code",
          "costCenter.name",
          "role",
          "capabilities",
          "approvers",
          "onBehalfAccess",
          "isActive",
          "aadObjectId",
          "preferences.language",
          "preferences.notifications.email",
          "preferences.notifications.inApp",
        ]
      case "capabilities":
        return [
          "capabilityName",
          "shortName",
          "capabilityDesc",
          "locationId",
          "capHeadGroup",
          "reqRunNo",
          "reqAsrRunNo"
        ]
      case "test-methods":
        return [
          "methodCode",
          "testingName",
          "detailTh",
          "detailEng",
          "keyResult",
          "price",
          "priorityPrice",
          "unit",
          "sampleAmount",
          "workingHour",
          "testingTime",
          "resultAnalysisTime",
          "analysisLeadtime",
          "equipmentName",
          "equipmentId",
          "locationId",
          "capabilityId",
          "serviceType",
          "methodType",
          "managable",
          "erSlotTime",
          "erTimeStart",
          "erTimeEnd",
          "noSamplePerYear",
          "methodAsset",
          "methodFoh",
          "methodStatus",
          "priceNote",
          "priceEffectiveDate"
        ]
      case "equipment":
        return [
          "equipmentCode",
          "equipmentName",
          "equipmentFunction",
          "model",
          "manufacturer",
          "usedDate",
          "equipmentCondition",
          "typeInEx",
          "mainMonitor",
          "serviceTime",
          "pmInYear",
          "calInYear",
          "serviceDayPerWeek",
          "aServiceDayPerWeek",
          "workloadFactor",
          "workloadFactorDescription",
          "serviceTimeStart",
          "serviceTimeEnd",
          "capPerDay",
          "serviceNormalDuration",
          "serviceErDuration",
          "equipmentScope",
          "range",
          "accuracy",
          "allowance",
          "rangeOfUse",
          "pmBy",
          "pmFreq",
          "calBy",
          "calFreq",
          "distributor",
          "location",
          "operationDocument",
          "respBy",
          "respByComplianceAssetId",
          "equipmentStatus",
          "equipmentType",
          "primaryId",
          "primaryCode",
          "componentId",
          "componentCode",
          "accessoryId",
          "accessoryCode",
          "equipmentFunctionAll",
          "obsoleteDate",
          "remark",
          "obsoleteReason",
          "targetDuration",
          "locationId",
          "equipmentImage"
        ]
      case "locations":
        return ["locationId", "sublocation", "contactPerson"]
      case "io-numbers":
        return [
          "ioNumber",
          "name",
          "responsible",
          "costCenter.code",
          "costCenter.name",
          "company",
          "status",
          "mappingInfo.mappingIO",
          "mappingInfo.mappingName",
          "ioType",
          "members",
          "testSpending",
          "isTechsprint",
          "techProgram",
          "asset",
          "isArchived",
        ]
      case "requests":
        return [
          "requestNumber",
          "requestType",
          "priority",
          "capabilityId",
          "title",
          "requester.email",
          "requester.name",
          "requester.costCenter",
          "onBehalf.isOnBehalf",
          "billing.ioNumber",
          "billing.ioName",
          "billing.costCenter",
          "billing.company",
          "status",
          "urgentMemo",
          "dataPool",
          "returnAddress",
          "supportInfo.staffEmail",
          "supportInfo.staffName",
          "isTechsprint",
          "costSpendingType",
          "isArchived",
        ]
      case "asr-requests":
        return [
          "asrId",
          "title",
          "requester.email",
          "requester.name",
          "requester.costCenter",
          "billing.ioNumber",
          "billing.ioName",
          "billing.costCenter",
          "billing.company",
          "details.problemSource",
          "details.objectives",
          "details.availableSamples",
          "primaryCapability.capabilityId",
          "primaryCapability.name",
          "status",
          "relatedRequests",
          "isArchived",
        ]
      case "smart-assistant":
        return ["propertyName", "propertyDescription", "category", "isActive"]
      case "queue-management":
        return [
          "equipmentId",
          "capabilityId",
          "queueStatus",
          "estimatedWaitTime",
          "pendingTests",
          "currentCapacity",
          "urgentSlots",
          "normalSlots",
        ]
      case "commercial-samples":
        return ["gradeName", "application", "polymerType", "isActive"]
      case "app-tech-list":
        return ["name", "shortCode", "techType", "description", "isActive"]
      case "plant-reactors":
        return ["name", "reactorShortName", "description", "isActive"]
      case "notifications":
        return ["userEmail", "type", "title", "message", "relatedTo.type", "relatedTo.id", "status", "priority"]
      case "activity-logs":
        return ["userEmail", "action", "entityType", "entityId", "ipAddress", "userAgent"]
      default:
        return []
    }
  }

  // Function to get the current table data
  const getTableData = (): any[] => {
    switch (activeTab) {
      case "users":
        return users
      case "capabilities":
        return capabilities
      case "test-methods":
        // Simple export format that matches import expectations exactly
        return testMethods.map(method => ({
          methodCode: method.methodCode || '',
          testingName: method.testingName || '',
          detailTh: method.detailTh || '',
          detailEng: method.detailEng || '',
          keyResult: method.keyResult || '',
          price: method.price || '0',
          priorityPrice: method.priorityPrice || '0',
          unit: method.unit || 'THB',
          sampleAmount: method.sampleAmount || 0,
          workingHour: method.workingHour || 8,
          testingTime: method.testingTime || 0,
          resultAnalysisTime: method.resultAnalysisTime || 0,
          analysisLeadtime: method.analysisLeadtime || 0,
          equipmentName: method.equipmentName || '',
          equipmentId: method.equipmentId || '',
          locationId: method.locationId || '',
          capabilityId: method.capabilityId || '',
          serviceType: Array.isArray(method.serviceType) ? method.serviceType.join(',') : (method.serviceType || ''),
          methodType: method.methodType || '',
          managable: method.managable || 'Yes',
          erSlotTime: method.erSlotTime || 0,
          erTimeStart: method.erTimeStart || 0,
          erTimeEnd: method.erTimeEnd || 0,
          noSamplePerYear: method.noSamplePerYear || 0,
          methodAsset: method.methodAsset || '',
          methodFoh: method.methodFoh || '',
          methodStatus: method.methodStatus || 'Active',
          priceNote: method.priceNote || '',
          priceEffectiveDate: method.priceEffectiveDate || ''
        }))
      case "equipment":
        // Transform equipment back to flat structure for export
        return equipment.map(eq => ({
          equipmentCode: eq.code || eq.equipmentCode || '',
          equipmentName: eq.name || eq.equipmentName || '',
          equipmentFunction: eq.function || eq.equipmentFunction || '',
          model: eq.specifications?.model || eq.model || '',
          manufacturer: eq.specifications?.manufacturer || eq.manufacturer || '',
          usedDate: eq.usedDate || '',
          equipmentCondition: eq.specifications?.condition || eq.equipmentCondition || '',
          typeInEx: eq.typeInEx || '',
          mainMonitor: eq.mainMonitor || '',
          serviceTime: eq.serviceTime || 0,
          pmInYear: eq.maintenance?.pmFrequency || eq.pmInYear || 0,
          calInYear: eq.maintenance?.calFrequency || eq.calInYear || 0,
          serviceDayPerWeek: eq.serviceCapacity?.daysPerWeek || eq.serviceDayPerWeek || 0,
          aServiceDayPerWeek: eq.serviceCapacity?.actualDaysPerWeek || eq.aServiceDayPerWeek || 0,
          workloadFactor: eq.workloadFactor || 0,
          workloadFactorDescription: eq.workloadFactorDescription || '',
          serviceTimeStart: eq.serviceCapacity?.startTime || eq.serviceTimeStart || 0,
          serviceTimeEnd: eq.serviceCapacity?.endTime || eq.serviceTimeEnd || 0,
          capPerDay: eq.serviceCapacity?.capacityPerDay || eq.capPerDay || 0,
          serviceNormalDuration: eq.serviceNormalDuration || 0,
          serviceErDuration: eq.serviceErDuration || 0,
          equipmentScope: eq.specifications?.scope || eq.equipmentScope || '',
          range: eq.range || '',
          accuracy: eq.accuracy || '',
          allowance: eq.allowance || '',
          rangeOfUse: eq.rangeOfUse || '',
          pmBy: eq.maintenance?.pmBy || eq.pmBy || '',
          pmFreq: eq.pmFreq || '',
          calBy: eq.maintenance?.calBy || eq.calBy || '',
          calFreq: eq.calFreq || '',
          distributor: eq.distributor || '',
          location: eq.location?.name || eq.location || '',
          operationDocument: eq.operationDocument || '',
          respBy: eq.respBy || '',
          respByComplianceAssetId: eq.respByComplianceAssetId || '',
          equipmentStatus: eq.status || eq.equipmentStatus || '',
          equipmentType: eq.specifications?.type || eq.equipmentType || '',
          primaryId: eq.primaryId || '',
          primaryCode: eq.primaryCode || '',
          componentId: eq.componentId || '',
          componentCode: eq.componentCode || '',
          accessoryId: eq.accessoryId || '',
          accessoryCode: eq.accessoryCode || '',
          equipmentFunctionAll: eq.equipmentFunctionAll || '',
          obsoleteDate: eq.obsoleteDate || '',
          remark: eq.remark || '',
          obsoleteReason: eq.obsoleteReason || '',
          targetDuration: eq.targetDuration || 0,
          locationId: eq.location?.locationId || eq.locationId || '',
          equipmentImage: eq.equipmentImage || ''
        }))
      case "locations":
        return locations
      case "io-numbers":
        return ioNumbers
      case "requests":
        return requests
      case "asr-requests":
        return asrRequests
      case "smart-assistant":
        return smartAssistant
      case "queue-management":
        return queueManagement
      case "commercial-samples":
        return commercialSamples
      case "app-tech-list":
        return appTechList
      case "plant-reactors":
        return plantReactors
      case "notifications":
        return notifications
      case "activity-logs":
        return activityLogs
      default:
        return []
    }
  }

  // Function to get the current table name
  const getTableName = (): string => {
    switch (activeTab) {
      case "users":
        return "Users"
      case "capabilities":
        return "Capabilities"
      case "test-methods":
        return "Test Methods"
      case "equipment":
        return "Equipment"
      case "locations":
        return "Locations"
      case "io-numbers":
        return "IO Numbers"
      case "requests":
        return "Requests"
      case "asr-requests":
        return "ASR Requests"
      case "smart-assistant":
        return "Smart Assistant"
      case "queue-management":
        return "Queue Management"
      case "commercial-samples":
        return "Commercial Samples"
      case "app-tech-list":
        return "App Tech List"
      case "plant-reactors":
        return "Plant Reactors"
      case "notifications":
        return "Notifications"
      case "activity-logs":
        return "Activity Logs"
      default:
        return ""
    }
  }

  // Function to filter tabs based on global search with improved matching
  useEffect(() => {
    // Define all available tabs
    const allTabs = [
      "users",
      "capabilities",
      "test-methods",
      "equipment",
      "locations",
      "io-numbers",
      "requests",
      "asr-requests",
      "smart-assistant",
      "queue-management",
      "commercial-samples",
      "app-tech-list",
      "plant-reactors",
      "notifications",
      "activity-logs",
    ];

    // Define display names and aliases for better matching
    const tabAliases: Record<string, string[]> = {
      "users": ["user", "users", "user management", "user table"],
      "capabilities": ["capability", "capabilities", "capability management"],
      "test-methods": ["test", "method", "test method", "test methods", "testing method", "testing methods"],
      "equipment": ["equipment", "equipments", "machine", "machines", "device", "devices"],
      "locations": ["location", "locations", "place", "places", "site", "sites"],
      "io-numbers": ["io", "io number", "io numbers", "io-number", "io-numbers"],
      "requests": ["request", "requests", "request management"],
      "asr-requests": ["asr", "asr request", "asr requests", "advanced service request"],
      "smart-assistant": ["smart", "assistant", "smart assistant", "ai", "help"],
      "queue-management": ["queue", "queues", "queue management"],
      "commercial-samples": ["commercial", "sample", "samples", "commercial sample", "commercial samples", "grade"],
      "app-tech-list": ["app", "tech", "application", "technology", "app tech", "app-tech"],
      "plant-reactors": ["plant", "reactor", "reactors", "plant reactor", "plant reactors"],
      "notifications": ["notification", "notifications", "alert", "alerts"],
      "activity-logs": ["activity", "log", "logs", "activity log", "activity logs", "history"],
    };

    if (globalSearchTerm) {
      const searchLower = globalSearchTerm.toLowerCase().trim();

      // First, try exact matches with tab names and aliases
      let filtered = allTabs.filter(tab => {
        // Check if the search term matches the tab name
        if (tab.includes(searchLower)) return true;

        // Check if the search term matches any of the aliases
        const displayName = tab.replace(/-/g, " ");
        if (displayName.includes(searchLower)) return true;

        // Check aliases
        return tabAliases[tab]?.some(alias => alias.includes(searchLower)) || false;
      });

      // If no exact matches, try partial word matching
      if (filtered.length === 0) {
        filtered = allTabs.filter(tab => {
          // Split search term into words
          const searchWords = searchLower.split(/\s+/);

          // Check if any word in the search term matches the tab name or aliases
          return searchWords.some(word => {
            if (tab.includes(word)) return true;
            const displayName = tab.replace(/-/g, " ");
            if (displayName.includes(word)) return true;
            return tabAliases[tab]?.some(alias => alias.includes(word)) || false;
          });
        });
      }

      // Sort results by relevance (exact matches first)
      filtered.sort((a, b) => {
        const aDisplayName = a.replace(/-/g, " ");
        const bDisplayName = b.replace(/-/g, " ");

        // Exact matches get highest priority
        const aExactMatch = a === searchLower || aDisplayName === searchLower;
        const bExactMatch = b === searchLower || bDisplayName === searchLower;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Starts with gets second priority
        const aStartsWith = a.startsWith(searchLower) || aDisplayName.startsWith(searchLower);
        const bStartsWith = b.startsWith(searchLower) || bDisplayName.startsWith(searchLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Contains gets third priority
        const aContains = a.includes(searchLower) || aDisplayName.includes(searchLower);
        const bContains = b.includes(searchLower) || bDisplayName.includes(searchLower);

        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;

        // Default to alphabetical order
        return a.localeCompare(b);
      });

      setFilteredTabs(filtered.length > 0 ? filtered : allTabs);
    } else {
      setFilteredTabs(allTabs);
    }
  }, [globalSearchTerm])

  // Function to get the displayed records based on showAllRecords state
  const getDisplayedRecords = (records: any[]) => {
    if (showAllRecords) {
      return records;
    }
    // Return only the latest 15 records
    return records.slice(0, 15);
  };

  // Function to render the appropriate table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "users":
        const displayedUsers = getDisplayedRecords(filteredUsers);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedUsers.length} of {filteredUsers.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Approvers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {Array.isArray(user.capabilities) && user.capabilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.capabilities.map((capId: string) => {
                            const capability = allCapabilities.find((c) => c._id === capId);
                            return (
                              <span key={capId} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                {capability ? (capability.capabilityName || capability.shortName) : capId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(user.approvers) && user.approvers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.approvers.map((approverId: string) => {
                            console.log('Looking for approver with ID:', approverId);
                            console.log('Available users:', users.map(u => ({ id: u.id, _id: u._id, name: u.name })));

                            const approver = users.find((u) => {
                              const userId = u._id || u.id;
                              const match = userId === approverId;
                              if (match) console.log('Found matching user:', u.name);
                              return match;
                            });

                            if (approver) {
                              // Create a descriptive string with available user information
                              const details = [
                                approver.position,
                                approver.department,
                                approver.division
                              ].filter(Boolean);

                              return (
                                <div key={approverId} className="flex flex-col">
                                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                    {approver.name || approver.fullName || approver.email}
                                  </span>
                                  {details.length > 0 && (
                                    <span className="text-xs text-muted-foreground ml-2 mt-0.5">
                                      {details.join(' • ')}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <span key={approverId} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                {approverId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDefaultAdmin(user.id) || isLoading}
                          title={isDefaultAdmin(user.id) ? "Default admin cannot be deleted" : "Delete user"}
                          onClick={() => handleDelete(user, 'user')}
                        >
                          <Trash2 className={`h-4 w-4 ${isDefaultAdmin(user.id) ? "text-gray-300" : "text-red-500"}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )
      case "capabilities":
        const displayedCapabilities = getDisplayedRecords(filteredCapabilities);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedCapabilities.length} of {filteredCapabilities.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability Name</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Head Group</TableHead>
                  <TableHead>Request Run No</TableHead>
                  <TableHead>ASR Run No</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCapabilities.map((capability) => (
                  <TableRow key={capability.id}>
                    <TableCell>{capability.capabilityName}</TableCell>
                    <TableCell>{capability.shortName}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={capability.capabilityDesc}>
                      {capability.capabilityDesc}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Handle both populated and non-populated locationId
                        if (capability.locationId) {
                          // If it's a populated object
                          if (typeof capability.locationId === 'object' && capability.locationId._id) {
                            const location = capability.locationId;
                            return (
                              <div className="flex flex-col">
                                <span>{location.sublocation || location.locationId}</span>
                                {location.address && <span className="text-xs text-muted-foreground">{location.address}</span>}
                              </div>
                            );
                          }

                          // If it's just an ID, try to find the location
                          const location = locations.find(loc =>
                            loc._id === capability.locationId ||
                            (loc._id && capability.locationId && loc._id.toString() === capability.locationId.toString())
                          );

                          if (location) {
                            return (
                              <div className="flex flex-col">
                                <span>{location.sublocation || location.locationId}</span>
                                {location.address && <span className="text-xs text-muted-foreground">{location.address}</span>}
                              </div>
                            );
                          }

                          // If we can't find the location, just show the ID
                          return <span>{capability.locationId.toString()}</span>;
                        }

                        // Default case - no location
                        return <span className="text-muted-foreground">None</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Handle both populated and non-populated capHeadGroup
                        if (capability.capHeadGroup) {
                          // If it's a populated object
                          if (typeof capability.capHeadGroup === 'object' && capability.capHeadGroup.name) {
                            const headUser = capability.capHeadGroup;
                            const displayName = headUser.name || headUser.username || headUser.email;
                            const position = headUser.position ? headUser.position : '';
                            const department = headUser.department ? headUser.department : '';
                            const division = headUser.division ? headUser.division : '';

                            return (
                              <div className="font-medium">
                                <div>{displayName}</div>
                                {position && <div className="text-xs text-muted-foreground">{position}</div>}
                                {department && <div className="text-xs text-muted-foreground">{department}</div>}
                                {division && <div className="text-xs text-muted-foreground">{division}</div>}
                              </div>
                            );
                          }
                          // If it's just an ID, try to find the user
                          else if (typeof capability.capHeadGroup === 'string' && capability.capHeadGroup !== "none") {
                            // Find the user by ID
                            const headUser = users.find(user => {
                              const userId = user._id || user.id;
                              return userId === capability.capHeadGroup;
                            });

                            if (headUser) {
                              const displayName = headUser.name || headUser.fullName || headUser.username || headUser.email;
                              const position = headUser.position ? headUser.position : '';
                              const department = headUser.department ? headUser.department : '';
                              const division = headUser.division ? headUser.division : '';

                              return (
                                <div className="font-medium">
                                  <div>{displayName}</div>
                                  {position && <div className="text-xs text-muted-foreground">{position}</div>}
                                  {department && <div className="text-xs text-muted-foreground">{department}</div>}
                                  {division && <div className="text-xs text-muted-foreground">{division}</div>}
                                </div>
                              );
                            } else {
                              // If user not found, show a warning
                              return <span className="text-amber-500">User not found</span>;
                            }
                          }
                        }

                        // Default case - no head group or not found
                        return <span className="text-muted-foreground">None</span>;
                      })()}
                    </TableCell>
                    <TableCell>{capability.reqRunNo}</TableCell>
                    <TableCell>{capability.reqAsrRunNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(capability)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading}
                          onClick={() => handleDelete(capability, 'capability')}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )
      case "test-methods":
        const displayedTestMethods = getDisplayedRecords(filteredTestMethods);
        return filteredTestMethods.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedTestMethods.length} of {filteredTestMethods.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Description (EN)</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Standard Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTestMethods.map((method) => {
                  console.log('Rendering test method:', method);
                  console.log('Method code for display:', method.methodCode);
                  console.log('Price data:', { price: method.price, pricing: method.pricing });
                  return (
                <TableRow key={method.id}>
                  <TableCell>{method.methodCode || '-'}</TableCell>
                  <TableCell>{method.name || method.testingName || '-'}</TableCell>
                  <TableCell>
                    {method.capability ?
                      (method.capability.capabilityName || method.capability.shortName) :
                      (method.capabilityId && typeof method.capabilityId === 'object' ?
                        (method.capabilityId.capabilityName || method.capabilityId.shortName) :
                        'None')}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={method.description?.en || ''}>
                    {method.description?.en || ''}
                  </TableCell>
                  <TableCell>
                    {method.images && (method.images.keyResult || method.images.description) ? (
                      <div className="flex items-center space-x-2">
                        {method.images.keyResult && (
                          <div className="flex flex-col items-center">
                            {(() => {
                              // Get download URL based on image data type
                              let downloadUrl = '';
                              let fileName = 'key-result-image';

                              if (typeof method.images.keyResult === 'string') {
                                // Check if it's a full URL (starts with http:// or https://)
                                if (method.images.keyResult.startsWith('http://') || method.images.keyResult.startsWith('https://')) {
                                  // For external URLs, use them directly
                                  downloadUrl = method.images.keyResult;
                                  fileName = method.images.keyResult.split('/').pop() || 'key-result-image';
                                } else if (method.images.keyResult.startsWith('/')) {
                                  // For local paths starting with /, use them directly
                                  downloadUrl = method.images.keyResult;
                                  fileName = method.images.keyResult.split('/').pop() || 'key-result-image';
                                } else {
                                  // For other strings, assume they're IDs for the /api/files/ endpoint
                                  downloadUrl = `/api/files/${method.images.keyResult}`;
                                  fileName = method.images.keyResult.split('/').pop() || 'key-result-image';
                                }
                              } else if (typeof method.images.keyResult === 'object' && method.images.keyResult !== null) {
                                if (method.images.keyResult._id) {
                                  downloadUrl = `/api/files/${method.images.keyResult._id}`;
                                  fileName = method.images.keyResult._id.toString().split('/').pop() || 'key-result-image';
                                }
                              }

                              if (downloadUrl) {
                                return (
                                  <>
                                    <div className="w-16 h-16 relative border rounded overflow-hidden mb-1">
                                      <img
                                        src={`${downloadUrl}?t=${Date.now()}`}
                                        alt="Key result"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `<div class="flex items-center justify-center h-full bg-gray-100 text-xs text-red-500">Failed to load</div>`;
                                          }
                                        }}
                                      />
                                    </div>
                                    <a
                                      href={downloadUrl}
                                      download={fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Key Result</span>
                                    </a>
                                  </>
                                );
                              } else {
                                return (
                                  <span className="text-muted-foreground text-xs flex items-center">
                                    <FileX className="h-4 w-4 mr-1" />
                                    No image
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        )}
                        {!method.images.keyResult && method.images.description && (
                          <div className="flex flex-col items-center">
                            {(() => {
                              // Get download URL based on image data type
                              let downloadUrl = '';
                              let fileName = 'description-image';

                              if (typeof method.images.description === 'string') {
                                // Check if it's a full URL (starts with http:// or https://)
                                if (method.images.description.startsWith('http://') || method.images.description.startsWith('https://')) {
                                  // For external URLs, use them directly
                                  downloadUrl = method.images.description;
                                  fileName = method.images.description.split('/').pop() || 'description-image';
                                } else if (method.images.description.startsWith('/')) {
                                  // For local paths starting with /, use them directly
                                  downloadUrl = method.images.description;
                                  fileName = method.images.description.split('/').pop() || 'description-image';
                                } else {
                                  // For other strings, assume they're IDs for the /api/files/ endpoint
                                  downloadUrl = `/api/files/${method.images.description}`;
                                  fileName = method.images.description.split('/').pop() || 'description-image';
                                }
                              } else if (typeof method.images.description === 'object' && method.images.description !== null) {
                                if (method.images.description._id) {
                                  downloadUrl = `/api/files/${method.images.description._id}`;
                                  fileName = method.images.description._id.toString().split('/').pop() || 'description-image';
                                }
                              }

                              if (downloadUrl) {
                                return (
                                  <>
                                    <div className="w-16 h-16 relative border rounded overflow-hidden mb-1">
                                      <img
                                        src={`${downloadUrl}?t=${Date.now()}`}
                                        alt="Description"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent) {
                                            parent.innerHTML = `<div class="flex items-center justify-center h-full bg-gray-100 text-xs text-red-500">Failed to load</div>`;
                                          }
                                        }}
                                      />
                                    </div>
                                    <a
                                      href={downloadUrl}
                                      download={fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Description</span>
                                    </a>
                                  </>
                                );
                              } else {
                                return (
                                  <span className="text-muted-foreground text-xs flex items-center">
                                    <FileX className="h-4 w-4 mr-1" />
                                    No image
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No image</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(method.serviceType) 
                      ? method.serviceType.join(', ') 
                      : (method.serviceType || 'N/A')}
                  </TableCell>
                  <TableCell>
                    {method.priceDisplay || method.price || '0'} {method.unit || 'THB'}
                  </TableCell>
                  <TableCell>{method.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        onClick={() => handleDelete(method, 'test-method')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Test Methods Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              There are no test methods in the database yet. You can add a new test method using the button below.
            </p>
            <Button onClick={() => setShowAddTestMethodDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Test Method
            </Button>
          </div>
        )
      case "equipment":
        const displayedEquipment = getDisplayedRecords(filteredEquipment);
        return filteredEquipment.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedEquipment.length} of {filteredEquipment.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Equipment Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Function</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEquipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>
                    {eq.equipmentImage ? (
                      <div className="flex flex-col items-center">
                        {(() => {
                          // Get download URL based on image data type
                          let downloadUrl = '';
                          let fileName = 'equipment-image';

                          if (typeof eq.equipmentImage === 'string') {
                            // Check if it's a full URL (starts with http:// or https://)
                            if (eq.equipmentImage.startsWith('http://') || eq.equipmentImage.startsWith('https://')) {
                              // For external URLs, use them directly
                              downloadUrl = eq.equipmentImage;
                              fileName = eq.equipmentImage.split('/').pop() || 'equipment-image';
                            } else if (eq.equipmentImage.startsWith('/uploads/equipment_img/')) {
                              // For paths already including the equipment_img subdirectory, use them directly
                              downloadUrl = eq.equipmentImage;
                              fileName = eq.equipmentImage.split('/').pop() || 'equipment-image';
                            } else if (eq.equipmentImage.startsWith('/uploads/')) {
                              // For paths starting with /uploads/ but missing the equipment_img subdirectory
                              // This is likely the case for the error
                              const imageName = eq.equipmentImage.replace('/uploads/', '');
                              downloadUrl = `/uploads/equipment_img/${imageName}`;
                              fileName = imageName;
                              console.log('Corrected equipment image path:', downloadUrl);
                            } else if (eq.equipmentImage.startsWith('/')) {
                              // For other local paths starting with /, use them directly
                              downloadUrl = eq.equipmentImage;
                              fileName = eq.equipmentImage.split('/').pop() || 'equipment-image';
                            } else {
                              // For other strings, assume they're filenames for the equipment_img directory
                              downloadUrl = `/uploads/equipment_img/${eq.equipmentImage}`;
                              fileName = eq.equipmentImage.split('/').pop() || 'equipment-image';
                            }
                          } else if (typeof eq.equipmentImage === 'object' && eq.equipmentImage !== null) {
                            // Handle if it's an object (could be a Binary object from MongoDB)
                            console.log('Equipment image is an object:', eq.equipmentImage);
                            if (eq.equipmentImage.buffer) {
                              try {
                                // Try to convert Binary to string
                                const binaryString = eq.equipmentImage.toString();
                                if (binaryString.startsWith('/uploads/equipment_img/')) {
                                  // Path already includes the equipment_img subdirectory
                                  downloadUrl = binaryString;
                                  fileName = binaryString.split('/').pop() || 'equipment-image';
                                } else if (binaryString.startsWith('/uploads/')) {
                                  // Path is missing the equipment_img subdirectory
                                  const imageName = binaryString.replace('/uploads/', '');
                                  downloadUrl = `/uploads/equipment_img/${imageName}`;
                                  fileName = imageName;
                                  console.log('Corrected equipment image path from binary:', downloadUrl);
                                }
                              } catch (error) {
                                console.error('Error processing Binary equipmentImage:', error);
                              }
                            }
                          }

                          console.log('Equipment image download URL:', downloadUrl);

                          if (downloadUrl) {
                            return (
                              <>
                                <div className="w-16 h-16 relative border rounded overflow-hidden mb-1">
                                  <img
                                    src={`${downloadUrl}?t=${Date.now()}`}
                                    alt={eq.name || eq.equipmentName}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      console.error('Image failed to load:', downloadUrl);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<div class="flex items-center justify-center h-full bg-gray-100 text-xs text-red-500">Failed to load</div>`;
                                      }
                                    }}
                                  />
                                </div>
                                <a
                                  href={downloadUrl}
                                  download={fileName}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Image</span>
                                </a>
                              </>
                            );
                          } else {
                            return (
                              <span className="text-muted-foreground text-xs flex items-center">
                                <FileX className="h-4 w-4 mr-1" />
                                No image
                              </span>
                            );
                          }
                        })()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No image</span>
                    )}
                  </TableCell>
                  <TableCell>{eq.code || eq.equipmentCode}</TableCell>
                  <TableCell>{eq.name || eq.equipmentName}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={eq.function || eq.equipmentFunction}>
                    {eq.function || eq.equipmentFunction}
                  </TableCell>
                  <TableCell>{eq.specifications?.manufacturer || eq.manufacturer}</TableCell>
                  <TableCell>{eq.specifications?.model || eq.model}</TableCell>
                  <TableCell>{typeof eq.location === 'object' && eq.location?.name ? eq.location.name : (typeof eq.location === 'string' ? eq.location : '')}</TableCell>
                  <TableCell>{eq.status || eq.equipmentStatus || "Active"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(eq)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        onClick={() => handleDelete(eq, 'equipment')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Equipment Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              There is no equipment in the database yet. You can add new equipment using the button below.
            </p>
            <Button onClick={() => setShowAddEquipmentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Equipment
            </Button>
          </div>
        )
      case "locations":
        const displayedLocations = getDisplayedRecords(filteredLocations);
        return filteredLocations.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedLocations.length} of {filteredLocations.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location ID</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.locationId}</TableCell>
                  <TableCell>{location.contactPerson}</TableCell>
                  <TableCell>{location.contactNumber}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={location.address}>
                    {location.address}
                  </TableCell>
                  <TableCell>{location.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        onClick={() => handleDelete(location, 'location')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Locations Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              There are no locations in the database yet. You can add a new location using the button below.
            </p>
            <Button onClick={() => setShowAddLocationDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Location
            </Button>
          </div>
        )
      case "io-numbers":
        const displayedIONumbers = getDisplayedRecords(filteredIONumbers);
        return filteredIONumbers.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedIONumbers.length} of {filteredIONumbers.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IO Number</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Cost Center</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedIONumbers.map((io) => (
                <TableRow key={io.id}>
                  <TableCell>{io.ioNumber}</TableCell>
                  <TableCell>{io.name}</TableCell>
                  <TableCell>{io.responsible}</TableCell>
                  <TableCell>
                    {io.costCenter && io.costCenter.code ? `${io.costCenter.code} - ${io.costCenter.name}` : ''}
                  </TableCell>
                  <TableCell>{io.company}</TableCell>
                  <TableCell>{io.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(io)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        onClick={() => handleDelete(io, 'io-number')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No IO Numbers Found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              There are no IO numbers in the database yet. You can add a new IO number using the button below.
            </p>
            <Button onClick={() => setShowAddIoDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New IO Number
            </Button>
          </div>
        )
      case "requests":
        const displayedRequests = getDisplayedRecords(filteredRequests);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedRequests.length} of {filteredRequests.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.requestNumber}</TableCell>
                  <TableCell>{request.requestType}</TableCell>
                  <TableCell>{request.priority}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={request.title}>
                    {request.title}
                  </TableCell>
                  <TableCell>{request.requester.name}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(request)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "asr-requests":
        const displayedASRRequests = getDisplayedRecords(filteredASRRequests);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedASRRequests.length} of {filteredASRRequests.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ASR ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Primary Capability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedASRRequests.map((asr) => (
                <TableRow key={asr.id}>
                  <TableCell>{asr.asrId}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={asr.title}>
                    {asr.title}
                  </TableCell>
                  <TableCell>{asr.requester.name}</TableCell>
                  <TableCell>{asr.primaryCapability.name}</TableCell>
                  <TableCell>{asr.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(asr)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "smart-assistant":
        const displayedSmartAssistant = getDisplayedRecords(filteredSmartAssistant);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedSmartAssistant.length} of {filteredSmartAssistant.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Recommended Methods</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSmartAssistant.map((sa) => (
                <TableRow key={sa.id}>
                  <TableCell>{sa.propertyName}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={sa.propertyDescription}>
                    {sa.propertyDescription}
                  </TableCell>
                  <TableCell>{sa.category}</TableCell>
                  <TableCell>{sa.recommendedMethods.length}</TableCell>
                  <TableCell>{sa.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(sa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "queue-management":
        const displayedQueueManagement = getDisplayedRecords(filteredQueueManagement);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedQueueManagement.length} of {filteredQueueManagement.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Queue Status</TableHead>
                  <TableHead>Wait Time (days)</TableHead>
                  <TableHead>Pending Tests</TableHead>
                  <TableHead>Current Capacity</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedQueueManagement.map((qm) => (
                <TableRow key={qm.id}>
                  <TableCell>{equipment.find((eq) => eq.id === qm.equipmentId)?.name || qm.equipmentId}</TableCell>
                  <TableCell>
                    {capabilities.find((cap) => cap.id === qm.capabilityId)?.name || qm.capabilityId}
                  </TableCell>
                  <TableCell>{qm.queueStatus}</TableCell>
                  <TableCell>{qm.estimatedWaitTime}</TableCell>
                  <TableCell>{qm.pendingTests}</TableCell>
                  <TableCell>{qm.currentCapacity}%</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(qm)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "commercial-samples":
        const displayedCommercialSamples = getDisplayedRecords(filteredCommercialSamples);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedCommercialSamples.length} of {filteredCommercialSamples.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade Name</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Polymer Type</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCommercialSamples.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell>{cs.gradeName}</TableCell>
                  <TableCell>{cs.application}</TableCell>
                  <TableCell>{cs.polymerType}</TableCell>
                  <TableCell>{cs.properties.length} properties</TableCell>
                  <TableCell>{cs.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cs)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "app-tech-list":
        const displayedAppTechList = getDisplayedRecords(filteredAppTechList);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedAppTechList.length} of {filteredAppTechList.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Short Code</TableHead>
                  <TableHead>Tech Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAppTechList.map((atl) => (
                <TableRow key={atl.id}>
                  <TableCell>{atl.name}</TableCell>
                  <TableCell>{atl.shortCode}</TableCell>
                  <TableCell>{atl.techType}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={atl.description}>
                    {atl.description}
                  </TableCell>
                  <TableCell>{atl.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(atl)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "plant-reactors":
        const displayedPlantReactors = getDisplayedRecords(filteredPlantReactors);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedPlantReactors.length} of {filteredPlantReactors.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reactor Short Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPlantReactors.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>{pr.name}</TableCell>
                  <TableCell>{pr.reactorShortName}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={pr.description}>
                    {pr.description}
                  </TableCell>
                  <TableCell>{pr.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pr)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "notifications":
        const displayedNotifications = getDisplayedRecords(filteredNotifications);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedNotifications.length} of {filteredNotifications.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedNotifications.map((notif) => (
                <TableRow key={notif.id}>
                  <TableCell>{notif.userEmail}</TableCell>
                  <TableCell>{notif.type}</TableCell>
                  <TableCell>{notif.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={notif.message}>
                    {notif.message}
                  </TableCell>
                  <TableCell>{notif.status}</TableCell>
                  <TableCell>{notif.priority}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(notif)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      case "activity-logs":
        const displayedActivityLogs = getDisplayedRecords(filteredActivityLogs);
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {displayedActivityLogs.length} of {filteredActivityLogs.length} records
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                {showAllRecords ? "Show Latest 15" : "Show All Records"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedActivityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.userEmail}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Database Configuration</h1>
          <p className="text-muted-foreground">Manage dynamic data used throughout the PCRD Smart Request System</p>
        </div>

        {/* Global Database Search with Real-time Matching */}
        <div className="flex items-center relative mb-4">
          <Search className="absolute left-3 h-5 w-5 text-muted-foreground z-10" />
          <div className="relative w-full">
            <Input
              placeholder="Search database name..."
              value={globalSearchTerm}
              onChange={handleGlobalSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 pr-10 py-6 text-lg"
            />
            {globalSearchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={clearGlobalSearch}>
                <X className="h-5 w-5" />
              </Button>
            )}

            {/* Real-time matching results dropdown */}
            {globalSearchTerm && (
              <div className="absolute w-full mt-1 rounded-md border bg-white shadow-lg z-50">
                <div className="p-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Matching Tables</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {filteredTabs.length > 0 ? (
                      filteredTabs.map((tab) => {
                        // Get the display name for the tab
                        let displayName = tab.replace(/-/g, " ");
                        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                        // Determine which group this tab belongs to
                        let groupColor = "bg-gray-100";
                        let textColor = "text-gray-800";
                        let groupName = "System & Utilities";
                        let groupIcon = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        );

                        if (["users", "capabilities"].includes(tab)) {
                          groupColor = "bg-blue-100";
                          textColor = "text-blue-800";
                          groupName = "User Management";
                          groupIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          );
                        } else if (["test-methods", "equipment", "locations"].includes(tab)) {
                          groupColor = "bg-green-100";
                          textColor = "text-green-800";
                          groupName = "Testing & Equipment";
                          groupIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                              <path d="M12 11.5v-6"></path>
                              <path d="M9 11.5h6"></path>
                              <path d="M3 21h18"></path>
                            </svg>
                          );
                        } else if (["requests", "asr-requests", "queue-management"].includes(tab)) {
                          groupColor = "bg-purple-100";
                          textColor = "text-purple-800";
                          groupName = "Request Management";
                          groupIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                              <path d="M9 14h6"></path>
                              <path d="M9 10h6"></path>
                            </svg>
                          );
                        } else if (["commercial-samples", "app-tech-list", "plant-reactors"].includes(tab)) {
                          groupColor = "bg-amber-100";
                          textColor = "text-amber-800";
                          groupName = "Sample Management";
                          groupIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 3v18"></path>
                              <path d="M9 3h6a6 6 0 0 1 0 12H3"></path>
                              <path d="M3 9h6a6 6 0 0 1 0 12H3"></path>
                            </svg>
                          );
                        }

                        // Get specific icon for the table
                        let tableIcon;
                        switch(tab) {
                          case "users":
                            tableIcon = (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            );
                            break;
                          case "capabilities":
                            tableIcon = (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            );
                            break;
                          case "test-methods":
                            tableIcon = (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            );
                            break;
                          default:
                            tableIcon = groupIcon;
                        }

                        // Check if this item is currently selected via keyboard navigation
                        const isSelected = filteredTabs.indexOf(tab) === selectedIndex;

                        return (
                          <button
                            key={tab}
                            className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md
                              ${isSelected ? 'bg-accent text-accent-foreground' : groupColor + ' ' + textColor}
                              hover:bg-gray-50 transition-colors duration-150`}
                            onClick={() => {
                              setActiveTab(tab);
                              clearGlobalSearch();
                            }}
                            onMouseEnter={() => setSelectedIndex(filteredTabs.indexOf(tab))}
                          >
                            <div className="flex items-center">
                              {tableIcon}
                              <span className="font-medium">{displayName}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="mr-1">{groupName}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        No matching tables found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Configure and manage the data used in the system</CardDescription>
            </div>
            <Button onClick={handleAddItem} disabled={newItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" onValueChange={setActiveTab} value={activeTab}>
              <div className="mb-8">
                <Accordion type="multiple" defaultValue={["user-management", "testing-equipment", "request-management", "sample-management", "system-utilities"]} className="w-full">
                  {/* User Management Group */}
                  <AccordionItem value="user-management" className="border rounded-md mb-2 bg-blue-50">
                    <AccordionTrigger className="py-3 px-4 text-base font-medium text-blue-700 hover:no-underline hover:bg-blue-100 rounded-t-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        User Management
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <TabsList className="flex flex-wrap mb-2 bg-white">
                        {filteredTabs.includes("users") && <TabsTrigger value="users" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">Users</TabsTrigger>}
                        {filteredTabs.includes("capabilities") && <TabsTrigger value="capabilities" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">Capabilities</TabsTrigger>}
                      </TabsList>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Testing & Equipment Group */}
                  <AccordionItem value="testing-equipment" className="border rounded-md mb-2 bg-green-50">
                    <AccordionTrigger className="py-3 px-4 text-base font-medium text-green-700 hover:no-underline hover:bg-green-100 rounded-t-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
                          <path d="M12 11.5v-6"></path>
                          <path d="M9 11.5h6"></path>
                          <path d="M3 21h18"></path>
                        </svg>
                        Testing & Equipment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <TabsList className="flex flex-wrap mb-2 bg-white">
                        {filteredTabs.includes("test-methods") && <TabsTrigger value="test-methods" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Test Methods</TabsTrigger>}
                        {filteredTabs.includes("equipment") && <TabsTrigger value="equipment" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Equipment</TabsTrigger>}
                        {filteredTabs.includes("locations") && <TabsTrigger value="locations" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Locations</TabsTrigger>}
                      </TabsList>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Request Management Group */}
                  <AccordionItem value="request-management" className="border rounded-md mb-2 bg-purple-50">
                    <AccordionTrigger className="py-3 px-4 text-base font-medium text-purple-700 hover:no-underline hover:bg-purple-100 rounded-t-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                          <path d="M9 14h6"></path>
                          <path d="M9 10h6"></path>
                        </svg>
                        Request Management
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <TabsList className="flex flex-wrap mb-2 bg-white">
                        {filteredTabs.includes("requests") && <TabsTrigger value="requests" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">Requests</TabsTrigger>}
                        {filteredTabs.includes("asr-requests") && <TabsTrigger value="asr-requests" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">ASR Requests</TabsTrigger>}
                        {filteredTabs.includes("queue-management") && (
                          <TabsTrigger value="queue-management" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">Queue Management</TabsTrigger>
                        )}
                      </TabsList>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Sample Management Group */}
                  <AccordionItem value="sample-management" className="border rounded-md mb-2 bg-amber-50">
                    <AccordionTrigger className="py-3 px-4 text-base font-medium text-amber-700 hover:no-underline hover:bg-amber-100 rounded-t-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 3v18"></path>
                          <path d="M9 3h6a6 6 0 0 1 0 12H3"></path>
                          <path d="M3 9h6a6 6 0 0 1 0 12H3"></path>
                        </svg>
                        Sample Management
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <TabsList className="flex flex-wrap mb-2 bg-white">
                        {filteredTabs.includes("commercial-samples") && (
                          <TabsTrigger value="commercial-samples" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">Commercial Samples</TabsTrigger>
                        )}
                        {filteredTabs.includes("app-tech-list") && (
                          <TabsTrigger value="app-tech-list" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">App Tech List</TabsTrigger>
                        )}
                        {filteredTabs.includes("plant-reactors") && (
                          <TabsTrigger value="plant-reactors" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">Plant Reactors</TabsTrigger>
                        )}
                      </TabsList>
                    </AccordionContent>
                  </AccordionItem>

                  {/* System & Utilities Group */}
                  <AccordionItem value="system-utilities" className="border rounded-md mb-2 bg-gray-50">
                    <AccordionTrigger className="py-3 px-4 text-base font-medium text-gray-700 hover:no-underline hover:bg-gray-100 rounded-t-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        System & Utilities
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1">
                      <TabsList className="flex flex-wrap mb-2 bg-white">
                        {filteredTabs.includes("io-numbers") && <TabsTrigger value="io-numbers" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800">IO Numbers</TabsTrigger>}
                        {filteredTabs.includes("smart-assistant") && (
                          <TabsTrigger value="smart-assistant" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800">Smart Assistant</TabsTrigger>
                        )}
                        {filteredTabs.includes("notifications") && (
                          <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800">Notifications</TabsTrigger>
                        )}
                        {filteredTabs.includes("activity-logs") && (
                          <TabsTrigger value="activity-logs" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800">Activity Logs</TabsTrigger>
                        )}
                      </TabsList>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="flex items-center mb-4 relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab.replace("-", " ")}...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button variant="ghost" size="icon" className="absolute right-2" onClick={clearSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(getTableData(), `${activeTab}-export.csv`)}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />

                </div>

                <div className="flex items-center space-x-2">
                  <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Drop Database
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Drop {getTableName()} Database</DialogTitle>
                        <DialogDescription>
                          This action will delete all data in the {getTableName()} table. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>

                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                          You are about to delete all data in the {getTableName()} table.
                        </AlertDescription>
                      </Alert>

                      <div className="mt-4">
                        <label className="text-sm font-medium">Enter Super Admin Password:</label>
                        <Input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => {
                            setAdminPassword(e.target.value)
                            setPasswordError(false)
                          }}
                          className={passwordError ? "border-red-500" : ""}
                        />
                        {passwordError && <p className="text-sm text-red-500 mt-1">Incorrect password</p>}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDropDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDropDatabase}>
                          Drop Database
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Database className="mr-2 h-4 w-4" />
                        Restore Database
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Restore {getTableName()} Database</DialogTitle>
                        <DialogDescription>
                          This action will clear all existing data and replace it with data from a CSV file.
                        </DialogDescription>
                      </DialogHeader>

                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                          You are about to replace all data in the {getTableName()} table.
                        </AlertDescription>
                      </Alert>

                      <div className="mt-4">
                        <label className="text-sm font-medium">Enter Super Admin Password:</label>
                        <Input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => {
                            setAdminPassword(e.target.value)
                            setPasswordError(false)
                          }}
                          className={passwordError ? "border-red-500" : ""}
                        />
                        {passwordError && <p className="text-sm text-red-500 mt-1">Incorrect password</p>}
                      </div>

                      <div className="mt-4">
                        <label className="text-sm font-medium">Select CSV File:</label>
                        <Input type="file" accept=".csv" onChange={handleFileImport} />
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (adminPassword !== "1133557799") {
                              setPasswordError(true)
                              return
                            }
                            // The actual restore happens in handleFileImport
                            setAdminPassword("")
                            setPasswordError(false)
                            setShowRestoreDialog(false)
                          }}
                        >
                          Restore Database
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <TabsContent value={activeTab} className="border rounded-md p-4">
                {renderTable()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Backup & Restore</CardTitle>
            <CardDescription>Backup your database or restore from a previous backup</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Create a hidden anchor element for download
                  const downloadLink = document.createElement('a');
                  downloadLink.href = '/api/database/backup';
                  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
                  downloadLink.download = `mongodb-backup-${timestamp}.json`;
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);

                  // Update last backup time
                  setLastBackupTime(new Date().toLocaleString());

                  toast({
                    title: "Backup Started",
                    description: "Your database backup is being downloaded",
                  });
                }}
              >
                <Database className="mr-2 h-4 w-4" />
                Backup Database
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRestoreBackupDialog(true)}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>

              <Dialog open={showRestoreBackupDialog} onOpenChange={setShowRestoreBackupDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Restore Database</DialogTitle>
                    <DialogDescription>
                      This action will replace your current database with the backup file. This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning!</AlertTitle>
                    <AlertDescription>
                      This will overwrite all data in your database. Make sure you have a backup before proceeding.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4">
                    <label className="text-sm font-medium">Enter Super Admin Password:</label>
                    <Input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value)
                        setPasswordError(false)
                      }}
                      className={passwordError ? "border-red-500" : ""}
                    />
                    {passwordError && <p className="text-sm text-red-500 mt-1">Incorrect password</p>}
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium">Select Backup File:</label>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setRestoreFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => {
                      setAdminPassword("");
                      setPasswordError(false);
                      setRestoreFile(null);
                      setShowRestoreBackupDialog(false);
                    }}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (adminPassword !== "1133557799") {
                          setPasswordError(true);
                          return;
                        }

                        if (!restoreFile) {
                          toast({
                            title: "Error",
                            description: "Please select a backup file",
                            variant: "destructive"
                          });
                          return;
                        }

                        // Create form data for the file upload
                        const formData = new FormData();
                        formData.append('file', restoreFile);
                        formData.append('adminPassword', adminPassword);

                        try {
                          setIsLoading(true);

                          const response = await fetch('/api/database/restore', {
                            method: 'POST',
                            body: formData,
                          });

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to restore database');
                          }

                          toast({
                            title: "Success",
                            description: "Database restored successfully",
                          });

                          // Refresh the data
                          if (activeTab === "users") {
                            fetchUsers();
                          } else if (activeTab === "capabilities") {
                            fetchCapabilities();
                          } else if (activeTab === "test-methods") {
                            fetchTestMethods();
                          } else if (activeTab === "equipment") {
                            fetchEquipment();
                          }

                          // Reset form
                          setAdminPassword("");
                          setPasswordError(false);
                          setRestoreFile(null);
                          setShowRestoreBackupDialog(false);

                          // Update last backup time
                          setLastBackupTime(new Date().toLocaleString());
                        } catch (error) {
                          console.error('Error restoring database:', error);
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to restore database",
                            variant: "destructive"
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      Restore Database
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-sm text-muted-foreground">Last backup: {lastBackupTime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {getTableName()} Item</DialogTitle>
            <DialogDescription>Make changes to the selected item. Click save when you're done.</DialogDescription>
          </DialogHeader>

          {currentEditItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {Object.entries(currentEditItem)
                .filter(([key]) => key !== "id")
                .map(([key, value]) => {
                  // Skip rendering complex objects directly
                  if (
                    typeof value === "object" &&
                    value !== null &&
                    !(value instanceof Date) &&
                    !Array.isArray(value)
                  ) {
                    return (
                      <div key={key} className="col-span-2">
                        <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <div className="mt-1 border rounded-md p-2 bg-muted/50">
                          {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                            <div key={subKey} className="grid grid-cols-2 gap-2 mb-2">
                              <label className="text-xs font-medium">{subKey}:</label>
                              <Input
                                value={String(subValue)}
                                onChange={(e) => {
                                  const newValue = { ...currentEditItem }
                                  ;(newValue[key] as Record<string, any>)[subKey] = e.target.value
                                  setCurrentEditItem(newValue)
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  // Handle arrays
                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="col-span-2">
                        <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <div className="mt-1 border rounded-md p-2 bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-2">Array items (comma separated):</p>
                          <Input
                            value={value.join(", ")}
                            onChange={(e) => {
                              const newValue = { ...currentEditItem }
                              newValue[key] = e.target.value.split(",").map((item) => item.trim())
                              setCurrentEditItem(newValue)
                            }}
                          />
                        </div>
                      </div>
                    )
                  }

                  // Handle dates
                  if (value instanceof Date) {
                    return (
                      <div key={key} className="col-span-1">
                        <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <Input
                          type="date"
                          value={value.toISOString().split("T")[0]}
                          onChange={(e) => {
                            const newValue = { ...currentEditItem }
                            newValue[key] = new Date(e.target.value)
                            setCurrentEditItem(newValue)
                          }}
                        />
                      </div>
                    )
                  }

                  // Handle booleans
                  if (typeof value === "boolean") {
                    return (
                      <div key={key} className="col-span-1">
                        <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <Select
                          value={value ? "true" : "false"}
                          onValueChange={(val) => {
                            const newValue = { ...currentEditItem }
                            newValue[key] = val === "true"
                            setCurrentEditItem(newValue)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  // Handle numbers
                  if (typeof value === "number") {
                    return (
                      <div key={key} className="col-span-1">
                        <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => {
                            const newValue = { ...currentEditItem }
                            newValue[key] = Number.parseFloat(e.target.value)
                            setCurrentEditItem(newValue)
                          }}
                        />
                      </div>
                    )
                  }

                  // Default text input for strings and other types
                  return (
                    <div key={key} className="col-span-1">
                      <label className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                      <Input
                        value={String(value)}
                        onChange={(e) => {
                          const newValue = { ...currentEditItem }
                          newValue[key] = e.target.value
                          setCurrentEditItem(newValue)
                        }}
                      />
                    </div>
                  )
                })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // ในการใช้งานจริงจะต้องเชื่อมต่อกับ API เพื่อบันทึกข้อมูล
                // ตัวอย่างนี้เป็นเพียงการจำลองการบันทึก

                // อัปเดตข้อมูลในตาราง
                switch (activeTab) {
                  case "users":
                    setUsers(users.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "capabilities":
                    setCapabilities(
                      capabilities.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "test-methods":
                    setTestMethods(testMethods.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "equipment":
                    setEquipment(equipment.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "locations":
                    setLocations(locations.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "io-numbers":
                    setIoNumbers(ioNumbers.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "requests":
                    setRequests(requests.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "asr-requests":
                    setASRRequests(asrRequests.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "smart-assistant":
                    setSmartAssistant(
                      smartAssistant.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "queue-management":
                    setQueueManagement(
                      queueManagement.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "commercial-samples":
                    setCommercialSamples(
                      commercialSamples.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "app-tech-list":
                    setAppTechList(appTechList.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)))
                    break
                  case "plant-reactors":
                    setPlantReactors(
                      plantReactors.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "notifications":
                    setNotifications(
                      notifications.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                  case "activity-logs":
                    setActivityLogs(
                      activityLogs.map((item) => (item.id === currentEditItem.id ? currentEditItem : item)),
                    )
                    break
                }

                setShowEditDialog(false)
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <AddUserDialog
        open={showAddUserDialog}
        onOpenChange={setShowAddUserDialog}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={showEditUserDialog}
        onOpenChange={setShowEditUserDialog}
        onUserUpdated={handleUserUpdated}
        userData={currentUserToEdit}
      />

      {/* Add Capability Dialog */}
      <AddCapabilityDialog
        open={showAddCapabilityDialog}
        onOpenChange={setShowAddCapabilityDialog}
        onCapabilityAdded={handleCapabilityAdded}
      />

      {/* Edit Capability Dialog */}
      <EditCapabilityDialog
        open={showEditCapabilityDialog}
        onOpenChange={setShowEditCapabilityDialog}
        onCapabilityUpdated={handleCapabilityUpdated}
        capabilityData={currentCapabilityToEdit}
      />

      {/* Add Test Method Dialog */}
      <AddTestMethodDialog
        open={showAddTestMethodDialog}
        onOpenChange={setShowAddTestMethodDialog}
        onTestMethodAdded={handleTestMethodAdded}
      />

      {/* Edit Test Method Dialog */}
      <EditTestMethodDialog
        open={showEditTestMethodDialog}
        onOpenChange={setShowEditTestMethodDialog}
        onTestMethodUpdated={handleTestMethodUpdated}
        testMethodData={currentTestMethodToEdit}
      />

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        open={showAddEquipmentDialog}
        onOpenChange={setShowAddEquipmentDialog}
        onEquipmentAdded={handleEquipmentAdded}
      />

      {/* Edit Equipment Dialog */}
      <EditEquipmentDialog
        open={showEditEquipmentDialog}
        onOpenChange={setShowEditEquipmentDialog}
        onEquipmentUpdated={handleEquipmentUpdated}
        equipmentData={currentEquipmentToEdit}
      />

      {/* Add Location Dialog */}
      <AddLocationDialog
        open={showAddLocationDialog}
        onOpenChange={setShowAddLocationDialog}
        onLocationAdded={handleLocationAdded}
      />

      {/* Edit Location Dialog */}
      <EditLocationDialog
        open={showEditLocationDialog}
        onOpenChange={setShowEditLocationDialog}
        onLocationUpdated={handleLocationUpdated}
        locationData={currentLocationToEdit}
      />

      {/* Add IO Dialog */}
      <AddIoDialog
        open={showAddIoDialog}
        onOpenChange={setShowAddIoDialog}
        onIoAdded={handleIoAdded}
      />

      {/* Edit IO Dialog */}
      <EditIoDialog
        open={showEditIoDialog}
        onOpenChange={setShowEditIoDialog}
        onIoUpdated={handleIoUpdated}
        ioData={currentIoToEdit}
      />

      {/* Add Commercial Sample Dialog */}
      <AddSampleCommercialDialog
        open={showAddSampleCommercialDialog}
        onOpenChange={setShowAddSampleCommercialDialog}
        onSampleAdded={handleSampleCommercialAdded}
      />

      {/* Edit Commercial Sample Dialog */}
      <EditSampleCommercialDialog
        open={showEditSampleCommercialDialog}
        onOpenChange={setShowEditSampleCommercialDialog}
        onSampleUpdated={handleSampleCommercialUpdated}
        sampleData={currentSampleCommercialToEdit}
      />

      {/* Add App Tech Dialog */}
      <AddAppTechDialog
        open={showAddAppTechDialog}
        onOpenChange={setShowAddAppTechDialog}
        onAppTechAdded={handleAppTechAdded}
      />

      {/* Edit App Tech Dialog */}
      <EditAppTechDialog
        open={showEditAppTechDialog}
        onOpenChange={setShowEditAppTechDialog}
        onAppTechUpdated={handleAppTechUpdated}
        appTechData={currentAppTechToEdit}
      />

      {/* Add Plant Reactor Dialog */}
      <AddPlantReactorDialog
        open={showAddPlantReactorDialog}
        onOpenChange={setShowAddPlantReactorDialog}
        onPlantReactorAdded={handlePlantReactorAdded}
      />

      {/* Edit Plant Reactor Dialog */}
      <EditPlantReactorDialog
        open={showEditPlantReactorDialog}
        onOpenChange={setShowEditPlantReactorDialog}
        onPlantReactorUpdated={handlePlantReactorUpdated}
        plantReactorData={currentPlantReactorToEdit}
      />

      {/* Add Request Dialog */}
      <AddRequestDialog
        open={showAddRequestDialog}
        onOpenChange={setShowAddRequestDialog}
        onRequestAdded={handleRequestAdded}
      />

      {/* Edit Request Dialog */}
      <EditRequestDialog
        open={showEditRequestDialog}
        onOpenChange={setShowEditRequestDialog}
        onRequestUpdated={handleRequestUpdated}
        requestData={currentRequestToEdit}
      />

      {/* Hidden download links */}
      <a ref={csvExportRef} className="hidden" />
    </DashboardLayout>
  )
}


