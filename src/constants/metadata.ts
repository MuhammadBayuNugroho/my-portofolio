/**
 * metadata.ts — SEO and metadata constants.
 * Centralized so future content updates don't require
 * touching layout.tsx.
 */

export const METADATA = {
  // Site identity
  siteName: "Muhammad Bayu Nugroho",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://muhammadbayunugroho.github.io/my-portofolio",

  // Default Open Graph image (1200x630)
  defaultOgImage: "/og-image.jpg",

  // Twitter handle
  twitterHandle: "@muhbayunugroho",

  // Social profiles for JSON-LD
  socialProfiles: {
    github: "https://github.com/muhbayunugroho",
    linkedin: "https://www.linkedin.com/in/muhammad-bayu-nugroho-61a922234/",
    instagram: "https://instagram.com/muhbayunugroho",
  },

  // Page-specific default descriptions
  pageDescriptions: {
    home: "Frontend Developer, Web Designer & Graphic Designer. Building beautiful digital experiences with code, design, and leadership.",
    about:
      "Tentang Muhammad Bayu Nugroho — perjalanan karir, filosofi desain, dan visi kepemimpinan.",
    projects:
      "Portfolio proyek — web development, UI/UX design, dan graphic design oleh Muhammad Bayu Nugroho.",
    blog: "Artikel, catatan, dan pemikiran tentang Frontend Development, Design, dan kepemimpinan.",
    contact: "Hubungi Muhammad Bayu Nugroho untuk kolaborasi, proyek, atau pertanyaan.",
  },
} as const;
