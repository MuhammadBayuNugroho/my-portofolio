"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { LogOut, Shield, Compass, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  return (
    <aside className="w-64 border-r border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#0B0B0C] min-h-screen flex flex-col justify-between sticky top-0">
      {/* Header */}
      <div>
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Shield size={16} />
          </div>
          <span className="font-display font-bold text-xs text-foreground tracking-tight uppercase">
            Admin Panel
          </span>
        </div>

        {/* User profile tag */}
        {user && (
          <div className="p-3.5 mx-4 mt-5 rounded-xl bg-background-overlay/60 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user.username.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
              <span className="text-[9px] text-foreground-muted/80 uppercase font-semibold tracking-wider">Administrator</span>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav className="flex flex-col gap-1 px-3 py-5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent/8 text-accent font-semibold border-l-2 border-accent rounded-l-none"
                    : "text-foreground-muted hover:bg-background-overlay hover:text-foreground"
                )}
              >
                <item.icon size={15} className={cn(isActive ? "text-accent" : "text-foreground-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col gap-1.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-foreground-muted hover:bg-background-overlay hover:text-foreground transition-all duration-200"
        >
          <Compass size={15} />
          Kembali ke Web
        </Link>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-foreground-muted hover:bg-background-overlay hover:text-foreground transition-all duration-200 cursor-pointer text-left"
            aria-label="Toggle tema"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-error hover:bg-error/8 transition-all duration-200 cursor-pointer text-left"
        >
          <LogOut size={15} />
          Keluar Sesi
        </button>
      </div>

    </aside>
  );
}
