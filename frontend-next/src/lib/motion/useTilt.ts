"use client";

import { useRef, type PointerEvent } from "react";
import { useMotionValue, useSpring, useTransform } from "motion/react";

interface TiltOptions {
  max?: number; // max rotation in degrees
  disabled?: boolean;
}

/** Pointer-tracked 3D tilt for glass panels — the card leans toward the cursor and a
 * soft light glare follows it, then springs back to rest on pointer leave. */
export function useTilt({ max = 8, disabled = false }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [max, -max]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-max, max]), springConfig);
  const glareX = useSpring(useTransform(pointerX, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(pointerY, [0, 1], [0, 100]), springConfig);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function onPointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const glareBackground = useTransform([glareX, glareY], ([x, y]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.14), transparent 55%)`,
  );

  return {
    ref,
    style: disabled
      ? {}
      : {
          rotateX,
          rotateY,
          transformPerspective: 900,
        },
    glareStyle: { background: glareBackground },
    handlers: { onPointerMove, onPointerLeave },
  };
}
