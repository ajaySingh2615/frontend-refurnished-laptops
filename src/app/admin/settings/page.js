"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/page-header";

const SECTIONS = [
  {
    title: "Business identity",
    description: "How your shop appears on invoices and public pages.",
    fields: [
      { key: "shopName", label: "Shop name", type: "text" },
      { key: "invoicePrefix", label: "Invoice prefix", type: "text", placeholder: "INV-" },
    ],
  },
  {
    title: "Tax details",
    description: "Statutory information for tax compliance.",
    fields: [
      { key: "gstin", label: "GSTIN", type: "text", placeholder: "22AAAAA0000A1Z5" },
      { key: "pan", label: "PAN", type: "text", placeholder: "AAAAA0000A" },
    ],
  },
  {
    title: "Address & contact",
    description: "Used in invoices, communication and shipping origin.",
    fields: [
      { key: "address", label: "Address", type: "textarea", colSpan: 2 },
      { key: "state", label: "State", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "email", colSpan: 2 },
    ],
  },
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        eyebrow="Settings"
        title="Shop & legal settings"
        description="Manage your store identity and tax details. These are used in invoices and on public pages."
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-border bg-card"
            >
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                {section.fields.map((f) => (
                  <div
                    key={f.key}
                    className={`space-y-1.5 ${f.colSpan === 2 ? "sm:col-span-2" : ""}`}
                  >
                    <Label htmlFor={f.key} className="text-xs font-medium text-foreground">
                      {f.label}
                    </Label>
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
              </div>
            </section>
          ))}

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
