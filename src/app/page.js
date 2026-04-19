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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
    tags: [product.isFeatured ? "Featured" : null, product.conditionGrade].filter(
      Boolean
    ),
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

      <FlashSale products={dealLaptops} />

      <ProductRow
        heading="Handpicked for you"
        products={curatedLaptops}
        viewAllHref="/shop?featured=true"
      />

      <ShopByBrand />

      <ShopByFilters />

      <WhyChooseUs />

      <section className="border-t border-border bg-foreground py-16 text-background sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Stay updated on new arrivals
          </h2>
          <p className="mt-3 text-sm text-background/70">
            Subscribe to get exclusive deals and tech tips, no more than once a week.
          </p>
          <form className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="h-10 flex-1 rounded-md border border-background/20 bg-background/10 px-3.5 text-sm text-background placeholder:text-background/50 outline-none focus:border-background/50"
            />
            <Button
              size="lg"
              className="h-10 bg-background text-foreground hover:bg-background/90"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
