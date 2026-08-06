"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, CalendarDays, PenLine, LineChart, Settings } from "lucide-react";
import { springPhysical } from "@/lib/motion/variants";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/log", label: "Log", icon: PenLine },
  { href: "/trends", label: "Trends", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-lg px-2 py-2 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center gap-1 rounded-sm px-3 py-1.5"
            aria-label={item.label}
          >
            {active && (
              <motion.span
                layoutId="mobile-nav-active"
                className="absolute inset-0 rounded-sm bg-aurora-rose/10"
                transition={springPhysical}
              />
            )}
            <Icon className={`relative z-10 h-5 w-5 ${active ? "text-aurora-teal" : "text-text-tertiary"}`} />
          </Link>
        );
      })}
    </nav>
  );
}
