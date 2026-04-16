"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = [
  { key: "shopName", label: "Shop Name", type: "text" },
  { key: "gstin", label: "GSTIN", type: "text", placeholder: "22AAAAA0000A1Z5" },
  { key: "pan", label: "PAN", type: "text", placeholder: "AAAAA0000A" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "state", label: "State", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "invoicePrefix", label: "Invoice Prefix", type: "text", placeholder: "INV-" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/shop-settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data) setForm(json.data);
        }
      } catch {
        // empty form if no settings yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/shop-settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Settings saved");
        if (json.data) setForm(json.data);
      } else {
        toast.error(json.message || "Failed to save settings");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
        Shop &amp; Legal Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    value={form[f.key] || ""}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || ""}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={f.key}
                    type={f.type}
                    value={form[f.key] || ""}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder || ""}
                  />
                )}
              </div>
            ))}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
