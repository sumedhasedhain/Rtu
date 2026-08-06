"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Inertial smooth-scroll, scoped to the marketing route group only — the dashboard's
 * data-dense UI (dropdowns, modals, tables) reads better with native scroll. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return <>{children}</>;
}
