"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const empty = {
  name: "",
  description: "",
  baseCost: "",
  freeAbove: "",
  estimatedDays: "",
  isPickup: false,
  isActive: true,
};

export default function AdminShippingMethodsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/shipping-methods");
      const json = await res.json();
      if (res.ok) setRows(json.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(row) {
    setForm({
      name: row.name || "",
      description: row.description || "",
      baseCost: String(row.baseCost ?? ""),
      freeAbove: row.freeAbove !== null && row.freeAbove !== undefined ? String(row.freeAbove) : "",
      estimatedDays: row.estimatedDays || "",
      isPickup: !!row.isPickup,
      isActive: !!row.isActive,
    });
    setEditing(row);
    setShowForm(true);
  }
  function close() {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || "",
        baseCost: Number(form.baseCost) || 0,
        freeAbove: form.freeAbove === "" ? null : Number(form.freeAbove),
        estimatedDays: form.estimatedDays || "",
        isPickup: !!form.isPickup,
        isActive: !!form.isActive,
      };
      const res = await apiFetch(
        editing
          ? `/api/admin/shipping-methods/${editing.id}`
          : "/api/admin/shipping-methods",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to save");
        return;
      }
      toast.success(editing ? "Shipping method updated" : "Shipping method created");
      close();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await apiFetch(
        `/api/admin/shipping-methods/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.message || "Failed to delete");
        return;
      }
      toast.success("Shipping method removed");
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Shipping methods"
        description="Define pickup and delivery options shown at checkout."
        action={
          !showForm ? (
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Add method
            </Button>
          ) : null
        }
      />

      {showForm && (
        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold">
              {editing ? "Edit shipping method" : "New shipping method"}
            </h2>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <form className="space-y-4 p-5" onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Standard delivery"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Delivered in 3-5 business days via courier"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Base cost (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.baseCost}
                  onChange={(e) => setForm({ ...form, baseCost: e.target.value })}
                  placeholder="99"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Free above (₹, optional)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.freeAbove}
                  onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
                  placeholder="20000"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Estimated days</Label>
                <Input
                  value={form.estimatedDays}
                  onChange={(e) =>
                    setForm({ ...form, estimatedDays: e.target.value })
                  }
                  placeholder="3-5 business days"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Pickup / in-store</p>
                  <p className="text-xs text-muted-foreground">
                    Mark as self-pickup (no address needed to deliver).
                  </p>
                </div>
                <Switch
                  checked={!!form.isPickup}
                  onCheckedChange={(v) => setForm({ ...form, isPickup: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive methods are hidden from customers.
                  </p>
                </div>
                <Switch
                  checked={!!form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update method"
                    : "Create method"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Free above</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Loading shipping methods...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium">No shipping methods yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add at least one method so customers can check out.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {r.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {Number(r.baseCost) === 0 ? "Free" : formatINR(r.baseCost)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {r.freeAbove !== null && r.freeAbove !== undefined
                      ? formatINR(r.freeAbove)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.estimatedDays || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.isPickup ? (
                      <Badge variant="accent">Pickup</Badge>
                    ) : (
                      <Badge variant="secondary">Delivery</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={r.isActive ? "success" : "secondary"}>
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove shipping method</DialogTitle>
            <DialogDescription>
              Delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
