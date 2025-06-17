"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  ChevronLeft,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Layers,
  Beaker,
  FlaskConical,
  Microscope,
  Save,
  CalendarClock,
  Settings,
  List,
  GripVertical,
  X,
  Loader2,
  Filter,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Package,
  BarChart3,
  Activity,
  Users,
  Zap,
  Timer,
  ChevronRight,
  Info,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addDays, isWeekend, isSameDay, parseISO, isValid, addHours, startOfWeek, endOfWeek, eachDayOfInterval, startOfDay, endOfDay, differenceInHours, isBefore, isAfter } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core"
import {
  Draggable,
  Droppable,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useDraggable, useDroppable } from "@dnd-kit/core"

// Enhanced Type definitions
type TestSample = {
  id: string
  sampleName: string
  sampleId: string
  testMethod: string
  estimatedHours: number
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed'
  equipment?: string
  requestId?: string // Parent request ID for highlighting
}

type Request = {
  id: string
  title: string
  type: string
  capability: string
  status: string
  priority: 'normal' | 'urgent' | 'critical'
  requester: string
  requestDate: string
  dueDate: string
  suggestedDueDate: string
  assignedTo: string
  progress: number
  samples: TestSample[]
  department: string
  description: string
  equipment: string
  estimatedHours: number
  color?: string
  testMethods?: string[]
}

type Equipment = {
  id: string
  name: string
  capability: string
  operator: string
  availability: number
  workload: number
  schedule: ScheduledTask[]
  maxCapacity: number // hours per day
  operationalHours: {
    start: number
    end: number
  }
}

type ScheduledTask = {
  id: string
  requestId: string
  sampleId: string
  sampleName?: string
  testMethod?: string
  title: string
  startTime: Date
  endTime: Date
  equipment: string
  equipmentId: string
  priority: string
  status: 'scheduled' | 'in-progress' | 'completed'
  operator?: string
  notes?: string
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  requestId: string
  sampleId: string
  equipment: string
  equipmentId: string
  priority: string
  color: string
  status: string
}

type CalculationSettings = {
  skipWeekends: boolean
  workingHoursStart: number
  workingHoursEnd: number
  exceptionalDays: string[]
  useWorkingHours: boolean
  bufferTime: number // Buffer time between tasks in minutes
  maintenanceWindows: MaintenanceWindow[]
}

type MaintenanceWindow = {
  equipmentId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startHour: number
  endHour: number
}

