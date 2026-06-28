/**
 * hooks/use-auth.ts — Admin authentication hook.
 *
 * Manages admin session state using sessionStorage.
 * Token is stored client-side only (no cookies) since
 * GitHub Pages cannot set HTTP-only cookies.
 *
 * Security model:
 * - Token is validated on EVERY admin API request by Apps Script
 * - sessionStorage clears on browser close (no persistent session)
 * - Token expiry is enforced server-side in Apps Script
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminUser, LoginCredentials } from "@/types";
import { authApi } from "@/lib/api";

const TOKEN_KEY = "mbn_admin_token";

interface UseAuthReturn {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        const parsed: AdminUser = JSON.parse(stored);
        // Check if token is expired
        if (new Date(parsed.expiresAt) > new Date()) {
          setUser(parsed);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(
        credentials.username,
        credentials.password
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Login gagal");
      }

      const adminUser: AdminUser = {
        username: credentials.username,
        token: response.data.token,
        expiresAt: response.data.expiresAt,
      };

      sessionStorage.setItem(TOKEN_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    error,
  };
}
