"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { LogOut, Shield, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  return (
    <aside className="w-64 border-r border-border bg-background-elevated min-h-screen flex flex-col justify-between sticky top-0">
      {/* Header */}
      <div>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border/60">
          <Shield className="text-accent" size={20} />
          <span className="font-display font-bold text-caption text-foreground tracking-tight">
            Admin Panel e Mas Bayu
          </span>
        </div>

        {/* User profile tag */}
        {user && (
          <div className="p-4 mx-4 mt-4 rounded-lg bg-background-overlay border border-border/40 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
              <span className="text-[9px] text-accent uppercase font-bold">Administrator</span>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav className="flex flex-col gap-1 p-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-md text-xs font-medium transition-colors hover:bg-background-overlay hover:text-foreground",
                  isActive ? "bg-background-overlay text-foreground font-bold" : "text-foreground-muted"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-border/60 flex flex-col gap-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-md text-xs font-medium text-foreground-muted hover:bg-background-overlay hover:text-foreground transition-colors"
        >
          <Compass size={16} />
          Kembali ke Web
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 rounded-md text-xs font-medium text-error hover:bg-error/10 transition-colors cursor-pointer text-left"
        >
          <LogOut size={16} />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
}
