"use client";

import { useState, type ReactNode } from "react";
import { RouteGuard } from "@/lib/auth/RouteGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SoftGlow } from "@/components/ui/SoftGlow";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="relative flex min-h-screen">
        <SoftGlow variant="ambient" className="fixed" />
        <Sidebar onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main className="relative z-10 flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <MobileNav />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </div>
    </RouteGuard>
  );
}
