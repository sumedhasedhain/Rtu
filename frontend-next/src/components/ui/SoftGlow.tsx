import { cn } from "@/lib/utils/cn";

interface SoftGlowProps {
  className?: string;
  /** "hero" = a touch more presence for the landing page; "ambient" = barely there,
   * used behind the app shell so it doesn't compete with content. */
  variant?: "hero" | "ambient";
}

/** A quiet, subtle red/pink glow — replaces the earlier 3D WebGL aurora scene with a
 * plain CSS gradient wash. No canvas, no motion library, negligible cost. */
export function SoftGlow({ className, variant = "hero" }: SoftGlowProps) {
  const strength = variant === "hero" ? 1 : 0.45;

  const blob = (rgb: string, alpha: number) => ({
    background: `radial-gradient(circle, rgba(${rgb}, ${alpha * strength}) 0%, transparent 70%)`,
  });

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -left-1/4 -top-1/4 h-[60%] w-[60%] animate-float rounded-full blur-3xl"
        style={blob("224, 97, 111", 0.16)}
      />
      <div
        className="absolute -right-1/4 top-0 h-[55%] w-[55%] animate-float rounded-full blur-3xl"
        style={{ ...blob("240, 168, 187", 0.2), animationDelay: "-3s" }}
      />
      <div
        className="absolute bottom-[-20%] left-1/3 h-[50%] w-[50%] animate-float rounded-full blur-3xl"
        style={{ ...blob("201, 79, 99", 0.12), animationDelay: "-6s" }}
      />
    </div>
  );
}
