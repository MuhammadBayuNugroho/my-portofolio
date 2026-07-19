/**
 * use-auth.ts — Convenience hook for consuming the AuthContext.
 *
 * Exposes the same interface as useAuthContext() but provides a stable
 * import path for all consumer components. If auth logic ever grows
 * (e.g., adding token refresh or role-based checks), it can be added
 * here without touching each consumer file.
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading, logout } = useAuth();
 */

import { useAuthContext } from "@/context/auth-context";

export function useAuth() {
  return useAuthContext();
}
