"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Check, Printer, Home, Phone, Mail, ArrowRight, Download, Info, Calendar, Clock, User, Building, Hash, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Request Tag Component for printing
function RequestTag({ request, requestData }: { request: any; requestData: any }) {
  return (
    <div className="request-tag-container" style={{
      width: '210mm',
      height: '297mm',
      padding: '20mm',
      margin: '0 auto',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
      color: '#000',
      pageBreakAfter: 'always',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        borderBottom: '3px solid #2563eb',
        paddingBottom: '15px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#2563eb',
          margin: '0 0 5px 0'
        }}>
          PCRD Test Request
        </h1>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '5px 0'
        }}>
          {request.requestId}
        </div>
        <div style={{
          fontSize: '16px',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '20px',
          display: 'inline-block',
          margin: '10px 0'
        }}>
          {request.capability}
        </div>
      </div>

      {/* QR Code Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          border: '2px solid #d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          flexShrink: 0
        }}>
          QR Code<br/>{request.requestId}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 10px 0',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Request Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Request Title:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.requestTitle}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Submission Date:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.submissionDate}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Estimated Completion:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{request.estimatedCompletion}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Priority:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>Normal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Requester Information */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 10px 0',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Requester Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Name:</div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.requester?.name || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Department:</div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.requester?.department || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Email:</div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.requester?.email || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Phone:</div>
            <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.requester?.phone || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Test Methods and Samples */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 10px 0',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Test Methods & Samples
        </h2>
        
        {request.methods.map((method: any, index: number) => {
          // Group samples by repeat number
          const samplesByRepeat = new Map();
          
          method.samples.forEach((sample: string) => {
            const repeatMatch = sample.match(/_R(\d+)$/);
            const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : 1;
            
            let baseSampleName = sample;
            if (repeatMatch) {
              baseSampleName = sample.replace(/_R\d+$/, '');
              baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
            }
            
            if (!samplesByRepeat.has(repeatNumber)) {
              samplesByRepeat.set(repeatNumber, []);
            }
            samplesByRepeat.get(repeatNumber).push(baseSampleName);
          });
          
          const sortedRepeats = Array.from(samplesByRepeat.entries()).sort(([a], [b]) => a - b);
          
          return (
            <div key={method.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#1f2937',
                marginBottom: '10px'
              }}>
                {method.name}
              </div>
              
              {sortedRepeats.length > 1 ? (
                // Multiple repeats
                sortedRepeats.map(([repeatNumber, samples]) => (
                  <div key={repeatNumber} style={{ marginBottom: '10px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#7c3aed',
                      marginBottom: '5px'
                    }}>
                      Repeat #{repeatNumber}
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginLeft: '15px'
                    }}>
                      {samples.map((sample: string, idx: number) => (
                        <span key={idx} style={{
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {sample}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Single repeat
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {sortedRepeats[0]?.[1]?.map((sample: string, idx: number) => (
                    <span key={idx} style={{
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {sample}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Laboratory Information */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 10px 0',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Laboratory Information
        </h2>
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Address:</div>
            <div style={{ fontWeight: '500' }}>{request.capabilityInfo.address}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Contact Person:</div>
              <div style={{ fontWeight: '500' }}>{request.capabilityInfo.contactPerson}</div>
            </div>
            <div>
              <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Phone:</div>
              <div style={{ fontWeight: '500' }}>{request.capabilityInfo.contactPhone}</div>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Email:</div>
            <div style={{ fontWeight: '500' }}>{request.capabilityInfo.contactEmail}</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        border: '2px solid #fbbf24',
        borderRadius: '8px',
        backgroundColor: '#fffbeb',
        padding: '15px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#92400e',
          margin: '0 0 10px 0'
        }}>
          Sample Submission Instructions
        </h3>
        <ol style={{
          margin: '0',
          paddingLeft: '20px',
          color: '#92400e'
        }}>
          <li style={{ marginBottom: '5px' }}>Print and attach sample tags to each sample</li>
          <li style={{ marginBottom: '5px' }}>Package samples securely to prevent damage</li>
          <li style={{ marginBottom: '5px' }}>Send samples to the laboratory address above</li>
          <li style={{ marginBottom: '5px' }}>Contact the lab if you have any questions</li>
        </ol>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <div>PCRD - Polymer Characterization & Research Division</div>
        <div>Generated on {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}

// Mock data for the confirmation page
const mockRequestData = {
  requestTitle: "HDPE Film Tensile Strength Analysis",
  submissionDate: "2023-10-16",
  requester: {
    name: "John Doe",
    department: "R&D",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  // Requests split by capability
  splitRequests: [
    {
      requestId: "NTR-MICRO-0124",
      capability: "Microstructure",
      methods: [
        {
          id: "TM-MICRO-001",
          name: "Tensile Strength (ASTM D638)",
          samples: ["HD5000S_L2023001_A1", "HD5300B_L2023002_B1"],
        },
        {
          id: "TM-MICRO-002",
          name: "Flexural Properties (ASTM D790)",
          samples: ["HD5000S_L2023001_A1"],
        },
      ],
      estimatedCompletion: "2023-10-23",
      capabilityInfo: {
        address: "Building 3, Floor 2, Lab 205, Research Center, 123 Science Park",
        contactPerson: "Dr. Sarah Johnson",
        contactEmail: "sarah.johnson@example.com",
        contactPhone: "123-456-7891",
      },
    },
    {
      requestId: "NTR-RHEO-0125",
      capability: "Rheology",
      methods: [
        {
          id: "TM-RHEO-001",
          name: "Melt Flow Rate (ASTM D1238)",
          samples: ["HD5000S_L2023001_A1", "HD5300B_L2023002_B1"],
        },
      ],
      estimatedCompletion: "2023-10-21",
      capabilityInfo: {
        address: "Building 2, Floor 1, Lab 103, Research Center, 123 Science Park",
        contactPerson: "Dr. Michael Chen",
        contactEmail: "michael.chen@example.com",
        contactPhone: "123-456-7892",
      },
    },
    {
      requestId: "NTR-MESO-0126",
      capability: "Mesostructure & Imaging",
      methods: [
        {
          id: "TM-MESO-001",
          name: "SEM Analysis",
          samples: ["HD5300B_L2023002_B1"],
        },
      ],
      estimatedCompletion: "2023-10-26",
      capabilityInfo: {
        address: "Building 4, Floor 3, Lab 312, Research Center, 123 Science Park",
        contactPerson: "Dr. Lisa Wong",
        contactEmail: "lisa.wong@example.com",
        contactPhone: "123-456-7893",
      },
    },
  ],
}

export default function RequestConfirmationPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // State for the real request data
  const [requestData, setRequestData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Function to fetch request data from the API for multiple request numbers
    const fetchRequestsData = async (requestNumbers: string[]) => {
      try {
        console.log('Fetching request data for:', requestNumbers);
        // Use the multi-details API endpoint that accepts an array of request numbers
        const response = await fetch(`/api/requests/multi-details?requestNumbers=${encodeURIComponent(JSON.stringify(requestNumbers))}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API request failed with status ${response.status}: ${errorData.error || response.statusText}`
          );
        }

        const result = await response.json();

        if (result.success) {
          console.log('Request data fetched successfully:', result.data);
          // The API returns an array, but we expect a single object
          // Take the first element if it's an array
          const data = Array.isArray(result.data) ? result.data[0] : result.data;
          setRequestData(data);
        } else {
          throw new Error(result.error || 'Failed to fetch request data');
        }
      } catch (error) {
        console.error('Error fetching request data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');

        // Fallback to mock data in case of error
        setRequestData({
          ...mockRequestData,
          requestId: localStorage.getItem('submittedRequestId') || 'unknown',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Try to get multiple request numbers from localStorage
    let requestNumbers: string[] = [];

    try {
      const submittedRequestNumbers = localStorage.getItem('submittedRequestNumbers');
      if (submittedRequestNumbers) {
        requestNumbers = JSON.parse(submittedRequestNumbers);
      }
    } catch (error) {
      console.error('Error parsing submittedRequestNumbers:', error);
    }

    // Fallback to single request number if multiple not found
    if (requestNumbers.length === 0) {
      const submittedRequestNumber = localStorage.getItem('submittedRequestNumber');
      if (submittedRequestNumber) {
        requestNumbers = [submittedRequestNumber];
      }
    }

    if (requestNumbers.length > 0) {
      // Fetch the actual data from the API using the request numbers
      fetchRequestsData(requestNumbers);
    } else {
      // If no request numbers are found, use the mock data
      setRequestData(mockRequestData);
      setIsLoading(false);
    }
  }, [])

  const handlePrintTags = (request: any) => {
    // Open a new window with the print-ready sample tags
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(generateSampleTagsHTML(request))
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handlePrintRequestTag = (request: any) => {
    // Open a new window with the print-ready request tag
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(generateRequestTagHTML(request))
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleDownloadPDF = (request: any) => {
    // Create a new window for PDF generation
    const pdfWindow = window.open('', '_blank', 'width=800,height=600')
    if (pdfWindow) {
      pdfWindow.document.write(generateRequestTagHTML(request, true))
      pdfWindow.document.close()
      pdfWindow.focus()
      // User can save as PDF using browser's print dialog
      pdfWindow.print()
    }
  }

  // Functions for handling ALL capabilities at once
  const handlePrintAllSampleTags = () => {
    if (!requestData?.splitRequests || requestData.splitRequests.length === 0) return
    
    // Generate HTML for all sample tags from all capabilities
    const allSampleTagsHTML = generateAllSampleTagsHTML(requestData.splitRequests)
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(allSampleTagsHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handlePrintAllRequestTags = () => {
    if (!requestData?.splitRequests || requestData.splitRequests.length === 0) return
    
    // Generate HTML for all request tags from all capabilities
    const allRequestTagsHTML = generateAllRequestTagsHTML(requestData.splitRequests)
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(allRequestTagsHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleDownloadAllPDF = () => {
    if (!requestData?.splitRequests || requestData.splitRequests.length === 0) return
    
    // Generate HTML for all request tags as PDF
    const allRequestTagsHTML = generateAllRequestTagsHTML(requestData.splitRequests)
    const pdfWindow = window.open('', '_blank', 'width=800,height=600')
    if (pdfWindow) {
      pdfWindow.document.write(allRequestTagsHTML)
      pdfWindow.document.close()
      pdfWindow.focus()
      pdfWindow.print()
    }
  }

  // Generate HTML for all sample tags from multiple capabilities
  const generateAllSampleTagsHTML = (allRequests: any[]) => {
    const allSampleData = [];
    
    // Collect samples from all capabilities
    allRequests.forEach((request) => {
      request.methods?.forEach((method: any) => {
        method.samples.forEach((sample: string) => {
          const repeatMatch = sample.match(/_R(\d+)$/);
          const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : 1;
          
          let baseSampleName = sample;
          if (repeatMatch) {
            baseSampleName = sample.replace(/_R\d+$/, '');
            baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
          }
          
          // Find existing sample entry or create new one
          let existingSample = allSampleData.find(s => s.fullSampleName === sample);
          if (!existingSample) {
            existingSample = {
              fullSampleName: sample,
              baseSampleName: baseSampleName,
              repeatNumber: repeatNumber,
              methods: [],
              capability: request.capability,
              requestId: request.requestId
            };
            allSampleData.push(existingSample);
          }
          
          // Add method to this sample
          existingSample.methods.push(method.name);
        });
      });
    });

    // Remove duplicate methods for each sample
    allSampleData.forEach(sample => {
      sample.methods = [...new Set(sample.methods)];
    });

    // Group samples into pages (6 per page)
    const tagsPerPage = 6;
    const pages = [];
    for (let i = 0; i < allSampleData.length; i += tagsPerPage) {
      pages.push(allSampleData.slice(i, i + tagsPerPage));
    }

    const pageHTML = pages.map((samplesOnPage, pageIndex) => {
      const currentPageSamples = [...samplesOnPage];
      // Fill remaining slots with empty cards if needed
      while (currentPageSamples.length < tagsPerPage) {
        currentPageSamples.push(null);
      }

      return `
        <div class="tags-page" style="page-break-after: ${pageIndex < pages.length - 1 ? 'always' : 'auto'};">
          <div class="tags-grid">
            ${currentPageSamples.map((sample, index) => {
              if (!sample) {
                return '<div class="tag-card empty-card"></div>';
              }
              
              return `
                <div class="tag-card">
                  <div class="cut-lines">
                    <div class="cut-line-top"></div>
                    <div class="cut-line-right"></div>
                    <div class="cut-line-bottom"></div>
                    <div class="cut-line-left"></div>
                  </div>
                  
                  <div class="tag-content">
                    <!-- Header with QR Code -->
                    <div class="tag-header">
                      <div class="header-left">
                        <div class="lab-name">${sample.capability} Lab</div>
                        <div class="request-id">${sample.requestId}</div>
                      </div>
                      <div class="qr-section">
                        <div class="qr-placeholder">
                          <div class="qr-text">QR</div>
                          <div class="qr-code">${sample.fullSampleName}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Sample Information -->
                    <div class="sample-info">
                      <div class="sample-name">${sample.baseSampleName}</div>
                      ${sample.repeatNumber > 1 ? `<div class="repeat-info">Repeat #${sample.repeatNumber}</div>` : ''}
                    </div>
                    
                    <!-- Test Methods -->
                    <div class="test-methods">
                      <div class="methods-title">Tests:</div>
                      <div class="methods-list">
                        ${sample.methods.slice(0, 4).map(method => `<div class="method-item">${method}</div>`).join('')}
                        ${sample.methods.length > 4 ? `<div class="method-item">+${sample.methods.length - 4} more</div>` : ''}
                      </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="tag-footer">
                      <div class="generated-date">${new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Sample Tags</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; color: #333; }
            .tags-page { width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .tags-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 5mm; width: 100%; height: 100%; padding: 5mm; }
            .tag-card { position: relative; border: 1px solid #ccc; border-radius: 8px; background: white; display: flex; flex-direction: column; overflow: hidden; aspect-ratio: 1; }
            .empty-card { border: 1px dashed #ddd; }
            .cut-lines { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
            .cut-line-top, .cut-line-bottom { position: absolute; left: -5mm; right: -5mm; height: 1px; background: repeating-linear-gradient(to right, #666 0px, #666 3px, transparent 3px, transparent 6px); }
            .cut-line-top { top: -1px; } .cut-line-bottom { bottom: -1px; }
            .cut-line-left, .cut-line-right { position: absolute; top: -5mm; bottom: -5mm; width: 1px; background: repeating-linear-gradient(to bottom, #666 0px, #666 3px, transparent 3px, transparent 6px); }
            .cut-line-left { left: -1px; } .cut-line-right { right: -1px; }
            .tag-content { padding: 3mm; height: 100%; display: flex; flex-direction: column; }
            .tag-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; padding-bottom: 1mm; border-bottom: 1px solid #eee; }
            .header-left { flex: 1; display: flex; flex-direction: column; }
            .lab-name { font-size: 8px; font-weight: bold; color: #2563eb; margin-bottom: 1mm; }
            .request-id { font-size: 7px; color: #666; font-weight: bold; }
            .qr-section { flex-shrink: 0; }
            .qr-placeholder { width: 18mm; height: 18mm; border: 1px solid #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .qr-text { font-size: 6px; font-weight: bold; color: #666; }
            .qr-code { font-size: 5px; color: #333; margin-top: 1px; word-break: break-all; }
            .sample-info { text-align: center; margin-bottom: 2mm; }
            .sample-name { font-size: 10px; font-weight: bold; color: #333; margin-bottom: 1mm; word-break: break-word; line-height: 1.2; }
            .repeat-info { font-size: 7px; color: #7c3aed; background: #ede9fe; padding: 1px 4px; border-radius: 3px; display: inline-block; }
            .test-methods { flex: 1; margin-bottom: 2mm; }
            .methods-title { font-size: 8px; font-weight: bold; color: #666; margin-bottom: 1mm; text-transform: uppercase; }
            .methods-list { display: flex; flex-direction: column; gap: 1px; }
            .method-item { font-size: 7px; color: #333; background: #f8f9fa; padding: 1px 3px; border-radius: 2px; line-height: 1.3; text-align: left; }
            .tag-footer { margin-top: auto; text-align: center; padding-top: 1mm; border-top: 1px solid #eee; }
            .generated-date { font-size: 5px; color: #999; }
            @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } .tags-page { height: auto; min-height: 90vh; } }
          </style>
        </head>
        <body>
          ${pageHTML}
        </body>
      </html>
    `;
  }

  // Generate HTML for all request tags from multiple capabilities
  const generateAllRequestTagsHTML = (allRequests: any[]) => {
    const allPagesHTML = allRequests.map((request) => {
      return generateRequestTagHTML(request);
    }).join('');

    return allPagesHTML;
  }

  const generateRequestTagHTML = (request: any, forPDF: boolean = false) => {
    // Split methods into pages (max 10 per page)
    const methodsPerPage = 10;
    const methodPages = [];
    for (let i = 0; i < request.methods.length; i += methodsPerPage) {
      methodPages.push(request.methods.slice(i, i + methodsPerPage));
    }
    
    // Generate HTML for each page
    const pages = methodPages.map((methodsOnPage, pageIndex) => {
      const isFirstPage = pageIndex === 0;
      const pageNumber = pageIndex + 1;
      const totalPages = methodPages.length;
      
      return generateSinglePageHTML(request, methodsOnPage, isFirstPage, pageNumber, totalPages, user);
    }).join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Request Tag - ${request.requestId}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.3;
              color: #333;
              background: white;
            }
            
            .request-tag {
              width: 100%;
              min-height: 100vh;
              padding: 15px;
              border: 2px solid #000;
              display: flex;
              flex-direction: column;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid #333;
            }
            
            .logo-section {
              flex: 1;
            }
            
            .logo-section h1 {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 3px;
            }
            
            .logo-section p {
              font-size: 11px;
              color: #666;
            }
            
            .qr-section {
              width: 80px;
              height: 80px;
              border: 2px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: 8px;
              color: #666;
            }
            
            .request-info {
              margin-bottom: 12px;
            }
            
            .section-title {
              font-size: 13px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 3px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .info-item {
              margin-bottom: 5px;
            }
            
            .info-label {
              color: #6b7280;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .info-value {
              font-weight: 600;
              font-size: 11px;
              margin-top: 1px;
            }
            
            .test-methods {
              margin-bottom: 12px;
              flex: 1;
            }
            
            .method-item {
              border: 1px solid #d1d5db;
              border-radius: 3px;
              padding: 6px;
              margin-bottom: 6px;
              background: #f9fafb;
            }
            
            .method-name {
              font-weight: bold;
              margin-bottom: 3px;
              font-size: 10px;
            }
            
            .sample-list {
              margin-top: 3px;
            }
            
            .sample-item {
              font-size: 9px;
              color: #4b5563;
              margin-bottom: 1px;
            }
            
            .repeat-badge {
              background: #ede9fe;
              color: #7c3aed;
              border: 1px solid #c4b5fd;
              padding: 1px 4px;
              border-radius: 8px;
              font-size: 8px;
              margin-left: 3px;
            }
            
            .lab-info {
              margin-bottom: 10px;
            }
            
            .instructions {
              margin-bottom: 10px;
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 8px;
              border-radius: 3px;
            }
            
            .instructions-title {
              font-weight: bold;
              color: #92400e;
              margin-bottom: 3px;
              font-size: 10px;
            }
            
            .instructions-text {
              font-size: 9px;
              color: #78350f;
            }
            
            .footer {
              border-top: 1px solid #333;
              padding-top: 6px;
              margin-top: auto;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .footer-text {
              font-size: 8px;
              color: #666;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .request-tag {
                height: auto;
                min-height: 95vh;
                max-height: 95vh;
                overflow: hidden;
              }
              
              .test-methods {
                flex: none;
                max-height: 40vh;
                overflow: hidden;
              }
            }
          </style>
        </head>
        <body>
          ${pages}
        </body>
      </html>
    `
  }

  const generateSinglePageHTML = (request: any, methodsOnPage: any[], isFirstPage: boolean, pageNumber: number, totalPages: number, currentUser: any) => {
    return `
      <div class="request-tag" style="page-break-after: ${pageNumber < totalPages ? 'always' : 'auto'};">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            <h1>${request.capability} Laboratory</h1>
            <p>Smart Request Management System</p>
            <p style="margin-top: 10px; font-weight: bold; font-size: 16px;">REQUEST TAG</p>
            ${totalPages > 1 ? `<p style="font-size: 11px; color: #666; margin-top: 5px;">Page ${pageNumber} of ${totalPages}</p>` : ''}
          </div>
          <div class="qr-section">
            <div>
              <div style="font-weight: bold; margin-bottom: 5px;">QR CODE</div>
              <div>${request.requestId}</div>
            </div>
          </div>
        </div>
        
        ${isFirstPage ? `
        <!-- Request Information -->
        <div class="request-info">
          <h2 class="section-title">Request Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Request ID</div>
              <div class="info-value">${request.requestId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Capability</div>
              <div class="info-value">${request.capability}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Submission Date</div>
              <div class="info-value">${requestData?.submissionDate || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estimated Completion</div>
              <div class="info-value">${request.estimatedCompletion}</div>
            </div>
          </div>
        </div>
        
        <!-- Requester Information -->
        <div class="request-info">
          <h2 class="section-title">Requester Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${currentUser?.name || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Department</div>
              <div class="info-value">${currentUser?.department || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${currentUser?.email || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">User ID</div>
              <div class="info-value">${currentUser?.id || 'N/A'}</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Test Methods and Samples -->
        <div class="test-methods">
          <h2 class="section-title">Test Methods and Samples ${totalPages > 1 ? `(Page ${pageNumber}/${totalPages})` : ''}</h2>
          ${methodsOnPage.map((method: any) => {
            const samplesByRepeat = new Map();
            
            method.samples.forEach((sample: string) => {
              const repeatMatch = sample.match(/_R(\d+)$/);
              const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : 1;
              
              let baseSampleName = sample;
              if (repeatMatch) {
                baseSampleName = sample.replace(/_R\d+$/, '');
                baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
              }
              
              if (!samplesByRepeat.has(repeatNumber)) {
                samplesByRepeat.set(repeatNumber, []);
              }
              samplesByRepeat.get(repeatNumber).push(baseSampleName);
            });
            
            const sortedRepeats = Array.from(samplesByRepeat.entries()).sort(([a], [b]) => a - b);
            
            return `
              <div class="method-item">
                <div class="method-name">${method.name}</div>
                <div class="sample-list">
                  ${sortedRepeats.map(([repeatNum, samples]) => {
                    const uniqueSamples = [...new Set(samples)];
                    return `
                      <div class="sample-item">
                        <strong>Repeat #${repeatNum}:</strong> ${uniqueSamples.join(', ')}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        ${isFirstPage ? `
        <!-- Laboratory Information -->
        <div class="lab-info">
          <h2 class="section-title">Laboratory Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Laboratory</div>
              <div class="info-value">${request.capabilityInfo?.laboratory || request.capability + ' Laboratory'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contact</div>
              <div class="info-value">${request.capabilityInfo?.contact || 'lab@pcrd.com'}</div>
            </div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Address</div>
            <div class="info-value">${request.capabilityInfo?.address || '123 Laboratory Street, Science District, Bangkok 10400'}</div>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="instructions">
          <div class="instructions-title">Sample Submission Instructions</div>
          <div class="instructions-text">
            1. Print and attach sample tags to each sample<br>
            2. Package samples securely to prevent damage<br>
            3. Submit samples to the laboratory address above<br>
            4. Contact the laboratory if you have any questions
          </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          <div class="footer-text">
            ${request.capability} Laboratory Management System
          </div>
        </div>
      </div>
    `;
  }

  const generateSampleTagsHTML = (request: any) => {
    // Collect all unique samples with their test methods
    const sampleData = [];
    
    request.methods.forEach((method: any) => {
      method.samples.forEach((sample: string) => {
        const repeatMatch = sample.match(/_R(\d+)$/);
        const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : 1;
        
        let baseSampleName = sample;
        if (repeatMatch) {
          baseSampleName = sample.replace(/_R\d+$/, '');
          baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
        }
        
        // Find existing sample entry or create new one
        let existingSample = sampleData.find(s => s.fullSampleName === sample);
        if (!existingSample) {
          existingSample = {
            fullSampleName: sample,
            baseSampleName: baseSampleName,
            repeatNumber: repeatNumber,
            methods: []
          };
          sampleData.push(existingSample);
        }
        
        // Add method to this sample
        existingSample.methods.push(method.name);
      });
    });

    // Remove duplicate methods for each sample
    sampleData.forEach(sample => {
      sample.methods = [...new Set(sample.methods)];
    });

    // Group samples into pages (6 per page)
    const tagsPerPage = 6;
    const pages = [];
    for (let i = 0; i < sampleData.length; i += tagsPerPage) {
      pages.push(sampleData.slice(i, i + tagsPerPage));
    }

    const pageHTML = pages.map((samplesOnPage, pageIndex) => {
      const currentPageSamples = [...samplesOnPage];
      // Fill remaining slots with empty cards if needed
      while (currentPageSamples.length < tagsPerPage) {
        currentPageSamples.push(null);
      }

      return `
        <div class="tags-page" style="page-break-after: ${pageIndex < pages.length - 1 ? 'always' : 'auto'};">
          <div class="tags-grid">
            ${currentPageSamples.map((sample, index) => {
              if (!sample) {
                return '<div class="tag-card empty-card"></div>';
              }
              
              return `
                <div class="tag-card">
                  <div class="cut-lines">
                    <div class="cut-line-top"></div>
                    <div class="cut-line-right"></div>
                    <div class="cut-line-bottom"></div>
                    <div class="cut-line-left"></div>
                  </div>
                  
                  <div class="tag-content">
                    <!-- Header with QR Code -->
                    <div class="tag-header">
                      <div class="header-left">
                        <div class="lab-name">${request.capability} Lab</div>
                        <div class="request-id">${request.requestId}</div>
                      </div>
                      <div class="qr-section">
                        <div class="qr-placeholder">
                          <div class="qr-text">QR</div>
                          <div class="qr-code">${sample.fullSampleName}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Sample Information -->
                    <div class="sample-info">
                      <div class="sample-name">${sample.baseSampleName}</div>
                      ${sample.repeatNumber > 1 ? `<div class="repeat-info">Repeat #${sample.repeatNumber}</div>` : ''}
                    </div>
                    
                    <!-- Test Methods -->
                    <div class="test-methods">
                      <div class="methods-title">Tests:</div>
                      <div class="methods-list">
                        ${sample.methods.slice(0, 4).map(method => `<div class="method-item">${method}</div>`).join('')}
                        ${sample.methods.length > 4 ? `<div class="method-item">+${sample.methods.length - 4} more</div>` : ''}
                      </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="tag-footer">
                      <div class="generated-date">${new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sample Tags - ${request.requestId}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
              color: #333;
            }
            
            .tags-page {
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .tags-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(2, 1fr);
              gap: 5mm;
              width: 100%;
              height: 100%;
              padding: 5mm;
            }
            
            .tag-card {
              position: relative;
              border: 1px solid #ccc;
              border-radius: 8px;
              background: white;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              aspect-ratio: 1;
            }
            
            .empty-card {
              border: 1px dashed #ddd;
            }
            
            .cut-lines {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
            }
            
            .cut-line-top, .cut-line-bottom {
              position: absolute;
              left: -5mm;
              right: -5mm;
              height: 1px;
              background: repeating-linear-gradient(
                to right,
                #666 0px,
                #666 3px,
                transparent 3px,
                transparent 6px
              );
            }
            
            .cut-line-top { top: -1px; }
            .cut-line-bottom { bottom: -1px; }
            
            .cut-line-left, .cut-line-right {
              position: absolute;
              top: -5mm;
              bottom: -5mm;
              width: 1px;
              background: repeating-linear-gradient(
                to bottom,
                #666 0px,
                #666 3px,
                transparent 3px,
                transparent 6px
              );
            }
            
            .cut-line-left { left: -1px; }
            .cut-line-right { right: -1px; }
            
            .tag-content {
              padding: 3mm;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .tag-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 2mm;
              padding-bottom: 1mm;
              border-bottom: 1px solid #eee;
            }
            
            .header-left {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            
            .lab-name {
              font-size: 8px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 1mm;
            }
            
            .request-id {
              font-size: 7px;
              color: #666;
              font-weight: bold;
            }
            
            .qr-section {
              flex-shrink: 0;
            }
            
            .qr-placeholder {
              width: 18mm;
              height: 18mm;
              border: 1px solid #ddd;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            
            .qr-text {
              font-size: 6px;
              font-weight: bold;
              color: #666;
            }
            
            .qr-code {
              font-size: 5px;
              color: #333;
              margin-top: 1px;
              word-break: break-all;
            }
            
            .sample-info {
              text-align: center;
              margin-bottom: 2mm;
            }
            
            .sample-name {
              font-size: 10px;
              font-weight: bold;
              color: #333;
              margin-bottom: 1mm;
              word-break: break-word;
              line-height: 1.2;
            }
            
            .repeat-info {
              font-size: 7px;
              color: #7c3aed;
              background: #ede9fe;
              padding: 1px 4px;
              border-radius: 3px;
              display: inline-block;
            }
            
            .test-methods {
              flex: 1;
              margin-bottom: 2mm;
            }
            
            .methods-title {
              font-size: 8px;
              font-weight: bold;
              color: #666;
              margin-bottom: 1mm;
              text-transform: uppercase;
            }
            
            .methods-list {
              display: flex;
              flex-direction: column;
              gap: 1px;
            }
            
            .method-item {
              font-size: 7px;
              color: #333;
              background: #f8f9fa;
              padding: 1px 3px;
              border-radius: 2px;
              line-height: 1.3;
              text-align: left;
            }
            
            .tag-footer {
              margin-top: auto;
              text-align: center;
              padding-top: 1mm;
              border-top: 1px solid #eee;
            }
            
            .generated-date {
              font-size: 5px;
              color: #999;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .tags-page {
                height: auto;
                min-height: 90vh;
              }
            }
          </style>
        </head>
        <body>
          ${pageHTML}
        </body>
      </html>
    `;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium">Processing your request...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Error Loading Request</h1>
          <p className="text-lg text-gray-600 mb-4">{error}</p>
          <p className="text-md text-gray-500 mb-6">We're showing you mock data instead.</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
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
            <h1 className="text-3xl font-bold mb-2">Request Submitted Successfully!</h1>
            <p className="text-lg text-gray-600">Your test request has been received and is being processed.</p>
          </div>

          {/* Request information card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>
                Your request has been split into multiple request IDs based on the capabilities required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                  <p className="font-medium">{requestData?.submissionDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Request Title</p>
                  <p className="font-medium">{requestData?.requestTitle}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium mb-4">Your Request IDs</h3>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-row items-center justify-between gap-4 mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    {requestData?.splitRequests?.map((request) => (
                      <TabsTrigger key={request.requestId} value={request.requestId}>
                        {request.capability}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Print All Capabilities Actions */}
                  {requestData?.splitRequests && requestData.splitRequests.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex-shrink-0">
                      <div className="text-xs font-medium text-blue-800 mb-1">Print All Capabilities</div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1 text-blue-600 border-blue-600 hover:bg-blue-50 whitespace-nowrap text-xs px-2 py-1"
                          onClick={handlePrintAllRequestTags}
                        >
                          <Printer className="h-3 w-3" />
                          Request
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1 text-green-600 border-green-600 hover:bg-green-50 whitespace-nowrap text-xs px-2 py-1"
                          onClick={handlePrintAllSampleTags}
                        >
                          <Printer className="h-3 w-3" />
                          Sample
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1 text-purple-600 border-purple-600 hover:bg-purple-50 whitespace-nowrap text-xs px-2 py-1"
                          onClick={handleDownloadAllPDF}
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <TabsContent value="all" className="space-y-4">
                  {requestData?.splitRequests?.map((request) => (
                    <RequestCard
                      key={request.requestId}
                      request={request}
                      onPrintTags={() => handlePrintTags(request)}
                      onPrintRequestTag={() => handlePrintRequestTag(request)}
                      onDownloadPDF={() => handleDownloadPDF(request)}
                    />
                  ))}
                </TabsContent>

                {requestData?.splitRequests?.map((request) => (
                  <TabsContent key={request.requestId} value={request.requestId}>
                    <RequestCard
                      request={request}
                      onPrintTags={() => handlePrintTags(request)}
                      onPrintRequestTag={() => handlePrintRequestTag(request)}
                      onDownloadPDF={() => handleDownloadPDF(request)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Please follow these guidelines to ensure your samples are processed correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Each capability has different sample submission requirements. Please check the details for each
                    request.
                  </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Print Sample Tags</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Print the sample tags for each request by clicking the "Print Sample Tags" button on each
                        request card.
                      </p>
                      <p className="mb-2">
                        Attach the printed tags securely to each sample to ensure proper identification during testing.
                      </p>
                      <p>Each tag contains a unique barcode that links the sample to your request in our system.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Submit Your Samples</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Send your samples to the appropriate laboratory address listed for each capability.
                      </p>
                      <p className="mb-2">
                        Different capabilities may have different laboratory locations, so please check each request
                        carefully.
                      </p>
                      <p>Ensure samples are properly packaged to prevent damage during transport.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. Track Your Request</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        You can track the status of your requests at any time by logging into your account and checking
                        the "My Requests" section.
                      </p>
                      <p>
                        You will receive email notifications when your results are ready or if additional information is
                        needed.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-between">
            <Link href="/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
            <div className="flex space-x-3">
              <Link href="/request/new">
                <Button
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  onClick={() => {
                    // Clear all request-related data from localStorage
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem("ntrFormData");
                      localStorage.removeItem("ntrFormData_persistent");
                      localStorage.removeItem("ntrSamples");
                      localStorage.removeItem("ntrTestMethods");
                      localStorage.removeItem("smartAssistantRecommendations");
                      console.log("Cleared all request data from localStorage");
                    }
                  }}
                >
                  Create Another Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Print Tags Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Sample Tags</DialogTitle>
            <DialogDescription>Print tags for all samples in this request.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Request: {selectedRequest.requestId}</h3>
              <p className="text-sm text-muted-foreground mb-4">Capability: {selectedRequest.capability}</p>

              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-medium mb-2">Samples to Tag:</h4>
                <ul className="space-y-2">
                  {Array.from(new Set(selectedRequest.methods.flatMap((method: any) => method.samples))).map(
                    (sample: any, index: number) => {
                      console.log('Processing sample in print dialog:', sample);
                      
                      // Check if sample name contains repeat indicator (_R1, _R2, etc.)
                      const repeatMatch = sample.match(/_R(\d+)$/);
                      const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : null;
                      
                      // Remove method code and repeat suffix to get base sample name
                      let baseSampleName = sample;
                      if (repeatMatch) {
                        // Remove _R1, _R2, etc.
                        baseSampleName = sample.replace(/_R\d+$/, '');
                        // Remove method code if present (pattern: _MethodCode before _R)
                        baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
                      }
                      
                      return (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span>{baseSampleName}</span>
                          {repeatNumber && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs ml-2">
                              Repeat #{repeatNumber}
                            </Badge>
                          )}
                        </li>
                      )
                    },
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Submission Information:</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start">
                    <Home className="h-4 w-4 mr-2 mt-0.5" />
                    <span>{selectedRequest.capabilityInfo.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{selectedRequest.capabilityInfo.contactPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{selectedRequest.capabilityInfo.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2">
              <Printer className="h-4 w-4" />
              Print Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// Request Card Component
function RequestCard({
  request,
  onPrintTags,
  onPrintRequestTag,
  onDownloadPDF,
}: {
  request: any
  onPrintTags: () => void
  onPrintRequestTag: () => void
  onDownloadPDF: () => void
}) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{request.requestId}</h3>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">{request.capability}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Estimated completion: {request.estimatedCompletion}</p>
        </div>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" className="gap-1 text-xs px-2 py-1" onClick={onPrintRequestTag}>
            <Printer className="h-3 w-3" />
            Request
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs px-2 py-1" onClick={onPrintTags}>
            <Printer className="h-3 w-3" />
            Sample
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs px-2 py-1" onClick={onDownloadPDF}>
            <Download className="h-3 w-3" />
            PDF
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Test Methods:</h4>
        <div className="space-y-2">
          {request.methods.map((method: any) => {
            // Group samples by repeat number (extracted from fullSampleName with _R suffix)
            const samplesByRepeat = new Map();
            
            method.samples.forEach((sample: string) => {
              console.log('Processing sample in confirmation:', sample);
              
              // Check if sample name contains repeat indicator (_R1, _R2, etc.)
              // Look for pattern: SampleName_MethodCode_R1, SampleName_MethodCode_R2, etc.
              const repeatMatch = sample.match(/_R(\d+)$/);
              const repeatNumber = repeatMatch ? parseInt(repeatMatch[1]) : 1;
              
              // Remove method code and repeat suffix to get base sample name
              let baseSampleName = sample;
              if (repeatMatch) {
                // Remove _R1, _R2, etc.
                baseSampleName = sample.replace(/_R\d+$/, '');
                // Remove method code if present (pattern: _MethodCode before _R)
                baseSampleName = baseSampleName.replace(/_[^_]*$/, '');
              }
              
              console.log(`Sample: ${sample}, RepeatNumber: ${repeatNumber}, BaseName: ${baseSampleName}`);
              
              if (!samplesByRepeat.has(repeatNumber)) {
                samplesByRepeat.set(repeatNumber, []);
              }
              samplesByRepeat.get(repeatNumber).push(baseSampleName);
            });
            
            // Sort repeats by number
            const sortedRepeats = Array.from(samplesByRepeat.entries()).sort(([a], [b]) => a - b);
            
            return (
              <div key={method.id} className="border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{method.name}</p>
                
                {sortedRepeats.length > 1 ? (
                  // Show repeats separately if there are multiple
                  <div className="mt-2 space-y-2">
                    {sortedRepeats.map(([repeatNumber, samples]) => (
                      <div key={repeatNumber} className="ml-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            Repeat #{repeatNumber}
                          </Badge>
                          <p className="text-xs text-muted-foreground">Samples:</p>
                        </div>
                        <div className="flex flex-wrap gap-1 ml-4">
                          {samples.map((sample: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              {sample}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Show samples normally if only one repeat
                  <div className="flex flex-wrap gap-1 mt-1">
                    <p className="text-xs text-muted-foreground">Samples:</p>
                    {sortedRepeats[0]?.[1]?.map((sample: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {sample}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Submission Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Address:</p>
            <p className="text-sm">{request.capabilityInfo.address}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contact Person:</p>
            <p className="text-sm">{request.capabilityInfo.contactPerson}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {request.capabilityInfo.contactEmail} | {request.capabilityInfo.contactPhone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

