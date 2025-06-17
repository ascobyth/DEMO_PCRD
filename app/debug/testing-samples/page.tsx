"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DebugTestingSamplesPage() {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(false)
  const [requestNumber, setRequestNumber] = useState("")

  const fetchSamples = async (reqNumber = "") => {
    setLoading(true)
    try {
      const url = reqNumber 
        ? `/api/debug/testing-samples?requestNumber=${encodeURIComponent(reqNumber)}`
        : '/api/debug/testing-samples'
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setSamples(result.data)
        console.log('Fetched samples:', result.data)
      } else {
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSamples()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Debug: Testing Sample List Records</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search by Request Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter request number (optional)"
              value={requestNumber}
              onChange={(e) => setRequestNumber(e.target.value)}
            />
            <Button onClick={() => fetchSamples(requestNumber)} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
            <Button variant="outline" onClick={() => {
              setRequestNumber("")
              fetchSamples()
            }}>
              Show All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing Sample Records ({samples.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : samples.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No records found</div>
          ) : (
            <div className="space-y-4">
              {samples.map((sample, index) => (
                <div key={sample._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Request Number</p>
                      <p className="font-medium">{sample.requestNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sample Name</p>
                      <p>{sample.sampleName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Sample Name</p>
                      <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {sample.fullSampleName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Method Code</p>
                      <p>{sample.methodCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capability</p>
                      <p>{sample.capabilityName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline">{sample.sampleStatus}</Badge>
                    </div>
                  </div>
                  {sample.testingRemark && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground">Testing Remark (Repeat Requirements)</p>
                      <p className="text-sm bg-white px-3 py-2 rounded border mt-1">
                        {sample.testingRemark}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}