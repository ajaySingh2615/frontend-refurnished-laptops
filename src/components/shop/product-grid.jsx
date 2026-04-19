"use client";

import Link from "next/link";
import { imagesForVariant } from "@/lib/product-images";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductCard({ product }) {
  const variant = product.variants?.[0];
  const gallery = imagesForVariant(product.images, variant?.id);
  const image = gallery[0];
  const price = variant ? Number(variant.price) : 0;
  const compareAt = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0;

  const stock = variant?.stock ?? 0;
  const lowThreshold = variant?.lowStockThreshold ?? 5;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.altText || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
            {discount}% off
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && (
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {product.brand}
          </p>
        )}
        <h3 className="text-[13.5px] font-semibold leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        {product.type === "laptop" && product.processor && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {[product.processor, product.ram, product.storage].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {formatPrice(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>

        {variant && (
          <p className="mt-1.5 text-[11px]">
            {stock > 0 ? (
              stock <= lowThreshold ? (
                <span className="text-amber-700">Only {stock} left</span>
              ) : (
                <span className="text-emerald-700">In stock</span>
              )
            ) : (
              <span className="text-destructive">Out of stock</span>
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
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
        <p className="text-sm font-medium text-foreground">No products found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
