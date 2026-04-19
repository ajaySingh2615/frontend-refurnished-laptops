"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MonitorSmartphone, Clock } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

function SessionsContent() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/sessions");
      const json = await res.json();
      if (res.ok) setSessions(json.data || []);
      else setError(json.message || "Failed to load sessions");
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
      if (res.ok) await fetchSessions();
      else {
        const json = await res.json();
        setError(json.message || "Failed to revoke other sessions");
      }
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-tight text-foreground">
            Active sessions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You can have up to 2 active sessions at a time.
          </p>
        </div>

        {sessions.length > 1 && (
          <Button
            variant="destructive-outline"
            size="sm"
            disabled={actionLoading === "others"}
            onClick={handleRevokeOthers}
          >
            {actionLoading === "others" ? "Revoking..." : "Revoke all others"}
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        )}

        {!loading && sessions.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active sessions.
          </p>
        )}

        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
              <MonitorSmartphone className="h-4 w-4" strokeWidth={1.6} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate max-w-xs">
                  {session.deviceInfo
                    ? session.deviceInfo.slice(0, 50) +
                      (session.deviceInfo.length > 50 ? "..." : "")
                    : "Unknown device"}
                </p>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {session.ipAddress || "—"}
                </Badge>
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last active {formatDate(session.lastActiveAt)}
                </span>
                <span>· Created {formatDate(session.createdAt)}</span>
              </p>
            </div>

            <Button
              variant="destructive-outline"
              size="sm"
              disabled={actionLoading === session.id}
              onClick={() => handleRevoke(session.id)}
            >
              {actionLoading === session.id ? "..." : "Revoke"}
            </Button>
          </div>
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
