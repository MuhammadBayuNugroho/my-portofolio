import type { NextConfig } from "next";

/**
 * Next.js configuration optimized for GitHub Pages + Custom Domain deployment.
 *
 * Key decisions:
 * - `output: "export"` enables full static export (SSG) for GitHub Pages.
 * - `basePath` and `assetPrefix` are intentionally empty strings because the
 *   site is served from the root of a custom domain (masbe.my.id), not a
 *   sub-path like username.github.io/repo.
 * - `trailingSlash: true` ensures GitHub Pages serves index.html correctly
 *   for all routes (e.g., /about/ → about/index.html).
 * - Image optimization is disabled (`unoptimized: true`) because Next.js image
 *   optimization requires a server runtime — unavailable in static exports.
 */
const nextConfig: NextConfig = {
  output: "export",

  // Custom domain is served from root — no sub-path prefix needed.
  // If you ever revert to username.github.io/repo (without custom domain),
  // set both of these to the repo name, e.g.:
  //   basePath: "/my-portofolio",
  //   assetPrefix: "/my-portofolio/",
  basePath: "",
  assetPrefix: "",

  trailingSlash: true,

  images: {
    // Required for static export — use Next Image without built-in optimizer.
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
};

export default nextConfig;
