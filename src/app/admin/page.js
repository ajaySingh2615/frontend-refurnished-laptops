"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { formatINR, formatDateTime } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  Package,
  FolderTree,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([
          apiFetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
          apiFetch("/api/admin/inventory/low-stock").then((r) =>
            r.ok ? r.json() : { data: [] }
          ),
        ]);
        setStats(s?.data || null);
        setLowStock(l.data || []);
      } finally {
        setLoading(false);
      }
    })();
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
            Here's a snapshot of your store today.
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

      {/* Revenue / orders summary */}
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat
          label="Revenue (30d)"
          value={
            loading
              ? "..."
              : stats
                ? formatINR(stats.last30.revenue)
                : "—"
          }
          sub={stats ? `${stats.last30.orders} orders` : ""}
          icon={TrendingUp}
          href="/admin/orders"
        />
        <KpiStat
          label="Revenue (7d)"
          value={
            loading
              ? "..."
              : stats
                ? formatINR(stats.last7.revenue)
                : "—"
          }
          sub={stats ? `${stats.last7.orders} orders` : ""}
          icon={TrendingUp}
          href="/admin/orders"
        />
        <KpiStat
          label="Lifetime orders"
          value={loading ? "..." : stats ? String(stats.totals.orders) : "—"}
          sub={
            stats ? `${formatINR(stats.totals.revenue)} lifetime` : ""
          }
          icon={ShoppingBag}
          href="/admin/orders"
        />
        <KpiStat
          label="Pending payments"
          value={
            loading
              ? "..."
              : stats
                ? String(stats.pendingPayments)
                : "—"
          }
          sub={stats && stats.pendingPayments > 0 ? "Action needed" : "All clear"}
          icon={Clock}
          href="/admin/orders?status=placed"
          accent={stats && stats.pendingPayments > 0}
        />
      </div>

      {/* Catalog snapshot */}
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat
          label="Products"
          value={loading ? "..." : stats ? String(stats.products) : "—"}
          sub={stats ? `${stats.variants} variants` : ""}
          icon={Package}
          href="/admin/products"
        />
        <KpiStat
          label="Customers"
          value={loading ? "..." : stats ? String(stats.customers) : "—"}
          sub="Signed up"
          icon={Users}
          href="/admin/users"
        />
        <KpiStat
          label="Categories"
          value="—"
          sub="Manage taxonomy"
          icon={FolderTree}
          href="/admin/categories"
        />
        <KpiStat
          label="Low stock"
          value={loading ? "..." : String(lowStock.length)}
          sub={
            loading
              ? "Loading"
              : lowStock.length === 0
                ? "All stocked up"
                : "Need attention"
          }
          icon={AlertTriangle}
          href="/admin/inventory"
          accent={!loading && lowStock.length > 0}
        />
      </div>

      {/* Recent orders + low stock + quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent orders
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest 5 orders placed
              </p>
            </div>
            <Link
              href="/admin/orders"
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
          ) : !stats || stats.recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium">No orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New orders will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-medium">
                        {o.orderNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                        {o.userName || "—"} · {formatDateTime(o.placedAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-24 text-right text-sm font-medium tabular-nums">
                      {formatINR(o.grandTotal)}
                    </span>
                  </Link>
                </li>
              ))}
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
            <QuickLink href="/admin/orders" label="View orders" />
            <QuickLink href="/admin/products/new" label="Add a product" />
            <QuickLink href="/admin/categories" label="Manage categories" />
            <QuickLink href="/admin/inventory" label="Adjust stock" />
            <QuickLink href="/admin/tax-rates" label="Manage tax rates" />
            <QuickLink
              href="/admin/shipping-methods"
              label="Manage shipping"
            />
            <QuickLink href="/admin/users" label="Manage users" />
            <QuickLink href="/admin/settings" label="Shop settings" />
          </div>
        </section>
      </div>

      {/* Low stock */}
      {!loading && lowStock.length > 0 && (
        <section className="rounded-xl border border-border bg-card">
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
              View inventory
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {lowStock.slice(0, 6).map((v) => (
              <li
                key={v.variantId}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
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
        </section>
      )}
    </div>
  );
}

function KpiStat({ label, value, sub, icon: Icon, href, accent }) {
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
      <p className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
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
