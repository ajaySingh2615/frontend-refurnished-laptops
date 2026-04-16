"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/shop/product-gallery";
import { VariantSelector } from "@/components/shop/variant-selector";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/api/products/${slug}`);
        if (res.ok) {
          const json = await res.json();
          const p = json.data;
          setProduct(p);
          if (p.variants?.length) setSelectedVariant(p.variants[0]);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const compareAt = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : 0;
  const stock = selectedVariant?.stock ?? 0;
  const lowThreshold = selectedVariant?.lowStockThreshold ?? 5;

  const specs = [
    { label: "Processor", value: product.processor },
    { label: "RAM", value: product.ram },
    { label: "Storage", value: product.storage },
    { label: "Display", value: product.display },
    { label: "GPU", value: product.gpu },
    { label: "Operating System", value: product.os },
    { label: "Condition", value: product.conditionGrade },
    { label: "Warranty", value: product.warrantyMonths ? `${product.warrantyMonths} months` : null },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} />

        {/* Info */}
        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold sm:text-3xl">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold text-primary">
              {formatPrice(price)}
            </span>
            {compareAt && compareAt > price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(compareAt)}
                </span>
                <Badge variant="destructive">{discount}% OFF</Badge>
              </>
            )}
          </div>

          {/* Stock status */}
          <div>
            {stock > 0 ? (
              stock <= lowThreshold ? (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Only {stock} left in stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  In Stock
                </Badge>
              )
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Variant selector */}
          <VariantSelector
            variants={product.variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <Button size="lg" className="w-full sm:w-auto" disabled={stock === 0}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {product.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </>
          )}

          {product.type === "laptop" && specs.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 font-semibold">Specifications</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between border-b py-2 text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
