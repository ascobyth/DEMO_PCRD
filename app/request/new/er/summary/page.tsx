"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, CheckCircle, Printer, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function EquipmentReservationSummaryPage() {
  const router = useRouter()

  // Mock data - in a real application, this would come from the previous form submission
  const [reservation, setReservation] = useState({
    id: "RE-ER-0323-00123",
    projectName: "Polymer Crystallization Study",
    capability: "Mesostructure & Imaging",
    equipment: "SAXS (Small-Angle X-ray Scattering)",
    date: "2023-03-25",
    timeSlot: "10:00 - 12:00",
    samples: [
      { id: 1, name: "Sample A", description: "HDPE film, 2mm thickness" },
      { id: 2, name: "Sample B", description: "LDPE film, 1mm thickness" },
    ],
    testingMode: "Expert Operator",
    priority: "Normal",
    status: "Pending Confirmation",
    contactPerson: "Dr. Sarah Johnson",
    contactEmail: "sarah.johnson@pcrd.com",
    contactPhone: "+66 2 123 4567",
    labLocation: "Building 3, Room 405, PCRD Central Laboratory",
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reservation Summary</h1>
          <p className="text-muted-foreground">Review your equipment reservation details</p>
        </div>

        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle>Reservation Submitted Successfully</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Reservation ID</p>
                <h2 className="text-2xl font-bold">{reservation.id}</h2>
              </div>
              <Badge className="w-fit" variant={reservation.status === "Confirmed" ? "default" : "outline"}>
                {reservation.status}
              </Badge>
            </div>

            <Separator />

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Reservation Details</TabsTrigger>
                <TabsTrigger value="samples">Samples</TabsTrigger>
                <TabsTrigger value="instructions">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Name</p>
                    <p className="font-medium">{reservation.projectName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <p className="font-medium">{reservation.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capability</p>
                    <p className="font-medium">{reservation.capability}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Equipment</p>
                    <p className="font-medium">{reservation.equipment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Testing Mode</p>
                    <p className="font-medium">{reservation.testingMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Samples</p>
                    <p className="font-medium">{reservation.samples.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-md">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Reservation Date & Time</p>
                    <p className="font-medium">
                      {reservation.date}, {reservation.timeSlot}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="samples" className="space-y-4">
                {reservation.samples.map((sample) => (
                  <div key={sample.id} className="p-4 border rounded-md space-y-2">
                    <Badge variant="outline">Sample {sample.id}</Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Sample Name</p>
                      <p className="font-medium">{sample.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium">{sample.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <p className="font-medium">
                      Your equipment reservation has been submitted and is pending confirmation.
                    </p>
                    <p className="mt-2">
                      You will receive an email notification once your reservation is confirmed by the lab manager.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold">Next Steps:</h3>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Print Sample Tags</p>
                      <p className="text-sm text-muted-foreground">
                        Attach the printed tags to your samples for identification.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 gap-1">
                        <Printer className="h-4 w-4" />
                        Print Sample Tags
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Prepare Your Samples</p>
                      <p className="text-sm text-muted-foreground">
                        Ensure your samples are properly prepared according to the equipment requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Deliver Samples to the Lab</p>
                      <p className="text-sm text-muted-foreground">
                        Bring your samples to the lab at least 30 minutes before your scheduled time.
                      </p>
                      <div className="mt-2 p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">Lab Location:</p>
                        <p className="text-sm">{reservation.labLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Contact Information</p>
                      <p className="text-sm text-muted-foreground">If you have any questions, please contact:</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Contact Person:</span> {reservation.contactPerson}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {reservation.contactEmail}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {reservation.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-1">
                <Printer className="h-4 w-4" />
                Print Reservation
              </Button>
              <Button variant="default" className="gap-1">
                <FileText className="h-4 w-4" />
                View All Reservations
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

