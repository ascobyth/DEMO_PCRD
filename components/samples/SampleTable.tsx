import React from "react"
import { Copy, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Sample } from "./types"

interface SampleTableProps {
  samples: Sample[];
  onCopySample: (sample: Sample) => void;
  onEditSample: (sample: Sample, index: number) => void;
  onRemoveSample: (index: number) => void;
}

export function SampleTable({ samples, onCopySample, onEditSample, onRemoveSample }: SampleTableProps) {
  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case "commercial":
        return "Commercial Grade";
      case "td":
        return "TD/NPD";
      case "benchmark":
        return "Benchmark";
      case "inprocess":
        return "Inprocess/Chemicals";
      case "chemicals":
        return "Chemicals/Substances";
      case "cap":
        return "Cap Development";
      default:
        return category;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Sample Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Form</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample, index) => (
            <TableRow key={sample.id || `sample-fallback-${index}-${Date.now()}`}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="font-medium">{sample.generatedName}</TableCell>
              <TableCell>{getCategoryDisplay(sample.category)}</TableCell>
              <TableCell>{sample.type}</TableCell>
              <TableCell>{sample.form}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onCopySample(sample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEditSample(sample, index)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveSample(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}