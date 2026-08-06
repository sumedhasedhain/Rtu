"use client";

interface GlassTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { name?: string; value?: number | string; color?: string }[];
}

export function GlassTooltip({ active, label, payload }: GlassTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass rounded-md px-4 py-3 text-sm shadow-lg">
      {label !== undefined && <p className="mb-1.5 font-medium text-text-primary">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary capitalize">{entry.name}</span>
            <span className="ml-auto font-mono text-text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
