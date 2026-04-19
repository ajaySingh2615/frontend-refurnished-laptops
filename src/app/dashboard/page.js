"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Heart,
  MonitorSmartphone,
  MapPin,
  Settings,
  ChevronRight,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

const stats = [
  { label: "Orders", value: "0", icon: ShoppingBag },
  { label: "Wishlist", value: "0", icon: Heart },
  { label: "Active sessions", value: "—", icon: MonitorSmartphone },
];

const quickActions = [
  {
    label: "My orders",
    href: "#",
    icon: ShoppingBag,
    description: "Track and manage your orders",
  },
  {
    label: "Saved addresses",
    href: "#",
    icon: MapPin,
    description: "Manage delivery addresses",
  },
  {
    label: "Active sessions",
    href: "/dashboard/sessions",
    icon: MonitorSmartphone,
    description: "View and revoke sessions",
  },
  {
    label: "Account settings",
    href: "#",
    icon: Settings,
    description: "Update your preferences",
  },
];

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-1 ring-border">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback className="bg-foreground text-background text-base font-medium">
              {(user?.name || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground">
              Welcome, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your orders, addresses and account.
            </p>
          </div>
        </div>

        {user?.role === "admin" && (
          <Link href="/admin">
            <Badge variant="outline" className="gap-1.5 border-foreground/20 px-2.5 py-1 text-xs">
              <Shield className="h-3 w-3" />
              Admin panel →
            </Badge>
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-start justify-between bg-card p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-3xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
            <stat.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Your account details</p>
          </div>
          <dl className="divide-y divide-border text-sm">
            <ProfileRow icon={Mail} label="Email" value={user?.email || "—"} />
            <ProfileRow icon={Phone} label="Phone" value={user?.phone || "—"} />
            <ProfileRow
              icon={Shield}
              label="Auth method"
              value={user?.authProvider || "—"}
              capitalize
            />
            <ProfileRow
              icon={Settings}
              label="Role"
              value={user?.role || "—"}
              capitalize
            />
          </dl>
        </div>

        <div className="lg:col-span-3">
          <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick actions
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <action.icon className="h-4.5 w-4.5" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`ml-auto truncate text-sm font-medium text-foreground ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
