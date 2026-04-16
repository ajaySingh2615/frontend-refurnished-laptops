"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Search } from "lucide-react";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductGrid } from "@/components/shop/product-grid";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name", label: "Name A-Z" },
];

function paramsToFilters(sp) {
  return {
    category: sp.get("category") || "",
    brand: sp.get("brand") || "",
    type: sp.get("type") || "",
    processor: sp.get("processor") || "",
    ram: sp.get("ram") || "",
    os: sp.get("os") || "",
    minPrice: sp.get("minPrice") || "",
    maxPrice: sp.get("maxPrice") || "",
    search: sp.get("search") || "",
    sort: sp.get("sort") || "newest",
    page: Number(sp.get("page")) || 1,
    limit: 20,
  };
}

function filtersToParams(filters) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && k !== "limit") p.set(k, String(v));
  });
  return p.toString();
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <ShopPageInner />
    </Suspense>
  );
}

function ShopPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState(() => paramsToFilters(searchParams));
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.type) params.set("type", filters.type);
      if (filters.processor) params.set("processor", filters.processor);
      if (filters.ram) params.set("ram", filters.ram);
      if (filters.os) params.set("os", filters.os);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.search) params.set("search", filters.search);
      params.set("sort", filters.sort);
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));

      const res = await apiFetch(`/api/products?${params}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data?.items || []);
        setTotal(json.data?.total || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
    router.replace(`/shop?${filtersToParams(filters)}`, { scroll: false });
  }, [filters, load, router]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handleSearch(e) {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold sm:text-3xl">
          Shop All
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex gap-6">
        <ProductFilters filters={filters} onChange={handleFilterChange} />

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </form>

            <Select value={filters.sort} onValueChange={(v) => setFilters((prev) => ({ ...prev, sort: v, page: 1 }))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="lg:hidden">
              <ProductFilters filters={filters} onChange={handleFilterChange} />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
