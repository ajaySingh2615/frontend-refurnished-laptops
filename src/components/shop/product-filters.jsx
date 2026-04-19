"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "laptop", label: "Laptops" },
  { value: "accessory", label: "Accessories" },
];

export function ProductFilters({ filters, onChange, mobileOnly = false }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/categories");
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch {
        // silent
      }
    }
    load();
  }, []);

  function set(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  function clear() {
    onChange({ page: 1, limit: 20, sort: "newest" });
  }

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v && !["page", "limit", "sort"].includes(k)
  ).length;

  const content = (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-foreground">
          Filters
        </h3>
        {activeCount > 0 && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={clear}
          >
            Reset
          </button>
        )}
      </div>

      <FilterGroup label="Type">
        <div className="flex flex-wrap gap-1.5">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              onClick={() => set("type", t.value)}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                filters.type === t.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/30"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Category">
        <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
          <CategoryItem
            label="All categories"
            active={!filters.category}
            onClick={() => set("category", "")}
          />
          {categories.map((cat) => (
            <div key={cat.id}>
              <CategoryItem
                label={cat.name}
                active={filters.category === cat.slug}
                onClick={() => set("category", cat.slug)}
              />
              {cat.children?.map((child) => (
                <CategoryItem
                  key={child.id}
                  label={child.name}
                  active={filters.category === child.slug}
                  onClick={() => set("category", child.slug)}
                  indent
                />
              ))}
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Brand">
        <Input
          placeholder="e.g. Dell, HP"
          value={filters.brand || ""}
          onChange={(e) => set("brand", e.target.value)}
        />
      </FilterGroup>

      {filters.type !== "accessory" && (
        <FilterGroup label="Laptop specs">
          <div className="space-y-2">
            <Input
              placeholder="Processor"
              value={filters.processor || ""}
              onChange={(e) => set("processor", e.target.value)}
            />
            <Input
              placeholder="RAM (e.g. 8GB)"
              value={filters.ram || ""}
              onChange={(e) => set("ram", e.target.value)}
            />
            <Input
              placeholder="Operating system"
              value={filters.os || ""}
              onChange={(e) => set("os", e.target.value)}
            />
          </div>
        </FilterGroup>
      )}

      <FilterGroup label="Price (₹)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </FilterGroup>
    </div>
  );

  if (mobileOnly) {
    return (
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          }
        />
        <SheetContent side="left" className="w-[320px] overflow-y-auto p-5 pt-12">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20">{content}</div>
    </aside>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function CategoryItem({ label, active, onClick, indent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full truncate rounded px-2 py-1.5 text-left text-sm transition-colors",
        indent && "pl-6 text-[13px]",
        active
          ? "bg-foreground text-background font-medium"
          : "text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}
