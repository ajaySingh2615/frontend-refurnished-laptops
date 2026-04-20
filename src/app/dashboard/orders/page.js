"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatINR, formatDateTime } from "@/lib/format";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

function OrdersInner() {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders?page=${page}&limit=20`);
      const json = await res.json();
      if (res.ok) setState(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Account</p>
          <h1 className="mt-1 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
            My orders
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">← Back to dashboard</Button>
        </Link>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : state.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders you place will appear here.
          </p>
          <Link href="/shop">
            <Button className="mt-5">
              <ShoppingBag className="h-4 w-4" /> Browse shop
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {state.items.map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
            >
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Package className="h-5 w-5 text-foreground" strokeWidth={1.6} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{order.orderNumber}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed on {formatDateTime(order.placedAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold">
                    {formatINR(order.grandTotal)}
                  </p>
                </div>

                <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {state.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {state.page} of {state.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={state.page <= 1}
              onClick={() => load(state.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={state.page >= state.totalPages}
              onClick={() => load(state.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-[74px] animate-pulse rounded-xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersInner />
    </ProtectedRoute>
  );
}
