import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";
import { SkillsPageClient } from "./SkillsPageClient";

// ─────────────────────────────────────────────────────────────────
// METADATA — Server-side SEO
// ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Keahlian & Spesialisasi",
  description: SITE_CONFIG.pageDescriptions.skills,
  openGraph: {
    title: `Keahlian | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.pageDescriptions.skills,
  },
};

// ─────────────────────────────────────────────────────────────────
// PAGE — Server Component shell
// ─────────────────────────────────────────────────────────────────
export default function SkillsPage() {
  return <SkillsPageClient />;
}
