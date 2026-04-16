import { Star } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }) {
  return (
    <div className="group relative flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-60">
      {/* Discount badge */}
      {product.discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
          {product.discount}% OFF
        </span>
      )}

      {/* Tags */}
      {product.tags?.length > 0 && (
        <span className="absolute right-2 top-2 z-10">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium">
            {product.tags[0]}
          </Badge>
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Specs */}
        <p className="text-[11px] text-muted-foreground">
          {product.processor} · {product.ram} · {product.storage}
        </p>
      </div>
    </div>
  );
}
