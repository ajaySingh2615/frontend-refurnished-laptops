"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/format";

export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateItem, removeItem } = useCart();
  const router = useRouter();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Your cart
            {cart.itemCount > 0 && (
              <span className="ml-1 text-sm text-muted-foreground">
                ({cart.itemCount})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Your cart is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a few laptops to get started.
              </p>
            </div>
            <Button
              onClick={() => {
                setDrawerOpen(false);
                router.push("/shop");
              }}
            >
              Browse shop
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <ul className="divide-y divide-border">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${item.productSlug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="text-sm font-medium text-foreground line-clamp-2 hover:underline"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.variantName}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            onClick={() =>
                              updateItem(item.id, Math.max(1, item.quantity - 1))
                            }
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(
                                item.id,
                                Math.min(item.stock, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                            className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatINR(item.lineTotal)}
                          </p>
                          {item.priceChanged && (
                            <p className="text-[10px] text-amber-600">Price updated</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatINR(cart.subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                GST and shipping are calculated at checkout.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push("/checkout");
                  }}
                >
                  Checkout
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push("/cart");
                  }}
                >
                  View cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
