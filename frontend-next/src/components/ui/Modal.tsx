"use client";

import type { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="overlay-surface fixed inset-0 z-50 bg-void-0/70 backdrop-blur-sm" />
        <RadixDialog.Content
          className={cn(
            "pop-surface glass fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-lg p-6",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <RadixDialog.Title className="text-lg font-semibold text-text-primary">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-text-secondary">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close className="aurora-ring-focus rounded-sm p-1 text-text-tertiary hover:text-text-primary">
              <X className="h-4 w-4" />
            </RadixDialog.Close>
          </div>
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
