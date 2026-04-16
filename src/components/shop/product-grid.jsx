"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductCard({ product }) {
  const variant = product.variants?.[0];
  const image = product.images?.[0];
  const price = variant ? Number(variant.price) : 0;
  const compareAt = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-muted">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.altText || product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-2 top-2" variant="destructive">
            {discount}% OFF
          </Badge>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        {product.brand && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
          {product.name}
        </h3>

        {product.type === "laptop" && product.processor && (
          <p className="text-xs text-muted-foreground truncate">
            {product.processor} &bull; {product.ram} &bull; {product.storage}
          </p>
        )}

        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-[family-name:var(--font-dm-sans)] text-base font-bold text-primary">
            {formatPrice(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>

        {variant && (
          <p className="text-xs text-muted-foreground">
            {variant.stock > 0 ? (
              variant.stock <= (variant.lowStockThreshold || 5) ? (
                <span className="text-orange-600">Only {variant.stock} left</span>
              ) : (
                "In Stock"
              )
            ) : (
              <span className="text-destructive">Out of Stock</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">No products found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
