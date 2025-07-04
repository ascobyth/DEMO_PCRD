"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SampleSelectionListProps {
  methodId: string
  instanceIndex?: number
  samples: string[]
  selectedSamples: string[]
  samplePriorities: Record<string, 'normal' | 'urgent'>
  sampleRequirements: Record<string, string>
  onSampleToggle: (sampleName: string) => void
  onPriorityChange: (sampleName: string, priority: 'normal' | 'urgent') => void
  onRequirementChange: (sampleName: string, requirement: string) => void
  isExpanded?: boolean
  disabled?: boolean
}

export function SampleSelectionList({
  methodId,
  instanceIndex,
  samples,
  selectedSamples,
  samplePriorities,
  sampleRequirements,
  onSampleToggle,
  onPriorityChange,
  onRequirementChange,
  isExpanded = false,
  disabled = false
}: SampleSelectionListProps) {
  const getSampleKey = (sampleName: string) => {
    return instanceIndex !== undefined 
      ? `${methodId}-instance-${instanceIndex}-${sampleName}`
      : `${methodId}-${sampleName}`
  }

  // Apply priority to all samples
  const applyPriorityToAll = (priority: 'normal' | 'urgent') => {
    samples.forEach(sample => {
      if (selectedSamples.includes(sample)) {
        onPriorityChange(sample, priority)
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium">Select Samples:</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Apply to all:</span>
          <RadioGroup
            onValueChange={disabled ? undefined : (value) => applyPriorityToAll(value as 'normal' | 'urgent')}
            className="flex items-center gap-3"
            disabled={disabled}
          >
            <div className="flex items-center gap-1">
              <RadioGroupItem value="normal" id={`${methodId}${instanceIndex !== undefined ? `-instance-${instanceIndex}` : ''}-all-normal`} className="h-3 w-3" disabled={disabled} />
              <Label htmlFor={`${methodId}${instanceIndex !== undefined ? `-instance-${instanceIndex}` : ''}-all-normal`} className="text-xs font-normal cursor-pointer">
                Normal
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="urgent" id={`${methodId}${instanceIndex !== undefined ? `-instance-${instanceIndex}` : ''}-all-urgent`} className="h-3 w-3 border-red-500 text-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" disabled={disabled} />
              <Label htmlFor={`${methodId}${instanceIndex !== undefined ? `-instance-${instanceIndex}` : ''}-all-urgent`} className="text-xs font-normal cursor-pointer text-red-600">
                Urgent
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      {samples.map((sample) => {
        const sampleKey = getSampleKey(sample)
        const isSelected = selectedSamples.includes(sample)
        const priority = samplePriorities[sampleKey] || 'normal'
        const requirement = sampleRequirements[sampleKey] || ''

        return (
          <div 
            key={sample}
            className={`border rounded p-2 transition-all ${
              isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Checkbox */}
              <Checkbox
                id={`${sampleKey}-checkbox`}
                checked={isSelected}
                onCheckedChange={disabled ? undefined : () => onSampleToggle(sample)}
                className="h-4 w-4"
                disabled={disabled}
              />
              
              {/* Sample name */}
              <Label 
                htmlFor={`${sampleKey}-checkbox`}
                className={`text-xs font-medium cursor-pointer ${isExpanded ? 'flex-1' : 'w-32'}`}
              >
                {sample}
              </Label>

              {/* Priority radio buttons - fixed width container for alignment */}
              <div className="w-40">
                {isSelected ? (
                  <RadioGroup
                    value={priority}
                    onValueChange={disabled ? undefined : (value) => onPriorityChange(sample, value as 'normal' | 'urgent')}
                    className="flex items-center gap-3"
                    disabled={disabled}
                  >
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="normal" id={`${sampleKey}-normal`} className="h-3 w-3" disabled={disabled} />
                      <Label htmlFor={`${sampleKey}-normal`} className="text-xs font-normal cursor-pointer">
                        Normal
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="urgent" id={`${sampleKey}-urgent`} className="h-3 w-3 border-red-500 text-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" disabled={disabled} />
                      <Label htmlFor={`${sampleKey}-urgent`} className="text-xs font-normal cursor-pointer text-red-600">
                        Urgent
                      </Label>
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="text-xs text-muted-foreground">-</div>
                )}
              </div>

              {/* Sample Requirements Input - fixed width for alignment */}
              <div className="flex-1 max-w-md">
                {isSelected ? (
                  <Input
                    placeholder="Add requirements"
                    value={requirement}
                    onChange={disabled ? undefined : (e) => onRequirementChange(sample, e.target.value)}
                    className="text-xs h-7 w-full"
                    disabled={disabled}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground">-</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}