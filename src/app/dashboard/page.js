"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              {user?.name || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              {user?.email || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {user?.phone || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Auth:</span>{" "}
              {user?.authProvider || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>{" "}
              {user?.role || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Manage your active sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sessions">
              <Button variant="outline" className="w-full">
                View sessions
              </Button>
            </Link>
          </CardContent>
        </Card>
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
