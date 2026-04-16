import { filterCategories } from "@/lib/mock-data";
import { Cpu, MemoryStick, Monitor } from "lucide-react";

const sections = [
  { key: "processor", label: "Find Your Perfect Processor", icon: Cpu },
  { key: "ram", label: "Choose Your Memory", icon: MemoryStick },
  { key: "os", label: "Your OS, Your Choice", icon: Monitor },
];

export function ShopByFilters() {
  return (
    <section className="bg-muted/50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center font-[family-name:var(--font-dm-sans)] text-xl font-bold sm:text-2xl">
          Find Your Ideal Laptop
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {sections.map(({ key, label, icon: Icon }) => (
            <div key={key} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">{label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterCategories[key].map((item) => (
                  <button
                    key={item.value}
                    className="rounded-full border bg-background px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
