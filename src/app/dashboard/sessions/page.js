"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

function SessionsContent() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/sessions");
      const json = await res.json();

      if (res.ok) {
        setSessions(json.data || []);
      } else {
        setError(json.message || "Failed to load sessions");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleRevoke(sessionId) {
    setActionLoading(sessionId);
    setError("");

    try {
      const res = await apiFetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        const json = await res.json();
        setError(json.message || "Failed to revoke session");
      }
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevokeOthers() {
    setActionLoading("others");
    setError("");

    try {
      const { getRefreshToken } = await import("@/lib/api");
      const refreshToken = getRefreshToken();

      const res = await apiFetch("/api/auth/sessions/others", {
        method: "DELETE",
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        await fetchSessions();
      } else {
        const json = await res.json();
        setError(json.message || "Failed to revoke other sessions");
      }
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-muted-foreground">Loading sessions...</div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You can have up to 2 active sessions
          </p>
        </div>

        {sessions.length > 1 && (
          <Button
            variant="destructive"
            size="sm"
            disabled={actionLoading === "others"}
            onClick={handleRevokeOthers}
          >
            {actionLoading === "others" ? "Revoking..." : "Revoke all others"}
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-4">
        {sessions.length === 0 && (
          <p className="text-muted-foreground text-sm">No active sessions.</p>
        )}

        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {session.deviceInfo
                  ? session.deviceInfo.slice(0, 60) +
                    (session.deviceInfo.length > 60 ? "..." : "")
                  : "Unknown device"}
                <Badge variant="outline" className="text-xs font-normal">
                  {session.ipAddress || "—"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Last active: {formatDate(session.lastActiveAt)} &middot;
                Created: {formatDate(session.createdAt)} &middot;
                Expires: {formatDate(session.expiresAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading === session.id}
                onClick={() => handleRevoke(session.id)}
              >
                {actionLoading === session.id ? "Revoking..." : "Revoke"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}
