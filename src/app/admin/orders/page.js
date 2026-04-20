"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatINR, formatDateTime } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
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
import { Search, Filter } from "lucide-react";

const STATUSES = [
  "all",
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_desc", label: "Amount: high → low" },
  { value: "amount_asc", label: "Amount: low → high" },
];

export default function AdminOrdersPage() {
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sort: "newest",
  });
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        params.set("sort", filters.sort);
        if (filters.status !== "all") params.set("status", filters.status);
        if (filters.search) params.set("search", filters.search);
        const res = await apiFetch(`/api/admin/orders?${params.toString()}`);
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Store"
        title="Orders"
        description="All customer orders. Click a row to view details, update status, or cancel."
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
                placeholder="Order #, customer name/email/phone"
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              <Filter className="mr-1 inline h-3 w-3" /> Sort
            </span>
            <select
              className="h-9 rounded-md border border-border bg-background px-2 text-xs"
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value }))
              }
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = filters.status === s;
            return (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, status: s }))}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : state.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <p className="text-sm font-medium">No orders match your filters</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try clearing filters or changing the search term.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              state.items.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/admin/orders/${order.id}`;
                  }}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.user?.name || "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {order.user?.email || order.user?.phone || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(order.placedAt)}
                  </TableCell>
                  <TableCell>
                    {order.payment ? (
                      <Badge
                        variant={
                          order.payment.status === "paid"
                            ? "success"
                            : order.payment.status === "failed"
                              ? "destructive"
                              : order.payment.status === "refunded"
                                ? "secondary"
                                : "warning"
                        }
                      >
                        {order.payment.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">none</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatINR(order.grandTotal)}
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
            Showing {state.items.length} of {state.total} orders · Page {state.page} of {state.totalPages}
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
    </div>
  );
}
