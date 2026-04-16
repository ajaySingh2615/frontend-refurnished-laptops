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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Variants</h3>
        <Button type="button" variant="outline" size="sm" onClick={startAdd} disabled={editIdx !== null}>
          <Plus className="mr-1 h-3 w-3" /> Add Variant
        </Button>
      </div>

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
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                <TableCell>{v.price}</TableCell>
                <TableCell>{v.compareAtPrice || "—"}</TableCell>
                <TableCell>{v.stock}</TableCell>
                <TableCell>{v.lowStockThreshold}</TableCell>
                <TableCell>{v.isActive ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(i)} disabled={editIdx !== null}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} disabled={variants.length <= 1}>
                      <Trash2 className="h-3 w-3 text-destructive" />
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
          <Button type="button" variant="ghost" size="icon" onClick={onSave}>
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
