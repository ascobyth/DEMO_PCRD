"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface MultiSelectDropdownProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  disabled = false,
  className,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const isAllSelected = selected.length === options.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([])
    } else {
      onChange(options.map(opt => opt.value))
    }
  }

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  const getDisplayText = () => {
    if (selected.length === 0) {
      return placeholder
    }
    if (selected.length === options.length) {
      return "All Selected"
    }
    const selectedLabels = selected
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter(Boolean)
    
    if (selectedLabels.length <= 2) {
      return selectedLabels.join(", ")
    }
    return `${selectedLabels.length} Selected`
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-white dark:bg-gray-950 px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="flex flex-wrap gap-1 items-center">
          <span className={cn(
            selected.length === 0 ? "text-muted-foreground" : "text-foreground"
          )}>
            {getDisplayText()}
          </span>
        </div>
        <svg
          className={cn(
            "h-4 w-4 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white dark:bg-gray-950 p-1 text-popover-foreground shadow-md">
          {/* Select All option */}
          <label
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground border-b mb-1"
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="mr-2"
            />
            Select All
          </label>
          
          {/* Individual options */}
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}