"use client";

import type { ReactNode } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ items, value, onValueChange, children }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange}>
      <RadixTabs.List className="glass relative flex gap-1 rounded-md p-1">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <RadixTabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-void-0" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {active && (
                <motion.span
                  layoutId="tabs-active-pill"
                  className="absolute inset-0 -z-10 rounded-sm bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-rose"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export const TabPanel = RadixTabs.Content;
