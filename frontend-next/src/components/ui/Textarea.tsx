"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full resize-none rounded-md px-4 py-3 text-sm text-text-primary",
            "bg-void-1 border border-aurora-rose/15 placeholder:text-text-tertiary",
            "transition-[border-color,box-shadow] duration-200 aurora-ring-focus hover:border-aurora-rose/30",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
