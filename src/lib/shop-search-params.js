/**
 * Shop catalog URL ↔ filter state. Matches backend GET /api/products query (product-query.dto).
 */

export const SHOP_DEFAULT_FILTERS = {
  category: "",
  brand: "",
  type: "",
  processor: "",
  ram: "",
  os: "",
  minPrice: "",
  maxPrice: "",
  search: "",
  sort: "newest",
  page: 1,
  limit: 20,
  featured: false,
};

/**
 * @param {URLSearchParams | string} searchParams
 */
export function parseShopFilters(searchParams) {
  const sp =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;
  return {
    category: sp.get("category") || "",
    brand: sp.get("brand") || "",
    type: sp.get("type") || "",
    processor: sp.get("processor") || "",
    ram: sp.get("ram") || "",
    os: sp.get("os") || "",
    minPrice: sp.get("minPrice") ?? "",
    maxPrice: sp.get("maxPrice") ?? "",
    search: sp.get("search") || "",
    sort: sp.get("sort") || "newest",
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: Math.min(100, Math.max(1, Number(sp.get("limit")) || 20)),
    featured: sp.get("featured") === "true",
  };
}

function hasString(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

/**
 * @param {Record<string, unknown>} filters
 */
export function serializeShopFilters(filters) {
  const p = new URLSearchParams();

  /** Stable key order so comparison with `searchParams.toString()` is reliable. */
  const pairs = [];
  if (hasString(filters.category)) pairs.push(["category", String(filters.category).trim()]);
  if (hasString(filters.brand)) pairs.push(["brand", String(filters.brand).trim()]);
  if (hasString(filters.type)) pairs.push(["type", String(filters.type).trim()]);
  if (hasString(filters.processor)) pairs.push(["processor", String(filters.processor).trim()]);
  if (hasString(filters.ram)) pairs.push(["ram", String(filters.ram).trim()]);
  if (hasString(filters.os)) pairs.push(["os", String(filters.os).trim()]);

  if (filters.minPrice !== "" && filters.minPrice != null && !Number.isNaN(Number(filters.minPrice))) {
    pairs.push(["minPrice", String(filters.minPrice)]);
  }
  if (filters.maxPrice !== "" && filters.maxPrice != null && !Number.isNaN(Number(filters.maxPrice))) {
    pairs.push(["maxPrice", String(filters.maxPrice)]);
  }

  if (hasString(filters.search)) pairs.push(["search", String(filters.search).trim()]);

  if (filters.sort && filters.sort !== "newest") pairs.push(["sort", String(filters.sort)]);
  if (filters.page && Number(filters.page) > 1) pairs.push(["page", String(filters.page)]);
  if (filters.limit && Number(filters.limit) !== 20) pairs.push(["limit", String(filters.limit)]);

  if (filters.featured === true) pairs.push(["featured", "true"]);

  pairs.sort((a, b) => a[0].localeCompare(b[0]));
  for (const [k, v] of pairs) {
    p.set(k, v);
  }

  return p.toString();
}

/** How many non-default refinements are active (for “Reset” / badge). */
export function countActiveShopFilters(filters) {
  const f = { ...SHOP_DEFAULT_FILTERS, ...filters };
  let n = 0;
  if (hasString(f.category)) n++;
  if (hasString(f.brand)) n++;
  if (hasString(f.type)) n++;
  if (hasString(f.processor)) n++;
  if (hasString(f.ram)) n++;
  if (hasString(f.os)) n++;
  if (f.minPrice !== "" && f.minPrice != null && !Number.isNaN(Number(f.minPrice))) n++;
  if (f.maxPrice !== "" && f.maxPrice != null && !Number.isNaN(Number(f.maxPrice))) n++;
  if (hasString(f.search)) n++;
  if (f.featured === true) n++;
  if (f.sort && f.sort !== "newest") n++;
  return n;
}
