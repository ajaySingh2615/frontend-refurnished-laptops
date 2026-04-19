import Link from "next/link";
import { ProductCard } from "./product-card";
import { ArrowRight } from "lucide-react";

export function FlashSale({ products }) {
  return (
    <section className="border-b border-border bg-muted/30 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Limited time
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Today's hot deals
            </h2>
          </div>
          <Link
            href="/shop?sort=price_asc"
            className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-muted-foreground sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
