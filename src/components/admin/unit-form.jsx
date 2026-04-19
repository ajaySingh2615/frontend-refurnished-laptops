"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUSES = ["available", "sold", "reserved", "returned", "defective"];
const GRADES = ["A+", "A", "B+", "B", "C"];

export function UnitFormDialog({ open, onClose, onSubmit, initial, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    serialNumber: "",
    conditionGrade: "A",
    conditionNotes: "",
    status: "available",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        serialNumber: initial.serialNumber || "",
        conditionGrade: initial.conditionGrade || "A",
        conditionNotes: initial.conditionNotes || "",
        status: initial.status || "available",
      });
    } else {
      setForm({ serialNumber: "", conditionGrade: "A", conditionNotes: "", status: "available" });
    }
  }, [initial, open]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit unit" : "Add unit"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = { ...form };
            if (isEdit) {
              delete payload.serialNumber;
            }
            onSubmit(payload);
          }}
          className="space-y-4"
        >
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Serial number <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
                required
                className="font-mono"
              />
            </div>
          )}
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Condition grade <span className="text-destructive">*</span>
              </Label>
              <Select value={form.conditionGrade} onValueChange={(v) => handleChange("conditionGrade", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Notes</Label>
            <Textarea
              value={form.conditionNotes}
              onChange={(e) => handleChange("conditionNotes", e.target.value)}
              rows={2}
              placeholder="Cosmetic notes, defects, accessories..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update unit" : "Add unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
