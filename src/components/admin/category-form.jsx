"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryForm({ initial, parents, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    name: "",
    parentId: "",
    description: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true,
    ...initial,
  });

  useEffect(() => {
    if (initial) setForm((prev) => ({ ...prev, ...initial }));
  }, [initial]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload = { ...form };
        if (!payload.parentId) delete payload.parentId;
        onSubmit(payload);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Parent Category</Label>
        <Select
          value={form.parentId || "none"}
          onValueChange={(v) => handleChange("parentId", v === "none" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="None (top-level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top-level)</SelectItem>
            {parents.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Image URL</Label>
        <Input
          value={form.imageUrl || ""}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => handleChange("isActive", v)}
          />
          <Label>Active</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initial?.id ? "Update" : "Create"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
