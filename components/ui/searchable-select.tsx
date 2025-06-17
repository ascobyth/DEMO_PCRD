"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  id?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Find the selected option for display
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options

    const lowerQuery = searchQuery.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerQuery) ||
      option.value.toLowerCase().includes(lowerQuery)
    )
  }, [options, searchQuery])

  // Handle selection
  const handleSelect = React.useCallback((selectedValue: string) => {
    console.log("SearchableSelect - Selecting value:", selectedValue)
    onChange(selectedValue)
    setOpen(false)
    setSearchQuery("")
  }, [onChange])

  // Focus input when popover opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={id}
          className={cn(
            "w-full justify-between bg-white border-input",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 bg-white border shadow-md z-50"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="bg-white">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground border-0 focus:ring-0 focus-visible:ring-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options list */}
          <div className="max-h-[300px] overflow-auto p-1" style={{ pointerEvents: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div>
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-3 text-sm outline-none w-full text-left",
                      value === option.value ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
                    )}
                    onClick={() => {
                      console.log("SearchableSelect - Option clicked:", option.value)
                      handleSelect(option.value)
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div className="mr-2 h-4 w-4 flex-shrink-0">
                        {value === option.value ? (
                          <Check className="h-4 w-4" />
                        ) : null}
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className={cn(
                          "font-medium",
                          value === option.value && "text-primary"
                        )}>{option.label}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
