"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const parents = categories.filter((c) => !c.parentId);

  async function handleCreate(data) {
    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Category created");
        setShowForm(false);
        load();
      } else {
        toast.error(json.message || "Failed to create");
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
      const res = await apiFetch(`/api/admin/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Category updated");
        setEditing(null);
        load();
      } else {
        toast.error(json.message || "Failed to update");
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
      const res = await apiFetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Category deleted");
        setDeleteTarget(null);
        load();
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading categories...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
          Categories
        </h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {(showForm || editing) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editing ? "Edit Category" : "New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              initial={editing || undefined}
              parents={parents.filter((p) => p.id !== editing?.id)}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No categories yet
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => {
                  const parent = categories.find((c) => c.id === cat.parentId);
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {cat.slug}
                      </TableCell>
                      <TableCell>{parent?.name || "—"}</TableCell>
                      <TableCell className="text-center">{cat.sortOrder}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cat.isActive ? "default" : "secondary"}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditing(cat); setShowForm(false); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(cat)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
