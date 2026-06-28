"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setFormError("Username dan password wajib diisi.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      await login({ username, password });
      router.push("/admin/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Kredensial login salah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent_45%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted/20 border border-accent/20 text-accent mb-3">
            <Lock size={20} />
          </div>
          <h1 className="font-display text-h2 text-foreground font-bold">Admin Portal</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Silakan masuk untuk mengelola portofolio Anda.
          </p>
        </div>

        <Card className="p-8 shadow-card dark:shadow-dark-card" hoverEffect={false}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error notifications */}
            {(formError || error) && (
              <div className="rounded-md bg-error/10 border border-error/20 p-3 text-xs text-error flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Username field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-foreground-muted">Username</label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-2 pl-10 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                  placeholder="admin"
                  required
                />
                <User className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4" />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground-muted">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-2 pl-10 pr-10 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-foreground-subtle hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? "Sedang Masuk..." : "Masuk ke Dashboard"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
