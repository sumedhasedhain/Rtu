"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
