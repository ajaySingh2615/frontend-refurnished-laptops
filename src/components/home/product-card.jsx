import Link from "next/link";
import { formatPrice } from "@/lib/mock-data";

export function ProductCard({ product }) {
  const mrp = product.originalPrice ?? product.mrp ?? 0;
  const specs =
    product.specs ??
    [product.processor, product.ram, product.storage].filter(Boolean).join(" · ");
  const href = product.slug ? `/shop/${product.slug}` : "#";

  return (
    <Link
      href={href}
      className="group relative flex w-60 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-card sm:w-64"
    >
      {product.discount > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
          {product.discount}% off
        </span>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3.5">
        {product.brand && (
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {product.brand}
          </p>
        )}
        <h3 className="text-[13.5px] font-semibold leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        {specs && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {specs}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {formatPrice(product.price)}
          </span>
          {mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
