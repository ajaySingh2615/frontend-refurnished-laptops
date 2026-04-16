"use client";

import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </AuthProvider>
  );
}
