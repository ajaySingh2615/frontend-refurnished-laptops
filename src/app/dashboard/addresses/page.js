"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AddressForm } from "@/components/account/address-form";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";

function AddressesContent() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/addresses");
      if (res.ok) {
        const json = await res.json();
        setAddresses(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm("Delete this address?")) return;
    const res = await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Address deleted");
      load();
    } else {
      toast.error("Could not delete address");
    }
  }

  async function handleSetDefault(id) {
    const res = await apiFetch(`/api/addresses/${id}/default`, { method: "POST" });
    if (res.ok) {
      toast.success("Default address updated");
      load();
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Account</p>
          <h1 className="mt-1 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight">
            Saved addresses
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage where your orders get delivered.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {showForm && (
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">
            {editing ? "Edit address" : "New address"}
          </h2>
          <AddressForm
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              load();
            }}
          />
        </section>
      )}

      <section className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No addresses yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your first delivery address to speed up checkout.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <article
                key={a.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {a.label && (
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {a.label}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {a.fullName}
                    </p>
                  </div>
                  {a.isDefault && (
                    <Badge variant="success" className="gap-1">
                      <Star className="h-3 w-3" /> Default
                    </Badge>
                  )}
                </div>

                <div className="mt-2 text-sm text-foreground">
                  <p>{a.addressLine1}</p>
                  {a.addressLine2 && <p>{a.addressLine2}</p>}
                  <p>
                    {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className="mt-1 text-muted-foreground">{a.phone}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {!a.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(a.id)}
                    >
                      Make default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(a);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(a.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressesContent />
    </ProtectedRoute>
  );
}
