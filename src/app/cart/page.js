"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (authLoading) {
    return <div className="px-4 py-12 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold">Sign in to view your cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save items to your cart and check out in one place.
        </p>
        <Button className="mt-6" onClick={() => router.push("/login")}>
          Sign in
        </Button>
      </div>
    );
  }

  if (!loading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse our shop and add a few refurbished laptops.
        </p>
        <Link href="/shop">
          <Button className="mt-6" size="lg">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Cart</p>
          <h1 className="mt-1 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
            Your cart
          </h1>
        </div>
        {cart.items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Remove all items from your cart?")) clearCart();
            }}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 p-5">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${item.productSlug}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variantName}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">SKU: {item.sku}</p>
                      {item.priceChanged && (
                        <p className="mt-1 text-[11px] text-amber-700">
                          Price updated to {formatINR(item.currentPrice)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="inline-flex items-center rounded-md border border-border">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease"
                        className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, Math.min(item.stock, item.quantity + 1))}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase"
                        className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">
                        {formatINR(item.lineTotal)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatINR(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal ({cart.itemCount} item{cart.itemCount === 1 ? "" : "s"})</dt>
              <dd className="font-medium text-foreground">{formatINR(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST</dt>
              <dd className="text-muted-foreground">Included / recalculated</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-border pt-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold">Estimated total</span>
              <span className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold tracking-tight">
                {formatINR(cart.subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Final total is calculated on the next step.
            </p>
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() => router.push("/checkout")}
          >
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <Link href="/shop" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
