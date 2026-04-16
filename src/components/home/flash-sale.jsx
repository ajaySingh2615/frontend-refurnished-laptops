import { ProductCard } from "./product-card";
import { Flame } from "lucide-react";

export function FlashSale({ products }) {
  return (
    <section className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center gap-2">
          <Flame className="h-6 w-6 text-accent" />
          <h2 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold sm:text-2xl">
            Today&apos;s Hot Deals
          </h2>
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
