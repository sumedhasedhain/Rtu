import type { ReactNode } from "react";
import { LenisProvider } from "@/lib/motion/LenisProvider";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </LenisProvider>
  );
}
