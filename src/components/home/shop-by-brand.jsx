import Link from "next/link";
import { brands } from "@/lib/mock-data";

export function ShopByBrand() {
  return (
    <section className="border-y border-border py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Top brands
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Shop by brand
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
              <span className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-foreground/70 transition-colors group-hover:text-foreground">
                {brand.name[0]}
              </span>
              <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
