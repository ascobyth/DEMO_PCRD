import React, { useState } from "react"
import { Trash2, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SampleSet } from "./types"

interface LoadSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedSampleLists: SampleSet[];
  loading?: boolean;
  onLoadSampleSet: (sampleSet: SampleSet) => void;
  onDeleteSampleSet?: (sampleSetId: string, sampleSetName: string, event: React.MouseEvent) => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LoadSampleDialog({
  open,
  onOpenChange,
  savedSampleLists,
  loading = false,
  onLoadSampleSet,
  onDeleteSampleSet,
  onFileUpload,
}: LoadSampleDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Filter sample lists based on search query
  const filteredSampleLists = savedSampleLists.filter((list) => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    
    // Search in sample set name
    if (list.sampleSetName.toLowerCase().includes(searchLower)) return true
    
    // Search in description
    if (list.description && list.description.toLowerCase().includes(searchLower)) return true
    
    // Search in requester name
    if (list.requesterName.toLowerCase().includes(searchLower)) return true
    
    // Search in IO number
    if (list.ioNumber && list.ioNumber.toLowerCase().includes(searchLower)) return true
    
    // Search in sample data
    if (list.samples && Array.isArray(list.samples)) {
      return list.samples.some(sample => {
        // Search in all sample fields
        return Object.values(sample).some(value => {
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower)
          }
          return false
        })
      })
    }
    
    return false
  })

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) setSearchQuery("") // Reset search when closing
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Sample List</DialogTitle>
          <DialogDescription>Select a saved sample set to load or upload from CSV</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* CSV Upload Section */}
          {onFileUpload && (
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Upload from CSV</h4>
                  <p className="text-xs text-muted-foreground">Import samples from a CSV file</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select CSV File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={onFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : savedSampleLists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved sample sets found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Save a sample set first or check if you have the correct IO number.
              </p>
            </div>
          ) : (
            <>
              {/* Search Box */}
              <div className="space-y-2">
                <Label htmlFor="sample-set-search">Search Sample Sets</Label>
                <Input
                  id="sample-set-search"
                  type="text"
                  placeholder="Search by name, description, IO number, or sample content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Search includes sample set names, descriptions, and all sample data fields
                </p>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredSampleLists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sample sets match your search.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try a different search term or clear the search.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredSampleLists.length} of {savedSampleLists.length} sample sets
                    </p>
                    {filteredSampleLists.map((list) => (
                      <div
                        key={list._id}
                        className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => onLoadSampleSet(list)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{list.sampleSetName}</h4>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{list.sampleCount} sample(s)</span>
                              <span>IO: {list.ioNumber || 'None'}</span>
                              <span>By: {list.requesterName}</span>
                              <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            {list.isOwner ? (
                              <>
                                <Badge variant="outline" className="text-xs">Your Set</Badge>
                                {onDeleteSampleSet && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => onDeleteSampleSet(list._id, list.sampleSetName, e)}
                                    title="Delete this sample set"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">Shared</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false)
            setSearchQuery("")
          }}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}