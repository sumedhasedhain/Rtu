"use client";

import { forwardRef, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type HTMLMotionProps } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap",
    "font-medium select-none aurora-ring-focus",
    "transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "text-void-0 bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-rose",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset,0_8px_30px_-8px_rgba(201,79,99,0.5)]",
        ].join(" "),
        glass: "glass text-text-primary hover:bg-glass-fill-hover",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-aurora-rose/8",
        danger:
          "bg-state-danger/15 text-state-danger border border-state-danger/30 hover:bg-state-danger/25",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-sm",
        md: "h-11 px-5 text-sm rounded-md",
        lg: "h-13 px-8 text-base rounded-md",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: ReactNode;
  /** Renders the styling onto its single child (e.g. a Next `<Link>`) instead of a
   * `<button>` — for link-styled CTAs. Loses the motion press/hover physics in favor
   * of a lightweight CSS transform transition, since Slot can't merge with Motion's
   * imperative animation controls. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, asChild, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size }),
            "transition-transform duration-200 hover:scale-[1.015] active:scale-[0.97]",
            className,
          )}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97, y: 1 }}
        whileHover={{ scale: 1.015 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : null}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
