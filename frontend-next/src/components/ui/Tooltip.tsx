"use client";

import type { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={250}>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={8}
          className="pop-surface glass z-50 rounded-sm px-3 py-1.5 text-xs text-text-primary"
        >
          {content}
          <RadixTooltip.Arrow className="fill-void-2" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
