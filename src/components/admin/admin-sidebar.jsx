"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  FolderTree,
  Package,
  Warehouse,
  ShoppingBag,
  Percent,
  Truck,
  Users,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Store",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/tax-rates", label: "Tax rates", icon: Percent },
      { href: "/admin/shipping-methods", label: "Shipping", icon: Truck },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/settings", label: "Shop settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-dm-sans)] text-base font-semibold tracking-tight text-foreground"
          >
            Refurbished<span className="text-muted-foreground">Admin</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-5 pb-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      strokeWidth={1.6}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>
        </div>
      </aside>
    </>
  );
}
