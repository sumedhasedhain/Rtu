"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-state-success" />,
  error: <XCircle className="h-5 w-5 text-state-danger" />,
  warning: <AlertTriangle className="h-5 w-5 text-state-warning" />,
  info: <Info className="h-5 w-5 text-aurora-teal" />,
};

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    idCounter += 1;
    setToasts((current) => [...current, { ...toast, id: idCounter }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      <RadixToast.Provider swipeDirection="right" duration={4500}>
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            onOpenChange={(open) => !open && remove(toast.id)}
            className={cn(
              "pop-surface glass flex items-start gap-3 rounded-md p-4 shadow-lg",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
            )}
          >
            <div className="mt-0.5">{TONE_ICON[toast.tone]}</div>
            <div className="flex-1">
              <RadixToast.Title className="text-sm font-medium text-text-primary">
                {toast.title}
              </RadixToast.Title>
              {toast.description && (
                <RadixToast.Description className="mt-0.5 text-xs text-text-secondary">
                  {toast.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close className="text-text-tertiary hover:text-text-primary">
              <X className="h-4 w-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-0 right-0 z-[100] flex w-96 max-w-[100vw] flex-col gap-2 p-6" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.push;
}
