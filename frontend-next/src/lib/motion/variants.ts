import type { Variants } from "motion/react";

export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_SOFT } },
};

export const staggerChildren = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

/** Shared spring used for anything that should feel physical: buttons, toggles,
 * the sidebar's active-route indicator. */
export const springPhysical = { type: "spring", stiffness: 380, damping: 32 } as const;
