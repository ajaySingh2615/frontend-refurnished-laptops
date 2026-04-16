import Link from "next/link";
import { ProductCard } from "./product-card";
import { ChevronRight } from "lucide-react";

export function ProductRow({ heading, products, viewAllHref = "#" }) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold sm:text-2xl">
            {heading}
          </h2>
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Scrollable row */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
