"use client"

import * as React from "react"
import { X, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AutocompleteInputProps {
  options?: { value: string; label: string }[]
  suggestions?: { id: string; name: string }[] // Added for backward compatibility
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  allowCustomValue?: boolean
  id?: string
}

export function AutocompleteInput({
  options: propOptions,
  suggestions,
  value,
  onChange,
  placeholder = "Search...",
  className,
  allowCustomValue = true,
  id,
}: AutocompleteInputProps) {
  // Convert suggestions to options format if provided
  const options = React.useMemo(() => {
    if (propOptions) return propOptions
    
    if (suggestions) {
      return suggestions.map(item => ({
        value: item.id,
        label: item.name
      }))
    }
    
    return []
  }, [propOptions, suggestions])
  const [inputValue, setInputValue] = React.useState<string>(value || "")
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const [focused, setFocused] = React.useState<boolean>(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Update input value when the external value changes
  React.useEffect(() => {
    const selectedOption = options?.find((option) => option.value === value)
    setInputValue(selectedOption ? selectedOption.label : value || "")
  }, [value, options])

  // Filter options based on input
  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim() || !options) return options || []

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase()),
    )
  }, [inputValue, options])

  // Handle clicks outside the component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)

        // If custom values are allowed and there's input text, set it as the value
        if (
          allowCustomValue &&
          inputValue.trim() &&
          !options?.some(
            (option) =>
              option.label.toLowerCase() === inputValue.toLowerCase() ||
              option.value.toLowerCase() === inputValue.toLowerCase(),
          )
        ) {
          onChange(inputValue)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [inputValue, onChange, options, allowCustomValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
  }

  const handleOptionSelect = (optionValue: string, optionLabel: string) => {
    setInputValue(optionLabel)
    onChange(optionValue)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setFocused(true)
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    setFocused(false)
    // Don't close dropdown immediately to allow clicking on options
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 100)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle enter to select first option or use current input as custom value
    if (e.key === "Enter") {
      e.preventDefault()

      if (filteredOptions.length > 0) {
        handleOptionSelect(filteredOptions[0].value, filteredOptions[0].label)
      } else if (allowCustomValue && inputValue.trim()) {
        onChange(inputValue)
        setIsOpen(false)
      }
    }

    // Close on escape
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const clearInput = () => {
    setInputValue("")
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex items-center border rounded-md bg-white overflow-hidden",
          focused ? "ring-2 ring-blue-500 border-blue-500" : "border-input",
          className,
        )}
      >
        <div className="flex-grow flex items-center px-3 py-2">
          <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none border-none focus:ring-0 p-0 text-sm"
            autoComplete="off"
          />
        </div>
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="h-auto py-1 px-2 mr-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white mt-1 rounded-md border border-gray-200 shadow-lg max-h-[200px] overflow-y-auto"
        >
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value, option.label)}
                  className={cn(
                    "px-3 py-2 cursor-pointer flex items-center text-sm",
                    option.value === value ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50",
                  )}
                >
                  {option.value === value && <Check className="h-4 w-4 mr-2 text-blue-500" />}
                  <span className={option.value === value ? "ml-0" : "ml-6"}>{option.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              {allowCustomValue ? (
                <>
                  <span>No options match. Press Enter to use "{inputValue}"</span>
                </>
              ) : (
                <span>No options found</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

