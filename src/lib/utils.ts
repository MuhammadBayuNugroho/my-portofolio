import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────────────────────────
// CSS CLASS UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * cn — Merge Tailwind CSS classes safely.
 * Combines clsx (conditional classes) with tailwind-merge (resolve conflicts).
 * Usage: cn("px-4 py-2", condition && "font-bold", "text-sm")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────
// DATE FORMATTING UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * formatDate — Format ISO date string to localized Indonesian format.
 * @example formatDate("2026-06-27") → "27 Juni 2026"
 */
export function formatDate(
  date: string | Date,
  formatStr: string = "d MMMM yyyy"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: idLocale });
}

/**
 * formatDateShort — Short date format.
 * @example formatDateShort("2026-06-27") → "Jun 2026"
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, "MMM yyyy");
}

/**
 * formatRelativeDate — Human-readable relative date.
 * @example formatRelativeDate("2026-06-20") → "7 hari yang lalu"
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale });
}

/**
 * getDuration — Calculate duration between two dates.
 * Returns a human-readable string like "Jan 2024 — Jun 2026 (2 tahun 5 bulan)"
 */
export function getDuration(
  startDate: string,
  endDate?: string
): { display: string; isCurrent: boolean } {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : new Date();
  const isCurrent = !endDate;

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let duration = "";
  if (years > 0) duration += `${years} tahun`;
  if (remainingMonths > 0) {
    if (years > 0) duration += " ";
    duration += `${remainingMonths} bulan`;
  }

  const startLabel = format(start, "MMM yyyy");
  const endLabel = isCurrent ? "Sekarang" : format(end, "MMM yyyy");

  return {
    display: `${startLabel} — ${endLabel}${duration ? ` (${duration})` : ""}`,
    isCurrent,
  };
}

// ─────────────────────────────────────────────────────────────────
// STRING UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * generateSlug — Convert a title to a URL-safe slug.
 * @example generateSlug("Hello World! Test") → "hello-world-test"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * truncateText — Trim text to max length with ellipsis.
 * @example truncateText("Hello World", 8) → "Hello..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * parseStringArray — Parse a comma-separated string from spreadsheet into array.
 * @example parseStringArray("React,Next.js, TypeScript") → ["React", "Next.js", "TypeScript"]
 */
export function parseStringArray(value: string | undefined): string[] {
  if (!value || value.trim() === "") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * stringifyArray — Convert an array to comma-separated string for spreadsheet storage.
 * @example stringifyArray(["React", "Next.js"]) → "React,Next.js"
 */
export function stringifyArray(arr: string[]): string {
  return arr.join(",");
}

// ─────────────────────────────────────────────────────────────────
// NUMBER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * formatNumber — Format a number with locale-appropriate separators.
 * @example formatNumber(12500) → "12.500"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * clamp — Constrain a number within a range.
 * @example clamp(150, 0, 100) → 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─────────────────────────────────────────────────────────────────
// URL UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * isCloudinaryUrl — Cek apakah URL berasal dari Cloudinary CDN.
 * @example isCloudinaryUrl("https://res.cloudinary.com/...") → true
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * getCloudinaryUrl — Transform Cloudinary URL dengan parameter optimasi.
 *
 * Memanfaatkan Cloudinary URL-based transformations untuk:
 * - Resize otomatis (w_, h_)
 * - Format otomatis (f_auto) → WebP/AVIF di browser modern
 * - Kualitas otomatis (q_auto) → ukuran file optimal
 *
 * @param url - URL Cloudinary asli (dari database/spreadsheet)
 * @param options - Transformasi opsional
 * @returns URL dengan transformasi ter-embed
 *
 * @example
 * getCloudinaryUrl("https://res.cloudinary.com/mycloud/image/upload/v123/portfolio/cover.jpg")
 * → "https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto,w_800/v123/portfolio/cover.jpg"
 */
export function getCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "crop" | "scale" | "thumb";
    quality?: number | "auto";
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
  } = {}
): string {
  if (!isCloudinaryUrl(url)) return url; // Pass-through untuk URL non-Cloudinary

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  const transformations: string[] = [];
  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (width)   transformations.push(`w_${width}`);
  if (height)  transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  if (transformations.length === 0) return url;

  // Sisipkan transformasi setelah "/upload/" dalam URL Cloudinary
  const transformStr = transformations.join(",");
  return url.replace("/upload/", `/upload/${transformStr}/`);
}

/**
 * getGoogleDriveDirectUrl — Convert Google Drive share URL ke direct image URL.
 * Dipertahankan untuk backward compatibility dengan data lama di spreadsheet.
 * @deprecated Gunakan Cloudinary untuk upload gambar baru.
 */
export function getGoogleDriveDirectUrl(shareUrl: string): string {
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return shareUrl;
  return `https://drive.google.com/uc?id=${match[1]}&export=view`;
}

/**
 * isValidUrl — Check if a string is a valid URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// MISC UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * generateId — Generate a short unique ID (for optimistic UI updates).
 * NOT cryptographically secure — use server-generated IDs for real data.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * debounce — Delay function execution until after wait ms.
 * Used for search inputs to reduce API calls.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), waitMs);
  };
}

/**
 * sleep — Promise-based delay. Useful for artificial loading states in dev.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
