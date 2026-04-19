"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
            Certified refurbished · 6-month warranty
          </span>

          <h1 className="mt-5 text-balance font-[family-name:var(--font-dm-sans)] text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Premium laptops,
            <br />
            <span className="text-muted-foreground">at a fraction of the price.</span>
          </h1>

          <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground">
            Hand-picked, tested and certified refurbished laptops from Dell, HP, Lenovo,
            Apple and more. Save up to 60% with confidence.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/shop">
              <Button size="lg" className="gap-2">
                Browse laptops
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop?type=accessory">
              <Button size="lg" variant="outline">
                Shop accessories
              </Button>
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Customers
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-foreground">
                12k+
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Models
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-foreground">
                200+
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Avg. rating
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-foreground">
                4.7
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <div className="absolute inset-x-8 top-12 bottom-0 rounded-3xl bg-muted/40" />
          <div className="relative aspect-[5/4] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&h=800&fit=crop"
              alt="Premium refurbished laptop"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
