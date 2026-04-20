"use client";

import { toast } from "sonner";
import { apiFetch } from "./api";

/**
 * Fetches the server-rendered invoice HTML (requires auth) and opens it in a
 * new tab using a blob URL. This is necessary because print links can't send
 * the JWT in a cross-origin `<a href>`.
 */
export async function openInvoicePrint(orderId, { admin = false } = {}) {
  const path = admin
    ? `/api/admin/orders/${orderId}/invoice/print`
    : `/api/orders/${orderId}/invoice/print`;

  const res = await apiFetch(path);
  if (!res.ok) {
    try {
      const err = await res.json();
      toast.error(err.message || "Could not load invoice");
    } catch {
      toast.error("Could not load invoice");
    }
    return;
  }

  const html = await res.text();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener");
  if (!win) toast.error("Pop-up blocked. Please allow pop-ups to view invoice.");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
