import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SITE_CONFIG } from "@/constants/site";
import { getPersonSchema } from "@/constants/schema";
import "./globals.css";

// ─────────────────────────────────────────────────────────────────
// FONT CONFIGURATION
// Using next/font for automatic font subsetting and zero layout shift.
// inter: body text — optimized for readability at small sizes
// outfit: display/headline text — modern geometric personality
// ─────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

// ─────────────────────────────────────────────────────────────────
// ROOT METADATA — Baseline SEO & Social Sharing
// All values are sourced from constants/site.ts (single source of truth).
// Per-page metadata overrides this via generateMetadata().
// ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — Frontend Developer & Designer`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  keywords: [...SITE_CONFIG.keywords],

  // Open Graph — for social sharing previews
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — Frontend Developer & Designer`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.defaultOgImage}`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Portfolio`,
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Frontend Developer & Designer`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.defaultOgImage}`],
    creator: SITE_CONFIG.twitterHandle,
  },

  // Canonical URL and robots
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Manifest for PWA-lite behavior
  manifest: "/site.webmanifest",

  // Verification (fill in after deploying)
  verification: {
    google: "2Rnjt6d9urJP7tLI-0jyQnO0veOACoNCqI7wyP-_xJU",
  },
};

// ─────────────────────────────────────────────────────────────────
// VIEWPORT CONFIG — Separate export required in App Router
// ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
  ],
};

// ─────────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning // Required by next-themes
      className={`${inter.variable} ${outfit.variable}`}
    >
      <head>
        {/* Preconnect to Google Fonts CDN for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/*
         * Favicon is handled automatically by Next.js App Router
         * via src/app/icon.jpg — no manual <link rel="icon"> needed.
         */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* JSON-LD Structured Data — Person Schema (sourced from constants/schema.ts) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getPersonSchema()),
          }}
        />
      </head>
      <body className="antialiased">
        {/*
         * ThemeProvider from next-themes
         * - attribute="class" → adds "dark" class to <html>
         * - defaultTheme="dark" → brand default is dark mode
         * - enableSystem → respects OS preference on first visit
         * - disableTransitionOnChange → prevents flash during theme switch
         */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <WhatsAppButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
