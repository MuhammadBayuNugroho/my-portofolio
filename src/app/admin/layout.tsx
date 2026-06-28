"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // If on login page, render children directly without sidebar
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protecting sub-routes
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
    <div className="flex bg-background min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 bg-background">
        <div className="p-8 md:p-10">{children}</div>
      </div>
    </div>
  );
}
