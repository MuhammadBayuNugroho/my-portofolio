import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * robots.ts — Generates /robots.txt at build time
 * Allows all crawlers to index public content.
 * Disallows admin panel from being indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://muhbayunugroho.github.io";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
