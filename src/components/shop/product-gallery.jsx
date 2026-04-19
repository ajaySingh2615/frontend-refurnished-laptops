"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { imagesForVariant } from "@/lib/product-images";

export function ProductGallery({ images, variantId }) {
  const [selected, setSelected] = useState(0);

  const gallery = useMemo(
    () => imagesForVariant(images, variantId),
    [images, variantId]
  );

  useEffect(() => {
    setSelected(0);
  }, [variantId, gallery.length]);

  if (!gallery || gallery.length === 0) {
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
          src={gallery[selected]?.url}
          alt={gallery[selected]?.altText || "Product image"}
          className="h-full w-full object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {gallery.map((img, i) => (
            <button
              key={img.id}
              type="button"
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
