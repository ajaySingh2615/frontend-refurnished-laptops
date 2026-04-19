"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ChevronRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
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
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Link href="/shop">
          <Button variant="outline">Back to shop</Button>
        </Link>
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
    { label: "Operating system", value: product.os },
    { label: "Condition", value: product.conditionGrade },
    {
      label: "Warranty",
      value: product.warrantyMonths ? `${product.warrantyMonths} months` : null,
    },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} />

        <div>
          <div className="space-y-4">
            {product.brand && (
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {product.brand}
              </p>
            )}

            <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
                {formatPrice(price)}
              </span>
              {compareAt && compareAt > price && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(compareAt)}
                  </span>
                  <Badge variant="success">{discount}% off</Badge>
                </>
              )}
            </div>

            <div>
              {stock > 0 ? (
                stock <= lowThreshold ? (
                  <Badge variant="warning">Only {stock} left in stock</Badge>
                ) : (
                  <Badge variant="success">In stock</Badge>
                )
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
          </div>

          <div className="mt-7">
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" className="flex-1" disabled={stock === 0}>
              <ShoppingCart className="h-4 w-4" />
              {stock === 0 ? "Out of stock" : "Add to cart"}
            </Button>
            <Button size="xl" variant="outline" className="flex-1" disabled={stock === 0}>
              Buy it now
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <Perk icon={ShieldCheck} label="Warranty" sub="6 months" />
            <Perk icon={Truck} label="Free shipping" sub="Orders ₹5k+" />
            <Perk icon={RefreshCw} label="Easy returns" sub="7 days" />
          </div>

          {product.description && (
            <div className="mt-10 border-t border-border pt-7">
              <h3 className="text-sm font-semibold text-foreground">Description</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {product.type === "laptop" && specs.length > 0 && (
            <div className="mt-10 border-t border-border pt-7">
              <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
              <dl className="mt-4 divide-y divide-border rounded-lg border border-border">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="grid grid-cols-3 gap-4 px-4 py-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="col-span-2 font-medium text-foreground">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Perk({ icon: Icon, label, sub }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-card px-3 py-4 text-center">
      <Icon className="h-4 w-4 text-foreground" strokeWidth={1.6} />
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
