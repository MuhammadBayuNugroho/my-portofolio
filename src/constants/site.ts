/**
 * site.ts — Global site configuration constants.
 * Single source of truth for site identity data.
 * Used across metadata, JSON-LD, footer, and about section.
 */

export const SITE_CONFIG = {
  name: "Muhammad Bayu Nugroho",
  tagline: "Frontend Developer | Web Designer | Graphic Designer",
  shortBio:
    "I build beautiful digital experiences at the intersection of clean code, thoughtful design, and purposeful leadership.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://muhbayunugroho.github.io",
  email: "bayu27.mbn@gmail.com",
  location: "Indonesia",
  github: "https://github.com/MuhammadBayuNugroho",
  linkedin: "https://www.linkedin.com/in/muhammad-bayu-nugroho-61a922234/",
  instagram: "https://instagram.com/mass_bayuuu",
  twitter: "https://twitter.com/muhbayunugroho",
  resumeUrl: "#",

  // Professional stats for Hero section
  stats: {
    experience: "3+",
    projects: "50+",
    organizations: "5+",
    certifications: "20+",
  },

  // Skill highlights for meta & homepage
  expertiseAreas: [
    "Frontend Development",
    "Web Design",
    "Graphic Design",
    "UI/UX Design",
    "Organizational Leadership",
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;
