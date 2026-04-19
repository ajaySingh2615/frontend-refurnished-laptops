"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Package,
  FolderTree,
  AlertTriangle,
  Warehouse,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/admin/inventory/low-stock");
        if (res.ok) {
          const json = await res.json();
          setLowStock(json.data || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here's a quick look at your store today.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value="—" icon={Package} hint="Manage catalog" href="/admin/products" />
        <Stat label="Categories" value="—" icon={FolderTree} hint="Manage tree" href="/admin/categories" />
        <Stat
          label="Low stock"
          value={loading ? "..." : String(lowStock.length)}
          icon={AlertTriangle}
          hint={
            loading
              ? "Loading"
              : lowStock.length === 0
                ? "All stocked up"
                : "Need attention"
          }
          href="/admin/inventory"
          accent={!loading && lowStock.length > 0}
        />
        <Stat label="Inventory units" value="—" icon={Warehouse} hint="Serial tracking" href="/admin/inventory" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Low-stock alerts
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Variants that need restocking soon
              </p>
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-muted-foreground"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : lowStock.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-foreground">All stocked up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No variants are below their low-stock threshold.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((v) => (
                <li
                  key={v.variantId}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {v.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {v.variantName}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-mono text-sm font-semibold text-amber-700">
                      {v.stock}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      / {v.lowStockThreshold}
                    </p>
                  </div>
                </li>
              ))}
              {lowStock.length > 6 && (
                <li className="px-5 py-3 text-center text-xs text-muted-foreground">
                  + {lowStock.length - 6} more
                </li>
              )}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Jump straight into common tasks
            </p>
          </div>
          <div className="p-2">
            <QuickLink href="/admin/products/new" label="Add a product" />
            <QuickLink href="/admin/categories" label="Manage categories" />
            <QuickLink href="/admin/inventory" label="Adjust stock" />
            <QuickLink href="/admin/settings" label="Update shop info" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, hint, href, accent }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 bg-card p-5 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon
          className={`h-4 w-4 ${accent ? "text-amber-700" : "text-muted-foreground"}`}
          strokeWidth={1.6}
        />
      </div>
      <p className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

function QuickLink({ href, label }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
