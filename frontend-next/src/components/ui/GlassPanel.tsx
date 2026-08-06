"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { useTilt } from "@/lib/motion/useTilt";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

export interface GlassPanelProps extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  /** Enables the pointer-tracked 3D tilt + glare. Off by default for dense layouts
   * (tables, forms) where a tilting surface would be distracting. */
  interactive?: boolean;
  glow?: "none" | "teal" | "violet" | "rose" | "gold";
  children?: ReactNode;
}

const GLOW_MAP: Record<NonNullable<GlassPanelProps["glow"]>, string> = {
  none: "",
  teal: "shadow-[0_0_60px_-20px_var(--aurora-teal)]",
  violet: "shadow-[0_0_60px_-20px_var(--aurora-violet)]",
  rose: "shadow-[0_0_60px_-20px_var(--aurora-rose)]",
  gold: "shadow-[0_0_60px_-20px_var(--aurora-gold)]",
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, interactive = false, glow = "none", children, style, ...props }, forwardedRef) => {
    const reducedMotion = usePrefersReducedMotion();
    const { ref: tiltRef, style: tiltStyle, glareStyle, handlers } = useTilt({
      disabled: !interactive || reducedMotion,
    });

    return (
      <motion.div
        ref={(node) => {
          tiltRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn(
          "glass relative rounded-lg overflow-hidden",
          GLOW_MAP[glow],
          interactive && "cursor-default",
          className,
        )}
        style={{ ...tiltStyle, transformStyle: "preserve-3d", ...style }}
        {...(interactive ? handlers : {})}
        {...props}
      >
        {interactive && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={glareStyle}
          />
        )}
        <div className="relative z-0">{children}</div>
      </motion.div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
