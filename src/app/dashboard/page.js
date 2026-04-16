"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
  { label: "Orders", value: "0", icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
  { label: "Wishlist", value: "0", icon: Heart, color: "text-pink-600 bg-pink-100" },
  { label: "Sessions", value: "—", icon: MonitorSmartphone, color: "text-emerald-600 bg-emerald-100" },
];

const quickActions = [
  { label: "My Orders", href: "#", icon: ShoppingBag, description: "Track and manage orders" },
  { label: "Saved Addresses", href: "#", icon: MapPin, description: "Manage delivery addresses" },
  { label: "Active Sessions", href: "/dashboard/sessions", icon: MonitorSmartphone, description: "View and revoke sessions" },
  { label: "Account Settings", href: "#", icon: Settings, description: "Update your preferences" },
];

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Welcome header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarImage src={user?.avatarUrl} alt={user?.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {(user?.name || "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s an overview of your account
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Profile card */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Email</span>
              <span className="ml-auto font-medium truncate">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Phone</span>
              <span className="ml-auto font-medium">{user?.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Auth</span>
              <span className="ml-auto font-medium capitalize">{user?.authProvider || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Role</span>
              <span className="ml-auto font-medium capitalize">{user?.role || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="lg:col-span-3 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="h-full shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                <CardContent className="flex items-center gap-3 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
