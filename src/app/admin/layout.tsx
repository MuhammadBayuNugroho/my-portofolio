"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  // Default: buka sidebar otomatis di desktop setelah mount
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-body-lg text-foreground-muted">Sesi Anda tidak valid / belum masuk.</p>
        <a
          href="/admin"
          className="px-4 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          Masuk Sekarang
        </a>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* ── Sidebar ─────────────────────────────── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Mobile backdrop overlay ──────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main content — shifts right on desktop ── */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : ""
        )}
      >
        {/* Admin Top Header */}
        <header className="h-14 sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-background-elevated">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-foreground-muted hover:bg-background-overlay hover:text-foreground transition-colors cursor-pointer"
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <Menu size={18} />
          </button>
          <span className="text-xs font-semibold text-foreground-muted tracking-wide">
            Admin Panel
          </span>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 lg:p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
