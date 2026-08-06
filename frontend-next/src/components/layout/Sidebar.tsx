"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  LineChart,
  Settings,
  LogOut,
  Command,
} from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { springPhysical } from "@/lib/motion/variants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/log", label: "Log entry", icon: PenLine },
  { href: "/trends", label: "Trends", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="glass sticky top-4 z-30 mx-4 mt-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-lg p-4 md:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-lg font-semibold tracking-tight">
        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
        Rtu
      </Link>

      <button
        onClick={onOpenCommandPalette}
        className="aurora-ring-focus mt-6 flex items-center justify-between rounded-md border border-aurora-rose/15 bg-aurora-rose/5 px-3 py-2 text-sm text-text-tertiary transition-colors hover:border-aurora-rose/30 hover:text-text-secondary"
      >
        <span className="flex items-center gap-2">
          <Command className="h-3.5 w-3.5" />
          Search
        </span>
        <kbd className="rounded-xs bg-aurora-rose/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md bg-aurora-rose/10"
                  transition={springPhysical}
                />
              )}
              <Icon
                className={`relative z-10 h-4 w-4 ${active ? "text-aurora-teal" : "text-text-tertiary"}`}
              />
              <span className={`relative z-10 ${active ? "text-text-primary" : "text-text-secondary"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between rounded-md border border-aurora-rose/15 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs text-text-secondary">{user?.email}</p>
        </div>
        <button
          onClick={() => void logout()}
          className="aurora-ring-focus shrink-0 rounded-sm p-1.5 text-text-tertiary transition-colors hover:text-state-danger"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
