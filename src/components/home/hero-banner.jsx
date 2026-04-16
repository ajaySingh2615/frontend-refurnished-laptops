"use client";

import { useState, useEffect, useCallback } from "react";
import { heroBanners } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroBanners.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const banner = heroBanners[current];

  return (
    <section className="relative overflow-hidden">
      <div
        className={`relative flex items-center justify-center bg-gradient-to-r ${banner.gradient} text-white transition-all duration-700`}
        style={{ minHeight: "380px" }}
      >
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {banner.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            {banner.subtitle}
          </p>
          <Button
            size="lg"
            className="mt-6 bg-white text-foreground hover:bg-white/90 font-semibold px-8"
          >
            {banner.cta}
          </Button>
        </div>

        <button
          onClick={prev}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to banner ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
