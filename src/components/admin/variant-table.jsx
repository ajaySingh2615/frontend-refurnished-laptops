"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { discountPercent } from "@/lib/product-admin-utils";

const emptyVariant = {
  name: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: 0,
  lowStockThreshold: 5,
  isActive: true,
  sortOrder: 0,
};

export function VariantTable({ variants, onChange, productId, onSaved }) {
  const [editIdx, setEditIdx] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const isPersisted = Boolean(productId);

  function startAdd() {
    setDraft({ ...emptyVariant });
    setEditIdx(-1);
  }

  function startEdit(idx) {
    setDraft({ ...variants[idx] });
    setEditIdx(idx);
  }

  function cancel() {
    setDraft(null);
    setEditIdx(null);
  }

  async function save() {
    if (!draft.name?.trim() || !draft.sku?.trim() || draft.price === "" || draft.price == null) {
      toast.error("Name, SKU and sale price are required");
      return;
    }

    const priceNum = Number(draft.price);
    const compareNum =
      draft.compareAtPrice !== "" && draft.compareAtPrice != null
        ? Number(draft.compareAtPrice)
        : null;

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Sale price must be a positive number");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      sku: draft.sku.trim(),
      price: Math.round(priceNum * 100) / 100,
      compareAtPrice:
        compareNum != null && Number.isFinite(compareNum) && compareNum > 0
          ? Math.round(compareNum * 100) / 100
          : null,
      stock: Number(draft.stock) || 0,
      lowStockThreshold: Number(draft.lowStockThreshold) || 0,
      isActive: Boolean(draft.isActive),
      sortOrder: Number(draft.sortOrder) || 0,
    };

    if (isPersisted) {
      setSaving(true);
      try {
        if (editIdx === -1) {
          const res = await apiFetch(`/api/admin/products/${productId}/variants`, {
            method: "POST",
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (!res.ok) {
            toast.error(json.message || "Failed to add variant");
            return;
          }
          toast.success("Variant added");
        } else {
          const vid = variants[editIdx].id;
          if (!vid) {
            toast.error("Missing variant id");
            return;
          }
          const res = await apiFetch(
            `/api/admin/products/${productId}/variants/${vid}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            }
          );
          const json = await res.json();
          if (!res.ok) {
            toast.error(json.message || "Failed to update variant");
            return;
          }
          toast.success("Variant updated");
        }
        onSaved?.();
        cancel();
      } catch {
        toast.error("Network error");
      } finally {
        setSaving(false);
      }
      return;
    }

    const updated = [...variants];
    if (editIdx === -1) {
      updated.push({ ...draft, ...payload, price: String(payload.price), compareAtPrice: payload.compareAtPrice != null ? String(payload.compareAtPrice) : "" });
    } else {
      updated[editIdx] = { ...draft, ...payload, price: String(payload.price), compareAtPrice: payload.compareAtPrice != null ? String(payload.compareAtPrice) : "" };
    }
    onChange(updated);
    cancel();
  }

  async function remove(idx) {
    if (variants.length <= 1) return;

    const row = variants[idx];
    if (isPersisted && row.id) {
      if (!window.confirm("Remove this variant from the product?")) return;
      setSaving(true);
      try {
        const res = await apiFetch(
          `/api/admin/products/${productId}/variants/${row.id}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const json = await res.json();
          toast.error(json.message || "Failed to delete");
          return;
        }
        toast.success("Variant removed");
        onSaved?.();
      } catch {
        toast.error("Network error");
      } finally {
        setSaving(false);
      }
      return;
    }

    onChange(variants.filter((_, i) => i !== idx));
  }

  function updateDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">How pricing works</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong className="text-foreground">Sale price</strong> is what the customer pays (shown on the shop).
          </li>
          <li>
            <strong className="text-foreground">MRP / list price</strong> is the original price before your offer. The
            storefront shows it struck through and computes &quot;% off&quot; when it is higher than the sale price.
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startAdd}
          disabled={editIdx !== null || saving}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add variant
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Sale price</TableHead>
              <TableHead>MRP (list)</TableHead>
              <TableHead className="text-center">Off %</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Low</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v, i) =>
              editIdx === i ? (
                <DraftRow
                  key={v.id || `new-${i}`}
                  draft={draft}
                  updateDraft={updateDraft}
                  onSave={save}
                  onCancel={cancel}
                  saving={saving}
                />
              ) : (
                <TableRow key={v.id || i}>
                  <TableCell className="font-medium text-foreground">{v.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.sku}</TableCell>
                  <TableCell className="tabular-nums">₹{v.price}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {v.compareAtPrice ? `₹${v.compareAtPrice}` : "—"}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums text-emerald-700">
                    {discountPercent(v.price, v.compareAtPrice) != null
                      ? `${discountPercent(v.price, v.compareAtPrice)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">{v.stock}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{v.lowStockThreshold}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{v.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(i)}
                        disabled={editIdx !== null || saving}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(i)}
                        disabled={saving}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
            {editIdx === -1 && (
              <DraftRow
                draft={draft}
                updateDraft={updateDraft}
                onSave={save}
                onCancel={cancel}
                saving={saving}
              />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DraftRow({ draft, updateDraft, onSave, onCancel, saving }) {
  if (!draft) return null;
  const off = discountPercent(draft.price, draft.compareAtPrice);

  return (
    <TableRow>
      <TableCell>
        <Input className="h-8 min-w-[5rem]" value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 min-w-[5rem] font-mono text-xs" value={draft.sku} onChange={(e) => updateDraft("sku", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input
          className="h-8 w-24"
          type="number"
          step="0.01"
          min="0"
          placeholder="150"
          value={draft.price}
          onChange={(e) => updateDraft("price", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          className="h-8 w-24"
          type="number"
          step="0.01"
          min="0"
          placeholder="200"
          value={draft.compareAtPrice}
          onChange={(e) => updateDraft("compareAtPrice", e.target.value)}
        />
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">
        {off != null ? `${off}%` : "—"}
      </TableCell>
      <TableCell>
        <Input className="h-8 w-16" type="number" min={0} value={draft.stock} onChange={(e) => updateDraft("stock", Number(e.target.value))} />
      </TableCell>
      <TableCell>
        <Input
          className="h-8 w-16"
          type="number"
          min={0}
          value={draft.lowStockThreshold}
          onChange={(e) => updateDraft("lowStockThreshold", Number(e.target.value))}
        />
      </TableCell>
      <TableCell>
        <Switch checked={draft.isActive} onCheckedChange={(v) => updateDraft("isActive", v)} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon-sm" onClick={onSave} disabled={saving} aria-label="Save">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} disabled={saving} aria-label="Cancel">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
