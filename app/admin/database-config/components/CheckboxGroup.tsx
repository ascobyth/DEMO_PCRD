"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

type Option = {
  _id: string
  label: string
  value: string
}

interface CheckboxGroupProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function CheckboxGroup({
  options,
  selected,
  onChange,
  className,
}: CheckboxGroupProps) {
  // Make sure options and selected are always arrays
  const safeOptions = Array.isArray(options) ? options : []
  const safeSelected = Array.isArray(selected) ? selected : []

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean, optionId: string) => {
    if (checked) {
      // Add to selected
      const newSelected = [...safeSelected, optionId]
      console.log('Adding capability:', optionId)
      console.log('New selected capabilities:', newSelected)
      onChange(newSelected)
    } else {
      // Remove from selected
      const newSelected = safeSelected.filter(id => id !== optionId)
      console.log('Removing capability:', optionId)
      console.log('New selected capabilities:', newSelected)
      onChange(newSelected)
    }
  }

  return (
    <div className={`border rounded-md p-2 ${className}`}>
      <ScrollArea className="h-[150px] pr-4">
        <div className="space-y-1">
          {safeOptions.length > 0 ? (
            safeOptions.map((option) => (
              <div key={option._id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`capability-${option._id}`}
                  checked={safeSelected.includes(option._id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked as boolean, option._id)
                  }
                />
                <label
                  htmlFor={`capability-${option._id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No capabilities available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
