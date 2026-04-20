"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AddressForm } from "@/components/account/address-form";
import { MapPin, Truck, Package, CheckCircle2, Lock, Plus } from "lucide-react";

function StepHeader({ num, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${
          done
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : num}
      </span>
      <span
        className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refresh: refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [step, setStep] = useState("address");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // ── Initial load ───────────────────────────────────
  useEffect(() => {
    (async () => {
      const [a, s] = await Promise.all([
        apiFetch("/api/addresses").then((r) => (r.ok ? r.json() : { data: [] })),
        apiFetch("/api/shipping-methods").then((r) =>
          r.ok ? r.json() : { data: [] }
        ),
      ]);
      setAddresses(a.data || []);
      setShippingMethods(s.data || []);
      const defaultAddr = (a.data || []).find((x) => x.isDefault) || (a.data || [])[0];
      if (defaultAddr) setAddressId(defaultAddr.id);
      if ((s.data || []).length) setShippingMethodId(s.data[0].id);
    })();
  }, []);

  // ── Quote (runs when both selections are made) ─────
  const fetchQuote = useCallback(async () => {
    if (!addressId || !shippingMethodId) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const res = await apiFetch("/api/checkout/quote", {
        method: "POST",
        body: JSON.stringify({ addressId, shippingMethodId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not calculate total");
        setQuote(null);
      } else {
        setQuote(json.data);
      }
    } finally {
      setQuoteLoading(false);
    }
  }, [addressId, shippingMethodId]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === addressId),
    [addresses, addressId]
  );
  const selectedShipping = useMemo(
    () => shippingMethods.find((s) => s.id === shippingMethodId),
    [shippingMethods, shippingMethodId]
  );

  // ── Pay ────────────────────────────────────────────
  async function handlePay() {
    if (!quote) return;
    setPayLoading(true);

    try {
      const placeRes = await apiFetch("/api/checkout/place-order", {
        method: "POST",
        body: JSON.stringify({ addressId, shippingMethodId, notes }),
      });
      const placeJson = await placeRes.json();
      if (!placeRes.ok) {
        toast.error(placeJson.message || "Could not place order");
        return;
      }

      const { order, razorpay } = placeJson.data;
      await refreshCart();

      if (razorpay.stubMode) {
        const verifyRes = await apiFetch("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: razorpay.orderId,
            razorpayPaymentId: `pay_stub_${Date.now()}`,
            razorpaySignature: "stub_signature",
          }),
        });
        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok) {
          toast.error(verifyJson.message || "Payment verification failed");
          return;
        }
        toast.success("Payment successful (test mode)");
        router.replace(`/dashboard/orders/${order.id}?paid=1`);
        return;
      }

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        toast.error("Could not load payment module. Please try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: quote.shop?.shopName || "Refurbished Laptops",
        description: `Order ${order.orderNumber}`,
        order_id: razorpay.orderId,
        prefill: {
          name: selectedAddress?.fullName || user?.name || "",
          email: user?.email || "",
          contact: selectedAddress?.phone || user?.phone || "",
        },
        theme: { color: "#0f172a" },
        handler: async (response) => {
          const verifyRes = await apiFetch("/api/payments/verify", {
            method: "POST",
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok) {
            toast.error(verifyJson.message || "Payment verification failed");
            return;
          }
          toast.success("Payment successful");
          router.replace(`/dashboard/orders/${order.id}?paid=1`);
        },
        modal: {
          ondismiss: async () => {
            await apiFetch("/api/payments/failed", {
              method: "POST",
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: razorpay.orderId,
                reason: "User dismissed payment",
              }),
            });
            toast.error("Payment cancelled");
          },
        },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setPayLoading(false);
    }
  }

  // ── Empty state ────────────────────────────────────
  if (cart.items.length === 0 && !payLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add items to the cart before checking out.
        </p>
        <Link href="/shop">
          <Button className="mt-6">Browse shop</Button>
        </Link>
      </div>
    );
  }

  const canReview = !!addressId && !!shippingMethodId && !!quote && !quoteLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Checkout</p>
        <h1 className="mt-1 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
          Checkout
        </h1>
      </div>

      <div className="mb-8 flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3 text-sm">
        <StepHeader num={1} label="Delivery" active={step === "address"} done={["delivery", "review"].includes(step)} />
        <div className="h-px flex-1 bg-border" />
        <StepHeader num={2} label="Shipping" active={step === "delivery"} done={step === "review"} />
        <div className="h-px flex-1 bg-border" />
        <StepHeader num={3} label="Pay" active={step === "review"} done={false} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* ── Step 1 ── */}
          <section className="rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Delivery address</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddressForm((v) => !v)}
              >
                <Plus className="h-3.5 w-3.5" /> Add new
              </Button>
            </header>

            <div className="p-5 space-y-3">
              {addresses.length === 0 && !showAddressForm && (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No saved addresses. Add one to continue.
                </div>
              )}

              {showAddressForm && (
                <div className="rounded-lg border border-border bg-background p-5">
                  <AddressForm
                    onCancel={() => setShowAddressForm(false)}
                    onSaved={async (saved) => {
                      setShowAddressForm(false);
                      const r = await apiFetch("/api/addresses").then((x) => x.json());
                      setAddresses(r.data || []);
                      setAddressId(saved.id);
                      setStep("delivery");
                    }}
                  />
                </div>
              )}

              {!showAddressForm && addresses.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`relative block cursor-pointer rounded-lg border p-4 transition-colors ${
                        addressId === a.id
                          ? "border-foreground ring-1 ring-foreground/20 bg-muted/30"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={addressId === a.id}
                        onChange={() => {
                          setAddressId(a.id);
                          setStep("delivery");
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold">{a.fullName}</p>
                        {a.isDefault && <Badge variant="success">Default</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city},{" "}
                        {a.state} {a.pincode}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{a.phone}</p>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Step 2 ── */}
          <section className="rounded-xl border border-border bg-card">
            <header className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Shipping method</h2>
            </header>
            <div className="p-5 space-y-3">
              {shippingMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No shipping methods configured. Please contact support.
                </p>
              ) : (
                shippingMethods.map((m) => {
                  const freeKicksIn =
                    m.freeAbove !== null &&
                    m.freeAbove !== undefined &&
                    Number(m.freeAbove) > 0;
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        shippingMethodId === m.id
                          ? "border-foreground ring-1 ring-foreground/20 bg-muted/30"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={m.id}
                        checked={shippingMethodId === m.id}
                        onChange={() => {
                          setShippingMethodId(m.id);
                          setStep("review");
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold">{m.name}</p>
                          <p className="text-sm font-semibold">
                            {Number(m.baseCost) === 0 || m.isPickup
                              ? "Free"
                              : formatINR(m.baseCost)}
                          </p>
                        </div>
                        {m.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {m.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.isPickup && <Badge variant="secondary">Pickup</Badge>}
                          {m.estimatedDays && (
                            <Badge variant="outline">{m.estimatedDays}</Badge>
                          )}
                          {freeKicksIn && (
                            <Badge variant="success">
                              Free above {formatINR(m.freeAbove)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Order notes (optional)</h3>
            <Textarea
              className="mt-3"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions, gift note, etc."
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Order summary</h2>

          <ul className="mt-4 divide-y divide-border">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-2">{item.productName}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.variantName} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold">{formatINR(item.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            {quoteLoading ? (
              <p className="text-sm text-muted-foreground">Calculating...</p>
            ) : quote ? (
              <>
                <Row label="Taxable value" value={formatINR(quote.taxableValue)} />
                {quote.intraState ? (
                  <>
                    <Row label="CGST" value={formatINR(quote.cgst)} />
                    <Row label="SGST" value={formatINR(quote.sgst)} />
                  </>
                ) : (
                  <Row label="IGST" value={formatINR(quote.igst)} />
                )}
                <Row
                  label="Shipping"
                  value={
                    quote.shippingCost === 0
                      ? "Free"
                      : formatINR(quote.shippingCost)
                  }
                />
                <div className="mt-2 flex items-end justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold">Grand total</span>
                  <span className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold">
                    {formatINR(quote.grandTotal)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select delivery address and shipping to see the total.
              </p>
            )}
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={!canReview || payLoading}
            onClick={handlePay}
          >
            <Lock className="h-4 w-4" />
            {payLoading ? "Processing..." : `Pay ${quote ? formatINR(quote.grandTotal) : ""}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" /> Secured by Razorpay
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutInner />
    </ProtectedRoute>
  );
}
