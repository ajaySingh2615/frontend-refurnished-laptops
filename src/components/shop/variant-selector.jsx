"use client";

import { cn } from "@/lib/utils";

export function VariantSelector({ variants, selected, onSelect }) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Choose variant
      </p>
      <div className="flex flex-wrap gap-2">
        {variants
          .filter((v) => v.isActive)
          .map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={cn(
                "rounded-md border px-3.5 py-2 text-sm transition-colors",
                selected?.id === v.id
                  ? "border-foreground bg-foreground text-background font-medium"
                  : "border-border bg-background text-foreground hover:border-foreground/30"
              )}
            >
              {v.name}
            </button>
          ))}
      </div>
    </div>
  );
}
