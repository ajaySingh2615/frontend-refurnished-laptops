"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Search, Ban, CheckCircle2, Shield } from "lucide-react";

const ROLES = [
  { value: "all", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "all", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [banTarget, setBanTarget] = useState(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.role !== "all") params.set("role", filters.role);
        if (filters.search) params.set("search", filters.search);
        const res = await apiFetch(`/api/admin/users?${params.toString()}`);
        const json = await res.json();
        if (res.ok) setState(json.data);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  async function toggleBan() {
    if (!banTarget) return;
    setActing(true);
    try {
      const path = banTarget.isBanned
        ? `/api/admin/users/${banTarget.id}/unban`
        : `/api/admin/users/${banTarget.id}/ban`;
      const res = await apiFetch(path, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Operation failed");
        return;
      }
      toast.success(banTarget.isBanned ? "User unbanned" : "User banned");
      setBanTarget(null);
      load(state.page);
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Users"
        description="All registered users. Ban to immediately revoke access; unban to restore."
      />

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setFilters((f) => ({ ...f, search: searchInput.trim() }));
            }}
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email or phone"
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
            {filters.search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setFilters((f) => ({ ...f, search: "" }));
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <div className="flex gap-1.5">
            {ROLES.map((r) => {
              const active = filters.role === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, role: r.value }))
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Lifetime value</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : state.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-sm font-medium">No users match your filters</p>
                </TableCell>
              </TableRow>
            ) : (
              state.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {(u.name || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {u.name || "—"}
                          {u.id === me?.id && (
                            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        {u.isBanned && (
                          <Badge variant="destructive" className="mt-0.5">
                            Banned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{u.email || "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {u.phone || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {u.role === "admin" ? (
                      <Badge variant="accent">
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Customer</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.orderCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatINR(u.totalSpent)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id === me?.id ? (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    ) : u.role === "admin" ? (
                      <span className="text-[11px] text-muted-foreground">
                        Protected
                      </span>
                    ) : u.isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBanTarget(u)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Unban
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBanTarget(u)}
                      >
                        <Ban className="h-3.5 w-3.5" /> Ban
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {state.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {state.page} of {state.totalPages} · {state.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={state.page <= 1}
              onClick={() => load(state.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={state.page >= state.totalPages}
              onClick={() => load(state.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={!!banTarget}
        onOpenChange={(v) => !v && setBanTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banTarget?.isBanned ? "Unban user" : "Ban user"}
            </DialogTitle>
            <DialogDescription>
              {banTarget?.isBanned ? (
                <>Restore access for <strong>{banTarget?.name || banTarget?.email}</strong>?</>
              ) : (
                <>
                  Revoke access for <strong>{banTarget?.name || banTarget?.email}</strong>?
                  They will be immediately signed out and unable to sign in again.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={banTarget?.isBanned ? "default" : "destructive"}
              onClick={toggleBan}
              disabled={acting}
            >
              {acting
                ? "Working..."
                : banTarget?.isBanned
                  ? "Unban user"
                  : "Ban user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
