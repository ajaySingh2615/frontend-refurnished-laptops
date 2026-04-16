"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = ["restock", "sale", "return", "correction", "reserved"];

export function StockAdjustDialog({ variant, open, onClose, onDone }) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quantity || !reason) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/inventory/${variant.variantId}/adjust`, {
        method: "POST",
        body: JSON.stringify({
          quantity: Number(quantity),
          reason,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Stock adjusted: ${json.data?.previousStock} → ${json.data?.newStock}`);
        onDone();
        onClose();
      } else {
        toast.error(json.message || "Adjustment failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock — {variant?.variantName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Stock</Label>
            <p className="text-lg font-bold">{variant?.stock}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Quantity Change (+ or -)</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10 or -5"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Adjust"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
