"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { UnitFormDialog } from "@/components/admin/unit-form";
import { AdminPageHeader } from "@/components/admin/page-header";

const statusVariants = {
  available: "success",
  sold: "secondary",
  reserved: "outline",
  returned: "outline",
  defective: "destructive",
};

export default function AdminUnitsPage({ params }) {
  const { variantId } = use(params);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/admin/inventory/${variantId}/units`);
      if (res.ok) {
        const json = await res.json();
        setUnits(json.data || []);
      }
    } catch {
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  }, [variantId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(data) {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/inventory/${variantId}/units`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Unit added");
        setShowForm(false);
        load();
      } else {
        toast.error(json.message || "Failed to add unit");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data) {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/inventory/units/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Unit updated");
        setEditing(null);
        load();
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/admin/inventory/units/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Unit removed");
        setDeleteTarget(null);
        load();
      } else {
        const json = await res.json();
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to inventory
      </Link>

      <AdminPageHeader
        eyebrow="Inventory"
        title="Serial units"
        description={`${units.length} ${units.length === 1 ? "unit" : "units"} tracked for this variant.`}
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add unit
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Sold at</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  Loading units...
                </TableCell>
              </TableRow>
            ) : units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium text-foreground">No units tracked yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add a unit to start tracking serial numbers for this variant.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              units.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs text-foreground">{u.serialNumber}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[u.status] || "outline"} className="capitalize">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{u.conditionGrade}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {u.conditionNotes || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {u.soldAt ? new Date(u.soldAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(u)} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(u)} aria-label="Delete">
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

      <UnitFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        saving={saving}
      />

      <UnitFormDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
        initial={editing}
        saving={saving}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove unit</DialogTitle>
            <DialogDescription>
              Delete unit &quot;{deleteTarget?.serialNumber}&quot;?
              Only available units can be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Remove unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
