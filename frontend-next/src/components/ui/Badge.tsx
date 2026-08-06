import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-void-2 text-text-secondary border border-aurora-rose/12",
        teal: "bg-aurora-teal/12 text-aurora-teal border border-aurora-teal/25",
        violet: "bg-aurora-violet/12 text-aurora-violet border border-aurora-violet/25",
        rose: "bg-aurora-rose/12 text-aurora-rose border border-aurora-rose/25",
        gold: "bg-aurora-gold/12 text-aurora-gold border border-aurora-gold/25",
        success: "bg-state-success/12 text-state-success border border-state-success/25",
        danger: "bg-state-danger/12 text-state-danger border border-state-danger/25",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse" />}
      {children}
    </span>
  );
}
