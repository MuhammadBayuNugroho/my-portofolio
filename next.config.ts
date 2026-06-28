import type { NextConfig } from "next";

/**
 * Next.js configuration optimized for GitHub Pages deployment.
 *
 * Key decisions:
 * - `output: "export"` enables full static export (SSG) for GitHub Pages.
 * - `basePath` and `assetPrefix` use GITHUB_REPOSITORY env for correct
 *   asset paths when hosted under a project page (e.g., username.github.io/repo).
 * - `trailingSlash: true` ensures GitHub Pages serves index.html correctly.
 * - Image optimization is disabled (`unoptimized: true`) because Next.js image
 *   optimization requires a server runtime — unavailable in static exports.
 *   Images are served directly via CDN-backed Google Drive URLs.
 */
const isProd = process.env.NODE_ENV === "production";
const GITHUB_REPO = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const nextConfig: NextConfig = {
  output: "export",

  // Only apply basePath in production CI where GITHUB_REPOSITORY is set
  // For personal GitHub Pages (username.github.io), leave empty string
  basePath: isProd && GITHUB_REPO ? `/${GITHUB_REPO}` : "",
  assetPrefix: isProd && GITHUB_REPO ? `/${GITHUB_REPO}/` : "",

  trailingSlash: true,

  images: {
    // Required for static export — use Next Image without built-in optimizer.
    // Google Drive public share links are allowed as remote patterns.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Strict experimental features
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
  },
};

export default nextConfig;
