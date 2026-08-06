"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealOptions {
  y?: number;
  delay?: number;
  start?: string;
}

/** Attaches a GSAP ScrollTrigger fade+rise reveal to the returned ref. Scoped to the
 * landing page — the rest of the app relies on Motion's viewport-triggered variants
 * instead, which is lighter weight for content that isn't a long scroll narrative. */
export function useScrollReveal<T extends HTMLElement>({
  y = 40,
  delay = 0,
  start = "top 85%",
}: ScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start },
        },
      );
    });

    return () => ctx.revert();
  }, [y, delay, start, prefersReducedMotion]);

  return ref;
}
