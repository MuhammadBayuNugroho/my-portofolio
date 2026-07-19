/**
 * src/lib/api.ts — API Client Layer
 *
 * Berkomunikasi dengan backend Google Apps Script (GAS).
 *
 * ⚠️ CATATAN PENTING ARSITEKTUR GAS + CORS:
 * Google Apps Script Web App TIDAK mendukung CORS preflight (OPTIONS request).
 * Ini berarti:
 * 1. POST request TIDAK BOLEH menggunakan custom header "Content-Type: application/json"
 *    karena akan memicu preflight → CORS error.
 * 2. Solusi: kirim body sebagai JSON string tanpa meng-set Content-Type secara manual
 *    (browser akan menganggap ini sebagai "simple request" dan tidak kirim preflight).
 * 3. Token auth dikirim via URL query param (?token=...) bukan Authorization header.
 * 4. GET request normal, aman, tidak ada CORS issue.
 *
 * Referensi: https://developers.google.com/apps-script/guides/web#request_parameters
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

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_GAS_BASE_URL ?? "";

/**
 * IS_REAL_API — true jika env var sudah dikonfigurasi dengan benar.
 * Jika false, semua API call menggunakan fallback simulator (data kosong).
 */
const IS_REAL_API = Boolean(
  BASE_URL &&
  BASE_URL.trim() !== "" &&
  !BASE_URL.includes("YOUR_SCRIPT_ID") &&
  BASE_URL.startsWith("https://script.google.com")
);

// Log sekali saat module di-load (hanya di browser, tidak saat SSG)
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log(
    `[API] Mode: ${IS_REAL_API ? "🟢 REAL (GAS)" : "🔴 SIMULATOR"}`,
    IS_REAL_API ? BASE_URL.substring(0, 60) + "..." : "BASE_URL tidak dikonfigurasi"
  );
}

// ─────────────────────────────────────────────────────────────────
// DUMMY SIMULATOR
// ─────────────────────────────────────────────────────────────────
async function simulateNetwork<T>(data: T): Promise<ApiResponse<T>> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, data }), 200)
  );
}

// ─────────────────────────────────────────────────────────────────
// CLIENT-SIDE IN-MEMORY CACHE
// Strategi: satu request "get_all_data" untuk semua data,
// lalu setiap modul mengambil field-nya masing-masing dari cache.
// ─────────────────────────────────────────────────────────────────
type CachedData = {
  settings:     SiteSetting[];
  skills:       Skill[];
  projects:     Project[];
  experiences:  Experience[];
  certificates: Certificate[];
  blogs:        Blog[];
  testimonials: Testimonial[];
};

let cachedData: CachedData | null = null;
let fetchAllPromise: Promise<CachedData | null> | null = null;

/** Hapus cache — dipanggil setelah setiap operasi tulis (CRUD) */
export function clearApiCache() {
  cachedData = null;
  fetchAllPromise = null;
}

async function getCachedField<K extends keyof CachedData>(
  field: K
): Promise<ApiResponse<CachedData[K]>> {
  // Return langsung dari cache jika sudah ada
  if (cachedData && cachedData[field]) {
    return { success: true, data: cachedData[field] };
  }

  // Jika sudah ada request yang berjalan, tunggu selesai
  if (fetchAllPromise) {
    await fetchAllPromise;
    return { success: true, data: (cachedData?.[field] ?? []) as CachedData[K] };
  }

  // Belum ada cache dan belum ada request berjalan — fetch sekarang
  fetchAllPromise = apiFetch<CachedData>("get_all_data")
    .then((res) => {
      if (res.success && res.data) {
        const sortArray = (arr: any[]) => {
          if (!Array.isArray(arr)) return arr;
          return arr.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 0;
            const orderB = typeof b.order === 'number' ? b.order : 0;
            if (orderA !== orderB) return orderA - orderB;
            
            const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
            const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
            return dateB - dateA;
          });
        };

        cachedData = {
          settings: res.data.settings,
          skills: sortArray(res.data.skills),
          projects: sortArray(res.data.projects),
          experiences: sortArray(res.data.experiences),
          certificates: sortArray(res.data.certificates),
          blogs: sortArray(res.data.blogs),
          testimonials: sortArray(res.data.testimonials),
        };
      }
      fetchAllPromise = null;
      return cachedData;
    })
    .catch((err) => {
      fetchAllPromise = null;
      throw err;
    });

  await fetchAllPromise;
  return { success: true, data: (cachedData?.[field] ?? []) as CachedData[K] };
}

// ─────────────────────────────────────────────────────────────────
// HTTP CLIENT — CORE FUNCTION
// ─────────────────────────────────────────────────────────────────

