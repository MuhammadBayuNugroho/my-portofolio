"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AdminUser, LoginCredentials } from "@/types";
import { authApi } from "@/lib/api";

const TOKEN_KEY = "mbn_admin_token";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        const parsed: AdminUser = JSON.parse(stored);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
