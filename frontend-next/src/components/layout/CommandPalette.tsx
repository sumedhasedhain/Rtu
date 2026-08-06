"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  LineChart,
  Settings,
  Droplet,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  function go(path: string) {
    router.push(path);
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div
      className="overlay-surface fixed inset-0 z-[80] flex items-start justify-center bg-void-0/70 px-4 pt-[15vh] backdrop-blur-sm"
      data-state="open"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="pop-surface glass w-full max-w-lg overflow-hidden rounded-lg"
        data-state="open"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="flex flex-col">
          <Command.Input
            autoFocus
            placeholder="Jump to a page or run a command..."
            className="aurora-ring-focus w-full border-b border-aurora-rose/15 bg-transparent px-5 py-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-text-tertiary">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigate" className="px-1 py-1 text-xs text-text-tertiary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <PaletteItem icon={LayoutDashboard} onSelect={() => go("/dashboard")}>
                Dashboard
              </PaletteItem>
              <PaletteItem icon={CalendarDays} onSelect={() => go("/calendar")}>
                Calendar
              </PaletteItem>
              <PaletteItem icon={PenLine} onSelect={() => go("/log")}>
                Log entry
              </PaletteItem>
              <PaletteItem icon={LineChart} onSelect={() => go("/trends")}>
                Trends
              </PaletteItem>
              <PaletteItem icon={Settings} onSelect={() => go("/settings")}>
                Settings
              </PaletteItem>
            </Command.Group>

            <Command.Group heading="Quick actions" className="px-1 py-1 text-xs text-text-tertiary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <PaletteItem icon={Droplet} onSelect={() => go("/log")}>
                Log a period
              </PaletteItem>
              <PaletteItem
                icon={LogOut}
                onSelect={() => {
                  onOpenChange(false);
                  void logout();
                }}
              >
                Log out
              </PaletteItem>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function PaletteItem({
  icon: Icon,
  onSelect,
  children,
}: {
  icon: typeof LayoutDashboard;
  onSelect: () => void;
  children: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-text-primary data-[selected=true]:bg-aurora-rose/10"
    >
      <Icon className="h-4 w-4 text-text-tertiary" />
      {children}
    </Command.Item>
  );
}
