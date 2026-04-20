"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatINR, formatDateTime } from "@/lib/format";
import { openInvoicePrint } from "@/lib/invoice";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  ArrowLeft,
  MapPin,
  Truck,
  FileText,
  Package,
  CheckCircle2,
  X,
} from "lucide-react";

function OrderDetailInner() {
  const { id } = useParams();
  const search = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders/${id}`);
      const json = await res.json();
      if (res.ok) setOrder(json.data);
      else toast.error(json.message || "Could not load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    if (search.get("paid") === "1") {
      toast.success("Payment successful. Your order is confirmed.");
    }
  }, [load, search]);

  async function handleCancel() {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const res = await apiFetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not cancel order");
        return;
      }
      setOrder(json.data);
      toast.success("Order cancelled");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-64 animate-pulse rounded-xl border border-border bg-card" />
      </main>
    );
  }
  if (!order) return null;

  const paidPayment = order.payments?.find((p) => p.status === "paid");
  const canCancel = order.status === "placed";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Order
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {formatDateTime(order.placedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.invoice && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInvoicePrint(order.id)}
            >
              <FileText className="h-4 w-4" /> Invoice
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              disabled={cancelling}
              onClick={handleCancel}
            >
              <X className="h-4 w-4" /> {cancelling ? "Cancelling..." : "Cancel order"}
            </Button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-xl border border-border bg-card">
            <header className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Items</h2>
            </header>
            <ul className="divide-y divide-border">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-start gap-4 p-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {i.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={i.imageUrl}
                        alt={i.productName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {i.productSlug ? (
                      <Link
                        href={`/shop/${i.productSlug}`}
                        className="text-sm font-semibold hover:underline"
                      >
                        {i.productName}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold">{i.productName}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {i.variantName}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Qty {i.quantity} × {formatINR(i.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatINR(i.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Delivery + shipping */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Deliver to</h2>
              </header>
              <div className="p-5 text-sm">
                {order.address ? (
                  <>
                    <p className="font-semibold">{order.address.fullName}</p>
                    <p className="mt-1 text-muted-foreground">
                      {order.address.addressLine1}
                      {order.address.addressLine2
                        ? `, ${order.address.addressLine2}`
                        : ""}
                      <br />
                      {order.address.city}, {order.address.state}{" "}
                      {order.address.pincode}
                    </p>
                    <p className="mt-1 text-muted-foreground">{order.address.phone}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Address removed</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Shipping</h2>
              </header>
              <div className="p-5 text-sm">
                {order.shippingMethod ? (
                  <>
                    <p className="font-semibold">{order.shippingMethod.name}</p>
                    {order.shippingMethod.estimatedDays && (
                      <p className="mt-1 text-muted-foreground">
                        Estimated: {order.shippingMethod.estimatedDays}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
                {paidPayment && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Paid via {paidPayment.method}
                  </p>
                )}
              </div>
            </section>
          </div>

          {order.notes && (
            <section className="rounded-xl border border-border bg-card p-5 text-sm">
              <h3 className="font-semibold">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        {/* Totals */}
        <aside className="self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            <Row label="Tax" value={formatINR(order.taxTotal)} />
            <Row
              label="Shipping"
              value={
                Number(order.shippingCost) === 0
                  ? "Free"
                  : formatINR(order.shippingCost)
              }
            />
          </dl>
          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold">
              {formatINR(order.grandTotal)}
            </span>
          </div>

          {order.invoice && (
            <Button
              variant="outline"
              className="mt-5 w-full"
              size="sm"
              onClick={() => openInvoicePrint(order.id)}
            >
              <FileText className="h-4 w-4" />
              View invoice
            </Button>
          )}
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailInner />
    </ProtectedRoute>
  );
}
