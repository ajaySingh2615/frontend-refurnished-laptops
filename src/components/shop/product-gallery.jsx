"use client";

import { useState } from "react";

export function ProductGallery({ images }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
        <img
          src={images[selected]?.url}
          alt={images[selected]?.altText || "Product image"}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === selected ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              }`}
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
