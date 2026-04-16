"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginCard } from "@/components/auth/login-card";
import { Laptop, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <main className="flex min-h-[calc(100vh-8rem)]">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-indigo-800 text-primary-foreground flex-col justify-center px-12 xl:px-20">
        <div className="flex items-center gap-3 mb-8">
          <Laptop className="h-10 w-10" />
          <span className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
            Refurbished Laptops
          </span>
        </div>

        <h2 className="font-[family-name:var(--font-dm-sans)] text-3xl font-bold leading-tight xl:text-4xl">
          Quality laptops,<br />
          unbeatable prices.
        </h2>
        <p className="mt-4 max-w-md text-base text-primary-foreground/80 leading-relaxed">
          Gurugram&apos;s largest refurbished laptop store. Every device is
          professionally restored and comes with a warranty.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            Quality checked with 40-point inspection
          </div>
          <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
            <Truck className="h-5 w-5 shrink-0" />
            Free delivery on orders above ₹5,000
          </div>
          <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
            <RefreshCw className="h-5 w-5 shrink-0" />
            7-day easy return policy
          </div>
        </div>
      </div>

      {/* Right side — login card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <LoginCard />
      </div>
    </main>
  );
}
