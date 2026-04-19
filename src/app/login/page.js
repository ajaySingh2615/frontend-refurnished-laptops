"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginCard } from "@/components/auth/login-card";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";

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
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-foreground p-12 text-background lg:flex xl:p-16">
        <Link
          href="/"
          className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold tracking-tight"
        >
          Refurbished<span className="text-background/60">Laptops</span>
        </Link>

        <div className="max-w-md">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Quality laptops,
            <br />
            <span className="text-background/60">honest prices.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-background/70">
            Sign in to track your orders, manage your wishlist, and access exclusive
            member deals.
          </p>

          <ul className="mt-10 space-y-4">
            <li className="flex items-start gap-3 text-sm text-background/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
              40-point quality inspection on every device
            </li>
            <li className="flex items-start gap-3 text-sm text-background/80">
              <Truck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
              Free delivery on orders above ₹5,000
            </li>
            <li className="flex items-start gap-3 text-sm text-background/80">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
              7-day no-questions return policy
            </li>
          </ul>
        </div>

        <p className="text-xs text-background/50">
          © {new Date().getFullYear()} Refurbished Laptops. All rights reserved.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <LoginCard />
      </div>
    </main>
  );
}
