"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/lib/utils/cn";

interface SliderProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  valueLabel?: string;
}

export function Slider({
  label,
  value,
  onValueChange,
  min = 1,
  max = 5,
  step = 1,
  valueLabel,
}: SliderProps) {
  return (
    <div className="flex flex-col gap-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <span className="font-mono text-sm text-aurora-teal">
            {valueLabel ?? `${value}/${max}`}
          </span>
        </div>
      )}
      <RadixSlider.Root
        className="relative flex h-5 w-full touch-none items-center"
        value={[value]}
        onValueChange={([v]) => onValueChange(v)}
        min={min}
        max={max}
        step={step}
      >
        <RadixSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-pill bg-void-3">
          <RadixSlider.Range className="absolute h-full rounded-pill bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-rose" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block h-5 w-5 rounded-full bg-void-0 shadow-[0_0_0_4px_rgba(224,97,111,0.28)]",
            "transition-transform hover:scale-110 aurora-ring-focus",
          )}
        />
      </RadixSlider.Root>
    </div>
  );
}
