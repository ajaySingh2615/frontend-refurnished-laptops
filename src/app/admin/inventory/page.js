"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings2, History, ExternalLink } from "lucide-react";
import { StockAdjustDialog } from "@/components/admin/stock-adjust-dialog";
import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";

export default function AdminInventoryPage() {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/inventory/low-stock");
      if (res.ok) {
        const json = await res.json();
        setLowStock(json.data || []);
      }
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function showHistory(variant) {
    setHistoryTarget(variant);
    setHistoryLoading(true);
    try {
      const res = await apiFetch(`/api/admin/inventory/${variant.variantId}/history`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data || []);
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Inventory"
        title="Low-stock alerts"
        description="Monitor variants approaching their reorder threshold and take action."
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Threshold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : lowStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium text-foreground">All variants are well-stocked</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nothing has crossed its low-stock threshold.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              lowStock.map((v) => (
                <TableRow key={v.variantId}>
                  <TableCell className="font-medium text-foreground">{v.productName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.variantName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{v.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm font-semibold text-amber-700">{v.stock}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground tabular-nums">
                    {v.lowStockThreshold}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Adjust stock"
                        onClick={() => setAdjustTarget(v)}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="View history"
                        onClick={() => showHistory(v)}
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      {v.type === "laptop" && (
                        <Link
                          href={`/admin/inventory/${v.variantId}/units`}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                          title="Manage units"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {adjustTarget && (
        <StockAdjustDialog
          variant={adjustTarget}
          open={!!adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onDone={load}
        />
      )}

      <Dialog open={!!historyTarget} onOpenChange={() => setHistoryTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Stock history — {historyTarget?.variantName}
            </DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No adjustments recorded.</p>
          ) : (
            <div className="max-h-80 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={
                          h.quantityChange > 0
                            ? "font-mono text-sm font-medium text-emerald-700"
                            : "font-mono text-sm font-medium text-destructive"
                        }>
                          {h.quantityChange > 0 ? "+" : ""}{h.quantityChange}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">{h.stockAfter}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{h.reason}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {h.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
