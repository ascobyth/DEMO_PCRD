"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
  _id: string
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Debug logging
  React.useEffect(() => {
    console.log('MultiSelect options:', options);
    console.log('MultiSelect selected:', selected);
  }, [options, selected]);

  const handleUnselect = (item: string) => {
    onChange(safeSelected.filter((i) => i !== item))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          const newSelected = [...safeSelected]
          newSelected.pop()
          onChange(newSelected)
        }
      }
      // This is not a default behavior of the <input /> field
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }

  // Make sure options and selected are always arrays
  const safeOptions = Array.isArray(options) ? options : []
  const safeSelected = Array.isArray(selected) ? selected : []

  // Filter out already selected options
  const selectables = safeOptions.filter((option) => !safeSelected.includes(option._id))

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className}`}
    >
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {safeSelected.map((item) => {
            const option = safeOptions.find((o) => o._id === item)
            return (
              <Badge key={item} variant="secondary" className="rounded-sm">
                {option?.label || item}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={safeSelected.length === 0 ? placeholder : undefined}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {selectables.length > 0 ? (
                selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option._id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        setInputValue("")
                        const newSelected = [...safeSelected, option._id];
                        console.log('Selecting option:', option);
                        console.log('New selected array:', newSelected);
                        onChange(newSelected)
                      }}
                      className={"cursor-pointer"}
                    >
                      {option.label}
                    </CommandItem>
                  )
                })
              ) : (
                <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                  {safeOptions.length === 0 ? "No options available" : "No more options to select"}
                </div>
              )}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
