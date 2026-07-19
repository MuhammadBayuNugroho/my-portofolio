/**
 * site.ts — Global site configuration constants.
 *
 * This is the SINGLE SOURCE OF TRUTH for all site identity data.
 * Used across: metadata, JSON-LD schema, layout, footer, hero, and about sections.
 *
 * Do NOT add parallel constants in other files — always import from here.
 */

export const SITE_CONFIG = {
  // ── Identity ─────────────────────────────────────────────────────
  name: "Muhammad Bayu Nugroho",
  tagline: "Frontend Developer | Web Designer | Graphic Designer",
  shortBio:
    "I build beautiful digital experiences at the intersection of clean code, thoughtful design, and purposeful leadership.",
  description:
    "Frontend Developer, Web Designer & Graphic Designer. Building beautiful digital experiences with code, design, and leadership.",

  // ── URLs ─────────────────────────────────────────────────────────
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://masbe.my.id",
  defaultOgImage: "/og-image.jpg",

  // ── Contact & Social ─────────────────────────────────────────────
  email: "bayu27.mbn@gmail.com",
  location: "Jepara | Central Java | Indonesia",
  github: "https://github.com/MuhammadBayuNugroho",
  linkedin: "https://www.linkedin.com/in/muhammadbayunugroho/",
  instagram: "https://instagram.com/mass_bayuuu",
  twitterHandle: "@muhbayunugroho",
  resumeUrl: "#",

  // ── Professional stats for Hero section ──────────────────────────
  stats: {
    experience: "3+",
    projects: "50+",
    organizations: "5+",
    certifications: "20+",
  },

  // ── SEO keywords & expertise areas ───────────────────────────────
  keywords: [
    "Frontend Developer",
    "Web Designer",
    "Graphic Designer",
    "Next.js",
    "React",
    "TypeScript",
    "UI/UX",
    "Indonesia",
    "Muhammad Bayu Nugroho",
  ],

  expertiseAreas: [
    "Frontend Development",
    "Web Design",
    "Graphic Design",
    "UI/UX Design",
    "Organizational Leadership",
  ],

  // ── Page-specific default descriptions ───────────────────────────
  pageDescriptions: {
    home: "Frontend Developer, Web Designer & Graphic Designer. Building beautiful digital experiences with code, design, and leadership.",
    about:
      "Tentang Muhammad Bayu Nugroho — perjalanan karir, filosofi desain, dan visi kepemimpinan.",
    projects:
      "Portfolio proyek — web development, UI/UX design, dan graphic design oleh Muhammad Bayu Nugroho.",
    blog: "Artikel, catatan, dan pemikiran tentang Frontend Development, Design, dan kepemimpinan.",
    contact: "Hubungi Muhammad Bayu Nugroho untuk kolaborasi, proyek, atau pertanyaan.",
    skills: "Peta kompetensi keahlian teknis dan desain Muhammad Bayu Nugroho.",
    experience: "Pengalaman profesional dan perjalanan karir Muhammad Bayu Nugroho.",
    certificates: "Sertifikasi dan pencapaian profesional Muhammad Bayu Nugroho.",
    testimonials: "Testimoni dari klien dan kolaborator Muhammad Bayu Nugroho.",
    journey: "Perjalanan dan milestone Muhammad Bayu Nugroho.",
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