/**
 * apiFetch — Generic HTTP client untuk Google Apps Script.
 *
 * Desain khusus untuk menghindari CORS preflight:
 * - GET: URL params saja, tidak ada body.
 * - POST: Body sebagai JSON string, TANPA Content-Type header eksplisit.
 *   Token dikirim via URL query param `?token=...`.
 */
async function apiFetch<T>(
  action: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    token?: string;
  } = {}
): Promise<ApiResponse<T>> {
  if (!IS_REAL_API) {
    throw new Error("GAS API tidak dikonfigurasi (NEXT_PUBLIC_GAS_BASE_URL kosong atau tidak valid).");
  }

  // Build URL dengan action & params
  const url = new URL(BASE_URL);
  const parts = action.split("&");
  url.searchParams.set("action", parts[0]);
  for (let i = 1; i < parts.length; i++) {
    const [key, val] = parts[i].split("=");
    if (key) url.searchParams.set(key, val ?? "");
  }

  // Token selalu dikirim via URL param (menghindari Authorization header → no preflight)
  if (options.token) {
    url.searchParams.set("token", options.token);
  }

  const fetchOptions: RequestInit = {
    method: options.method ?? "GET",
    // ⚠️ JANGAN set Content-Type secara eksplisit untuk POST ke GAS.
    // Browser secara default mengirimnya sebagai text/plain yang tidak
    // memerlukan preflight CORS. GAS tetap bisa parse JSON dari postData.contents.
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  let response: Response;
  try {
    response = await fetch(url.toString(), fetchOptions);
  } catch (networkError) {
    throw new Error(
      `Network error: Tidak bisa menjangkau GAS API. Pastikan URL benar dan GAS sudah di-deploy dengan akses "Anyone". Detail: ${networkError instanceof Error ? networkError.message : String(networkError)}`
    );
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();

  // GAS mengembalikan { success: false, error: "..." } untuk error logika
  if (!json.success) {
    throw new Error(json.error ?? "GAS API mengembalikan error tanpa pesan.");
  }

  return json;
}

// ─────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; expiresAt: string }>> => {
    if (IS_REAL_API) {
      return apiFetch<{ token: string; expiresAt: string }>("login", {
        method: "POST",
        body: { username, password },
      });
    }
    // Simulator fallback untuk development lokal
    if (username === "admin" && password === "admin123") {
      return simulateNetwork({
        token: "dev-token-mbn-simulator",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
    }
    throw new Error("Kredensial salah. (Dev default: admin / admin123)");
  },
};

// ─────────────────────────────────────────────────────────────────
// SETTINGS API
// ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: async (): Promise<ApiResponse<SiteSetting[]>> => {
    if (IS_REAL_API) return getCachedField("settings");
    return simulateNetwork([]);
  },

  upsert: async (
    data: { key: string; value: string; description?: string; type: string },
    token: string
  ): Promise<ApiResponse<SiteSetting>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<SiteSetting>("upsert_setting", {
        method: "POST",
        body: data,
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as SiteSetting);
  },
};

// ─────────────────────────────────────────────────────────────────
// SKILLS API
// ─────────────────────────────────────────────────────────────────
export const skillsApi = {
  getAll: async (): Promise<ApiResponse<Skill[]>> => {
    if (IS_REAL_API) return getCachedField("skills");
    return simulateNetwork([]);
  },

  create: async (data: Partial<Skill>, token: string): Promise<ApiResponse<Skill>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Skill>("create_skill", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Skill);
  },

  update: async (id: string, data: Partial<Skill>, token: string): Promise<ApiResponse<Skill>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Skill>("update_skill", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Skill);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_skill", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// PROJECTS API
// ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: async (params?: { category?: string }): Promise<ApiResponse<Project[]>> => {
    if (IS_REAL_API) {
      const res = await getCachedField("projects");
      if (res.success && res.data && params?.category) {
        return { success: true, data: res.data.filter((p) => p.category === params.category) };
      }
      return res;
    }
    return simulateNetwork([]);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Project>> => {
    if (IS_REAL_API) {
      const res = await getCachedField("projects");
      const found = res.data?.find((p) => p.slug === slug);
      if (found) return { success: true, data: found };
      throw new Error(`Proyek slug '${slug}' tidak ditemukan.`);
    }
    throw new Error("Proyek tidak ditemukan (API simulator).");
  },

  create: async (data: Partial<Project>, token: string): Promise<ApiResponse<Project>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Project>("create_project", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Project);
  },

  update: async (id: string, data: Partial<Project>, token: string): Promise<ApiResponse<Project>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Project>("update_project", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Project);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_project", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// EXPERIENCES API
// ─────────────────────────────────────────────────────────────────
export const experiencesApi = {
  getAll: async (): Promise<ApiResponse<Experience[]>> => {
    if (IS_REAL_API) return getCachedField("experiences");
    return simulateNetwork([]);
  },

  create: async (data: Partial<Experience>, token: string): Promise<ApiResponse<Experience>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Experience>("create_experience", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Experience);
  },

  update: async (id: string, data: Partial<Experience>, token: string): Promise<ApiResponse<Experience>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Experience>("update_experience", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Experience);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_experience", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// CERTIFICATES API
