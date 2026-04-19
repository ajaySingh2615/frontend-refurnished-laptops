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
  DialogDescription,
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
        setQuantity("");
        setReason("");
        setNotes("");
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
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {variant?.variantName} · current stock{" "}
            <span className="font-mono font-medium text-foreground">
              {variant?.stock}
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Quantity change
            </Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Use + to add, - to remove"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Example: 10 to add ten units, -5 to remove five.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional context"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Adjust stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
