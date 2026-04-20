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
import {
  parseShopFilters,
  serializeShopFilters,
  SHOP_DEFAULT_FILTERS,
} from "@/lib/shop-search-params";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

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
  const searchParamsString = searchParams.toString();

  const [filters, setFilters] = useState(() => parseShopFilters(searchParams));
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "");

  /** Keep filter state aligned with the URL (back/forward, shared links). */
  useEffect(() => {
    setFilters((prev) => {
      const next = parseShopFilters(searchParams);
      if (serializeShopFilters(prev) === serializeShopFilters(next)) return prev;
      return next;
    });
    setSearchInput((prev) => {
      const next = parseShopFilters(searchParams).search || "";
      if (prev === next) return prev;
      return next;
    });
  }, [searchParams, searchParamsString]);

  /** Push canonical query string when local filter state diverges from the URL. */
  useEffect(() => {
    const fromState = serializeShopFilters(filters);
    const fromUrl = serializeShopFilters(parseShopFilters(searchParams));
    if (fromState === fromUrl) return;
    router.replace(fromState ? `/shop?${fromState}` : "/shop", { scroll: false });
  }, [filters, router, searchParams, searchParamsString]);

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
      if (filters.minPrice !== "" && filters.minPrice != null && !Number.isNaN(Number(filters.minPrice))) {
        params.set("minPrice", String(filters.minPrice));
      }
      if (filters.maxPrice !== "" && filters.maxPrice != null && !Number.isNaN(Number(filters.maxPrice))) {
        params.set("maxPrice", String(filters.maxPrice));
      }
      if (filters.search) params.set("search", filters.search.trim());
      if (filters.featured === true) params.set("featured", "true");

      params.set("sort", filters.sort || "newest");
      params.set("page", String(filters.page || 1));
      params.set("limit", String(filters.limit || 20));

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
  }, [load]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handleFiltersReset() {
    setSearchInput("");
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = searchInput.trim();
    setFilters((prev) => ({ ...prev, search: q, page: 1 }));
  }

  const limit = filters.limit || 20;
  const totalPages = Math.ceil(total / limit);

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
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            defaults={SHOP_DEFAULT_FILTERS}
            onReset={handleFiltersReset}
          />

          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
              <form
                onSubmit={handleSearch}
                className="relative flex-1 min-w-[200px] max-w-md"
                role="search"
                aria-label="Search products"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, brand, or description"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  name="search"
                  autoComplete="off"
                  className="pl-9"
                />
              </form>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">Sort by</span>
                <Select
                  value={filters.sort || "newest"}
                  onValueChange={(v) =>
                    setFilters((prev) => ({ ...prev, sort: v, page: 1 }))
                  }
                >
                  <SelectTrigger className="w-[min(100%,220px)] min-w-[180px]">
                    <SelectValue placeholder="Sort">
                      {(val) =>
                        SORT_OPTIONS.find((o) => o.value === val)?.label ??
                        SORT_OPTIONS[0].label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:hidden">
                <ProductFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  defaults={SHOP_DEFAULT_FILTERS}
                  onReset={handleFiltersReset}
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
                      setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
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
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(totalPages, prev.page + 1),
                      }))
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
