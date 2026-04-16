"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  if (loading) {
    return <p className="text-muted-foreground">Loading inventory...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
        Inventory
      </h1>

      <Card>
        <CardContent className="p-0">
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
              {lowStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    All variants are well-stocked
                  </TableCell>
                </TableRow>
              ) : (
                lowStock.map((v) => (
                  <TableRow key={v.variantId}>
                    <TableCell className="font-medium">{v.productName}</TableCell>
                    <TableCell>{v.variantName}</TableCell>
                    <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{v.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-destructive font-bold">{v.stock}</span>
                    </TableCell>
                    <TableCell className="text-center">{v.lowStockThreshold}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Adjust stock"
                          onClick={() => setAdjustTarget(v)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View history"
                          onClick={() => showHistory(v)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {v.type === "laptop" && (
                          <Button variant="ghost" size="icon" title="Manage units" asChild>
                            <Link href={`/admin/inventory/${v.variantId}/units`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              Stock History — {historyTarget?.variantName}
            </DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground">No adjustments recorded.</p>
          ) : (
            <div className="max-h-80 overflow-auto">
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
                      <TableCell className="text-xs">
                        {new Date(h.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={h.quantityChange > 0 ? "text-green-600" : "text-destructive"}>
                          {h.quantityChange > 0 ? "+" : ""}{h.quantityChange}
                        </span>
                      </TableCell>
                      <TableCell>{h.stockAfter}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{h.reason}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
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
