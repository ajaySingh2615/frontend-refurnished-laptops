"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import {
  BRAND_OPTIONS,
  OS_OPTIONS,
  PROCESSOR_OPTIONS,
  RAM_OPTIONS,
  SPEC_SELECT_EMPTY,
  SPEC_SELECT_OTHER,
} from "@/lib/product-spec-options";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { countActiveShopFilters, SHOP_DEFAULT_FILTERS } from "@/lib/shop-search-params";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "laptop", label: "Laptops" },
  { value: "accessory", label: "Accessories" },
];

/**
 * @param {object} props
 * @param {Record<string, unknown>} props.filters
 * @param {(f: Record<string, unknown>) => void} props.onChange
 * @param {Record<string, unknown>} props.defaults
 * @param {() => void} [props.onReset]
 * @param {boolean} [props.mobileOnly]
 */
export function ProductFilters({
  filters,
  onChange,
  defaults = SHOP_DEFAULT_FILTERS,
  onReset,
  mobileOnly = false,
}) {
  const [categories, setCategories] = useState([]);
  const [filterEpoch, setFilterEpoch] = useState(0);

  /** Prefer subcategories only; if the API tree has no children, list top-level categories. */
  const categoryOptions = useMemo(() => {
    const subs = categories.flatMap((p) => p.children ?? []);
    const list = subs.length > 0 ? subs : categories;
    return [...list].sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
    );
  }, [categories]);

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
    setFilterEpoch((e) => e + 1);
    onChange({ ...defaults });
    onReset?.();
  }

  const activeCount = countActiveShopFilters(filters);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-foreground">
          Filters
        </h3>
        {activeCount > 0 && (
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={clear}
          >
            Clear
          </button>
        )}
      </div>

      <FilterSection title="Type">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Product type">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              onClick={() => set("type", t.value)}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                filters.type === t.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/30"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
          <CategoryItem
            label="All"
            active={!filters.category}
            onClick={() => set("category", "")}
          />
          {categoryOptions.map((cat) => (
            <CategoryItem
              key={cat.id}
              label={cat.name}
              active={filters.category === cat.slug}
              onClick={() => set("category", cat.slug)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <PresetFilterSelect
          ariaLabel="Brand"
          options={BRAND_OPTIONS}
          value={filters.brand || ""}
          onChange={(v) => set("brand", v)}
          placeholder="Any"
          inputPlaceholder="Brand name"
          resetKey={filterEpoch}
        />
      </FilterSection>

      {filters.type !== "accessory" && (
        <FilterSection title="Laptop specs">
          <div className="space-y-3">
            <PresetFilterSelect
              ariaLabel="Processor"
              options={PROCESSOR_OPTIONS}
              value={filters.processor || ""}
              onChange={(v) => set("processor", v)}
              placeholder="Processor"
              inputPlaceholder="CPU"
              resetKey={filterEpoch}
            />
            <PresetFilterSelect
              ariaLabel="RAM"
              options={RAM_OPTIONS}
              value={filters.ram || ""}
              onChange={(v) => set("ram", v)}
              placeholder="RAM"
              inputPlaceholder="e.g. 8 GB"
              resetKey={filterEpoch}
            />
            <PresetFilterSelect
              ariaLabel="Operating system"
              options={OS_OPTIONS}
              value={filters.os || ""}
              onChange={(v) => set("os", v)}
              placeholder="OS"
              inputPlaceholder="OS"
              resetKey={filterEpoch}
            />
          </div>
        </FilterSection>
      )}

      <FilterSection title="Featured">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Featured">
          <button
            type="button"
            onClick={() => set("featured", false)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
              !filters.featured
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:border-foreground/30"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => set("featured", true)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
              filters.featured
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:border-foreground/30"
            )}
          >
            Featured
          </button>
        </div>
      </FilterSection>

      <FilterSection title="Price (₹)">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.minPrice === "" || filters.minPrice == null ? "" : filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.maxPrice === "" || filters.maxPrice == null ? "" : filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </FilterSection>
    </div>
  );

  if (mobileOnly) {
    return (
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </Button>
          }
        />
        <SheetContent side="left" className="w-[min(100vw-2rem,380px)] overflow-y-auto p-5 pt-12">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-20 rounded-xl border border-border bg-card p-4 shadow-sm">
        {content}
      </div>
    </aside>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className="space-y-2 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}

function PresetFilterSelect({
  ariaLabel,
  options,
  value,
  onChange,
  placeholder,
  inputPlaceholder,
  resetKey,
}) {
  const v = value ?? "";
  const [emptyCustom, setEmptyCustom] = useState(false);

  useEffect(() => {
    setEmptyCustom(false);
  }, [resetKey]);

  const selectValue = options.includes(v)
    ? v
    : v !== "" || emptyCustom
      ? SPEC_SELECT_OTHER
      : SPEC_SELECT_EMPTY;

  const selectId = `shop-preset-${ariaLabel.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="space-y-1">
      <Select
        value={selectValue}
        onValueChange={(next) => {
          if (next === SPEC_SELECT_EMPTY) {
            setEmptyCustom(false);
            onChange("");
          } else if (next === SPEC_SELECT_OTHER) {
            setEmptyCustom(true);
            onChange("");
          } else {
            setEmptyCustom(false);
            onChange(next);
          }
        }}
      >
        <SelectTrigger id={selectId} className="h-9 w-full min-w-0" aria-label={ariaLabel}>
          <SelectValue placeholder={placeholder}>
            {(val) => {
              if (val === SPEC_SELECT_EMPTY) return placeholder;
              if (val === SPEC_SELECT_OTHER) return "Custom…";
              return val != null ? String(val) : "";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SPEC_SELECT_EMPTY}>Any</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
          <SelectItem value={SPEC_SELECT_OTHER}>Custom…</SelectItem>
        </SelectContent>
      </Select>
      {selectValue === SPEC_SELECT_OTHER && (
        <Input
          className="h-9"
          value={v}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            if (next === "") setEmptyCustom(true);
          }}
          placeholder={inputPlaceholder}
          aria-label={ariaLabel}
        />
      )}
    </div>
  );
}

function CategoryItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full truncate rounded px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-foreground text-background font-medium"
          : "text-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}
