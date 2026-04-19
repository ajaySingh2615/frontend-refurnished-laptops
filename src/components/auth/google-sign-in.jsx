"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/lib/constants";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-gsi-script");

    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google script")),
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

export function GoogleSignIn() {
  const containerRef = useRef(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });

        const contentType = res.headers.get("content-type") || "";
        const json = contentType.includes("application/json") ? await res.json() : null;

        if (!res.ok) {
          const message = json?.message || `Google auth failed (${res.status})`;
          console.error(message);
          return;
        }

        login(json.data);
        router.push("/dashboard");
      } catch (err) {
        console.error("Google auth error:", err);
      }
    },
    [login, router]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;

        // Avoid duplicate initialize/render issues during Fast Refresh
        containerRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "rectangular",
        });
      })
      .catch((err) => {
        console.error("Google script load error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [handleCredentialResponse]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
        Google Sign-In not configured
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center [&>div]:!w-full [&_iframe]:!w-full" />;
}
