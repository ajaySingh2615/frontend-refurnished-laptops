import { brands } from "@/lib/mock-data";

export function ShopByBrand() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 font-[family-name:var(--font-dm-sans)] text-xl font-bold sm:text-2xl">
          Explore Top Brands
        </h2>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8 md:gap-4">
          {brands.map((brand) => (
            <button
              key={brand.slug}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary transition-transform group-hover:scale-110">
                {brand.name[0]}
              </div>
              <span className="text-xs font-medium text-foreground sm:text-sm">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
