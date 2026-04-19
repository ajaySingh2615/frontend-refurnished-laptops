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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductGrid } from "@/components/shop/product-grid";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name: A → Z" },
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
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
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
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Shop all products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${total} ${total === 1 ? "product" : "products"} available`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProductFilters filters={filters} onChange={handleFilterChange} />

          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
              <form
                onSubmit={handleSearch}
                className="relative flex-1 min-w-[200px] max-w-md"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </form>

              <Select
                value={filters.sort}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, sort: v, page: 1 }))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="lg:hidden">
                <ProductFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  mobileOnly
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-xl border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : (
              <ProductGrid products={products} />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  Page {filters.page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
