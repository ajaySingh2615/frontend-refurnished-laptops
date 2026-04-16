"use client";

import { use, useEffect, useState, useCallback } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { UnitFormDialog } from "@/components/admin/unit-form";

const statusColors = {
  available: "default",
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

  if (loading) {
    return <p className="text-muted-foreground">Loading units...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
          Serial Units
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Sold At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No units tracked for this variant
                  </TableCell>
                </TableRow>
              ) : (
                units.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-sm">{u.serialNumber}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[u.status] || "outline"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.conditionGrade}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {u.conditionNotes || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.soldAt ? new Date(u.soldAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(u)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            <DialogTitle>Remove Unit</DialogTitle>
            <DialogDescription>
              Delete unit &quot;{deleteTarget?.serialNumber}&quot;?
              Only available units can be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
