import React from "react"
import { Save } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Sample } from "./types"

interface SaveSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleListName: string;
  onSampleListNameChange: (name: string) => void;
  sampleListDescription: string;
  onSampleListDescriptionChange: (description: string) => void;
  samples: Sample[];
  ioNumber?: string;
  onSave: () => void;
  saving?: boolean;
}

export function SaveSampleDialog({
  open,
  onOpenChange,
  sampleListName,
  onSampleListNameChange,
  sampleListDescription,
  onSampleListDescriptionChange,
  samples,
  ioNumber,
  onSave,
  saving = false,
}: SaveSampleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Sample List</DialogTitle>
          <DialogDescription>Save your current samples as a reusable sample set</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sample-set-name">Sample Set Name</Label>
            <Input
              id="sample-set-name"
              value={sampleListName}
              onChange={(e) => onSampleListNameChange(e.target.value)}
              placeholder="e.g., Polymer Film Samples"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sample-set-description">Description (optional)</Label>
            <Textarea
              id="sample-set-description"
              value={sampleListDescription}
              onChange={(e) => onSampleListDescriptionChange(e.target.value)}
              placeholder="Brief description of this sample set..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>IO Number:</strong> {ioNumber || 'No IO Number'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Total Samples:</strong> {samples.length}
            </p>
            {ioNumber && (
              <p className="text-xs text-muted-foreground">
                This sample set will be shared with other users who have access to IO {ioNumber}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            onSampleListNameChange("");
            onSampleListDescriptionChange("");
          }}>
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={saving || !sampleListName.trim()}
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Sample Set
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}