// Draggable Task Component
function DraggableTask({ task, children }: { task: Request | TestSample; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: task,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

// Draggable Scheduled Task Component with improved overlap handling
function DraggableScheduledTask({ 
  task, 
  isHighlighted, 
  onDoubleClick, 
  onRemove,
  isOverlapping,
  overlapIndex,
  getColorForPriority,
  getOverlapColor
}: { 
  task: ScheduledTask
  isHighlighted: boolean
  onDoubleClick: () => void
  onRemove: () => void
  isOverlapping: boolean
  overlapIndex: number
  getColorForPriority: (priority: string) => string
  getOverlapColor: (index: number) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `scheduled-${task.id}`,
    data: { ...task, isScheduled: true },
  })
  

  // Calculate height - each hour is 48px (h-12 in tailwind)
  const startTime = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
  const endTime = task.endTime instanceof Date ? task.endTime : new Date(task.endTime)
  const hoursDiff = differenceInHours(endTime, startTime)
  const taskHeight = Math.max((hoursDiff * 48) - 8, 40) // Minimum height of 40px
  
  const baseColor = getColorForPriority(task.priority)
  const backgroundColor = isOverlapping 
    ? getOverlapColor(overlapIndex) // Use different color for overlapping tasks
    : baseColor
  
  // Improved positioning for overlapping tasks
  const overlapOffset = isOverlapping ? overlapIndex * 15 : 0 // Cascade offset
  const overlapMargin = isOverlapping ? overlapIndex * 4 : 0 // Small margin between overlapped tasks
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    position: 'absolute' as const,
    left: isOverlapping ? `${4 + overlapMargin}px` : '4px',
    right: isOverlapping ? `${4 - overlapMargin}px` : '4px',
    top: `${2 + overlapOffset}px`,
    backgroundColor,
    height: `${taskHeight}px`,
    minHeight: '40px',
    zIndex: isHighlighted ? 20 : (isOverlapping ? 10 + overlapIndex : 1),
    boxShadow: isOverlapping ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
    border: isHighlighted 
      ? '2px solid #ef4444'
      : (isOverlapping ? '1px solid rgba(255,255,255,0.3)' : 'none'),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded text-xs text-white group cursor-move ${
        isDragging ? '' : 'transition-all duration-200'
      }`}
      title={`${task.title}\n${format(task.startTime, 'HH:mm')} - ${format(task.endTime, 'HH:mm')}\nOperator: ${task.operator || 'Unassigned'}\n\nDouble-click to ${isHighlighted ? 'deselect' : 'highlight'} all tasks from this request`}
      onContextMenu={(e) => {
        e.preventDefault()
        onRemove()
      }}
      onDoubleClick={onDoubleClick}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-1 h-full p-1 pointer-events-none">
        <div className="flex items-center gap-1 flex-1">
          <GripVertical className="h-3 w-3 text-white/60 flex-shrink-0 cursor-move" />
          <div className="flex flex-col justify-center flex-1 min-w-0 space-y-0.5">
            <div className="bg-black/20 rounded px-1 py-0.5 inline-block max-w-full">
              <div className="font-medium text-[8px] text-white whitespace-nowrap overflow-visible">{task.title}</div>
            </div>
            {task.testMethod && (
              <div className="text-[9px] text-white/90">{task.testMethod}</div>
            )}
            {task.sampleName && (
              <div className="text-[9px] text-white/80 line-clamp-2 break-words">{task.sampleName}</div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded p-0.5 hover:scale-110 transform flex-shrink-0 pointer-events-auto relative z-20"
          title="Remove from schedule"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// Droppable Calendar Slot Component with improved drop detection
function DroppableSlot({ 
  id, 
  date, 
  hour, 
  equipment, 
  children,
  isOccupied,
  isReserved,
  reservationReason,
  isSelected,
  onSlotClick,
  reservationMode,
  onDeleteReservation
}: { 
  id: string
  date: Date
  hour: number
  equipment: Equipment
  children?: React.ReactNode
  isOccupied: boolean
  isReserved?: boolean
  reservationReason?: string
  isSelected?: boolean
  onSlotClick?: () => void
  reservationMode?: boolean
  onDeleteReservation?: () => void
}) {
  const {
    isOver,
    setNodeRef,
    active,
  } = useDroppable({
    id: id,
    data: {
      date,
      hour,
      equipment,
    },
    disabled: isReserved,
  })

  // Calculate if there are multiple tasks in this slot
  const childrenArray = React.Children.toArray(children)
  const hasMultipleTasks = childrenArray.length > 1

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-12 border-b border-r relative group transition-all duration-150",
        isOver && !isReserved && "bg-blue-100 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-inset",
        isOver && isOccupied && !isReserved && "bg-orange-100 dark:bg-orange-950/30 ring-2 ring-orange-500 ring-inset",
        hasMultipleTasks && "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
        isReserved && "bg-red-100 dark:bg-red-950/30 cursor-not-allowed",
        isSelected && "bg-purple-100 dark:bg-purple-950/30 ring-2 ring-purple-500 ring-inset",
        reservationMode && !isReserved && "cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20"
      )}
      style={{ 
        position: 'relative', 
        zIndex: isOver ? 10 : 1,
        minHeight: hasMultipleTasks ? `${48 + (childrenArray.length - 1) * 16}px` : '48px',
        overflow: 'visible',
      }}
      onClick={(e) => {
        // Allow delete button clicks to pass through
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          return;
        }
        if (reservationMode && !isReserved && onSlotClick) {
          onSlotClick();
        }
      }}
      title={isReserved ? `Reserved: ${reservationReason}` : undefined}
    >
      {/* Drop indicator with better visibility */}
      {isOver && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <div className={cn(
              "absolute inset-0 border-2 rounded",
              isOccupied ? "border-orange-500" : "border-blue-500",
              "animate-pulse"
            )} />
          </div>
          {/* Cursor position indicator */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50" />
        </>
      )}
      
      {/* Reserved indicator */}
      {isReserved && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
          <div className="text-xs font-medium text-red-700 dark:text-red-300 text-center line-clamp-2 pointer-events-none">
            {reservationReason}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onDeleteReservation) {
                onDeleteReservation()
              }
            }}
            className="mt-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded shadow-sm cursor-pointer z-20 transition-colors"
            type="button"
          >
            Delete
          </button>
        </div>
      )}
      
      {/* Stacked tasks container */}
      <div className="relative h-full" style={{ minHeight: 'inherit' }}>
        {children}
      </div>
    </div>
  )
}


export default function AssignDuePage() {
  // State variables
  const [searchQuery, setSearchQuery] = useState("")
  const [capabilityFilter, setCapabilityFilter] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [capabilities, setCapabilities] = useState<any[]>([])
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("queue")
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedItem, setDraggedItem] = useState<Request | TestSample | null>(null)
  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>({
    skipWeekends: true,
    workingHoursStart: 8,
    workingHoursEnd: 17,
    exceptionalDays: [],
    useWorkingHours: true,
    bufferTime: 30,
    maintenanceWindows: [],
  })
  const [showSettingsSheet, setShowSettingsSheet] = useState(false)
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false)
  const [dynamicWorkingHours, setDynamicWorkingHours] = useState({ start: 8, end: 16 })

  // State for storing data from API
  const [requests, setRequests] = useState<Request[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null)
  const [originallyScheduledSampleIds, setOriginallyScheduledSampleIds] = useState<Set<string>>(new Set())
  const [conflictDialog, setConflictDialog] = useState<{
    show: boolean
    conflictingTasks: ScheduledTask[]
    newTask: any
    dropData: any
  } | null>(null)
  
  // Time reservation states
  const [reservationMode, setReservationMode] = useState(false)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Array<{
    equipmentId: string
    date: Date
    hour: number
  }>>([])
  const [showReservationDialog, setShowReservationDialog] = useState(false)
  const [reservationReason, setReservationReason] = useState('')
  const [shouldSaveSchedule, setShouldSaveSchedule] = useState(false)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false)
  const [timeReservations, setTimeReservations] = useState<Array<{
    reservationId: string
    equipmentId: string
    startTime: Date
    endTime: Date
    reason: string
    createdBy: string
  }>>([])
  
  // User info (from auth context - you'll need to get this from your auth system)
  const { user } = useAuth()

  // Drag and drop sensors with improved activation for better alignment
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Fetch testing samples from API
  const fetchTestingSamples = async () => {
    setLoading(true)
    try {
      // First fetch testing samples with correct status filter
      const statusFilter = encodeURIComponent('in-progress') + ',' + encodeURIComponent('Pending Entry Results')
      const response = await fetch(`/api/testing-samples?limit=100`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Filter samples by status
        const filteredSamples = data.data.filter((sample: any) => 
          sample.sampleStatus === 'in-progress' || sample.sampleStatus === 'Pending Entry Results'
        )
        
        // Group samples by request number
        const requestsMap = new Map<string, any>()
        const uniqueRequestNumbers = new Set<string>()
        
        filteredSamples.forEach((sample: any) => {
          const requestNumber = sample.requestNumber
          uniqueRequestNumbers.add(requestNumber)
          
          if (!requestsMap.has(requestNumber)) {
            // Create a new request entry
            requestsMap.set(requestNumber, {
              id: requestNumber,
              title: `Request ${requestNumber}`,
              type: sample.requestType || "NTR",
              capability: sample.capabilityName || "Unknown",
              status: sample.sampleStatus === "Pending Entry Results" ? "pending" : "in-progress",
              priority: sample.priority || "normal",
              requester: sample.requesterName || "Unknown",
              requestDate: sample.submitDate || new Date().toISOString(),
              dueDate: sample.dueDate || "",
              suggestedDueDate: sample.dueDate || "",
              assignedTo: sample.operationCompleteBy || "",
              progress: sample.sampleStatus === "Pending Entry Results" ? 75 : 50,
              department: "Testing",
              description: `Testing samples for ${requestNumber}`,
              equipment: sample.equipmentName || "",
              estimatedHours: 2,
              color: "#3b82f6",
              samples: []
            })
          }
          
          // Add sample to the request
          const request = requestsMap.get(requestNumber)
          request.samples.push({
            id: sample.testingListId,
            sampleName: sample.sampleName,
            sampleId: sample.sampleId,
            testMethod: sample.methodCode || "Unknown",
            estimatedHours: 2,
            status: sample.sampleStatus === "Pending Entry Results" ? "pending" : "in-progress",
            equipment: sample.equipmentName || "",
            requestId: requestNumber // Add parent request ID
          })
          
          // Update equipment if multiple equipment in same request
          if (sample.equipmentName && !request.equipment.includes(sample.equipmentName)) {
            request.equipment = request.equipment ? `${request.equipment}, ${sample.equipmentName}` : sample.equipmentName
          }
        })
        
        // Fetch request details for each unique request number
        const requestDetailsPromises = Array.from(uniqueRequestNumbers).map(async (requestNumber) => {
          try {
            const detailsResponse = await fetch(`/api/requests/multi-details?requestNumbers=${requestNumber}`)
            const detailsData = await detailsResponse.json()
            
            if (detailsData.success && detailsData.data && detailsData.data.length > 0) {
              const requestDetail = detailsData.data[0]
              const request = requestsMap.get(requestNumber)
              
              if (request) {
                // Update request with actual details
                request.title = requestDetail.requestTitle || `Request ${requestNumber}`
                request.type = requestDetail.requestType || "NTR"
                request.requester = requestDetail.requesterName || request.requester
                request.department = requestDetail.requesterDepartment || request.department
                request.requestDate = requestDetail.submitDate || request.requestDate
                request.priority = requestDetail.priority || "normal"
                
                // Set color based on priority
                if (requestDetail.priority === "urgent") {
                  request.color = "#f59e0b"
                  request.priority = "urgent"
                } else if (requestDetail.priority === "critical") {
                  request.color = "#dc2626"
                  request.priority = "critical"
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching details for request ${requestNumber}:`, error)
          }
        })
        
        // Wait for all request details to be fetched
        await Promise.all(requestDetailsPromises)
        
        // Calculate total hours for each request and convert map to array
        const requestsArray = Array.from(requestsMap.values()).map(request => {
          // Calculate total hours from all samples
          const totalHours = request.samples.reduce((sum: number, sample: any) => 
            sum + (sample.estimatedHours || 2), 0
          )
          return {
            ...request,
            estimatedHours: totalHours || 2 // Default to 2 if no samples
          }
        })
        setRequests(requestsArray)
        
        // Extract unique equipment names from filtered samples
        const uniqueEquipmentNames = new Set<string>()
        filteredSamples.forEach((sample: any) => {
          if (sample.equipmentName && sample.equipmentName.trim() !== '') {
            uniqueEquipmentNames.add(sample.equipmentName.trim())
          }
        })
        
        console.log('Filtered samples count:', filteredSamples.length)
        console.log('Unique equipment names:', Array.from(uniqueEquipmentNames))
        
        // Only fetch equipment if we have equipment names from active samples
        if (uniqueEquipmentNames.size > 0) {
          const equipmentData = await fetchEquipment(Array.from(uniqueEquipmentNames))
          
          // Load existing schedules from samples with plannedStartTime AFTER equipment is loaded
          const scheduledTasksFromDB: ScheduledTask[] = []
          const loadedTaskIds = new Set<string>() // Prevent duplicates
          
          filteredSamples.forEach((sample: any) => {
            if (sample.plannedStartTime && sample.plannedEndTime && !loadedTaskIds.has(sample.testingListId)) {
              const request = requestsMap.get(sample.requestNumber)
              if (request) {
                // Find the equipment ID from the equipment list based on name
                let equipmentId = sample.equipmentId || ""
                if (!equipmentId && sample.equipmentName && equipmentData) {
                  const matchingEquipment = equipmentData.find((eq: any) => 
                    eq.name.toLowerCase().trim() === sample.equipmentName.toLowerCase().trim()
                  )
                  if (matchingEquipment) {
                    equipmentId = matchingEquipment.id
                  }
                }
                
                scheduledTasksFromDB.push({
                  id: `task-${sample.testingListId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  requestId: sample.requestNumber,
                  sampleId: sample.testingListId,
                  sampleName: sample.sampleName || sample.fullSampleName || '',
                  testMethod: sample.methodCode || "Unknown",
                  title: sample.requestNumber.replace(/^Request\s+/, ''),
                  startTime: new Date(sample.plannedStartTime),
                  endTime: new Date(sample.plannedEndTime),
                  equipment: sample.equipmentName || "",
                  equipmentId: equipmentId,
                  priority: sample.priority || request.priority || 'normal',
                  status: 'scheduled',
                  operator: sample.plannedBy || sample.operationCompleteBy || "",
                  estimatedHours: differenceInHours(new Date(sample.plannedEndTime), new Date(sample.plannedStartTime))
                })
                loadedTaskIds.add(sample.testingListId)
              }
            }
          })
          
          if (scheduledTasksFromDB.length > 0) {
            setScheduledTasks(scheduledTasksFromDB)
            // Store the originally scheduled sample IDs
            setOriginallyScheduledSampleIds(new Set(loadedTaskIds))
            console.log('Loaded', scheduledTasksFromDB.length, 'scheduled tasks from database')
            console.log('Originally scheduled sample IDs:', Array.from(loadedTaskIds))
            toast.info(`Loaded ${scheduledTasksFromDB.length} scheduled tasks from previous planning`)
          }
        } else {
          // No equipment found in active samples, set empty array
          setEquipment([])
        }
      }
    } catch (error) {
      console.error('Error fetching testing samples:', error)
      toast.error('Failed to load testing samples')
    } finally {
      setLoading(false)
    }
  }

  // Fetch equipment data
  const fetchEquipment = async (filterEquipmentNames?: string[]) => {
    try {
      console.log('fetchEquipment called with filter:', filterEquipmentNames)
      
      const response = await fetch('/api/equipment')
      const data = await response.json()
      
      if (data.success && data.data) {
        let formattedEquipment = data.data.map((eq: any) => ({
          id: eq._id || eq.id,
          name: eq.equipmentName || eq.name,
          capability: eq.capability || "Unknown",
          operator: eq.operator || "Unassigned",
          availability: 0.85,
          workload: Math.floor(Math.random() * 100),
          maxCapacity: 8,
          operationalHours: { 
            start: eq.serviceTimeStart || 8, 
            end: eq.serviceTimeEnd || 16 
          },
          schedule: []
        }))
        
        console.log('All equipment count:', formattedEquipment.length)
        console.log('All equipment names:', formattedEquipment.map((eq: Equipment) => eq.name))
        
        // Filter equipment if names provided
        if (filterEquipmentNames && filterEquipmentNames.length > 0) {
          // Create a set of lowercase equipment names for case-insensitive comparison
          const filterNamesLower = new Set(filterEquipmentNames.map(name => name.toLowerCase().trim()))
          
          formattedEquipment = formattedEquipment.filter((eq: Equipment) => 
            filterNamesLower.has(eq.name.toLowerCase().trim())
          )
          console.log('Filtered equipment count:', formattedEquipment.length)
          console.log('Filtered equipment names:', formattedEquipment.map((eq: Equipment) => eq.name))
        }
        
        setEquipment(formattedEquipment)
        return formattedEquipment // Return the equipment data
      } else {
        // Use mock equipment if API fails
        const mockEquipment: Equipment[] = [
          {
            id: "eq1",
            name: "DSC-001",
            capability: "Thermal Analysis",
            operator: "John Doe",
            availability: 0.85,
            workload: 65,
            maxCapacity: 8,
            operationalHours: { start: 8, end: 16 },
            schedule: []
          },
          {
            id: "eq2",
            name: "TGA-001",
            capability: "Thermal Analysis",
            operator: "John Doe",
            availability: 0.90,
            workload: 45,
            maxCapacity: 8,
            operationalHours: { start: 8, end: 16 },
            schedule: []
          },
          {
            id: "eq3",
            name: "FTIR-001",
            capability: "Spectroscopy",
            operator: "Jane Smith",
            availability: 0.90,
            workload: 45,
            maxCapacity: 8,
            operationalHours: { start: 8, end: 16 },
            schedule: []
          },
          {
            id: "eq4",
            name: "UV-Vis-001",
            capability: "Spectroscopy",
            operator: "Jane Smith",
            availability: 0.85,
            workload: 55,
            maxCapacity: 8,
            operationalHours: { start: 8, end: 16 },
            schedule: []
          },
          {
            id: "eq5",
            name: "UTM-001",
            capability: "Mechanical Testing",
            operator: "Bob Johnson",
            availability: 0.75,
            workload: 80,
            maxCapacity: 8,
            operationalHours: { start: 8, end: 16 },
            schedule: []
          }
        ]
        
        // Filter mock equipment if names provided
        if (filterEquipmentNames && filterEquipmentNames.length > 0) {
          // Create a set of lowercase equipment names for case-insensitive comparison
          const filterNamesLower = new Set(filterEquipmentNames.map(name => name.toLowerCase().trim()))
          
          const filteredMockEquipment = mockEquipment.filter(eq => 
            filterNamesLower.has(eq.name.toLowerCase().trim())
          )
          setEquipment(filteredMockEquipment)
          return filteredMockEquipment
        } else {
          setEquipment(mockEquipment)
          return mockEquipment
        }
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
      return []
    }
  }
  
  // Fetch time reservations
  const fetchTimeReservations = async () => {
    try {
      const equipmentIds = selectedEquipment.length > 0 ? selectedEquipment : equipment.map(eq => eq.id)
      const response = await fetch(`/api/time-reservations?equipmentIds=${equipmentIds.join(',')}&startDate=${startOfWeek(currentDate).toISOString()}&endDate=${endOfWeek(currentDate).toISOString()}`)
      
      if (!response.ok) throw new Error('Failed to fetch time reservations')
      
      const data = await response.json()
      if (data.success) {
        setTimeReservations(data.reservations.map((res: any) => ({
          ...res,
          startTime: new Date(res.startTime),
          endTime: new Date(res.endTime)
        })))
      }
    } catch (error) {
      console.error('Error fetching time reservations:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchTestingSamples()
  }, [])
  
  // Fetch reservations when equipment selection or date changes
  useEffect(() => {
    if (equipment.length > 0) {
      fetchTimeReservations()
    }
  }, [selectedEquipment, currentDate, equipment])
  
  // Debug scheduled tasks
  useEffect(() => {
    console.log('Scheduled tasks updated:', scheduledTasks.map(t => ({
      id: t.id,
      title: t.title,
      equipmentId: t.equipmentId,
      startTime: t.startTime,
      hour: t.startTime instanceof Date ? t.startTime.getHours() : new Date(t.startTime).getHours()
    })))
  }, [scheduledTasks])


  // Get color for priority
  const getColorForPriority = (priority: string) => {
    switch (priority) {
      case "critical": return "#dc2626"
      case "urgent": return "#f59e0b"
      case "normal": return "#3b82f6"
      default: return "#6b7280"
    }
  }

  // Get color for overlapping tasks
  const getOverlapColor = (index: number) => {
    const overlapColors = [
      "#8b5cf6", // Purple
      "#10b981", // Emerald
      "#f97316", // Orange
      "#ec4899", // Pink
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f59e0b", // Amber
      "#6366f1", // Indigo
    ]
    return overlapColors[index % overlapColors.length]
  }
  
  // Handle time slot selection for reservation
  const handleTimeSlotClick = (equipmentId: string, date: Date, hour: number) => {
    // Handle combined equipment view
    if (equipmentId === 'combined-equipment') {
      // When clicking on combined view, select/deselect for all selected equipment
      const equipmentIds = selectedEquipment.length > 0 
        ? selectedEquipment 
        : equipment.filter(eq => selectedEquipment.includes(eq.id)).map(eq => eq.id)
      
      // Check if all equipment have this slot selected
      const allSelected = equipmentIds.every(eqId => 
        selectedTimeSlots.some(slot => 
          slot.equipmentId === eqId && 
          slot.date.toISOString() === date.toISOString() && 
          slot.hour === hour
        )
      )
      
      if (allSelected) {
        // Remove all
        setSelectedTimeSlots(prev => 
          prev.filter(slot => 
            !(equipmentIds.includes(slot.equipmentId) && 
              slot.date.toISOString() === date.toISOString() && 
              slot.hour === hour)
          )
        )
      } else {
        // Add for all equipment that don't have it and aren't reserved
        const newSlots = equipmentIds
          .filter(eqId => 
            !selectedTimeSlots.some(slot => 
              slot.equipmentId === eqId && 
              slot.date.toISOString() === date.toISOString() && 
              slot.hour === hour
            ) && !isTimeSlotReserved(eqId, date, hour)
          )
          .map(eqId => ({ equipmentId: eqId, date, hour }))
        
        setSelectedTimeSlots(prev => [...prev, ...newSlots])
      }
    } else {
      // Single equipment selection
      setSelectedTimeSlots(prev => {
        const existing = prev.find(slot => 
          slot.equipmentId === equipmentId && 
          slot.date.toISOString() === date.toISOString() && 
          slot.hour === hour
        )
        
        if (existing) {
          // Remove if already selected
          return prev.filter(slot => 
            !(slot.equipmentId === equipmentId && 
              slot.date.toISOString() === date.toISOString() && 
              slot.hour === hour)
          )
        } else {
          // Add new selection
          return [...prev, { equipmentId, date, hour }]
        }
      })
    }
  }
  
  // Check if a time slot is selected
  const isTimeSlotSelected = (equipmentId: string, date: Date, hour: number) => {
    if (equipmentId === 'combined-equipment') {
      // For combined view, check if ANY of the selected equipment have this slot selected
      const equipmentIds = selectedEquipment.length > 0 ? selectedEquipment : equipment.map(eq => eq.id)
      return equipmentIds.some(eqId => 
        selectedTimeSlots.some(slot => 
          slot.equipmentId === eqId && 
          slot.date.toISOString() === date.toISOString() && 
          slot.hour === hour
        )
      )
    }
    
    return selectedTimeSlots.some(slot => 
      slot.equipmentId === equipmentId && 
      slot.date.toISOString() === date.toISOString() && 
      slot.hour === hour
    )
  }
  
  // Check if a time slot is reserved
  const isTimeSlotReserved = (equipmentId: string, date: Date, hour: number) => {
    if (equipmentId === 'combined-equipment') {
      // For combined view, check if ANY of the selected equipment have reservations
      const equipmentIds = selectedEquipment.length > 0 ? selectedEquipment : equipment.map(eq => eq.id)
      return equipmentIds.some(eqId => {
        const slotStart = new Date(date)
        slotStart.setHours(hour, 0, 0, 0)
        const slotEnd = new Date(date)
        slotEnd.setHours(hour + 1, 0, 0, 0)
        
        return timeReservations.some(res => 
          res.equipmentId === eqId &&
          res.startTime < slotEnd &&
          res.endTime > slotStart
        )
      })
    }
    
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date)
    slotEnd.setHours(hour + 1, 0, 0, 0)
    
    return timeReservations.some(res => 
      res.equipmentId === equipmentId &&
      res.startTime < slotEnd &&
      res.endTime > slotStart
    )
  }
  
  // Get reservation reason for a time slot
  const getReservationReason = (equipmentId: string, date: Date, hour: number) => {
    if (equipmentId === 'combined-equipment') {
      // For combined view, get reason from any of the selected equipment
      const equipmentIds = selectedEquipment.length > 0 ? selectedEquipment : equipment.map(eq => eq.id)
      for (const eqId of equipmentIds) {
        const slotStart = new Date(date)
        slotStart.setHours(hour, 0, 0, 0)
        const slotEnd = new Date(date)
        slotEnd.setHours(hour + 1, 0, 0, 0)
        
        const reservation = timeReservations.find(res => 
          res.equipmentId === eqId &&
          res.startTime < slotEnd &&
          res.endTime > slotStart
        )
        
        if (reservation) return reservation.reason
      }
      return ''
    }
    
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date)
    slotEnd.setHours(hour + 1, 0, 0, 0)
    
    const reservation = timeReservations.find(res => 
      res.equipmentId === equipmentId &&
      res.startTime < slotEnd &&
      res.endTime > slotStart
    )
    
    return reservation?.reason || ''
  }
  
  // Delete a reservation
  const handleDeleteReservation = async (equipmentId: string, date: Date, hour: number) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this reservation?')
    if (!confirmed) return
    
    try {
      // Handle combined equipment view
      if (equipmentId === 'combined-equipment') {
        // Delete reservations for all selected equipment at this time
        const equipmentIds = selectedEquipment.length > 0 ? selectedEquipment : equipment.map(eq => eq.id)
        let deletedCount = 0
        
        for (const eqId of equipmentIds) {
          const slotStart = new Date(date)
          slotStart.setHours(hour, 0, 0, 0)
          const slotEnd = new Date(date)
          slotEnd.setHours(hour + 1, 0, 0, 0)
          
          const reservation = timeReservations.find(res => 
            res.equipmentId === eqId &&
            res.startTime < slotEnd &&
            res.endTime > slotStart
          )
          
          if (reservation) {
            const response = await fetch(`/api/time-reservations?id=${reservation.reservationId}`, {
              method: 'DELETE'
            })
            
            if (response.ok) {
              deletedCount++
            }
          }
        }
        
        if (deletedCount > 0) {
          toast.success(`Deleted ${deletedCount} reservation(s)`)
          await fetchTimeReservations() // Refresh reservations
        } else {
          toast.error('No reservations found to delete')
        }
      } else {
        // Single equipment deletion
        const slotStart = new Date(date)
        slotStart.setHours(hour, 0, 0, 0)
        const slotEnd = new Date(date)
        slotEnd.setHours(hour + 1, 0, 0, 0)
        
        const reservation = timeReservations.find(res => 
          res.equipmentId === equipmentId &&
          res.startTime < slotEnd &&
          res.endTime > slotStart
        )
        
        if (!reservation) {
          toast.error('Reservation not found')
          return
        }
        
        const response = await fetch(`/api/time-reservations?id=${reservation.reservationId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to delete reservation')
        
        const data = await response.json()
        if (data.success) {
          toast.success('Reservation deleted')
          await fetchTimeReservations() // Refresh reservations
        }
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Failed to delete reservation')
    }
  }

  // Submit time reservations
  const handleSubmitReservations = async () => {
    if (selectedTimeSlots.length === 0 || !reservationReason.trim()) {
      toast.error('Please select time slots and provide a reason')
      return
    }
    
    try {
      // Group consecutive time slots
      const groupedSlots = []
      const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
        if (a.equipmentId !== b.equipmentId) return a.equipmentId.localeCompare(b.equipmentId)
        if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime()
        return a.hour - b.hour
      })
      
      let currentGroup = null
      for (const slot of sortedSlots) {
        if (!currentGroup || 
            currentGroup.equipmentId !== slot.equipmentId ||
            currentGroup.date.toDateString() !== slot.date.toDateString() ||
            currentGroup.endHour !== slot.hour) {
          // Start new group
          if (currentGroup) groupedSlots.push(currentGroup)
          currentGroup = {
            equipmentId: slot.equipmentId,
            equipmentName: equipment.find(eq => eq.id === slot.equipmentId)?.name || '',
            date: slot.date,
            startHour: slot.hour,
            endHour: slot.hour + 1
          }
        } else {
          // Extend current group
          currentGroup.endHour = slot.hour + 1
        }
      }
      if (currentGroup) groupedSlots.push(currentGroup)
      
      // Convert to time slots for API
      const timeSlots = groupedSlots.map(group => {
        const startTime = new Date(group.date)
        startTime.setHours(group.startHour, 0, 0, 0)
        const endTime = new Date(group.date)
        endTime.setHours(group.endHour, 0, 0, 0)
        
        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        }
      })
      
      // Submit reservations for each equipment separately
      const responses = []
      
      // Group slots by equipment
      const slotsByEquipment = groupedSlots.reduce((acc, group) => {
        if (!acc[group.equipmentId]) {
          acc[group.equipmentId] = {
            equipmentId: group.equipmentId,
            equipmentName: group.equipmentName,
            slots: []
          }
        }
        
        const startTime = new Date(group.date)
        startTime.setHours(group.startHour, 0, 0, 0)
        const endTime = new Date(group.date)
        endTime.setHours(group.endHour, 0, 0, 0)
        
        acc[group.equipmentId].slots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
        
        return acc
      }, {})
      
      // Submit for each equipment
      for (const equipmentData of Object.values(slotsByEquipment)) {
        const response = await fetch('/api/time-reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            equipmentId: equipmentData.equipmentId,
            equipmentName: equipmentData.equipmentName,
            timeSlots: equipmentData.slots,
            reason: reservationReason,
            createdBy: user?.name || 'Unknown User',
            createdByEmail: user?.email || 'unknown@email.com'
          })
        })
        
        responses.push(response)
      }
      
      // Check all responses
      const allSuccessful = responses.every(r => r.ok)
      
      if (!allSuccessful) throw new Error('Failed to create some reservations')
      
      const totalReservations = Object.keys(slotsByEquipment).length
      toast.success(`Created reservations for ${totalReservations} equipment(s)`)
      setSelectedTimeSlots([])
      setReservationReason('')
      setShowReservationDialog(false)
      setReservationMode(false)
      await fetchTimeReservations() // Refresh reservations
    } catch (error) {
      console.error('Error creating reservations:', error)
      toast.error('Failed to create reservations')
    }
  }
  
  // Helper function to find next available time slot skipping reserved times
  const findNextAvailableTime = (startTime: Date, duration: number, equipmentId: string): Date => {
    let currentTime = new Date(startTime)
    let attempts = 0
    const maxAttempts = 100 // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      const endTime = addHours(currentTime, duration)
      
      // Check for reserved time conflicts
      const hasReservedConflict = timeReservations.some(res => {
        if (res.equipmentId !== equipmentId) return false
        
        return (
          (currentTime >= res.startTime && currentTime < res.endTime) ||
          (endTime > res.startTime && endTime <= res.endTime) ||
          (currentTime <= res.startTime && endTime >= res.endTime)
        )
      })
      
      if (hasReservedConflict) {
        // Find the end of the conflicting reservation
        const conflictingRes = timeReservations.find(res => {
          if (res.equipmentId !== equipmentId) return false
          
          return (
            (currentTime >= res.startTime && currentTime < res.endTime) ||
            (endTime > res.startTime && endTime <= res.endTime) ||
            (currentTime <= res.startTime && endTime >= res.endTime)
          )
        })
        
        if (conflictingRes) {
          // Move to the end of the reservation
          currentTime = new Date(conflictingRes.endTime)
          console.log(`Skipping reserved time, moving to ${currentTime}`)
        } else {
          // Move forward by 1 hour if we can't find the specific reservation
          currentTime = addHours(currentTime, 1)
        }
        
        // Check if we need to move to next working day
        const currentHour = currentTime.getHours()
        if (currentHour >= calculationSettings.workingHoursEnd || 
            (currentHour < calculationSettings.workingHoursStart && currentHour !== 0)) {
          currentTime = addDays(currentTime, 1)
          currentTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
        }
        
        // Skip weekends if necessary
        if (calculationSettings.skipWeekends) {
          while (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
            currentTime = addDays(currentTime, 1)
          }
        }
      } else {
        // No conflict, return this time
        return currentTime
      }
      
      attempts++
    }
    
    // Fallback to original time if we couldn't find a slot
    return startTime
  }

  // Check if there are conflicts in a time slot (excluding reserved times)
  const checkForConflicts = (startTime: Date, endTime: Date, equipmentId: string, excludeTaskId?: string) => {
    console.log('checkForConflicts called:', {
      startTime,
      endTime,
      equipmentId,
      excludeTaskId,
      totalTasks: scheduledTasks.length
    })
    
    // Don't check for reserved time conflicts here - we'll handle them automatically
    
    return scheduledTasks.filter(task => {
      if (excludeTaskId && task.id === excludeTaskId) return false
      
      const taskStart = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
      const taskEnd = task.endTime instanceof Date ? task.endTime : new Date(task.endTime)
      
      // Check if same equipment
      if (task.equipmentId !== equipmentId) {
        return false
      }
      
      // Check if time overlaps
      const overlaps = (
        (startTime >= taskStart && startTime < taskEnd) || // New task starts during existing task
        (endTime > taskStart && endTime <= taskEnd) || // New task ends during existing task
        (startTime <= taskStart && endTime >= taskEnd) // New task completely covers existing task
      )
      
      if (overlaps) {
        console.log('Conflict found:', {
          task: task.title,
          taskStart,
          taskEnd,
          newStart: startTime,
          newEnd: endTime
        })
      }
      
      return overlaps
    })
  }

  // Get week days
  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const end = endOfWeek(date, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current
    setDraggedItem(item)
    
    // If dragging a scheduled task and it's part of highlighted request,
    // we'll move all tasks from that request
    if (item.isScheduled && highlightedRequestId === item.requestId) {
      toast.info(`Moving all tasks from request ${item.title}`)
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      console.log('No drop target')
      setDraggedItem(null)
      return
    }

    console.log('Drop event:', {
      activeId: active.id,
      overId: over.id,
      overData: over.data.current
    })

    const item = active.data.current as any
    const dropData = over.data.current as {
      date: Date
      hour: number
      equipment: Equipment
    }
    
    if (!dropData || !dropData.date || dropData.hour === undefined || !dropData.equipment) {
      setDraggedItem(null)
      return
    }

    // Check if this is a scheduled task being moved
    if (item.isScheduled) {
      // Handle moving an already scheduled task
      const scheduledTask = item as ScheduledTask
      
      // Calculate new time for the task
      const taskDuration = differenceInHours(scheduledTask.endTime, scheduledTask.startTime)
      let taskStartTime = new Date(dropData.date)
      taskStartTime.setHours(dropData.hour, 0, 0, 0)
      
      // Calculate end of working day
      const endOfDay = new Date(taskStartTime)
      endOfDay.setHours(calculationSettings.workingHoursEnd, 0, 0, 0)
      
      // Calculate hours until end of day
      const hoursUntilEndOfDay = differenceInHours(endOfDay, taskStartTime)
      
      // If task doesn't fit in remaining hours of the day, move to next day
      if (hoursUntilEndOfDay < taskDuration) {
        taskStartTime = addDays(taskStartTime, 1)
        taskStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
      }
      
      // Check for conflicts
      const targetEquipmentId = dropData.equipment.id === 'combined-equipment' 
        ? scheduledTask.equipmentId 
        : dropData.equipment.id
      
      // Find next available time skipping reserved slots
      taskStartTime = findNextAvailableTime(taskStartTime, taskDuration, targetEquipmentId)
      const taskEndTime = addHours(taskStartTime, taskDuration)
        
      const conflicts = checkForConflicts(taskStartTime, taskEndTime, targetEquipmentId, scheduledTask.id)
      
      
      if (conflicts.length > 0) {
        // Show conflict dialog
        setConflictDialog({
          show: true,
          conflictingTasks: conflicts,
          newTask: scheduledTask,
          dropData: {
            ...dropData,
            startTime: taskStartTime,
            endTime: taskEndTime,
            equipmentId: targetEquipmentId,
            equipment: dropData.equipment
          }
        })
        setDraggedItem(null)
        return
      }
      
      // If double-clicked (all tasks highlighted), move all tasks from this request
      if (highlightedRequestId === scheduledTask.requestId) {
        // Move all tasks from this request
        const tasksToMove = scheduledTasks.filter(t => t.requestId === scheduledTask.requestId)
        const otherTasks = scheduledTasks.filter(t => t.requestId !== scheduledTask.requestId)
        
        let currentStartTime = new Date(dropData.date)
        currentStartTime.setHours(dropData.hour, 0, 0, 0)
        
        const updatedTasks = tasksToMove.map((task, index) => {
          let taskStartTime = new Date(currentStartTime)
          
          // Calculate end of working day
          const endOfDay = new Date(taskStartTime)
          endOfDay.setHours(calculationSettings.workingHoursEnd, 0, 0, 0)
          
          // Calculate hours until end of day
          const hoursUntilEndOfDay = differenceInHours(endOfDay, taskStartTime)
          const taskDuration = differenceInHours(task.endTime, task.startTime)
          
          // If task doesn't fit in remaining hours of the day, move to next day
          if (hoursUntilEndOfDay < taskDuration) {
            taskStartTime = addDays(taskStartTime, 1)
            taskStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
          }
          
          const taskEndTime = addHours(taskStartTime, taskDuration)
          currentStartTime = new Date(taskEndTime)
          
          return {
            ...task,
            startTime: taskStartTime,
            endTime: taskEndTime,
            equipment: dropData.equipment.id === 'combined-equipment' 
              ? task.equipment // Keep original equipment name
              : dropData.equipment.name,
            equipmentId: dropData.equipment.id === 'combined-equipment'
              ? task.equipmentId // Keep original equipment ID
              : dropData.equipment.id,
          }
        })
        
        setScheduledTasks([...otherTasks, ...updatedTasks])
        toast.success(`Moved all tasks for request ${scheduledTask.title} to ${dropData.equipment.name}`)
        setHighlightedRequestId(null)
      } else {
        // Move single task
        const taskDuration = differenceInHours(scheduledTask.endTime, scheduledTask.startTime)
        let taskStartTime = new Date(dropData.date)
        taskStartTime.setHours(dropData.hour, 0, 0, 0)
        
        // Calculate end of working day
        const endOfDay = new Date(taskStartTime)
        endOfDay.setHours(calculationSettings.workingHoursEnd, 0, 0, 0)
        
        // Calculate hours until end of day
        const hoursUntilEndOfDay = differenceInHours(endOfDay, taskStartTime)
        
        // If task doesn't fit in remaining hours of the day, move to next day
        if (hoursUntilEndOfDay < taskDuration) {
          taskStartTime = addDays(taskStartTime, 1)
          taskStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
        }
        
        const taskEndTime = addHours(taskStartTime, taskDuration)
        
        // Update the task
        
        const updatedScheduledTasks = scheduledTasks.map(task =>
          task.id === scheduledTask.id
            ? {
                ...task,
                startTime: taskStartTime,
                endTime: taskEndTime,
                equipment: dropData.equipment.id === 'combined-equipment' 
                  ? task.equipment // Keep original equipment name
                  : dropData.equipment.name,
                equipmentId: dropData.equipment.id === 'combined-equipment'
                  ? task.equipmentId // Keep original equipment ID
                  : dropData.equipment.id,
              }
            : task
        )
        
        setScheduledTasks(updatedScheduledTasks)
        toast.success(`Moved "${scheduledTask.title}" to ${dropData.equipment.name}`)
      }
      
      setDraggedItem(null)
      return
    }

    // Create new scheduled task(s)
    const startTime = new Date(dropData.date)
    startTime.setHours(dropData.hour, 0, 0, 0)
    
    
    if ('samples' in item) {
      // It's a request - create tasks for each sample
      console.log(`Dragging request ${item.id} with ${item.samples.length} samples`)
      let currentStartTime = new Date(startTime)
      const newTasks: ScheduledTask[] = []
      
      // First, remove any existing tasks for these samples
      const sampleIds = item.samples.map(s => s.id)
      const filteredTasks = scheduledTasks.filter(task => !sampleIds.includes(task.sampleId))
      
      // Calculate all new tasks first to check for conflicts
      const plannedTasks: ScheduledTask[] = []
      let tempStartTime = new Date(currentStartTime)
      
      console.log(`Creating tasks for ${item.samples.length} samples:`, item.samples.map(s => ({
        id: s.id,
        name: s.sampleName,
        method: s.testMethod,
        hours: s.estimatedHours
      })))
      
      item.samples.forEach((sample, index) => {
        let taskStartTime = new Date(tempStartTime)
        
        // Calculate end of working day
        const endOfDay = new Date(taskStartTime)
        endOfDay.setHours(calculationSettings.workingHoursEnd, 0, 0, 0)
        
        // Calculate hours until end of day
        const hoursUntilEndOfDay = differenceInHours(endOfDay, taskStartTime)
        
        // If sample doesn't fit in remaining hours of the day, move to next day
        if (hoursUntilEndOfDay < sample.estimatedHours) {
          taskStartTime = addDays(taskStartTime, 1)
          taskStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
        }
        
        const taskEndTime = addHours(taskStartTime, sample.estimatedHours)
        
        const targetEquipmentId = dropData.equipment.id === 'combined-equipment'
          ? equipment.filter(eq => selectedEquipment.includes(eq.id))[0]?.id || dropData.equipment.id
          : dropData.equipment.id
        
        // Find next available time skipping reserved slots
        taskStartTime = findNextAvailableTime(taskStartTime, sample.estimatedHours, targetEquipmentId)
        const adjustedTaskEndTime = addHours(taskStartTime, sample.estimatedHours)
          
        plannedTasks.push({
          id: `task-${item.id}-${sample.id}-${Date.now()}-${index}`,
          requestId: item.id,
          sampleId: sample.id,
          sampleName: sample.sampleName,
          testMethod: sample.testMethod,
          title: item.title.replace(/^Request\s+/, ''),
          startTime: new Date(taskStartTime),
          endTime: adjustedTaskEndTime,
          equipment: dropData.equipment.id === 'combined-equipment' 
            ? equipment.filter(eq => selectedEquipment.includes(eq.id))[0]?.name || dropData.equipment.name
            : dropData.equipment.name,
          equipmentId: targetEquipmentId,
          priority: item.priority,
          status: 'scheduled',
          operator: dropData.equipment.operator,
        })
        
        // Update temp start time for next sample
        tempStartTime = new Date(adjustedTaskEndTime)
      })
      
      console.log(`Created ${plannedTasks.length} planned tasks for request ${item.id}`)
      
      // Check for conflicts with all planned tasks
      let hasConflicts = false
      let conflictingTasks: ScheduledTask[] = []
      
      for (const plannedTask of plannedTasks) {
        const conflicts = checkForConflicts(
          plannedTask.startTime, 
          plannedTask.endTime, 
          plannedTask.equipmentId
        )
        if (conflicts.length > 0) {
          hasConflicts = true
          conflictingTasks = [...conflictingTasks, ...conflicts]
        }
      }
      
      // Remove duplicates from conflicting tasks
      conflictingTasks = Array.from(new Set(conflictingTasks.map(t => t.id)))
        .map(id => conflictingTasks.find(t => t.id === id)!)
      
      if (hasConflicts) {
        // Show conflict dialog
        setConflictDialog({
          show: true,
          conflictingTasks,
          newTask: {
            ...item,
            plannedTasks, // Store the planned tasks for later use
            startTime: plannedTasks[0].startTime,
            endTime: plannedTasks[plannedTasks.length - 1].endTime
          },
          dropData: {
            ...dropData,
            startTime: plannedTasks[0].startTime,
            endTime: plannedTasks[plannedTasks.length - 1].endTime,
            equipmentId: plannedTasks[0].equipmentId,
            equipment: dropData.equipment
          }
        })
        setDraggedItem(null)
        return
      }
      
      // No conflicts, proceed with scheduling
      const newScheduledTasks = [...filteredTasks, ...plannedTasks]
      setScheduledTasks(newScheduledTasks)
      
      // Update request status
      setRequests(requests.map(req => 
        req.id === item.id 
          ? { ...req, status: 'scheduled', equipment: dropData.equipment.name }
          : req
      ))
    } else {
      // It's a single sample
      const estimatedHours = (item as TestSample).estimatedHours
      
      // Remove any existing task for this sample
      const filteredTasks = scheduledTasks.filter(task => task.sampleId !== item.id)
      
      let taskStartTime = new Date(startTime)
      
      // Calculate end of working day
      const endOfDay = new Date(taskStartTime)
      endOfDay.setHours(calculationSettings.workingHoursEnd, 0, 0, 0)
      
      // Calculate hours until end of day
      const hoursUntilEndOfDay = differenceInHours(endOfDay, taskStartTime)
      
      // If sample doesn't fit in remaining hours of the day, move to next day
      if (hoursUntilEndOfDay < estimatedHours) {
        taskStartTime = addDays(taskStartTime, 1)
        taskStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
      }
      
      const targetEquipmentId = dropData.equipment.id === 'combined-equipment'
        ? equipment.filter(eq => selectedEquipment.includes(eq.id))[0]?.id || dropData.equipment.id
        : dropData.equipment.id
      
      // Find next available time skipping reserved slots
      taskStartTime = findNextAvailableTime(taskStartTime, estimatedHours, targetEquipmentId)
      const taskEndTime = addHours(taskStartTime, estimatedHours)

      // Check for conflicts
      const conflicts = checkForConflicts(taskStartTime, taskEndTime, targetEquipmentId)
      
      if (conflicts.length > 0) {
        // Show conflict dialog
        setConflictDialog({
          show: true,
          conflictingTasks: conflicts,
          newTask: {
            ...item,
            id: `task-sample-${item.id}-${Date.now()}`,
            requestId: item.requestId || '',
            sampleId: item.id,
            title: item.requestId ? item.requestId.replace(/^Request\s+/, '') : `${item.sampleName} - ${item.testMethod}`,
            startTime: taskStartTime,
            endTime: taskEndTime,
            equipment: dropData.equipment.name,
            equipmentId: targetEquipmentId,
            priority: item.priority || 'normal',
            status: 'scheduled',
            operator: dropData.equipment.operator,
          },
          dropData: {
            ...dropData,
            startTime: taskStartTime,
            endTime: taskEndTime,
            equipmentId: targetEquipmentId,
            equipment: dropData.equipment
          }
        })
        setDraggedItem(null)
        return
      }

      const newTask: ScheduledTask = {
        id: `task-single-${item.id}-${Date.now()}`,
        requestId: item.requestId || '',
        sampleId: item.id,
        sampleName: item.sampleName,
        testMethod: item.testMethod,
        title: item.requestId ? item.requestId.replace(/^Request\s+/, '') : `${item.sampleName} - ${item.testMethod}`,
        startTime: taskStartTime,
        endTime: taskEndTime,
        equipment: dropData.equipment.id === 'combined-equipment' 
          ? equipment.filter(eq => selectedEquipment.includes(eq.id))[0]?.name || dropData.equipment.name
          : dropData.equipment.name,
        equipmentId: targetEquipmentId,
        priority: item.priority || 'normal',
        status: 'scheduled',
        operator: dropData.equipment.operator,
      }

      console.log('Adding new task:', newTask)
      console.log('Current scheduled tasks before:', scheduledTasks.length)
      setScheduledTasks([...filteredTasks, newTask])
      console.log('Scheduled tasks after:', [...filteredTasks, newTask].length)
      
      // Update sample status
      setRequests(requests.map(req => ({
        ...req,
        samples: req.samples.map(sample =>
          sample.id === item.id
            ? { ...sample, status: 'scheduled' }
            : sample
        )
      })))
    }

    const scheduledTitle = 'samples' in item ? item.title.replace(/^Request\s+/, '') : item.sampleName
    toast.success(`Scheduled "${scheduledTitle}" on ${dropData.equipment.name}`)
    setDraggedItem(null)
  }

  // Handle removing a task from the schedule
  const handleRemoveTask = (taskId: string) => {
    const taskToRemove = scheduledTasks.find(task => task.id === taskId)
    if (!taskToRemove) return

    let tasksToRemove = [taskToRemove]
    
    // If removing highlighted request tasks, remove all tasks from that request
    if (highlightedRequestId && taskToRemove.requestId === highlightedRequestId) {
      tasksToRemove = scheduledTasks.filter(task => task.requestId === highlightedRequestId)
      setHighlightedRequestId(null)
    } else if (taskToRemove.requestId && taskToRemove.sampleId) {
      // It's a sample from a request - remove just this sample
      tasksToRemove = [taskToRemove]
    } else if (taskToRemove.requestId) {
      // It's a standalone task representing a request - shouldn't happen with new logic
      tasksToRemove = scheduledTasks.filter(task => task.requestId === taskToRemove.requestId)
    }

    // Remove the task(s) from scheduled tasks
    const taskIdsToRemove = tasksToRemove.map(t => t.id)
    setScheduledTasks(scheduledTasks.filter(task => !taskIdsToRemove.includes(task.id)))

    // Update the request/sample status back to its original state
    if (taskToRemove.requestId) {
      // Check if there are any remaining scheduled tasks for this request
      const remainingTasks = scheduledTasks.filter(
        task => task.requestId === taskToRemove.requestId && !taskIdsToRemove.includes(task.id)
      )
      
      if (remainingTasks.length === 0) {
        // No more scheduled tasks for this request - update request status
        setRequests(requests.map(req => 
          req.id === taskToRemove.requestId 
            ? { ...req, status: 'in-progress', equipment: '' }
            : req
        ))
      }
    }

    toast.success(`Removed ${tasksToRemove.length > 1 ? `all ${tasksToRemove.length} tasks from request` : `"${taskToRemove.title}"`} from schedule`)
  }

  // Handle double-click on calendar task - toggle highlight
  const handleTaskDoubleClick = (task: ScheduledTask) => {
    if (task.requestId) {
      // Toggle highlight - if already highlighted, unhighlight it
      setHighlightedRequestId(prevId => prevId === task.requestId ? null : task.requestId)
    }
  }

  // Get scheduled tasks for a specific time slot
  const getTasksForSlot = (date: Date, hour: number, equipmentId: string) => {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)

    // Only return tasks that START in this hour slot
    const tasksInSlot = scheduledTasks.filter(task => {
      // Ensure task.startTime is a Date object
      const taskStartTime = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
      const taskStartHour = taskStartTime.getHours()
      
      // For combined equipment view, show all tasks from selected equipment
      if (equipmentId === 'combined-equipment') {
        const selectedEquipmentIds = equipment
          .filter(eq => selectedEquipment.includes(eq.id))
          .map(eq => eq.id)
        return selectedEquipmentIds.includes(task.equipmentId) &&
          isSameDay(taskStartTime, date) &&
          taskStartHour === hour
      }
      
      const matches = task.equipmentId === equipmentId &&
        isSameDay(taskStartTime, date) &&
        taskStartHour === hour
        
      return matches
    })
    
    return tasksInSlot
  }

  // Group tasks by request for visual grouping
  const getTasksGroupedByRequest = (tasks: ScheduledTask[]) => {
    const groups: { [key: string]: ScheduledTask[] } = {}
    
    tasks.forEach(task => {
      if (task.requestId) {
        if (!groups[task.requestId]) {
          groups[task.requestId] = []
        }
        groups[task.requestId].push(task)
      } else {
        // Individual samples without request
        groups[`individual-${task.id}`] = [task]
      }
    })
    
    return groups
  }

  // Handle removing all tasks for a request
  const handleRemoveAllRequestTasks = (requestId: string) => {
    const tasksToRemove = scheduledTasks.filter(task => task.requestId === requestId)
    const taskIds = tasksToRemove.map(t => t.id)
    
    // Remove all tasks for this request
    setScheduledTasks(scheduledTasks.filter(task => task.requestId !== requestId))
    
    // Update request status
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { ...req, status: 'in-progress', equipment: '' }
        : req
    ))
    
    const request = requests.find(r => r.id === requestId)
    toast.success(`Removed all samples for "${request?.title.replace(/^Request\s+/, '')}" from schedule`)
  }

  // Calculate equipment workload
  const calculateEquipmentWorkload = (equipmentId: string) => {
    const today = startOfDay(new Date())
    const weekEnd = addDays(today, 7)
    
    let weekTasks
    if (equipmentId === 'combined-equipment') {
      const selectedEquipmentIds = equipment
        .filter(eq => selectedEquipment.includes(eq.id))
        .map(eq => eq.id)
      weekTasks = scheduledTasks.filter(task =>
        selectedEquipmentIds.includes(task.equipmentId) &&
        isAfter(task.startTime, today) &&
        isBefore(task.startTime, weekEnd)
      )
    } else {
      weekTasks = scheduledTasks.filter(task =>
        task.equipmentId === equipmentId &&
        isAfter(task.startTime, today) &&
        isBefore(task.startTime, weekEnd)
      )
    }

    const totalHours = weekTasks.reduce((sum, task) => 
      sum + differenceInHours(task.endTime, task.startTime), 0
    )

    const availableHours = 5 * 8 // 5 days * 8 hours
    return Math.round((totalHours / availableHours) * 100)
  }

  // Initialize selected equipment on mount
  useEffect(() => {
    // Auto-select first 3 equipment if available
    if (equipment.length > 0 && selectedEquipment.length === 0) {
      const initialSelection = equipment.slice(0, 3).map(eq => eq.id)
      setSelectedEquipment(initialSelection)
    }
  }, [equipment])
  
  // Update dynamic working hours based on selected equipment
  useEffect(() => {
    if (selectedEquipment.length === 0) {
      // Default working hours when no equipment selected
      setDynamicWorkingHours({ start: 8, end: 16 })
      return
    }
    
    // Get selected equipment objects
    const selectedEquipmentObjects = equipment.filter(eq => 
      selectedEquipment.includes(eq.id)
    )
    
    if (selectedEquipmentObjects.length === 0) {
      setDynamicWorkingHours({ start: 8, end: 16 })
      return
    }
    
    // Calculate widest time range from all selected equipment
    const earliestStart = Math.min(
      ...selectedEquipmentObjects.map(eq => eq.operationalHours.start)
    )
    const latestEnd = Math.max(
      ...selectedEquipmentObjects.map(eq => eq.operationalHours.end)
    )
    
    setDynamicWorkingHours({ start: earliestStart, end: latestEnd })
    
    // Also update calculationSettings to use the dynamic hours
    setCalculationSettings(prev => ({
      ...prev,
      workingHoursStart: earliestStart,
      workingHoursEnd: latestEnd
    }))
  }, [selectedEquipment, equipment])
  
  // Handle save schedule trigger
  useEffect(() => {
    if (shouldSaveSchedule) {
      handleSaveSchedule()
      setShouldSaveSchedule(false)
    }
  }, [shouldSaveSchedule])
  
  // Handle overlap conflict - allow tasks to stack
  const handleOverlapConflict = () => {
    if (!conflictDialog) return
    
    const { newTask, dropData } = conflictDialog
    
    // Check if this is a new task from left panel (has plannedTasks)
    if (newTask.plannedTasks) {
      // Handle multiple tasks from a request
      const filteredTasks = scheduledTasks.filter(task => 
        !newTask.samples.map((s: any) => s.id).includes(task.sampleId)
      )
      setScheduledTasks([...filteredTasks, ...newTask.plannedTasks])
      
      // Update request status
      setRequests(requests.map(req => 
        req.id === newTask.id 
          ? { ...req, status: 'scheduled', equipment: dropData.equipment.name }
          : req
      ))
      
      toast.success(`Scheduled "${newTask.title}" (overlapping allowed)`)
      setConflictDialog(null)
      return
    }
    
    // Check if this is a single sample from left panel (no existing id in scheduledTasks)
    const isNewTask = !scheduledTasks.find(t => t.id === newTask.id)
    if (isNewTask && !newTask.requestId) {
      // It's a new single sample
      const filteredTasks = scheduledTasks.filter(task => task.sampleId !== newTask.sampleId)
      const newScheduledTask: ScheduledTask = {
        id: newTask.id || `task-overlap-${newTask.sampleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestId: newTask.requestId || '',
        sampleId: newTask.sampleId,
        sampleName: newTask.sampleName,
        testMethod: newTask.testMethod,
        title: newTask.title,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        equipment: newTask.equipment,
        equipmentId: newTask.equipmentId,
        priority: newTask.priority || 'normal',
        status: 'scheduled',
        operator: newTask.operator,
      }
      
      setScheduledTasks([...filteredTasks, newScheduledTask])
      
      // Update sample status
      setRequests(requests.map(req => ({
        ...req,
        samples: req.samples.map(sample =>
          sample.id === newTask.sampleId
            ? { ...sample, status: 'scheduled' }
            : sample
        )
      })))
      
      toast.success(`Scheduled "${newTask.title}" (overlapping allowed)`)
      setConflictDialog(null)
      return
    }
    
    // Handle existing task being moved
    if (newTask.requestId && highlightedRequestId === newTask.requestId) {
      // Move all tasks from this request
      const tasksToMove = scheduledTasks.filter(t => t.requestId === newTask.requestId)
      const otherTasks = scheduledTasks.filter(t => t.requestId !== newTask.requestId)
      
      let currentStartTime = new Date(dropData.startTime)
      
      const updatedTasks = tasksToMove.map((task) => {
        let taskStartTime = new Date(currentStartTime)
        const taskDuration = differenceInHours(task.endTime, task.startTime)
        const taskEndTime = addHours(taskStartTime, taskDuration)
        currentStartTime = new Date(taskEndTime)
        
        return {
          ...task,
          startTime: taskStartTime,
          endTime: taskEndTime,
          equipment: dropData.equipment.name,
          equipmentId: dropData.equipmentId,
        }
      })
      
      setScheduledTasks([...otherTasks, ...updatedTasks])
      toast.success(`Moved all tasks for request ${newTask.title} (overlapping allowed)`)
    } else {
      // Move single task
      setScheduledTasks(scheduledTasks.map(task =>
        task.id === newTask.id
          ? {
              ...task,
              startTime: dropData.startTime,
              endTime: dropData.endTime,
              equipment: dropData.equipment.name,
              equipmentId: dropData.equipmentId,
            }
          : task
      ))
      toast.success(`Moved "${newTask.title}" (overlapping allowed)`)
    }
    
    setConflictDialog(null)
  }
  
  // Handle insert conflict - shift all subsequent tasks with proper cascading
  const handleInsertConflict = () => {
    if (!conflictDialog) return
    
    const { newTask, dropData, conflictingTasks } = conflictDialog
    
    // Handle new tasks from left panel
    if (newTask.plannedTasks) {
      // Multiple tasks from a request
      console.log(`handleInsertConflict: Processing ${newTask.plannedTasks.length} planned tasks from ${newTask.title}`)
      console.log('Planned tasks details:', newTask.plannedTasks.map((t: ScheduledTask) => ({
        id: t.id,
        sampleName: t.sampleName,
        testMethod: t.testMethod,
        startTime: t.startTime,
        endTime: t.endTime
      })))
      
      // Find all existing tasks that need to be shifted
      const tasksToShift = scheduledTasks.filter(task => {
        if (task.equipmentId !== dropData.equipmentId) return false
        const taskStart = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
        return taskStart >= dropData.startTime
      }).sort((a, b) => {
        // Sort by start time to ensure proper cascading
        const aStart = a.startTime instanceof Date ? a.startTime : new Date(a.startTime)
        const bStart = b.startTime instanceof Date ? b.startTime : new Date(b.startTime)
        return aStart.getTime() - bStart.getTime()
      })
      
      console.log(`Found ${tasksToShift.length} tasks to shift`)
      
      // Remove old tasks for the same samples
      const filteredTasks = scheduledTasks.filter(task => 
        !newTask.samples.map((s: any) => s.id).includes(task.sampleId) &&
        !tasksToShift.find(t => t.id === task.id)
      )
      
      console.log(`Keeping ${filteredTasks.length} existing tasks after filtering`)
      
      // Create array to hold all tasks in chronological order
      let allTasksInOrder: ScheduledTask[] = []
      
      // Add the new tasks first - they should stay together as a block
      allTasksInOrder.push(...newTask.plannedTasks)
      console.log(`Added ${newTask.plannedTasks.length} new tasks to order array`)
      
      // Add tasks that need to be shifted after the new tasks
      allTasksInOrder.push(...tasksToShift)
      console.log(`Added ${tasksToShift.length} existing tasks to shift`)
      
      // DO NOT SORT! We want to maintain the insertion order:
      // - All new tasks together at the drop position
      // - Then all existing tasks that need to shift
      
      // Now recalculate positions sequentially to avoid any overlap
      // Start from the exact drop time
      let currentEndTime = new Date(dropData.startTime)
      
      const repositionedTasks = allTasksInOrder.map((task, index) => {
        const taskDuration = differenceInHours(
          task.endTime instanceof Date ? task.endTime : new Date(task.endTime),
          task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
        )
        
        const isNewTask = newTask.plannedTasks.some((pt: ScheduledTask) => pt.id === task.id)
        console.log(`Repositioning task ${index + 1}/${allTasksInOrder.length}: ${task.sampleName} - ${task.testMethod} (${isNewTask ? 'NEW' : 'EXISTING'})`)
        
        // Set start time to current end time (or later if needed)
        let newStartTime = new Date(currentEndTime)
        let newEndTime = addHours(newStartTime, taskDuration)
        
        // Check for reserved time conflicts and skip them
        let hasReservedConflict = true
        let maxIterations = 100 // Prevent infinite loop
        let iterations = 0
        
        while (hasReservedConflict && iterations < maxIterations) {
          hasReservedConflict = timeReservations.some(res => {
            if (res.equipmentId !== task.equipmentId) return false
            
            return (
              (newStartTime >= res.startTime && newStartTime < res.endTime) ||
              (newEndTime > res.startTime && newEndTime <= res.endTime) ||
              (newStartTime <= res.startTime && newEndTime >= res.endTime)
            )
          })
          
          if (hasReservedConflict) {
            console.log(`Task conflicts with reserved time, skipping to next available slot`)
            // Find the end of the conflicting reservation
            const conflictingRes = timeReservations.find(res => {
              if (res.equipmentId !== task.equipmentId) return false
              
              return (
                (newStartTime >= res.startTime && newStartTime < res.endTime) ||
                (newEndTime > res.startTime && newEndTime <= res.endTime) ||
                (newStartTime <= res.startTime && newEndTime >= res.endTime)
              )
            })
            
            if (conflictingRes) {
              newStartTime = new Date(conflictingRes.endTime)
              newEndTime = addHours(newStartTime, taskDuration)
            }
          }
          
          iterations++
        }
        
        // Check if we need to move to next working day
        const startHour = newStartTime.getHours()
        
        if (startHour >= calculationSettings.workingHoursEnd || 
            (startHour < calculationSettings.workingHoursStart && startHour !== 0)) {
          // Move to next working day
          newStartTime = addDays(newStartTime, 1)
          newStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
          newEndTime = addHours(newStartTime, taskDuration)
        }
        
        // Check if task extends beyond working hours
        if (newEndTime.getHours() > calculationSettings.workingHoursEnd || 
            (newEndTime.getHours() === calculationSettings.workingHoursEnd && newEndTime.getMinutes() > 0)) {
          // Move to next working day
          newStartTime = addDays(newStartTime, 1)
          newStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
          const adjustedEndTime = addHours(newStartTime, taskDuration)
          
          currentEndTime = adjustedEndTime
          
          return {
            ...task,
            startTime: newStartTime,
            endTime: adjustedEndTime,
          }
        }
        
        // Update current end time for next task
        currentEndTime = newEndTime
        
        return {
          ...task,
          startTime: newStartTime,
          endTime: newEndTime,
        }
      })
      
      console.log(`Final repositioned tasks count: ${repositionedTasks.length}`)
      console.log('Repositioned tasks:', repositionedTasks.map(t => ({
        id: t.id,
        sampleName: t.sampleName,
        testMethod: t.testMethod
      })))
      
      const newTaskIds = newTask.plannedTasks.map((pt: ScheduledTask) => pt.id)
      const actuallyInsertedTasks = repositionedTasks.filter(t => newTaskIds.includes(t.id))
      console.log(`Actually inserted tasks: ${actuallyInsertedTasks.length}`)
      
      setScheduledTasks([...filteredTasks, ...repositionedTasks])
      
      // Update request status
      setRequests(requests.map(req => 
        req.id === newTask.id 
          ? { ...req, status: 'scheduled', equipment: dropData.equipment.name }
          : req
      ))
      
      const insertedCount = repositionedTasks.filter(t => 
        newTask.plannedTasks.some((pt: ScheduledTask) => pt.id === t.id)
      ).length
      
      // Verify all new tasks were inserted
      if (insertedCount !== newTask.plannedTasks.length) {
        console.error(`Warning: Only ${insertedCount} of ${newTask.plannedTasks.length} tasks were inserted!`)
      }
      
      toast.success(`Inserted ${insertedCount} samples from "${newTask.title}" and shifted ${tasksToShift.length} subsequent tasks`)
      setConflictDialog(null)
      return
    }
    
    // Handle all other cases (single sample or existing task move)
    
    // Determine if this is a new task
    const isNewTask = !scheduledTasks.find(t => t.id === newTask.id)
    
    // Get all tasks on the same equipment
    let allRelevantTasks = scheduledTasks.filter(task => 
      task.equipmentId === dropData.equipmentId && task.id !== newTask.id
    )
    
    // If moving existing task, exclude it from the list
    if (!isNewTask) {
      allRelevantTasks = allRelevantTasks.filter(task => task.id !== newTask.id)
    } else {
      // Remove any existing task for the same sample
      allRelevantTasks = allRelevantTasks.filter(task => task.sampleId !== newTask.sampleId)
    }
    
    // Create the task to insert
    const taskToInsert: ScheduledTask = {
      id: newTask.id || `task-overlap-${newTask.sampleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requestId: newTask.requestId || '',
      sampleId: newTask.sampleId,
      sampleName: newTask.sampleName || newTask.title,
      testMethod: newTask.testMethod,
      title: newTask.title,
      startTime: dropData.startTime,
      endTime: dropData.endTime,
      equipment: dropData.equipment.name,
      equipmentId: dropData.equipmentId,
      priority: newTask.priority || 'normal',
      status: 'scheduled',
      operator: dropData.equipment.operator,
    }
    
    // Add the new/moved task to the list
    allRelevantTasks.push(taskToInsert)
    
    // Sort all tasks by start time
    allRelevantTasks.sort((a, b) => {
      const aStart = a.startTime instanceof Date ? a.startTime : new Date(a.startTime)
      const bStart = b.startTime instanceof Date ? b.startTime : new Date(b.startTime)
      return aStart.getTime() - bStart.getTime()
    })
    
    // Now recalculate positions to avoid any overlap
    let lastEndTime: Date | null = null
    
    const repositionedTasks = allRelevantTasks.map((task, index) => {
      const taskDuration = differenceInHours(
        task.endTime instanceof Date ? task.endTime : new Date(task.endTime),
        task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
      )
      
      let newStartTime: Date
      
      if (index === 0 || !lastEndTime) {
        // First task, use its original start time
        newStartTime = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
      } else {
        // Subsequent tasks start where the previous one ended
        newStartTime = new Date(lastEndTime)
      }
      
      // Check if we need to move to next working day
      if (newStartTime.getHours() >= calculationSettings.workingHoursEnd || 
          (newStartTime.getHours() < calculationSettings.workingHoursStart && newStartTime.getHours() !== 0)) {
        // Move to next working day
        newStartTime = addDays(newStartTime, 1)
        newStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
      }
      
      let newEndTime = addHours(newStartTime, taskDuration)
      
      // Check if task extends beyond working hours
      if (newEndTime.getHours() > calculationSettings.workingHoursEnd || 
          (newEndTime.getHours() === calculationSettings.workingHoursEnd && newEndTime.getMinutes() > 0)) {
        // Move to next working day
        newStartTime = addDays(newStartTime, 1)
        newStartTime.setHours(calculationSettings.workingHoursStart, 0, 0, 0)
        newEndTime = addHours(newStartTime, taskDuration)
      }
      
      // Update last end time for next iteration
      lastEndTime = newEndTime
      
      return {
        ...task,
        startTime: newStartTime,
        endTime: newEndTime,
      }
    })
    
    // Get all other tasks (different equipment)
    const otherTasks = scheduledTasks.filter(task => 
      task.equipmentId !== dropData.equipmentId
    )
    
    // Combine all tasks
    setScheduledTasks([...otherTasks, ...repositionedTasks])
    
    // Update request/sample status
    if (isNewTask && !newTask.requestId) {
      setRequests(requests.map(req => ({
        ...req,
        samples: req.samples.map(sample =>
          sample.id === newTask.sampleId
            ? { ...sample, status: 'scheduled' }
            : sample
        )
      })))
    }
    
    const shiftedCount = allRelevantTasks.filter(t => t.id !== taskToInsert.id).length
    toast.success(`Inserted "${newTask.title}" and shifted ${shiftedCount} subsequent tasks`)
    setConflictDialog(null)
  }

  // Handle replace - replace existing tasks with new ones
  const handleReplace = (newTask: any, dropData: any) => {
    if (!conflictDialog) return
    
    // Remove conflicting tasks
    const conflictingTaskIds = conflictDialog.conflictingTasks.map((t: ScheduledTask) => t.id)
    const filteredTasks = scheduledTasks.filter(task => !conflictingTaskIds.includes(task.id))
    
    // Handle new tasks from left panel
    if (newTask.plannedTasks) {
      // Multiple tasks from a request
      setScheduledTasks([...filteredTasks, ...newTask.plannedTasks])
      
      // Update request status
      setRequests(requests.map(req => 
        req.id === newTask.id 
          ? { ...req, status: 'scheduled', equipment: dropData.equipment.name }
          : req
      ))
      
      toast.success(`Replaced ${conflictingTaskIds.length} tasks with "${newTask.title}"`)
    } else {
      // Single task
      const newScheduledTask: ScheduledTask = {
        id: newTask.id || `task-overlap-${newTask.sampleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestId: newTask.requestId || '',
        sampleId: newTask.sampleId,
        sampleName: newTask.sampleName,
        testMethod: newTask.testMethod,
        title: newTask.title,
        startTime: dropData.startTime,
        endTime: dropData.endTime,
        equipment: dropData.equipment.name,
        equipmentId: dropData.equipmentId,
        priority: newTask.priority || 'normal',
        status: 'scheduled',
        operator: dropData.equipment.operator,
      }
      
      setScheduledTasks([...filteredTasks, newScheduledTask])
      toast.success(`Replaced existing task with "${newTask.title}"`)
    }
    
    setConflictDialog(null)
  }

  // Handle insert and shift - insert new task and shift subsequent tasks
  const handleInsertAndShift = (newTask: any, dropData: any) => {
    if (!conflictDialog) return
    
    const { conflictingTasks } = conflictDialog
    
    // Calculate duration of new task(s)
    let totalDuration = 0
    if (newTask.plannedTasks) {
      totalDuration = newTask.plannedTasks.reduce((sum: number, task: ScheduledTask) => 
        sum + differenceInHours(task.endTime, task.startTime), 0
      )
    } else {
      totalDuration = differenceInHours(dropData.endTime, dropData.startTime)
    }
    
    // Find all tasks that need to be shifted (including conflicting ones)
    const tasksToShift = scheduledTasks.filter(task => {
      if (task.equipmentId !== dropData.equipmentId) return false
      const taskStart = task.startTime instanceof Date ? task.startTime : new Date(task.startTime)
      return taskStart >= dropData.startTime
    })
    
    // Shift existing tasks
    const shiftedTasks = tasksToShift.map(task => ({
      ...task,
      startTime: addHours(task.startTime, totalDuration),
      endTime: addHours(task.endTime, totalDuration),
    }))
    
    // Remove tasks to be shifted from current list
    const nonShiftedTasks = scheduledTasks.filter(task => 
      !tasksToShift.find(t => t.id === task.id)
    )
    
    // Add new task(s)
    if (newTask.plannedTasks) {
      // Multiple tasks from a request
      setScheduledTasks([...nonShiftedTasks, ...newTask.plannedTasks, ...shiftedTasks])
      
      // Update request status
      setRequests(requests.map(req => 
        req.id === newTask.id 
          ? { ...req, status: 'scheduled', equipment: dropData.equipment.name }
          : req
      ))
      
      toast.success(`Inserted "${newTask.title}" and shifted ${tasksToShift.length} tasks`)
    } else {
      // Single task
      const newScheduledTask: ScheduledTask = {
        id: newTask.id || `task-overlap-${newTask.sampleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestId: newTask.requestId || '',
        sampleId: newTask.sampleId,
        sampleName: newTask.sampleName,
        testMethod: newTask.testMethod,
        title: newTask.title,
        startTime: dropData.startTime,
        endTime: dropData.endTime,
        equipment: dropData.equipment.name,
        equipmentId: dropData.equipmentId,
        priority: newTask.priority || 'normal',
        status: 'scheduled',
        operator: dropData.equipment.operator,
      }
      
      setScheduledTasks([...nonShiftedTasks, newScheduledTask, ...shiftedTasks])
      toast.success(`Inserted "${newTask.title}" and shifted ${tasksToShift.length} tasks`)
    }
    
    setConflictDialog(null)
  }

  // Get filtered equipment based on selection
  const getFilteredEquipment = () => {
    if (selectedEquipment.length === 0) return []
    
    // If multiple equipment selected, create a combined view
    const filteredEquipment = equipment.filter(eq => selectedEquipment.includes(eq.id))
    
    if (filteredEquipment.length > 1) {
      // Create a single combined equipment entry
      return [{
        id: 'combined-equipment',
        name: filteredEquipment.map(eq => eq.name).join(' / '),
        capability: 'Multiple',
        operator: 'Multiple Operators',
        availability: 0.85,
        workload: 0,
        maxCapacity: 8,
        operationalHours: { start: 8, end: 17 },
        schedule: []
      }]
    }
    
    return filteredEquipment
  }

  // Check if a request is scheduled
  const isRequestScheduled = (requestId: string) => {
    return scheduledTasks.some(task => task.requestId === requestId)
  }

  // Check if a sample is scheduled
  const isSampleScheduled = (sampleId: string) => {
    return scheduledTasks.some(task => task.sampleId === sampleId)
  }

  // Get scheduled task info for a request
  const getRequestScheduleInfo = (requestId: string) => {
    const tasks = scheduledTasks.filter(task => task.requestId === requestId)
    if (tasks.length === 0) return null
    
    // Return the earliest start time and latest end time
    const startTime = new Date(Math.min(...tasks.map(t => t.startTime.getTime())))
    const endTime = new Date(Math.max(...tasks.map(t => t.endTime.getTime())))
    
    return {
      startTime,
      endTime,
      equipment: tasks[0].equipment // Assuming all on same equipment
    }
  }

  // Get scheduled task info for a sample
  const getSampleScheduleInfo = (sampleId: string) => {
    return scheduledTasks.find(task => task.sampleId === sampleId)
  }

  // Toggle request expansion
  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
  }

  // Get unscheduled requests
  const getUnscheduledRequests = () => {
    return requests.filter(request => !isRequestScheduled(request.id))
  }

  // Handle clear all schedule
  const handleClearAllSchedule = () => {
    if (confirm('Are you sure you want to clear all scheduled tasks? This action cannot be undone.')) {
      setScheduledTasks([])
      toast.success('All scheduled tasks have been cleared')
    }
  }

  // Handle auto plan
  const handleAutoPlan = () => {
    if (selectedEquipment.length === 0) {
      toast.error('Please select equipment first')
      return
    }

    const unscheduledRequests = getUnscheduledRequests()
    if (unscheduledRequests.length === 0) {
      toast.info('No unscheduled requests to plan')
      return
    }

    // Sort requests by priority: urgent/critical first, then normal by submission time (FIFO)
    const sortedRequests = [...unscheduledRequests].sort((a, b) => {
      // Priority weight: critical = 3, urgent = 2, normal = 1
      const priorityWeight = (priority: string) => {
        if (priority === 'critical') return 3
        if (priority === 'urgent') return 2
        return 1
      }
      
      const aPriority = priorityWeight(a.priority)
      const bPriority = priorityWeight(b.priority)
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority // Higher priority first
      }
      
      // If same priority, use FIFO (earlier submission time first)
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    })

    // Get selected equipment
    const selectedEquipmentObjects = equipment.filter(eq => 
      selectedEquipment.includes(eq.id)
    )

    let newScheduledTasks: ScheduledTask[] = [...scheduledTasks]
    let currentDate = new Date()
    currentDate.setHours(dynamicWorkingHours.start, 0, 0, 0)
    
    // Skip to next working day if needed
    if (currentDate < new Date()) {
      currentDate = new Date()
      currentDate.setHours(currentDate.getHours() + 1, 0, 0, 0)
    }
    
    if (calculationSettings.skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
      // Move to Monday if weekend
      const daysToAdd = currentDate.getDay() === 0 ? 1 : 2
      currentDate.setDate(currentDate.getDate() + daysToAdd)
      currentDate.setHours(dynamicWorkingHours.start, 0, 0, 0)
    }

    let scheduledCount = 0

    // Process each request
    for (const request of sortedRequests) {
      // Process each sample in the request
      for (const sample of request.samples) {
        // Find equipment for this sample
        const sampleEquipment = selectedEquipmentObjects.find(eq => 
          eq.name.toLowerCase().trim() === sample.equipment?.toLowerCase().trim()
        )
        
        if (!sampleEquipment) continue

        // Find next available slot for this equipment
        let taskStartTime = new Date(currentDate)
        let slotFound = false
        
        while (!slotFound) {
          // Check if current time is within working hours
          const currentHour = taskStartTime.getHours()
          if (currentHour >= dynamicWorkingHours.end || currentHour < dynamicWorkingHours.start) {
            // Move to next day
            taskStartTime.setDate(taskStartTime.getDate() + 1)
            taskStartTime.setHours(dynamicWorkingHours.start, 0, 0, 0)
            
            // Skip weekends if needed
            if (calculationSettings.skipWeekends && 
                (taskStartTime.getDay() === 0 || taskStartTime.getDay() === 6)) {
              const daysToAdd = taskStartTime.getDay() === 0 ? 1 : 2
              taskStartTime.setDate(taskStartTime.getDate() + daysToAdd)
            }
            continue
          }

          // Calculate end time
          const taskEndTime = new Date(taskStartTime)
          taskEndTime.setHours(taskEndTime.getHours() + sample.estimatedHours)

          // Check if this slot conflicts with existing tasks
          const hasConflict = newScheduledTasks.some(task => 
            task.equipmentId === sampleEquipment.id &&
            ((taskStartTime >= task.startTime && taskStartTime < task.endTime) ||
             (taskEndTime > task.startTime && taskEndTime <= task.endTime) ||
             (taskStartTime <= task.startTime && taskEndTime >= task.endTime))
          )

          if (!hasConflict) {
            // Create scheduled task
            const scheduledTask: ScheduledTask = {
              id: `auto-${request.id}-${sample.id}-${Date.now()}`,
              requestId: request.id,
              sampleId: sample.id,
              sampleName: sample.sampleName,
              testMethod: sample.testMethod,
              title: `${sample.sampleName} - ${sample.testMethod}`,
              startTime: new Date(taskStartTime),
              endTime: new Date(taskEndTime),
              equipment: sampleEquipment.name,
              equipmentId: sampleEquipment.id,
              priority: request.priority,
              status: 'scheduled',
              operator: sampleEquipment.operator || 'Unassigned',
            }

            newScheduledTasks.push(scheduledTask)
            scheduledCount++
            slotFound = true
          } else {
            // Move to next hour
            taskStartTime.setHours(taskStartTime.getHours() + 1)
          }
        }
      }
    }

    setScheduledTasks(newScheduledTasks)
    toast.success(`Auto-planned ${scheduledCount} samples from ${sortedRequests.length} requests`)
  }

  // Handle save schedule
  const handleSaveSchedule = async () => {
    console.log('Save Schedule button clicked')
    console.log('Scheduled tasks:', scheduledTasks)
    try {
      // Get currently scheduled sample IDs
      const currentlyScheduledSampleIds = new Set(
        scheduledTasks.map(task => task.sampleId)
      )
      
      // Find samples that were removed (previously scheduled but not in current schedule)
      const removedSampleIds = Array.from(originallyScheduledSampleIds).filter(
        sampleId => !currentlyScheduledSampleIds.has(sampleId)
      )
      
      console.log('Originally scheduled samples:', Array.from(originallyScheduledSampleIds))
      console.log('Currently scheduled samples:', Array.from(currentlyScheduledSampleIds))
      console.log('Removed samples:', removedSampleIds)
      
      // Prepare schedule data for currently scheduled tasks
      const schedules = scheduledTasks.map(task => ({
        sampleId: task.sampleId,
        startTime: task.startTime.toISOString(),
        endTime: task.endTime.toISOString()
      }))
      
      // Prepare clear schedule data for removed tasks
      const clearedSchedules = removedSampleIds.map(sampleId => ({
        sampleId,
        startTime: null,
        endTime: null,
        clearSchedule: true
      }))
      
      // Combine both scheduled and cleared tasks
      const allScheduleUpdates = [...schedules, ...clearedSchedules]
      
      if (allScheduleUpdates.length === 0) {
        toast.error('No schedule changes to save')
        return
      }
      
      // Call API to save schedules
      const response = await fetch('/api/testing-samples/save-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedules: allScheduleUpdates,
          plannedBy: user?.name || 'Unknown',
          plannedByEmail: user?.email || ''
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save schedule')
      }
      
      const data = await response.json()
      
      if (data.success) {
        let message = data.message || 'Schedule saved successfully'
        if (removedSampleIds.length > 0) {
          message += ` and cleared schedules for ${removedSampleIds.length} removed sample(s)`
        }
        toast.success(message)
        
        // Update the originally scheduled sample IDs to reflect the current state
        // This ensures that if they save again without refreshing, it works correctly
        setOriginallyScheduledSampleIds(currentlyScheduledSampleIds)
        
        // Refresh the data to show saved schedules
        await fetchTestingSamples()
      } else {
        toast.error(data.error || 'Failed to save schedule')
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      toast.error('Failed to save schedule')
    } finally {
      setShowSaveConfirmDialog(false)
    }
  }

  // Render request card
  const renderRequestCard = (request: Request) => {
    const isScheduled = isRequestScheduled(request.id)
    const scheduleInfo = getRequestScheduleInfo(request.id)
    const isHighlighted = highlightedRequestId === request.id
    
    return (
      <DraggableTask key={request.id} task={request}>
        <Card className={`cursor-move hover:shadow-md transition-all duration-200 ${
          isScheduled 
            ? 'bg-green-50 dark:bg-green-950 border-green-500' 
            : ''
        } ${
          isHighlighted 
            ? 'border-2 border-red-500' 
            : ''
        }`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <h4 
                    className="font-medium text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setHighlightedRequestId(highlightedRequestId === request.id ? null : request.id)
                    }}
                  >
                    {request.title.replace(/^Request\s+/, '')}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{request.requester}</p>
              </div>
              <Badge 
                variant={
                  request.priority === 'critical' ? 'destructive' : 
                  request.priority === 'urgent' ? 'destructive' : 
                  'default'
                }
                className="ml-2"
              >
                {request.priority}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3" />
              <span>{(() => {
                const filteredSamples = selectedEquipment.length === 0 
                  ? request.samples 
                  : request.samples.filter(sample => {
                      if (!sample.equipment) return false
                      const selectedEquipmentNames = equipment
                        .filter(eq => selectedEquipment.includes(eq.id))
                        .map(eq => eq.name.toLowerCase().trim())
                      return selectedEquipmentNames.includes(sample.equipment.toLowerCase().trim())
                    })
                const totalHours = filteredSamples.reduce((sum, s) => sum + s.estimatedHours, 0)
                return `${totalHours}h total`
              })()}</span>
              <Package className="h-3 w-3 ml-2" />
              <span>{(() => {
                const filteredCount = selectedEquipment.length === 0 
                  ? request.samples.length 
                  : request.samples.filter(sample => {
                      if (!sample.equipment) return false
                      const selectedEquipmentNames = equipment
                        .filter(eq => selectedEquipment.includes(eq.id))
                        .map(eq => eq.name.toLowerCase().trim())
                      return selectedEquipmentNames.includes(sample.equipment.toLowerCase().trim())
                    }).length
                return `${filteredCount} samples`
              })()}</span>
            </div>
            
            {/* Show schedule information if scheduled */}
            {isScheduled && scheduleInfo && (
              <div className="bg-green-100 dark:bg-green-900 rounded px-2 py-1 mb-2 text-xs">
                <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                  <CalendarClock className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="font-medium">
                    {format(scheduleInfo.startTime, 'MMM d, HH:mm')} - {format(scheduleInfo.endTime, 'HH:mm')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Show remove all button when highlighted */}
            {highlightedRequestId === request.id && isScheduled && (
              <div className="space-y-2">
                <div className="bg-red-50 dark:bg-red-900/30 rounded px-2 py-1 text-xs">
                  <div className="flex items-center gap-1 text-red-700 dark:text-red-300">
                    <Info className="h-3 w-3" />
                    <span className="font-medium">
                      {scheduledTasks.filter(t => t.requestId === request.id).length} tasks highlighted
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveAllRequestTasks(request.id)
                    setHighlightedRequestId(null)
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove all samples from calendar
                </Button>
              </div>
            )}
            
            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-7 -mx-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleRequestExpansion(request.id)
              }}
            >
              <ChevronRight 
                className={`h-3 w-3 mr-1 transition-transform ${
                  expandedRequests.has(request.id) ? 'rotate-90' : ''
                }`} 
              />
              {expandedRequests.has(request.id) ? 'Hide' : 'Show'} samples
            </Button>
            
            {/* Individual Samples - Collapsible */}
            {expandedRequests.has(request.id) && (
              <div className="space-y-1 mt-2 pt-2 border-t">
                {request.samples
                  .filter(sample => {
                    if (selectedEquipment.length === 0) return false
                    
                    const selectedEquipmentNames = equipment
                      .filter(eq => selectedEquipment.includes(eq.id))
                      .map(eq => eq.name.toLowerCase().trim())
                    
                    if (!sample.equipment) return false
                    const sampleEquipment = sample.equipment.toLowerCase().trim()
                    return selectedEquipmentNames.includes(sampleEquipment)
                  })
                  .map(sample => {
                    const isSampleSched = isSampleScheduled(sample.id)
                    const sampleScheduleInfo = getSampleScheduleInfo(sample.id)
                    // Ensure sample has parent request ID for highlighting
                    const sampleWithRequestId = { ...sample, requestId: sample.requestId || request.id }
                    return (
                      <DraggableTask key={sample.id} task={sampleWithRequestId}>
                        <div className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          isSampleSched 
                            ? 'bg-green-50 dark:bg-green-950 ring-1 ring-green-500' 
                            : 'bg-gray-50 dark:bg-gray-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-3 w-3 text-gray-400" />
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium">{sample.sampleName}</p>
                                  {isSampleSched && (
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{sample.testMethod}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{sample.estimatedHours}h</span>
                          </div>
                          {/* Show sample schedule info */}
                          {isSampleSched && sampleScheduleInfo && (
                            <div className="mt-1 text-xs text-green-600">
                              {format(sampleScheduleInfo.startTime, 'MMM d, HH:mm')}
                            </div>
                          )}
                        </div>
                      </DraggableTask>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </DraggableTask>
    )
  }

  // Render calendar view
  const renderCalendarView = () => {
    const weekDays = getWeekDays(currentDate)
    const workingHours = Array.from(
      { length: calculationSettings.workingHoursEnd - calculationSettings.workingHoursStart },
      (_, i) => calculationSettings.workingHoursStart + i
    )
    const filteredEquipment = getFilteredEquipment()

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="flex gap-4">
          {/* Left Panel - Request Queue */}
          <Card className="w-80 flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Request Queue</CardTitle>
              <CardDescription>
                Drag items to schedule them on calendar
              </CardDescription>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search request number or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {selectedEquipment.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-muted-foreground">
                        Please select equipment from the filter above to view requests
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Urgent/Critical Section */}
                      {(() => {
                        const urgentRequests = requests.filter(request => {
                          const isUrgentOrCritical = request.priority === 'urgent' || request.priority === 'critical'
                          if (!isUrgentOrCritical) return false

                          // Apply same equipment and search filters
                          if (selectedEquipment.length === 0) return false
                          
                          const selectedEquipmentNames = equipment
                            .filter(eq => selectedEquipment.includes(eq.id))
                            .map(eq => eq.name.toLowerCase().trim())
                          
                          const hasMatchingEquipment = request.samples.some(sample => {
                            if (!sample.equipment) return false
                            const sampleEquipment = sample.equipment.toLowerCase().trim()
                            return selectedEquipmentNames.includes(sampleEquipment)
                          })
                          
                          if (!hasMatchingEquipment) return false
                          
                          if (searchQuery.trim()) {
                            const query = searchQuery.toLowerCase().trim()
                            return (
                              request.id.toLowerCase().includes(query) ||
                              request.title.toLowerCase().includes(query) ||
                              request.requester.toLowerCase().includes(query) ||
                              request.samples.some(sample => 
                                sample.sampleName.toLowerCase().includes(query) ||
                                sample.testMethod.toLowerCase().includes(query)
                              )
                            )
                          }
                          
                          return true
                        })

                        if (urgentRequests.length > 0) {
                          return (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <h3 className="font-semibold text-sm text-red-600">Urgent/Critical Tasks</h3>
                                <Badge variant="destructive" className="text-xs">{urgentRequests.length}</Badge>
                              </div>
                              <div className="space-y-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                {urgentRequests.map(request => renderRequestCard(request))}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })()}

                      {/* Normal Tasks Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <h3 className="font-semibold text-sm">Normal Priority Tasks</h3>
                        </div>
                        <div className="space-y-2">
                          {requests
                            .filter(request => {
                              // Filter out urgent/critical
                              if (request.priority === 'urgent' || request.priority === 'critical') return false
                      // If no equipment filter selected, show nothing
                      if (selectedEquipment.length === 0) return false
                      
                      // Get selected equipment names
                      const selectedEquipmentNames = equipment
                        .filter(eq => selectedEquipment.includes(eq.id))
                        .map(eq => eq.name.toLowerCase().trim())
                      
                      // Check if any sample in this request uses the selected equipment
                      const hasMatchingEquipment = request.samples.some(sample => {
                        if (!sample.equipment) return false
                        const sampleEquipment = sample.equipment.toLowerCase().trim()
                        return selectedEquipmentNames.includes(sampleEquipment)
                      })
                      
                      if (!hasMatchingEquipment) return false
                      
                      // Apply search filter
                      if (searchQuery.trim()) {
                        const query = searchQuery.toLowerCase().trim()
                        return (
                          request.id.toLowerCase().includes(query) ||
                          request.title.toLowerCase().includes(query) ||
                          request.requester.toLowerCase().includes(query) ||
                          request.samples.some(sample => 
                            sample.sampleName.toLowerCase().includes(query) ||
                            sample.testMethod.toLowerCase().includes(query)
                          )
                        )
                      }
                      
                      return true
                    })
                    .map(request => renderRequestCard(request))
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>

          {/* Right Panel - Calendar Grid */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipment Schedule</CardTitle>
                  {filteredEquipment.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Equipment:</span>
                      <span className="text-sm font-medium">{filteredEquipment[0].name}</span>
                      {filteredEquipment[0].capability !== 'Multiple' && (
                        <>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{filteredEquipment[0].capability}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span className="text-sm">{calculateEquipmentWorkload(filteredEquipment[0].id)}% Workload</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoPlan}
                    disabled={getUnscheduledRequests().length === 0 || selectedEquipment.length === 0}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <Sparkles className="h-4 w-4" />
                    Auto Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllSchedule}
                    disabled={scheduledTasks.length === 0}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowSaveConfirmDialog(true)
                    }}
                    disabled={scheduledTasks.length === 0}
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <Save className="h-4 w-4" />
                    Save Schedule ({scheduledTasks.length})
                  </Button>
                  <div className="h-6 w-px bg-border" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addDays(currentDate, -7))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addDays(currentDate, 7))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-visible">
              <div className="overflow-x-auto overflow-y-visible relative" style={{ minHeight: '400px' }}>
                <div className="min-w-[800px] relative" style={{ overflow: 'visible' }}>
                  {/* Equipment Headers */}
                  <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-0">
                    <div className="h-24 border-b border-r flex items-center justify-center">
                      <span className="text-sm font-medium">Time</span>
                    </div>
                    {weekDays.map(day => {
                      const dayHasSelection = selectedTimeSlots.some(slot => 
                        slot.date.toDateString() === day.toDateString()
                      )
                      
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={cn(
                            "border-b border-r",
                            reservationMode && "cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors",
                            reservationMode && dayHasSelection && "bg-purple-100 dark:bg-purple-950/30"
                          )}
                          onClick={reservationMode ? () => {
                            // Toggle all slots for this day for all selected equipment
                            const equipmentToUse = selectedEquipment.length > 0 
                              ? equipment.filter(eq => selectedEquipment.includes(eq.id))
                              : equipment
                            
                            const daySlots = []
                            for (const eq of equipmentToUse) {
                              for (let hour = calculationSettings.workingHoursStart; hour < calculationSettings.workingHoursEnd; hour++) {
                                daySlots.push({
                                  equipmentId: eq.id,
                                  date: day,
                                  hour
                                })
                              }
                            }
                            
                            // Check if all slots for this day are already selected
                            const allDaySlotsSelected = daySlots.every(slot => 
                              selectedTimeSlots.some(selected => 
                                selected.equipmentId === slot.equipmentId &&
                                selected.date.toDateString() === slot.date.toDateString() &&
                                selected.hour === slot.hour
                              ) || isTimeSlotReserved(slot.equipmentId, slot.date, slot.hour)
                            )
                            
                            if (allDaySlotsSelected) {
                              // Deselect all slots for this day
                              setSelectedTimeSlots(prev => 
                                prev.filter(slot => 
                                  slot.date.toDateString() !== day.toDateString()
                                )
                              )
                            } else {
                              // Select all available slots for this day
                              const newSlots = daySlots.filter(slot => 
                                !isTimeSlotReserved(slot.equipmentId, slot.date, slot.hour)
                              )
                              
                              setSelectedTimeSlots(prev => {
                                // Remove any existing slots for this day
                                const filtered = prev.filter(slot => 
                                  slot.date.toDateString() !== day.toDateString()
                                )
                                // Add new slots
                                return [...filtered, ...newSlots]
                              })
                            }
                          } : undefined}
                        >
                          <div className="text-center p-2">
                            <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                            <div className="text-lg">{format(day, 'd')}</div>
                            {reservationMode && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                {dayHasSelection ? "Click to deselect" : "Click to select all"}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Slots for Each Equipment */}
                  {filteredEquipment.length === 0 ? (
                    <div className="col-span-8 py-12 text-center text-muted-foreground">
                      No equipment selected. Please select equipment from the filter above.
                    </div>
                  ) : (
                    filteredEquipment.map(eq => (
                      <div key={eq.id} className="border-b relative">
                        {/* Hour Slots */}
                        {workingHours.map(hour => (
                          <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] gap-0">
                            <div className="h-12 border-r flex items-center justify-center text-xs text-muted-foreground">
                              {hour}:00
                            </div>
                            {weekDays.map(day => {
                              const slotId = `${eq.id}-${day.toISOString()}-${hour}`
                              const tasks = getTasksForSlot(day, hour, eq.id)
                              
                              return (
                                <DroppableSlot
                                  key={slotId}
                                  id={slotId}
                                  date={day}
                                  hour={hour}
                                  equipment={eq}
                                  isOccupied={tasks.length > 0}
                                  isReserved={isTimeSlotReserved(eq.id, day, hour)}
                                  reservationReason={getReservationReason(eq.id, day, hour)}
                                  isSelected={isTimeSlotSelected(eq.id, day, hour)}
                                  onSlotClick={() => handleTimeSlotClick(eq.id, day, hour)}
                                  reservationMode={reservationMode}
                                  onDeleteReservation={() => handleDeleteReservation(eq.id, day, hour)}
                                >
                                  {tasks.map((task, taskIndex) => {
                                    const isHighlighted = highlightedRequestId === task.requestId
                                    const isOverlapping = tasks.length > 1
                                    
                                    return (
                                      <DraggableScheduledTask 
                                        key={task.id} 
                                        task={task}
                                        isHighlighted={isHighlighted}
                                        onDoubleClick={() => handleTaskDoubleClick(task)}
                                        onRemove={() => handleRemoveTask(task.id)}
                                        isOverlapping={isOverlapping}
                                        overlapIndex={taskIndex}
                                        getColorForPriority={getColorForPriority}
                                        getOverlapColor={getOverlapColor}
                                      />
                                    )
                                  })}
                                </DroppableSlot>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drag Overlay with precise cursor alignment */}
        <DragOverlay 
          dropAnimation={null}
          style={{
            cursor: 'grabbing',
          }}
        >
          {draggedItem && (
            <div className="pointer-events-none">
              <div className="bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-lg shadow-2xl p-2 opacity-95 min-w-[180px] max-w-[250px]">
                <div className="font-medium text-xs truncate">
                  {draggedItem.isScheduled 
                    ? draggedItem.title 
                    : ('samples' in draggedItem ? draggedItem.title : draggedItem.sampleName)
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {draggedItem.isScheduled
                    ? `${format(draggedItem.startTime, 'HH:mm')} - ${format(draggedItem.endTime, 'HH:mm')}`
                    : ('samples' in draggedItem 
                      ? `${draggedItem.estimatedHours}h (${draggedItem.samples.length} samples)`
                      : `${draggedItem.estimatedHours}h`
                    )
                  }
                </div>
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{draggedItem.estimatedHours || differenceInHours(draggedItem.endTime, draggedItem.startTime)}h</span>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )
  }

  // Render statistics view
  const renderStatisticsView = () => {
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.status === 'pending').length
    const scheduledRequests = requests.filter(r => r.status === 'scheduled').length
    const urgentRequests = requests.filter(r => r.priority === 'urgent' || r.priority === 'critical').length

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting scheduling</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{scheduledRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for testing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Urgent/Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">High priority tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Utilization</CardTitle>
            <CardDescription>Current week workload and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.map(eq => {
                const workload = calculateEquipmentWorkload(eq.id)
                return (
                  <div key={eq.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-muted-foreground">{eq.capability}</p>
                      </div>
                      <span className="text-sm font-medium">{workload}%</span>
                    </div>
                    <Progress value={workload} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/request-management">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Test Queue Management</h1>
              <p className="text-muted-foreground">
                Schedule and manage testing queue by equipment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={reservationMode ? "default" : "outline"} 
              onClick={() => {
                setReservationMode(!reservationMode)
                setSelectedTimeSlots([])
              }}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              {reservationMode ? "Cancel Reservation" : "Reserve Time"}
            </Button>
            {selectedTimeSlots.length > 0 && (
              <Button 
                variant="default" 
                onClick={() => setShowReservationDialog(true)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Reservation ({selectedTimeSlots.length} slots)
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Scheduling Settings</SheetTitle>
                  <SheetDescription>
                    Configure working hours and scheduling rules
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="skip-weekends">Skip Weekends</Label>
                      <Switch
                        id="skip-weekends"
                        checked={calculationSettings.skipWeekends}
                        onCheckedChange={(checked) =>
                          setCalculationSettings({ ...calculationSettings, skipWeekends: checked })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Working Hours</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={calculationSettings.workingHoursStart}
                          onChange={(e) =>
                            setCalculationSettings({
                              ...calculationSettings,
                              workingHoursStart: parseInt(e.target.value),
                            })
                          }
                          className="w-20"
                          min={0}
                          max={23}
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          value={calculationSettings.workingHoursEnd}
                          onChange={(e) =>
                            setCalculationSettings({
                              ...calculationSettings,
                              workingHoursEnd: parseInt(e.target.value),
                            })
                          }
                          className="w-20"
                          min={0}
                          max={23}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button onClick={() => setShowSettingsSheet(false)}>Done</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-4">
        <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Capabilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Capabilities</SelectItem>
            <SelectItem value="Thermal Analysis">Thermal Analysis</SelectItem>
            <SelectItem value="Spectroscopy">Spectroscopy</SelectItem>
            <SelectItem value="Mechanical Testing">Mechanical Testing</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Equipment Multi-Select */}
        <Popover open={showEquipmentSelector} onOpenChange={setShowEquipmentSelector}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[250px] justify-between"
              role="combobox"
              aria-expanded={showEquipmentSelector}
            >
              <span className="truncate">
                {selectedEquipment.length === 0
                  ? "Select Equipment..."
                  : selectedEquipment.length === equipment.length
                  ? "All Equipment"
                  : `${selectedEquipment.length} Equipment Selected`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-white dark:bg-gray-950 shadow-lg" align="start">
            <div className="border-b p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Select Equipment</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedEquipment.length === equipment.length) {
                      setSelectedEquipment([])
                    } else {
                      setSelectedEquipment(equipment.map(eq => eq.id))
                    }
                  }}
                >
                  {selectedEquipment.length === equipment.length ? "Clear All" : "Select All"}
                </Button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {equipment
                .filter(eq => capabilityFilter === 'all' || eq.capability === capabilityFilter)
                .map(eq => (
                  <div
                    key={eq.id}
                    className="flex items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedEquipment(prev => 
                        prev.includes(eq.id)
                          ? prev.filter(id => id !== eq.id)
                          : [...prev, eq.id]
                      )
                    }}
                  >
                    <Checkbox
                      checked={selectedEquipment.includes(eq.id)}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{eq.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {eq.capability} • {calculateEquipmentWorkload(eq.id)}% utilized
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Calendar Time Range Indicator */}
        {selectedEquipment.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Calendar Hours: {dynamicWorkingHours.start}:00 - {dynamicWorkingHours.end}:00
            </span>
          </div>
        )}
      </div>


      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {renderCalendarView()}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {renderStatisticsView()}
        </TabsContent>
      </Tabs>
      
      {/* Conflict Resolution Dialog */}
      <Dialog 
        open={conflictDialog?.show || false}
        onOpenChange={(open) => {
          if (!open) setConflictDialog(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scheduling Conflict Detected</DialogTitle>
            <DialogDescription>
              The time slot you selected already has scheduled tasks. Choose how to proceed:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <h4 className="font-medium text-sm mb-2">Conflicting Tasks:</h4>
              {conflictDialog?.conflictingTasks.map(task => (
                <div key={task.id} className="text-sm">
                  <span className="font-medium">{task.title}</span> - {task.testMethod}
                  <span className="text-muted-foreground ml-2">
                    ({format(task.startTime, 'HH:mm')} - {format(task.endTime, 'HH:mm')})
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <h4 className="font-medium text-sm mb-2">New Task:</h4>
              <div className="text-sm">
                <span className="font-medium">{conflictDialog?.newTask.title}</span>
                <span className="text-muted-foreground ml-2">
                  (Duration: {conflictDialog?.newTask.estimatedHours || differenceInHours(conflictDialog?.newTask.endTime, conflictDialog?.newTask.startTime)} hours)
                </span>
                {conflictDialog?.newTask.plannedTasks && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {conflictDialog.newTask.plannedTasks.length} samples will be scheduled:
                    <ul className="mt-1 ml-4">
                      {conflictDialog.newTask.plannedTasks.slice(0, 3).map((task: ScheduledTask, idx: number) => (
                        <li key={idx}>• {task.sampleName} - {task.testMethod}</li>
                      ))}
                      {conflictDialog.newTask.plannedTasks.length > 3 && (
                        <li>• ... and {conflictDialog.newTask.plannedTasks.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConflictDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => conflictDialog && handleOverlapConflict()}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Allow Overlap
            </Button>
            <Button
              variant="default"
              onClick={() => conflictDialog && handleInsertConflict()}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Insert & Shift All
            </Button>
            <Button
              variant="destructive"
              onClick={() => conflictDialog && handleReplace(conflictDialog.newTask, conflictDialog.dropData)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Replace Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Time Reservation Dialog */}
      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve Time Slots</DialogTitle>
            <DialogDescription>
              Provide a reason for reserving these time slots
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reservation</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Equipment maintenance, calibration, special testing..."
                value={reservationReason}
                onChange={(e) => setReservationReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <h4 className="font-medium text-sm mb-2">Selected Time Slots: ({selectedTimeSlots.length} slots)</h4>
              <ScrollArea className="h-[200px] w-full rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-950 p-2">
                <div className="text-sm space-y-1">
                  {selectedTimeSlots
                    .sort((a, b) => {
                      if (a.equipmentId !== b.equipmentId) return a.equipmentId.localeCompare(b.equipmentId)
                      if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime()
                      return a.hour - b.hour
                    })
                    .map((slot, idx) => {
                      // Find equipment in the full equipment list
                      const eq = equipment.find(eq => eq.id === slot.equipmentId)
                      const equipmentName = eq?.name || `Equipment ${slot.equipmentId}`
                      
                      return (
                        <div key={idx} className="py-0.5">
                          {equipmentName} - {format(slot.date, 'EEE, MMM d')} at {slot.hour}:00
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReservationDialog(false)
              setReservationReason('')
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReservations}
              disabled={!reservationReason.trim()}
            >
              Save Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Schedule Confirmation Dialog */}
      <Dialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Schedule Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to save the current schedule?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <h4 className="font-medium text-sm mb-2">Schedule Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tasks:</span>
                  <span className="font-medium">{scheduledTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipment:</span>
                  <span className="font-medium">
                    {Array.from(new Set(scheduledTasks.map(t => t.equipment))).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Range:</span>
                  <span className="font-medium">
                    {scheduledTasks.length > 0 && (
                      <>
                        {format(new Date(Math.min(...scheduledTasks.map(t => t.startTime.getTime()))), 'MMM d')} - 
                        {format(new Date(Math.max(...scheduledTasks.map(t => t.endTime.getTime()))), 'MMM d, yyyy')}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">This will:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Save the planned start and end times for each sample</li>
                <li>Update the actual due date for scheduled samples</li>
                <li>Record you as the planner with current timestamp</li>
                {scheduledTasks.some(t => {
                  const sample = requests.flatMap(r => r.samples).find(s => s.id === t.sampleId)
                  return sample && !sample.firstDueDate
                }) && (
                  <li className="text-blue-600 dark:text-blue-400">Set first due date for new samples (this cannot be changed later)</li>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShouldSaveSchedule(true)
              }}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Confirm Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
