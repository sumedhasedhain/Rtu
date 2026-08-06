"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ label, value, onValueChange, options, placeholder, className }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-md px-4 text-sm text-text-primary",
            "bg-void-1 border border-aurora-rose/15 hover:border-aurora-rose/30",
            "transition-[border-color,box-shadow] duration-200 aurora-ring-focus data-[state=open]:border-aurora-teal/50",
            className,
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={8}
            className={cn(
              "pop-surface z-50 w-[--radix-select-trigger-width] overflow-hidden rounded-md p-1",
              "bg-void-0 border border-aurora-rose/15 shadow-lg",
            )}
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "relative flex h-9 cursor-pointer items-center rounded-sm px-3 pr-8 text-sm text-text-primary outline-none",
                    "data-[highlighted]:bg-aurora-rose/8 capitalize",
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2.5 inline-flex items-center">
                    <Check className="h-3.5 w-3.5 text-aurora-teal" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
