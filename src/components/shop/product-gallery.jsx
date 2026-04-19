"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={images[selected]?.url}
          alt={images[selected]?.altText || "Product image"}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border bg-muted transition-colors",
                i === selected
                  ? "border-foreground"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <img
                src={img.url}
                alt={img.altText || "Thumbnail"}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
