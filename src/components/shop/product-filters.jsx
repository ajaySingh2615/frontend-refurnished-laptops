"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function ProductFilters({ filters, onChange }) {
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Type</Label>
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "laptop", label: "Laptops" },
            { value: "accessory", label: "Accessories" },
          ].map((t) => (
            <Badge
              key={t.value}
              variant={filters.type === t.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => set("type", t.value)}
            >
              {t.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
        <div className="space-y-1 max-h-48 overflow-auto">
          <button
            className={`block w-full text-left text-sm px-2 py-1 rounded ${!filters.category ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
            onClick={() => set("category", "")}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                className={`block w-full text-left text-sm px-2 py-1 rounded ${filters.category === cat.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                onClick={() => set("category", cat.slug)}
              >
                {cat.name}
              </button>
              {cat.children?.map((child) => (
                <button
                  key={child.id}
                  className={`block w-full text-left text-sm pl-6 py-1 rounded ${filters.category === child.slug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => set("category", child.slug)}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Brand</Label>
        <Input
          placeholder="e.g. Dell, HP"
          value={filters.brand || ""}
          onChange={(e) => set("brand", e.target.value)}
        />
      </div>

      {filters.type !== "accessory" && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Specs (Laptops)</Label>
            <Input placeholder="Processor" value={filters.processor || ""} onChange={(e) => set("processor", e.target.value)} />
            <Input placeholder="RAM (e.g. 8GB)" value={filters.ram || ""} onChange={(e) => set("ram", e.target.value)} />
            <Input placeholder="OS" value={filters.os || ""} onChange={(e) => set("os", e.target.value)} />
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">{content}</div>
      </div>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-auto p-4">
            {content}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
