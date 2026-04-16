"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { laptops as mockLaptops } from "@/lib/mock-data";
import { HeroBanner } from "@/components/home/hero-banner";
import { FlashSale } from "@/components/home/flash-sale";
import { ShopByBrand } from "@/components/home/shop-by-brand";
import { ProductRow } from "@/components/home/product-row";
import { ShopByFilters } from "@/components/home/shop-by-filters";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";

function apiToMock(product) {
  const v = product.variants?.[0];
  const price = v ? Number(v.price) : 0;
  const originalPrice = v?.compareAtPrice ? Number(v.compareAtPrice) : price;
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand || "",
    image: product.images?.[0]?.url || "/placeholder.png",
    price,
    originalPrice,
    discount,
    specs: [product.processor, product.ram, product.storage]
      .filter(Boolean)
      .join(" · "),
    tags: [product.isFeatured ? "Featured" : null, product.conditionGrade]
      .filter(Boolean),
    rating: 4.5,
    reviews: 0,
  };
}

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [deals, setDeals] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [featRes, dealRes] = await Promise.all([
          apiFetch("/api/products?featured=true&limit=8"),
          apiFetch("/api/products?sort=price_asc&limit=8"),
        ]);

        if (featRes.ok) {
          const json = await featRes.json();
          const items = (json.data?.items || []).map(apiToMock);
          setFeatured(items.length > 0 ? items : null);
        }

        if (dealRes.ok) {
          const json = await dealRes.json();
          const items = (json.data?.items || []).map(apiToMock);
          setDeals(items.length > 0 ? items : null);
        }
      } catch {
        // fallback to mock
      }
    }
    load();
  }, []);

  const dealLaptops = deals || mockLaptops.filter((l) => l.discount >= 33);
  const curatedLaptops = featured || mockLaptops.slice(0, 8);

  return (
    <main>
      <HeroBanner />

      <section className="border-b bg-card py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
          <p className="font-[family-name:var(--font-dm-sans)] text-sm font-bold text-primary sm:text-base">
            Gurugram&apos;s Largest Refurbished Laptop Store
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Warranty Included
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              Free Shipping
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-primary" />
              7-Day Returns
            </span>
          </div>
        </div>
      </section>

      <FlashSale products={dealLaptops} />

      <ShopByBrand />

      <div className="bg-muted/30">
        <ProductRow heading="Handpicked For You" products={curatedLaptops} viewAllHref="/shop?featured=true" />
      </div>

      <ShopByFilters />

      <WhyChooseUs />

      <section className="border-t bg-primary py-10 text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-lg font-bold sm:text-xl">
            Stay Updated on Latest Deals
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Subscribe for exclusive offers, new arrivals, and tech tips.
          </p>
          <div className="mt-5 flex gap-2 mx-auto max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-10 flex-1 rounded-lg bg-white/15 px-4 text-sm placeholder:text-primary-foreground/50 outline-none backdrop-blur-sm border border-white/20 focus:border-white/40"
            />
            <button className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-primary hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
