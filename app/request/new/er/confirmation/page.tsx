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
          PCRD Equipment Reservation
        </h1>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '5px 0'
        }}>
          {request.requestNumber}
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
          QR Code<br/>{request.requestNumber}
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
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.submissionDate || new Date().toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Estimated Completion:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{request.estimatedCompletion}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Priority:</div>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>{requestData?.priority || 'Normal'}</div>
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

      {/* Equipment & Methods and Samples */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 10px 0',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '5px'
        }}>
          Equipment & Testing Methods
        </h2>
        
        {request.methods.map((method: any, index: number) => {
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
              
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '10px'
              }}>
                Equipment: {request.equipmentName || 'N/A'}
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {method.samples.map((sample: string, idx: number) => (
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
            <div style={{ fontWeight: '500' }}>{request.capabilityInfo?.address || 'PCRD Laboratory'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Contact Person:</div>
              <div style={{ fontWeight: '500' }}>{request.capabilityInfo?.contactPerson || 'Lab Administrator'}</div>
            </div>
            <div>
              <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Phone:</div>
              <div style={{ fontWeight: '500' }}>{request.capabilityInfo?.contactPhone || '123-456-7890'}</div>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold' }}>Email:</div>
            <div style={{ fontWeight: '500' }}>{request.capabilityInfo?.contactEmail || 'lab@pcrd.com'}</div>
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
          Equipment Reservation Instructions
        </h3>
        <ol style={{
          margin: '0',
          paddingLeft: '20px',
          color: '#92400e'
        }}>
          <li style={{ marginBottom: '5px' }}>Print and keep this reservation request for reference</li>
          <li style={{ marginBottom: '5px' }}>Prepare samples according to testing requirements</li>
          <li style={{ marginBottom: '5px' }}>Arrive at the scheduled time with your samples</li>
          <li style={{ marginBottom: '5px' }}>Contact the lab if you need to reschedule</li>
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

export default function ERConfirmationPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // State for the real request data
  const [requestData, setRequestData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        // Get request data from localStorage
        const submittedData = localStorage.getItem('submittedERData')
        const requestNumbers = localStorage.getItem('submittedERRequestNumbers')
        
        if (submittedData) {
          const parsedData = JSON.parse(submittedData)
          
          // Use the data directly from localStorage for ER requests
          setRequestData(parsedData)
        } else {
          setError('No submission data found')
        }
      } catch (error) {
        console.error('Error loading request data:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestData()
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

  // Functions for handling ALL requests at once
  const handlePrintAllSampleTags = () => {
    if (!requestData?.requests || requestData.requests.length === 0) return
    
    // Generate HTML for all sample tags from all requests
    const allSampleTagsHTML = generateAllSampleTagsHTML(requestData.requests)
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(allSampleTagsHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handlePrintAllRequestTags = () => {
    if (!requestData?.requests || requestData.requests.length === 0) return
    
    // Generate HTML for all request tags from all requests
    const allRequestTagsHTML = generateAllRequestTagsHTML(requestData.requests)
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(allRequestTagsHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleDownloadAllPDF = () => {
    if (!requestData?.requests || requestData.requests.length === 0) return
    
    // Generate HTML for all request tags as PDF
    const allRequestTagsHTML = generateAllRequestTagsHTML(requestData.requests)
    const pdfWindow = window.open('', '_blank', 'width=800,height=600')
    if (pdfWindow) {
      pdfWindow.document.write(allRequestTagsHTML)
      pdfWindow.document.close()
      pdfWindow.focus()
      pdfWindow.print()
    }
  }

  // Generate HTML for all sample tags from multiple requests
  const generateAllSampleTagsHTML = (allRequests: any[]) => {
    const allSampleData = [];
    
    // Collect samples from all requests
    allRequests.forEach((request) => {
      request.methods?.forEach((method: any) => {
        method.samples.forEach((sample: string) => {
          // Find existing sample entry or create new one
          let existingSample = allSampleData.find(s => s.fullSampleName === sample);
          if (!existingSample) {
            existingSample = {
              fullSampleName: sample,
              baseSampleName: sample,
              methods: [],
              capability: request.capability,
              requestNumber: request.requestNumber,
              equipmentName: request.equipmentName
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
                        <div class="request-id">${sample.requestNumber}</div>
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
                      <div class="equipment-info">Equipment: ${sample.equipmentName || 'N/A'}</div>
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
            .equipment-info { font-size: 7px; color: #666; }
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

  // Generate HTML for all request tags from multiple requests
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
          <title>Request Tag - ${request.requestNumber}</title>
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
            
            .equipment-info {
              font-size: 9px;
              color: #666;
              margin-bottom: 2px;
            }
            
            .sample-list {
              margin-top: 3px;
            }
            
            .sample-item {
              font-size: 9px;
              color: #4b5563;
              margin-bottom: 1px;
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
            <p>Equipment Reservation System</p>
            <p style="margin-top: 10px; font-weight: bold; font-size: 16px;">RESERVATION TAG</p>
            ${totalPages > 1 ? `<p style="font-size: 11px; color: #666; margin-top: 5px;">Page ${pageNumber} of ${totalPages}</p>` : ''}
          </div>
          <div class="qr-section">
            <div>
              <div style="font-weight: bold; margin-bottom: 5px;">QR CODE</div>
              <div>${request.requestNumber}</div>
            </div>
          </div>
        </div>
        
        ${isFirstPage ? `
        <!-- Request Information -->
        <div class="request-info">
          <h2 class="section-title">Request Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Request Number</div>
              <div class="info-value">${request.requestNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Capability</div>
              <div class="info-value">${request.capability}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Submission Date</div>
              <div class="info-value">${requestData?.submissionDate || new Date().toLocaleDateString()}</div>
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
        
        <!-- Equipment & Test Methods and Samples -->
        <div class="test-methods">
          <h2 class="section-title">Equipment & Test Methods ${totalPages > 1 ? `(Page ${pageNumber}/${totalPages})` : ''}</h2>
          ${methodsOnPage.map((method: any) => {
            return `
              <div class="method-item">
                <div class="method-name">${method.name}</div>
                <div class="equipment-info">Equipment: ${request.equipmentName || 'N/A'}</div>
                <div class="sample-list">
                  <div class="sample-item">
                    <strong>Samples:</strong> ${method.samples.join(', ')}
                  </div>
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
              <div class="info-value">${request.capabilityInfo?.contactEmail || 'lab@pcrd.com'}</div>
            </div>
          </div>
          <div class="info-item" style="margin-top: 10px;">
            <div class="info-label">Address</div>
            <div class="info-value">${request.capabilityInfo?.address || 'PCRD Laboratory'}</div>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="instructions">
          <div class="instructions-title">Equipment Reservation Instructions</div>
          <div class="instructions-text">
            1. Print and keep this reservation tag for reference<br>
            2. Prepare your samples according to testing requirements<br>
            3. Arrive at the scheduled time with your samples<br>
            4. Contact the laboratory if you need to reschedule
          </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">
            Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          <div class="footer-text">
            ${request.capability} Equipment Reservation System
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
        // Find existing sample entry or create new one
        let existingSample = sampleData.find(s => s.fullSampleName === sample);
        if (!existingSample) {
          existingSample = {
            fullSampleName: sample,
            baseSampleName: sample,
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
                        <div class="request-id">${request.requestNumber}</div>
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
                      <div class="equipment-info">Equipment: ${request.equipmentName || 'N/A'}</div>
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
          <title>Sample Tags - ${request.requestNumber}</title>
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
            
            .equipment-info {
              font-size: 7px;
              color: #666;
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
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!requestData || !requestData.requests || requestData.requests.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-2">No Data Found</h1>
          <p className="text-lg text-gray-600 mb-4">No request data found. Please try submitting a new request.</p>
          <Link href="/request/new/er">
            <Button>Create New Request</Button>
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
            <p className="text-lg text-gray-600">Your equipment reservation request has been received and is being processed.</p>
          </div>

          {/* Request information card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>
                Your equipment reservation request has been submitted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Request Title</p>
                  <p className="font-medium">{requestData?.requestTitle}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium mb-4">Your Request Details</h3>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-row items-center justify-between gap-4 mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    {requestData?.requests?.map((request) => (
                      <TabsTrigger key={request.requestNumber} value={request.requestNumber}>
                        {request.capability}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Print All Requests Actions */}
                  {requestData?.requests && requestData.requests.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 flex-shrink-0">
                      <div className="text-xs font-medium text-blue-800 mb-1">Print All</div>
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
                  {requestData?.requests?.map((request) => (
                    <RequestCard
                      key={request.requestNumber}
                      request={request}
                      onPrintTags={() => handlePrintTags(request)}
                      onPrintRequestTag={() => handlePrintRequestTag(request)}
                      onDownloadPDF={() => handleDownloadPDF(request)}
                    />
                  ))}
                </TabsContent>

                {requestData?.requests?.map((request) => (
                  <TabsContent key={request.requestNumber} value={request.requestNumber}>
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
                Please follow these guidelines for your equipment reservation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Please arrive at the scheduled time with your samples prepared according to the testing requirements.
                  </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>1. Print Reservation Tags</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Print the reservation tag by clicking the "Print Request" button on your request card.
                      </p>
                      <p className="mb-2">
                        Keep this tag with you when you visit the laboratory for your scheduled equipment reservation.
                      </p>
                      <p>The tag contains all necessary information including your reservation details and laboratory contact information.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>2. Prepare Your Samples</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Ensure your samples are prepared according to the testing method requirements.
                      </p>
                      <p className="mb-2">
                        Label your samples clearly with the sample names shown in your request.
                      </p>
                      <p>If you have any questions about sample preparation, contact the laboratory before your scheduled time.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>3. Track Your Reservation</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        You can view your reservation status at any time by logging into your account and checking the "My Requests" section.
                      </p>
                      <p>
                        You will receive email notifications for any changes to your reservation schedule or if additional information is needed.
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
                      localStorage.removeItem("erFormData");
                      localStorage.removeItem("erSamples");
                      localStorage.removeItem("submittedERData");
                      localStorage.removeItem("submittedERRequestNumbers");
                      console.log("Cleared all ER request data from localStorage");
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
              <h3 className="font-medium mb-2">Request: {selectedRequest.requestNumber}</h3>
              <p className="text-sm text-muted-foreground mb-4">Capability: {selectedRequest.capability}</p>

              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-medium mb-2">Samples to Tag:</h4>
                <ul className="space-y-2">
                  {Array.from(new Set(selectedRequest.methods.flatMap((method: any) => method.samples))).map(
                    (sample: any, index: number) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>{sample}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Laboratory Information:</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start">
                    <Home className="h-4 w-4 mr-2 mt-0.5" />
                    <span>{selectedRequest.capabilityInfo?.address || 'PCRD Laboratory'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{selectedRequest.capabilityInfo?.contactPhone || '123-456-7890'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{selectedRequest.capabilityInfo?.contactEmail || 'lab@pcrd.com'}</span>
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
            <h3 className="text-lg font-medium">{request.requestNumber}</h3>
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
        <h4 className="text-sm font-medium mb-2">Equipment & Test Methods:</h4>
        <div className="space-y-2">
          {request.methods.map((method: any) => (
            <div key={method.id} className="border rounded-md p-3 bg-gray-50">
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Equipment: {request.equipmentName || 'N/A'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <p className="text-xs text-muted-foreground">Samples:</p>
                {method.samples.map((sample: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-gray-100">
                    {sample}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Laboratory Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Address:</p>
            <p className="text-sm">{request.capabilityInfo?.address || 'PCRD Laboratory'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contact Person:</p>
            <p className="text-sm">{request.capabilityInfo?.contactPerson || 'Lab Administrator'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {request.capabilityInfo?.contactEmail || 'lab@pcrd.com'} | {request.capabilityInfo?.contactPhone || '123-456-7890'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}