"use client";

import { useState } from "react";
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

export function VariantTable({ variants, onChange, productId }) {
  const [editIdx, setEditIdx] = useState(null);
  const [draft, setDraft] = useState(null);

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

  function save() {
    if (!draft.name || !draft.sku || !draft.price) return;
    const updated = [...variants];
    if (editIdx === -1) {
      updated.push(draft);
    } else {
      updated[editIdx] = draft;
    }
    onChange(updated);
    cancel();
  }

  function remove(idx) {
    if (variants.length <= 1) return;
    onChange(variants.filter((_, i) => i !== idx));
  }

  function updateDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startAdd}
          disabled={editIdx !== null}
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
            <TableHead>Price</TableHead>
            <TableHead>Compare</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Low</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v, i) =>
            editIdx === i ? (
              <DraftRow key={i} draft={draft} updateDraft={updateDraft} onSave={save} onCancel={cancel} />
            ) : (
              <TableRow key={i}>
                <TableCell className="font-medium text-foreground">{v.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{v.sku}</TableCell>
                <TableCell className="tabular-nums">{v.price}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{v.compareAtPrice || "—"}</TableCell>
                <TableCell className="tabular-nums">{v.stock}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{v.lowStockThreshold}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{v.isActive ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => startEdit(i)} disabled={editIdx !== null} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} disabled={variants.length <= 1} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          )}
          {editIdx === -1 && (
            <DraftRow draft={draft} updateDraft={updateDraft} onSave={save} onCancel={cancel} />
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

function DraftRow({ draft, updateDraft, onSave, onCancel }) {
  return (
    <TableRow>
      <TableCell>
        <Input className="h-8 w-24" value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-24" value={draft.sku} onChange={(e) => updateDraft("sku", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20" type="number" step="0.01" value={draft.price} onChange={(e) => updateDraft("price", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-20" type="number" step="0.01" value={draft.compareAtPrice} onChange={(e) => updateDraft("compareAtPrice", e.target.value)} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-16" type="number" value={draft.stock} onChange={(e) => updateDraft("stock", Number(e.target.value))} />
      </TableCell>
      <TableCell>
        <Input className="h-8 w-16" type="number" value={draft.lowStockThreshold} onChange={(e) => updateDraft("lowStockThreshold", Number(e.target.value))} />
      </TableCell>
      <TableCell>
        <Switch checked={draft.isActive} onCheckedChange={(v) => updateDraft("isActive", v)} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon-sm" onClick={onSave} aria-label="Save">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Cancel">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
