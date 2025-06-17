"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, MessageCircle, Home, Phone, Mail, ArrowRight, Calendar, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"

export default function ASRConfirmationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [requestData, setRequestData] = useState(null)
  const [error, setError] = useState("")

  // State to store capabilities loaded from the API
  const [loadedCapabilities, setLoadedCapabilities] = useState<any[]>([])
  
  // Fetch capabilities from the API
  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const response = await fetch('/api/capabilities')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setLoadedCapabilities(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching capabilities:', error)
      }
    }
    
    fetchCapabilities()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the ASR ID from localStorage
        const asrId = localStorage.getItem('submittedAsrId')
        const asrNumber = localStorage.getItem('submittedAsrNumber')
        
        console.log('ASR ID from localStorage:', asrId);
        console.log('ASR Number from localStorage:', asrNumber);
        
        if (!asrId && !asrNumber) {
          throw new Error("No ASR ID or number found. Please return to the request form.")
        }


        // Fetch the ASR data from the API
        console.log('Fetching data from API for:', asrId || asrNumber);
        const response = await fetch(`/api/asrs/${asrId || asrNumber}`)
        
        // Check if the request was successful
        if (!response.ok) {
          let errorMessage = "Failed to load request data";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          
          console.error(`API responded with status ${response.status}: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        const result = await response.json()
        
        console.log('API Response:', result);
        
        if (result.success && result.data) {
          // Transform the data for display
          const data = result.data;
          
          // Calculate estimated review completion (2 business days from submission)
          const submissionDate = data.submissionDate ? new Date(data.submissionDate) : new Date();
          const estimatedReviewDate = new Date(submissionDate);
          estimatedReviewDate.setDate(estimatedReviewDate.getDate() + 2);
          
          const formattedData = {
            requestId: data.asrNumber,
            requestTitle: data.asrName,
            submissionDate: format(submissionDate, 'yyyy-MM-dd'),
            requester: {
              name: data.requesterName,
              email: data.requesterEmail,
              department: data.requesterCostCenter || "N/A"
            },
            estimatedReviewCompletion: format(estimatedReviewDate, 'yyyy-MM-dd'),
            selectedCapabilities: data.capability ? 
              [data.capability.name] : 
              ["Pending assignment"],
            samples: Array.isArray(data.samples) ? 
              data.samples.map(sample => ({
                name: sample.generatedName || sample.sampleName || sample.name || `Sample ${sample.id || ""}`,
                category: sample.category || "Custom",
                type: sample.type || "-",
                form: sample.form || "-"
              })) : [],
            capabilityExperts: data.experts && data.experts.length > 0 ? 
              data.experts.map(expert => ({
                capability: data.capability?.name || "Analysis Expert",
                name: expert.name,
                email: expert.email,
                phone: expert.phone || "Contact via email"
              })) : 
              [{
                capability: "PCRD Support",
                name: "Support Team",
                email: "support@pcrd.example.com",
                phone: "-"
              }],
            nextSteps: [
              "Your request will be reviewed by capability experts within 2 business days",
              "You may be contacted for additional information or clarification",
              "Once approved, your request will be assigned to researchers",
              "You'll receive regular updates on the progress of your analysis",
            ],
          }
          
          console.log('Formatted data:', formattedData);
          setRequestData(formattedData)
        } else {
          throw new Error(result.error || "Failed to load request data")
        }
      } catch (error) {
        console.error("Error fetching ASR data:", error);
        // Log stack trace for debugging
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        
        setError(error instanceof Error ? error.message : "Failed to load request data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium">Loading your request details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Request</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/request/new/asr">
              <Button>
                Create New Request
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Request Data Found</h1>
          <p className="text-gray-600 mb-4">Please return to the request form and try again.</p>
          <Link href="/request/new/asr">
            <Button>
              Return to ASR Form
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success message */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">ASR Request Submitted Successfully!</h1>
            <p className="text-lg text-gray-600">
              Your analysis solution request has been received and is pending review.
            </p>
          </div>

          {/* Request information card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>
                Your request has been submitted and will be reviewed by capability experts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request ID</p>
                  <p className="font-medium">{requestData.requestId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                  <p className="font-medium">{requestData.submissionDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Request Title</p>
                  <p className="font-medium">{requestData.requestTitle}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Selected Capabilities</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {requestData.selectedCapabilities.map((capability, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium mb-4">Request Status</h3>

              <div className="rounded-lg border p-4 bg-amber-50 border-amber-200 mb-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Pending Review</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Your request is currently pending review by capability experts. Estimated review completion:{" "}
                      <strong>{requestData.estimatedReviewCompletion}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {requestData.capabilityExperts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Capability Experts</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The following experts will review your request and may contact you for additional information:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestData.capabilityExperts.map((expert, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {expert.capability}
                          </Badge>
                        </div>
                        <p className="font-medium">{expert.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{expert.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{expert.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Samples card */}
          {requestData.samples.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Samples ({requestData.samples.length})</CardTitle>
                <CardDescription>The following samples have been registered with your request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requestData.samples.map((sample, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{sample.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sample.category} • {sample.type} • {sample.form}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" /> Registered
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>What to expect after submitting your ASR request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Important</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    ASR requests require expert review and may need additional information from you. Please monitor your
                    email and respond promptly to any inquiries.
                  </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Expert Review Process</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Your request will be reviewed by experts from each selected capability area. They will assess:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Feasibility of the requested analysis</li>
                        <li>Appropriateness of the selected capabilities</li>
                        <li>Sufficiency of the provided samples and information</li>
                        <li>Estimated timeline and cost for the analysis</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Approval and Assignment</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Once your request is approved:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>You'll receive an approval notification with estimated timeline and cost</li>
                        <li>Your request will be assigned to researchers with relevant expertise</li>
                        <li>A primary contact researcher will be designated for your request</li>
                        <li>The research team will develop a detailed testing plan</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. Analysis and Collaboration</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">During the analysis phase:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>The research team will execute the testing plan</li>
                        <li>You'll receive regular progress updates</li>
                        <li>You may be invited to discussions or meetings to review interim findings</li>
                        <li>Additional tests may be recommended based on initial results</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>4. Results and Recommendations</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Upon completion of the analysis:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>You'll receive a comprehensive report with findings and recommendations</li>
                        <li>A meeting will be scheduled to discuss the results in detail</li>
                        <li>Follow-up actions or additional analyses may be recommended</li>
                        <li>You'll have the opportunity to provide feedback on the process and results</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">Immediate Next Steps:</h3>
                  <ul className="space-y-2">
                    {requestData.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-between">
            <Link href="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
            <div className="flex space-x-3">
              <Link href="/requests">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View All Requests
                </Button>
              </Link>
              <Link href="/request/new">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Create Another Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
