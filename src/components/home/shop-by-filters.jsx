import Link from "next/link";
import { filterCategories } from "@/lib/mock-data";

const sections = [
  { key: "processor", label: "Processor", paramKey: "processor" },
  { key: "ram", label: "Memory", paramKey: "ram" },
  { key: "os", label: "Operating system", paramKey: "os" },
];

export function ShopByFilters() {
  return (
    <section className="bg-muted/30 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Find what you need
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Shop by spec
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map(({ key, label, paramKey }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {filterCategories[key].map((item) => (
                  <Link
                    key={item.value}
                    href={`/shop?${paramKey}=${encodeURIComponent(item.value)}`}
                    className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
