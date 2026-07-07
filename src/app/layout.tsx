import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/auth-context";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
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
// SITE METADATA CONSTANTS
// ─────────────────────────────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://masbe.my.id";
const SITE_NAME = "Muhammad Bayu Nugroho";
const SITE_DESCRIPTION =
  "Frontend Developer, Web Designer & Graphic Designer. Building beautiful digital experiences with code, design, and leadership.";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ─────────────────────────────────────────────────────────────────
// ROOT METADATA — Baseline SEO & Social Sharing
// Per-page metadata overrides this via generateMetadata()
// ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Frontend Developer & Designer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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

  // Open Graph — for social sharing previews
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Frontend Developer & Designer`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Portfolio`,
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Frontend Developer & Designer`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@muhbayunugroho",
  },

  // Canonical URL and robots
  alternates: {
    canonical: SITE_URL,
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
        {/* JSON-LD Structured Data — Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Muhammad Bayu Nugroho",
              url: SITE_URL,
              jobTitle: "Frontend Developer & Web Designer",
              description: SITE_DESCRIPTION,
              sameAs: [
                "https://github.com/MuhammadBayuNugroho",
                "https://www.linkedin.com/in/muhammad-bayu-nugroho-61a922234/",
              ],
              knowsAbout: [
                "Frontend Development",
                "Web Design",
                "Graphic Design",
                "Next.js",
                "TypeScript",
                "UI/UX Design",
                "Organizational Leadership",
              ],
            }),
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
