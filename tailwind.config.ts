/**
 * tailwind.config.ts
 *
 * NOTE: In TailwindCSS v4, theme configuration is done via CSS @theme
 * directive in globals.css, NOT here in tailwind.config.ts.
 *
 * This file is kept for:
 * 1. Content paths configuration (still required in v4)
 * 2. Dark mode class strategy
 * 3. Future plugin additions
 *
 * Design token reference (for documentation purposes):
 * All actual CSS variable values are declared in src/app/globals.css
 */
import type { Config } from "tailwindcss";

const config: Config = {
  // Dark mode via "class" on <html> element — next-themes compatible
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // These reference CSS variables defined in globals.css @theme and :root
      colors: {
        background: {
          DEFAULT: "var(--color-background)",
          elevated: "var(--color-background-elevated)",
          overlay: "var(--color-background-overlay)",
        },
        foreground: {
          DEFAULT: "var(--color-foreground)",
          muted: "var(--color-foreground-muted)",
          subtle: "var(--color-foreground-subtle)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          muted: "var(--color-accent-muted)",
          foreground: "var(--color-accent-foreground)",
        },
        violet: {
          DEFAULT: "var(--color-violet)",
          hover: "var(--color-violet-hover)",
          muted: "var(--color-violet-muted)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },

      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      screens: {
        xs: "375px",
      },
    },
  },

  plugins: [],
};

export default config;
