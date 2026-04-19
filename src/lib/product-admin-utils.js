/** Normalize API variant rows for admin form inputs (decimals arrive as strings). */
export function normalizeAdminVariant(v) {
  return {
    id: v.id,
    name: v.name ?? "",
    sku: v.sku ?? "",
    price: v.price != null && v.price !== "" ? String(v.price) : "",
    compareAtPrice:
      v.compareAtPrice != null && v.compareAtPrice !== ""
        ? String(v.compareAtPrice)
        : "",
    stock: Number(v.stock ?? 0),
    lowStockThreshold: Number(v.lowStockThreshold ?? 5),
    isActive: Boolean(v.isActive),
    sortOrder: Number(v.sortOrder ?? 0),
  };
}

export function discountPercent(price, compareAt) {
  const p = Number(price);
  const c = Number(compareAt);
  if (!c || c <= p || !Number.isFinite(p)) return null;
  return Math.round(((c - p) / c) * 100);
}
