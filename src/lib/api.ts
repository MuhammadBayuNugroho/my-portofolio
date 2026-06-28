/**
 * src/lib/api.ts — API Client Layer with Fallback Repository Pattern
 *
 * This module acts as the Single Source of Truth for data access.
 */

import type {
  Project,
  Blog,
  Skill,
  Experience,
  Certificate,
  Testimonial,
  ContactMessage,
  SiteSetting,
  ApiResponse
} from "@/types";
import {
  DUMMY_PROJECTS,
  DUMMY_BLOGS,
  DUMMY_SKILLS,
  DUMMY_EXPERIENCE,
  DUMMY_CERTIFICATES,
  DUMMY_TESTIMONIALS
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
// REPOSITORY IMPLEMENTATION
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
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    throw new Error("Kredensial salah (Lokal dev default: admin/admin)");
  },
};

export const settingsApi = {
  getAll: async (): Promise<ApiResponse<SiteSetting[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<SiteSetting[]>("get_settings");
      } catch {
        return simulateNetwork([
          { key: "site_name", value: "Muhammad Bayu Nugroho", type: "text" },
          { key: "bio_title", value: "Lead Frontend Developer", type: "text" }
        ]);
      }
    }
    return simulateNetwork([
      { key: "site_name", value: "Muhammad Bayu Nugroho", type: "text" },
      { key: "bio_title", value: "Lead Frontend Developer", type: "text" }
    ]);
  },
  upsert: async (data: { key: string; value: string; description?: string; type: string }, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("upsert_setting", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Setting updated in simulator" });
  }
};

export const skillsApi = {
  getAll: async (): Promise<ApiResponse<Skill[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Skill[]>("get_skills");
      } catch {
        return simulateNetwork(DUMMY_SKILLS);
      }
    }
    return simulateNetwork(DUMMY_SKILLS);
  },
  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_skill", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Skill created in simulator" });
  },
  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_skill", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Skill updated in simulator" });
  },
  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_skill", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Skill deleted in simulator" });
  }
};

export const projectsApi = {
  getAll: async (params?: { category?: string }): Promise<ApiResponse<Project[]>> => {
    if (IS_REAL_API) {
      try {
        const query = params?.category ? `&category=${params.category}` : "";
        return await apiFetch<Project[]>(`get_projects${query}`);
      } catch {
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

export const experiencesApi = {
  getAll: async (): Promise<ApiResponse<Experience[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Experience[]>("get_experiences");
      } catch {
        return simulateNetwork(DUMMY_EXPERIENCE);
      }
    }
    return simulateNetwork(DUMMY_EXPERIENCE);
  },
  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_experience", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Experience created in simulator" });
  },
  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_experience", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Experience updated in simulator" });
  },
  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_experience", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Experience deleted in simulator" });
  }
};

export const certificatesApi = {
  getAll: async (): Promise<ApiResponse<Certificate[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Certificate[]>("get_certificates");
      } catch {
        return simulateNetwork(DUMMY_CERTIFICATES);
      }
    }
    return simulateNetwork(DUMMY_CERTIFICATES);
  },
  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_certificate", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Certificate created in simulator" });
  },
  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_certificate", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Certificate updated in simulator" });
  },
  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_certificate", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Certificate deleted in simulator" });
  }
};

export const testimonialsApi = {
  getAll: async (): Promise<ApiResponse<Testimonial[]>> => {
    if (IS_REAL_API) {
      try {
        return await apiFetch<Testimonial[]>("get_testimonials");
      } catch {
        return simulateNetwork(DUMMY_TESTIMONIALS);
      }
    }
    return simulateNetwork(DUMMY_TESTIMONIALS);
  },
  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_testimonial", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Testimonial created in simulator" });
  },
  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_testimonial", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Testimonial updated in simulator" });
  },
  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_testimonial", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Testimonial deleted in simulator" });
  }
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

  create: async (data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("create_blog", { method: "POST", body: data, token });
    }
    return simulateNetwork({ message: "Blog created in simulator" });
  },

  update: async (id: string, data: unknown, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("update_blog", { method: "POST", body: { id, ...data as object }, token });
    }
    return simulateNetwork({ message: "Blog updated in simulator" });
  },

  delete: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("delete_blog", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Blog deleted in simulator" });
  }
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
  
  getMessages: async (token: string): Promise<ApiResponse<ContactMessage[]>> => {
    if (IS_REAL_API) {
      return apiFetch<ContactMessage[]>("get_messages", { method: "POST", token });
    }
    return simulateNetwork([]);
  },
  
  markRead: async (id: string, token: string) => {
    if (IS_REAL_API) {
      return apiFetch("mark_message_read", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ message: "Message marked as read" });
  }
};

export const mediaApi = {
  upload: async (
    data: { filename: string; mimeType: string; base64Content: string; subfolder?: string },
    token: string
  ) => {
    if (IS_REAL_API) {
      return apiFetch<{ url: string; fileId: string }>("upload_file", {
        method: "POST",
        body: data,
        token,
      });
    }
    return simulateNetwork({ url: "https://lh3.googleusercontent.com/d/dummy-uploaded-file-id", fileId: "dummy-uploaded-file-id" });
  },
};
