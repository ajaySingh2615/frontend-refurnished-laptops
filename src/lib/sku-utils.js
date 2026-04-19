/** Uppercase alphanumeric segments for SKU (max piece length enforced in join). */
function cleanPart(s, maxLen = 24) {
  return String(s || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
}

/**
 * Build a unique SKU from product + variant labels. User can edit the result.
 * @param {object} opts
 * @param {string} [opts.productSlug]
 * @param {string} [opts.productName]
 * @param {string} [opts.variantName]
 * @param {string[]} [opts.existingSkus] — SKUs already taken (case-insensitive)
 */
export function suggestVariantSku({
  productSlug,
  productName,
  variantName,
  existingSkus = [],
}) {
  const p = cleanPart(productSlug || productName || "PRD", 20);
  const v = cleanPart(variantName || "VAR", 16);
  let base = [p, v].filter(Boolean).join("-").replace(/-+/g, "-");
  if (!base) base = "SKU";

  const taken = new Set(
    existingSkus.map((s) => String(s).trim().toUpperCase()).filter(Boolean)
  );

  let candidate = base.slice(0, 44);
  let n = 0;
  while (taken.has(candidate) && n < 200) {
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    candidate = `${base}-${rnd}`.replace(/-+/g, "-").slice(0, 50);
    n += 1;
  }
  while (taken.has(candidate)) {
    candidate = `${base}-${Date.now().toString(36).toUpperCase().slice(-6)}`
      .replace(/-+/g, "-")
      .slice(0, 50);
  }

  return candidate.slice(0, 50);
}
