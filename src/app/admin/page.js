"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, AlertTriangle } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Manage products, categories, and inventory from the sidebar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Organize your catalog into parent and child categories.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <>
                <p className="text-2xl font-bold">{lowStock.length}</p>
                <p className="text-xs text-muted-foreground">
                  {lowStock.length === 0
                    ? "All stocked up!"
                    : "variants need attention"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((v) => (
                <div
                  key={v.variantId}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{v.productName}</span>
                    <span className="ml-2 text-muted-foreground">
                      {v.variantName}
                    </span>
                  </div>
                  <span className="font-mono text-destructive">
                    {v.stock} / {v.lowStockThreshold}
                  </span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  + {lowStock.length - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
