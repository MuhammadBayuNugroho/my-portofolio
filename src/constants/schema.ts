/**
 * schema.ts — JSON-LD Structured Data schemas.
 *
 * Centralizes all schema.org markup used across the app.
 * Import and render in layout.tsx or page-level <head> as needed.
 */

import { SITE_CONFIG } from "./site";

// ─────────────────────────────────────────────────────────────────
// PERSON SCHEMA — Root layout (homepage identity)
// ─────────────────────────────────────────────────────────────────

export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    jobTitle: "Frontend Developer & Web Designer",
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    sameAs: [
      SITE_CONFIG.github,
      SITE_CONFIG.linkedin,
      SITE_CONFIG.instagram,
    ],
    knowsAbout: [...SITE_CONFIG.expertiseAreas],
  };
}

// ─────────────────────────────────────────────────────────────────
// WEBSITE SCHEMA — Sitewide
// ─────────────────────────────────────────────────────────────────

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
  };
}
