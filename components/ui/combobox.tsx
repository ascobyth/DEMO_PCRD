"use client"

import * as React from "react"
import { ChevronsUpDown, Search, Square, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Find the selected option for display
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options

    const lowerQuery = searchQuery.toLowerCase()
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(lowerQuery)
      const descMatch = option.description ? option.description.toLowerCase().includes(lowerQuery) : false
      return labelMatch || descMatch
    })
  }, [options, searchQuery])

  // Handle selection
  const handleSelect = React.useCallback((selectedValue: string) => {
    console.log("Selecting value:", selectedValue)
    onChange(selectedValue)
    setOpen(false)
    setSearchQuery("")
  }, [onChange])

  // Handle direct click on an option
  const handleOptionClick = (e: React.MouseEvent, optionValue: string) => {
    e.preventDefault()
    e.stopPropagation()
    handleSelect(optionValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white border-input",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="flex flex-col items-start text-left">
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {selectedOption.description}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border shadow-md">
        <div className="bg-white">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground border-0 focus:ring-0 focus-visible:ring-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options list */}
          <div className="max-h-[300px] overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div>
                {filteredOptions.map((option, index) => (
                  <div
                    key={`${option.value}-${index}`}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none",
                      value === option.value ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center w-full">
                      <div className="mr-2 h-4 w-4 flex-shrink-0">
                        {value === option.value ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className={cn(
                          "font-medium",
                          value === option.value && "text-primary"
                        )}>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

