
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "./skeleton"

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  onCreate?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  allowCreation?: boolean;
  isLoading?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  noResultsText = "No results found.",
  allowCreation = false,
  isLoading = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const getDisplayLabel = () => {
    const selectedOption = options.find(
      (option) => option.label.toLowerCase() === value.toLowerCase()
    );
    return selectedOption?.label || value || placeholder;
  };
  
  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(
      (option) => option.value === currentValue
    );
    onChange(selectedOption ? selectedOption.label : currentValue);
    setInputValue("");
    setOpen(false);
  };
  
  const handleCreate = () => {
    if (onCreate && inputValue) {
      onCreate(inputValue);
    }
    setInputValue("");
    setOpen(false);
  };
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{getDisplayLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="p-0">
              {allowCreation && inputValue ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-t-none"
                  onClick={handleCreate}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add "{inputValue}"
                </Button>
              ) : (
                <div className="py-6 text-center text-sm">{noResultsText}</div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === option.label.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreation && inputValue && !filteredOptions.some(o => o.label.toLowerCase() === inputValue.toLowerCase()) && (
                 <CommandGroup className="border-t">
                    <CommandItem
                        onSelect={handleCreate}
                        value={inputValue}
                        className="text-muted-foreground"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add "{inputValue}"
                    </CommandItem>
                 </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
