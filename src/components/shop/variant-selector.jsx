"use client";

import { cn } from "@/lib/utils";

export function VariantSelector({ variants, selected, onSelect }) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Choose variant</p>
      <div className="flex flex-wrap gap-2">
        {variants
          .filter((v) => v.isActive)
          .map((v) => (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                selected?.id === v.id
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "hover:border-muted-foreground/30"
              )}
            >
              {v.name}
            </button>
          ))}
      </div>
    </div>
  );
}