// ─────────────────────────────────────────────────────────────────
export const certificatesApi = {
  getAll: async (): Promise<ApiResponse<Certificate[]>> => {
    if (IS_REAL_API) return getCachedField("certificates");
    return simulateNetwork([]);
  },

  create: async (data: Partial<Certificate>, token: string): Promise<ApiResponse<Certificate>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Certificate>("create_certificate", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Certificate);
  },

  update: async (id: string, data: Partial<Certificate>, token: string): Promise<ApiResponse<Certificate>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Certificate>("update_certificate", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Certificate);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_certificate", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// TESTIMONIALS API
// ─────────────────────────────────────────────────────────────────
export const testimonialsApi = {
  getAll: async (): Promise<ApiResponse<Testimonial[]>> => {
    if (IS_REAL_API) return getCachedField("testimonials");
    return simulateNetwork([]);
  },

  create: async (data: Partial<Testimonial>, token: string): Promise<ApiResponse<Testimonial>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Testimonial>("create_testimonial", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Testimonial);
  },

  update: async (id: string, data: Partial<Testimonial>, token: string): Promise<ApiResponse<Testimonial>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Testimonial>("update_testimonial", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Testimonial);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_testimonial", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// BLOGS API
// ─────────────────────────────────────────────────────────────────
export const blogsApi = {
  getAll: async (): Promise<ApiResponse<Blog[]>> => {
    if (IS_REAL_API) return getCachedField("blogs");
    return simulateNetwork([]);
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Blog>> => {
    if (IS_REAL_API) {
      // get_blog_by_slug juga increment views — kirim via GET
      const res = await apiFetch<Blog>(`get_blog_by_slug&slug=${encodeURIComponent(slug)}`);
      return res;
    }
    throw new Error("Blog tidak ditemukan (API simulator).");
  },

  create: async (data: Partial<Blog>, token: string): Promise<ApiResponse<Blog>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Blog>("create_blog", { method: "POST", body: data, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork(data as Blog);
  },

  update: async (id: string, data: Partial<Blog>, token: string): Promise<ApiResponse<Blog>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<Blog>("update_blog", { method: "POST", body: { id, ...data }, token });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ id, ...data } as Blog);
  },

  delete: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      const res = await apiFetch<{ deleted: boolean; id: string }>("delete_blog", {
        method: "POST",
        body: { id },
        token,
      });
      clearApiCache();
      return res;
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// CONTACT API
// ─────────────────────────────────────────────────────────────────
export const contactApi = {
  sendMessage: async (data: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ id: string }>> => {
    if (IS_REAL_API) {
      return apiFetch<{ id: string }>("send_message", { method: "POST", body: data });
    }
    return simulateNetwork({ id: `msg_${Date.now()}` });
  },

  getMessages: async (token: string): Promise<ApiResponse<ContactMessage[]>> => {
    if (IS_REAL_API) {
      return apiFetch<ContactMessage[]>("get_messages", { method: "POST", body: {}, token });
    }
    return simulateNetwork([]);
  },

  markRead: async (id: string, token: string): Promise<ApiResponse<ContactMessage>> => {
    if (IS_REAL_API) {
      return apiFetch<ContactMessage>("mark_message_read", { method: "POST", body: { id }, token });
    }
    return simulateNetwork({ id, isRead: true } as ContactMessage);
  },

  deleteMessage: async (id: string, token: string): Promise<ApiResponse<{ deleted: boolean; id: string }>> => {
    if (IS_REAL_API) {
      return apiFetch<{ deleted: boolean; id: string }>("delete_message", {
        method: "POST",
        body: { id },
        token,
      });
    }
    return simulateNetwork({ deleted: true, id });
  },
};

// ─────────────────────────────────────────────────────────────────
// MEDIA API
// ─────────────────────────────────────────────────────────────────
export const mediaApi = {
  upload: async (
    data: {
      filename: string;
      mimeType: string;
      base64Content: string;
      subfolder?: string;
    },
    token: string
  ): Promise<ApiResponse<{ url: string; fileId: string; downloadUrl?: string }>> => {
    if (IS_REAL_API) {
      return apiFetch<{ url: string; fileId: string; downloadUrl?: string }>("upload_file", {
        method: "POST",
        body: data,
        token,
      });
    }
    return simulateNetwork({
      url: "https://lh3.googleusercontent.com/d/dummy-file-id",
      fileId: "dummy-file-id",
      downloadUrl: "https://drive.google.com/uc?id=dummy-file-id&export=download",
    });
  },
};
