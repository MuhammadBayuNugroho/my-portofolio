/**
 * src/lib/api.ts — API Client Layer with Fallback Repository Pattern
 *
 * This module acts as the Single Source of Truth for data access.
 *
 * Key Architecture Decisions:
 * - If NEXT_PUBLIC_GAS_BASE_URL is not set or contains "YOUR_SCRIPT_ID",
 *   the system automatically uses local high-quality dummy data (DUMMY_*).
 * - All response schemas are unified using the ApiResponse<T> interface.
 * - SWR caching on the frontend handles data revalidation.
 */

import type { Project, Blog, ApiResponse } from "@/types";
import {
  DUMMY_PROJECTS,
  DUMMY_BLOGS,
} from "@/data/dummy";

const BASE_URL = process.env.NEXT_PUBLIC_GAS_BASE_URL ?? "";
const IS_REAL_API = BASE_URL && !BASE_URL.includes("YOUR_SCRIPT_ID");

// ─────────────────────────────────────────────────────────────────
// DUMMY SIMULATOR SYSTEM
// ─────────────────────────────────────────────────────────────────
async function simulateNetwork<T>(data: T): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
      });
    }, 150); // Simulate network latency
  });
}

// ─────────────────────────────────────────────────────────────────
// HTTP CLIENT
// ─────────────────────────────────────────────────────────────────
async function apiFetch<T>(
  action: string,
  options: { method?: "GET" | "POST"; body?: unknown; token?: string } = {}
): Promise<ApiResponse<T>> {
  if (!IS_REAL_API) {
    throw new Error("No real API base URL set");
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("action", action);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────
// REPOSITORY IMPLEMENTATION (Fallback to Local/SSG Dummy Data)
// ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (username: string, password: string) => {
    if (IS_REAL_API) {
      return apiFetch<{ token: string; expiresAt: string }>("login", {
        method: "POST",
        body: { username, password },
      });
    }
    // Static Login simulation for testing admin panels
    if (username === "admin" && password === "admin") {
      return simulateNetwork({
        token: "fake-jwt-token-mbn-12345",
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours expiry
      });
    }
    throw new Error("Kredensial salah (Lokal dev default: admin/admin)");
  },
};

export const projectsApi = {
  getAll: async (params?: { category?: string }): Promise<ApiResponse<Project[]>> => {
    if (IS_REAL_API) {
      try {
        const query = params?.category ? `&category=${params.category}` : "";
        return await apiFetch<Project[]>(`get_projects${query}`);
      } catch {
        // Fallback gracefully on network/cors failure
        return simulateNetwork(DUMMY_PROJECTS);
      }
    }
    return simulateNetwork(DUMMY_PROJECTS);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Project>(`get_project_by_slug&slug=${slug}`);
      } catch {
        const found = DUMMY_PROJECTS.find((p) => p.slug === slug);
        if (!found) throw new Error("Project not found");
        return simulateNetwork(found);
      }
    }
    const found = DUMMY_PROJECTS.find((p) => p.slug === slug);
    if (!found) throw new Error("Project not found");
    return simulateNetwork(found);
  },

  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_project", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Project created in simulator" });
  },

  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_project", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Project updated in simulator" });
  },

  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_project", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Project deleted in simulator" });
  },
};

export const blogsApi = {
  getAll: async (): Promise<ApiResponse<Blog[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Blog[]>("get_blogs");
      } catch {
        return simulateNetwork(DUMMY_BLOGS);
      }
    }
    return simulateNetwork(DUMMY_BLOGS);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Blog>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Blog>(`get_blog_by_slug&slug=${slug}`);
      } catch {
        const found = DUMMY_BLOGS.find((b) => b.slug === slug);
        if (!found) throw new Error("Blog not found");
        return simulateNetwork(found);
      }
    }
    const found = DUMMY_BLOGS.find((b) => b.slug === slug);
    if (!found) throw new Error("Blog not found");
    return simulateNetwork(found);
  },
};

export const contactApi = {
  sendMessage: async (data: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }) => {
    if (IS_REAL_API) {
      return apiFetch("send_message", { method: "POST", body: data });
    }
    return simulateNetwork({ message: "Pesan terkirim di simulator" });
  },
};
