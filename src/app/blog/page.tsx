import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";
import { BlogPageClient } from "./BlogPageClient";

// ─────────────────────────────────────────────────────────────────
// METADATA — Server-side SEO (only possible in Server Components)
// ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Blog — Catatan & Pemikiran",
  description: SITE_CONFIG.pageDescriptions.blog,
  openGraph: {
    title: `Blog | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.pageDescriptions.blog,
  },
};

// ─────────────────────────────────────────────────────────────────
// PAGE — Server Component shell (metadata + client handoff)
// ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  return <BlogPageClient />;
}
