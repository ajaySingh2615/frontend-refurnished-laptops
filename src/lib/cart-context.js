"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { apiFetch } from "./api";
import { useAuth } from "@/hooks/use-auth";

const CartContext = createContext(null);

const emptyCart = { id: null, items: [], subtotal: 0, itemCount: 0 };

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/cart");
      if (res.ok) {
        const json = await res.json();
        setCart(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) refresh();
  }, [authLoading, refresh]);

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!user) {
        toast.error("Please sign in to add items to your cart");
        return { ok: false, requiresAuth: true };
      }
      try {
        const res = await apiFetch("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ variantId, quantity }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.message || "Could not add to cart");
          return { ok: false };
        }
        setCart(json.data);
        toast.success("Added to cart");
        setDrawerOpen(true);
        return { ok: true };
      } catch {
        toast.error("Network error");
        return { ok: false };
      }
    },
    [user]
  );

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      const res = await apiFetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not update cart");
        return { ok: false };
      }
      setCart(json.data);
      return { ok: true };
    } catch {
      toast.error("Network error");
      return { ok: false };
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const res = await apiFetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Could not remove item");
        return { ok: false };
      }
      setCart(json.data);
      return { ok: true };
    } catch {
      toast.error("Network error");
      return { ok: false };
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const res = await apiFetch("/api/cart", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) return { ok: false };
      setCart(json.data);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      drawerOpen,
      setDrawerOpen,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }),
    [cart, loading, drawerOpen, refresh, addItem, updateItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
