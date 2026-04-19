/**
 * Images with no variantId apply to every SKU. If a variant has specific images,
 * only those (plus unassigned) are shown; otherwise fall back to the full list.
 */
export function imagesForVariant(images, variantId) {
  if (!images?.length) return [];
  if (!variantId) return images;
  const matched = images.filter(
    (img) => !img.variantId || img.variantId === variantId
  );
  return matched.length > 0 ? matched : images;
}
