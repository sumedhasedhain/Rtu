import type { ReactNode } from "react";
import Link from "next/link";
import { SoftGlow } from "@/components/ui/SoftGlow";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <SoftGlow variant="ambient" />
      <Link
        href="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
        Rtu
      </Link>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
