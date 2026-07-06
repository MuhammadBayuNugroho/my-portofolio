/**
 * types/index.ts — Global TypeScript type definitions.
 *
 * This is the single source of truth for all data types used
 * across the application. Every interface maps directly to a
 * Google Spreadsheet tab schema defined in the blueprint.
 *
 * Naming Convention:
 * - Interfaces use PascalCase
 * - Enums/unions use PascalCase string unions for easy spreadsheet mapping
 */

// ─────────────────────────────────────────────────────────────────
// COMMON TYPES
// ─────────────────────────────────────────────────────────────────

/** Content status across all modules */
export type ContentStatus = "Draft" | "Published" | "Archived";

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

/** Pagination metadata */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Base entity fields every spreadsheet row has */
export interface BaseEntity {
  id: string;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────
// PROJECT MODULE
// ─────────────────────────────────────────────────────────────────

export type ProjectCategory = string;

export interface Project extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  contentMarkdown: string;
  coverImage: string;
  images: string[]; // Additional gallery images — comma-separated in sheet
  techStack: string[]; // Comma-separated in sheet
  projectUrl?: string;
  githubUrl?: string;
  figmaUrl?: string;
  category: ProjectCategory;
  isGalleryOnly?: boolean;
  status: ContentStatus;
  featured: boolean;
  order: number; // Sort order for display
}

// ─────────────────────────────────────────────────────────────────
// GALLERY MODULE
// ─────────────────────────────────────────────────────────────────

export type GalleryCategory = string;

export interface GalleryItem extends BaseEntity {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: GalleryCategory;
  tags: string[];
  projectId?: string; // Link to project if applicable
  status: ContentStatus;
  featured: boolean;
  order: number;
}

// ─────────────────────────────────────────────────────────────────
// JOURNEY MODULE
// ─────────────────────────────────────────────────────────────────

export type JourneyType =
  | "Education"
  | "Career"
  | "Leadership"
  | "Achievement"
  | "Volunteer";

export interface Journey extends BaseEntity {
  year: string;
  month?: string;
  title: string;
  organization: string;
  role: string;
  description: string;
  type: JourneyType;
  highlight: boolean; // Pin this as a key milestone
  icon?: string; // Lucide icon name
  link?: string;
}

// ─────────────────────────────────────────────────────────────────
// SKILLS MODULE
// ─────────────────────────────────────────────────────────────────

/**
 * SkillCategory — free-form string to allow admin to define custom categories.
 * Common presets: "Frontend" | "Backend" | "Design" | "Tools" | "Soft Skills" | "Language"
 */
export type SkillCategory = string;

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill extends BaseEntity {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  percentage: number; // 0-100 for progress bar display
  iconUrl?: string; // SVG icon URL from devicons or similar
  order: number;
}

// ─────────────────────────────────────────────────────────────────
// EXPERIENCE MODULE
// ─────────────────────────────────────────────────────────────────

export type ExperienceType = string;

export interface Experience extends BaseEntity {
  title: string;           // Job/role title
  organization: string;
  location?: string;
  startDate: string;       // ISO date string
  endDate?: string;        // ISO date string | undefined if current
  isCurrent: boolean;
  description: string;
  highlights: string[];    // Comma-separated in sheet
  type: ExperienceType;
  logoUrl?: string;
  link?: string;
}

// ─────────────────────────────────────────────────────────────────
// CERTIFICATE MODULE
// ─────────────────────────────────────────────────────────────────

export type CertificateCategory = string;

export interface Certificate extends BaseEntity {
  title: string;
  issuer: string;
  category: CertificateCategory;
  issueDate: string;       // ISO date string
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;        // Certificate preview image
  description?: string;
  status: "Active" | "Expired";
  featured: boolean;
}

// ─────────────────────────────────────────────────────────────────
// BLOG MODULE
// ─────────────────────────────────────────────────────────────────

export interface Blog extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverImage: string;
  tags: string[];          // Comma-separated in sheet
  category: string;
  status: ContentStatus;
  views: number;
  readingTime?: number;    // Auto-calculated in minutes
  featured: boolean;
}

// ─────────────────────────────────────────────────────────────────
// TESTIMONIAL MODULE
// ─────────────────────────────────────────────────────────────────

export type TestimonialRelation =
  | "Client"
  | "Colleague"
  | "Mentor"
  | "Supervisee"
  | "Partner";

export interface Testimonial extends BaseEntity {
  authorName: string;
  authorRole: string;
  authorOrganization: string;
  authorImageUrl?: string;
  content: string;
  rating: number;          // 1-5
  relation: TestimonialRelation;
  projectId?: string;      // Link to project if project-specific
  status: ContentStatus;
  featured: boolean;
}

// ─────────────────────────────────────────────────────────────────
// CONTACT / MESSAGE MODULE
// ─────────────────────────────────────────────────────────────────

export interface ContactMessage extends BaseEntity {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  ipAddress?: string;
}

// ─────────────────────────────────────────────────────────────────
// SETTINGS MODULE
// ─────────────────────────────────────────────────────────────────

export interface SiteSetting {
  key: string;
  value: string;
  description?: string;
  type: "text" | "boolean" | "json" | "url" | "number";
}

// ─────────────────────────────────────────────────────────────────
// ANALYTICS / STATISTICS
// ─────────────────────────────────────────────────────────────────

export interface SiteStatistics {
  totalProjects: number;
  totalBlogs: number;
  totalCertificates: number;
  totalTestimonials: number;
  totalMessages: number;
  unreadMessages: number;
  totalViews: number;
  recentMessages: ContactMessage[];
}

// ─────────────────────────────────────────────────────────────────
// AUTH MODULE
// ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  username: string;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ─────────────────────────────────────────────────────────────────
// FILTER & SORT TYPES (Used across list pages)
// ─────────────────────────────────────────────────────────────────

export interface FilterOptions {
  category?: string;
  status?: ContentStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  featured?: boolean;
}
