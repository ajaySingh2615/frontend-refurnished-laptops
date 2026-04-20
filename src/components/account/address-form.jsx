"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const emptyAddress = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export function AddressForm({ initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState(() => ({ ...emptyAddress, ...(initial || {}) }));
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        label: form.label || "",
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || "",
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        isDefault: !!form.isDefault,
      };
      const res = await apiFetch(
        isEdit ? `/api/addresses/${initial.id}` : "/api/addresses",
        {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Failed to save address");
        return;
      }
      toast.success(isEdit ? "Address updated" : "Address added");
      onSaved?.(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
        </Field>
        <Field label="Phone" required>
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
        </Field>

        <Field label="Address line 1" required span={2}>
          <Input
            value={form.addressLine1}
            onChange={(e) => update("addressLine1", e.target.value)}
            required
          />
        </Field>
        <Field label="Address line 2" span={2}>
          <Input
            value={form.addressLine2}
            onChange={(e) => update("addressLine2", e.target.value)}
          />
        </Field>

        <Field label="City" required>
          <Input value={form.city} onChange={(e) => update("city", e.target.value)} required />
        </Field>
        <Field label="State" required>
          <Input value={form.state} onChange={(e) => update("state", e.target.value)} required />
        </Field>
        <Field label="Pincode" required>
          <Input
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value)}
            inputMode="numeric"
            maxLength={6}
            required
          />
        </Field>
        <Field label="Label (optional)">
          <Input
            value={form.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Home, Office..."
          />
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Set as default</p>
          <p className="text-xs text-muted-foreground">
            Default address is pre-selected at checkout.
          </p>
        </div>
        <Switch
          checked={!!form.isDefault}
          onCheckedChange={(v) => update("isDefault", v)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update address" : "Save address"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, span, children }) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
