"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatINR, formatDateTime } from "@/lib/format";
import { openInvoicePrint } from "@/lib/invoice";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Truck,
  FileText,
  Package,
  User,
  CheckCircle2,
  X,
} from "lucide-react";

const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "packed",
  packed: "shipped",
  shipped: "delivered",
};
const NEXT_LABEL = {
  placed: "Mark confirmed",
  confirmed: "Mark packed",
  packed: "Mark shipped",
  shipped: "Mark delivered",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (res.ok) setOrder(json.data);
      else toast.error(json.message || "Could not load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function advanceStatus() {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    if (!confirm(`Move order to "${next}"?`)) return;
    setActing(true);
    try {
      const res = await apiFetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not update status");
        return;
      }
      setOrder(json.data);
      toast.success(`Status updated to ${next}`);
    } finally {
      setActing(false);
    }
  }

  async function cancel() {
    setActing(true);
    try {
      const res = await apiFetch(`/api/admin/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancelReason }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not cancel order");
        return;
      }
      setOrder(json.data);
      toast.success("Order cancelled");
      setCancelOpen(false);
      setCancelReason("");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }
  if (!order) return null;

  const nextStatus = NEXT_STATUS[order.status];
  const canCancel = ["placed", "confirmed", "packed"].includes(order.status);
  const paidPayment = order.payments?.find((p) => p.status === "paid");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <AdminPageHeader
        eyebrow="Order"
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.placedAt)}`}
        action={
          <>
            <OrderStatusBadge status={order.status} className="mr-2" />
            {order.invoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInvoicePrint(order.id, { admin: true })}
              >
                <FileText className="h-4 w-4" /> Invoice
              </Button>
            )}
            {nextStatus && (
              <Button size="sm" disabled={acting} onClick={advanceStatus}>
                <CheckCircle2 className="h-4 w-4" /> {NEXT_LABEL[order.status]}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                disabled={acting}
                onClick={() => setCancelOpen(true)}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
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
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {i.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.imageUrl} alt={i.productName} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{i.productName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{i.variantName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {i.quantity} × {formatINR(i.unitPrice)} (GST {i.gstPercent}%)
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatINR(i.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Customer */}
          <section className="rounded-xl border border-border bg-card">
            <header className="flex items-center gap-2 border-b border-border px-5 py-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Customer</h2>
            </header>
            <div className="p-5 text-sm">
              <p className="font-semibold">{order.user?.name || "—"}</p>
              <p className="mt-1 text-muted-foreground">
                {order.user?.email || "—"} · {order.user?.phone || "—"}
              </p>
            </div>
          </section>

          {/* Address + shipping */}
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
                      {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
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
                        {order.shippingMethod.estimatedDays}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </div>
            </section>
          </div>

          {/* Payments */}
          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Payments</h2>
            </header>
            {order.payments.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No payment attempts yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-medium truncate">
                        {p.gatewayPaymentId || p.gatewayOrderId || p.id}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {p.method} · {formatDateTime(p.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          p.status === "paid"
                            ? "success"
                            : p.status === "failed"
                              ? "destructive"
                              : p.status === "refunded"
                                ? "secondary"
                                : "warning"
                        }
                      >
                        {p.status}
                      </Badge>
                      <span className="font-medium tabular-nums">
                        {formatINR(p.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {order.notes && (
            <section className="rounded-xl border border-border bg-card p-5 text-sm">
              <h3 className="font-semibold">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Totals */}
        <aside className="self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            <Row label="Tax" value={formatINR(order.taxTotal)} />
            <Row
              label="Shipping"
              value={
                Number(order.shippingCost) === 0 ? "Free" : formatINR(order.shippingCost)
              }
            />
          </dl>
          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold">
              {formatINR(order.grandTotal)}
            </span>
          </div>
          {paidPayment && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paid on{" "}
              {formatDateTime(paidPayment.paidAt || paidPayment.createdAt)}
            </p>
          )}
        </aside>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
            <DialogDescription>
              {paidPayment
                ? "This order was paid. Cancelling will mark it refunded and restore any committed stock. Actual refund has to be processed in Razorpay separately."
                : "Cancelling will abort the order and, if stock was committed, restore it."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="Reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={cancel} disabled={acting}>
              {acting ? "Cancelling..." : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
