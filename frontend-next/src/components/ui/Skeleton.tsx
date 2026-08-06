import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-void-3",
        "before:absolute before:inset-0 before:animate-shimmer before:bg-[length:200%_100%]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent",
        className,
      )}
    />
  );
}
