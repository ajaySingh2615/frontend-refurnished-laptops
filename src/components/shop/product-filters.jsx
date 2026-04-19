"use client";

import { useEffect, useState } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "laptop", label: "Laptops" },
  { value: "accessory", label: "Accessories" },
];

export function ProductFilters({ filters, onChange, mobileOnly = false }) {
  const [categories, setCategories] = useState([]);
  /** Bumps when filters reset so preset selects clear internal “Other (empty)” state. */
  const [filterEpoch, setFilterEpoch] = useState(0);

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
        <PresetFilterSelect
          options={BRAND_OPTIONS}
          value={filters.brand || ""}
          onChange={(v) => set("brand", v)}
          placeholder="Any brand"
          inputPlaceholder="Type brand"
          resetKey={filterEpoch}
        />
      </FilterGroup>

      {filters.type !== "accessory" && (
        <FilterGroup label="Laptop specs">
          <div className="space-y-2">
            <PresetFilterSelect
              options={PROCESSOR_OPTIONS}
              value={filters.processor || ""}
              onChange={(v) => set("processor", v)}
              placeholder="Processor"
              inputPlaceholder="Type processor"
              resetKey={filterEpoch}
            />
            <PresetFilterSelect
              options={RAM_OPTIONS}
              value={filters.ram || ""}
              onChange={(v) => set("ram", v)}
              placeholder="RAM"
              inputPlaceholder="e.g. 8 GB"
              resetKey={filterEpoch}
            />
            <PresetFilterSelect
              options={OS_OPTIONS}
              value={filters.os || ""}
              onChange={(v) => set("os", v)}
              placeholder="Operating system"
              inputPlaceholder="Type OS"
              resetKey={filterEpoch}
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

/** Preset list + optional custom text; matches admin catalog values for RAM (exact) and partial OS/processor. */
function PresetFilterSelect({
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

  return (
    <div className="space-y-1.5">
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
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
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
        />
      )}
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
