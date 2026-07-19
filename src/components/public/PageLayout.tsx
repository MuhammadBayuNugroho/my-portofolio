import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// PAGE LAYOUT — Standard public page wrapper
// Eliminates the need to repeat <Navbar /> and <Footer /> in every page.
// ─────────────────────────────────────────────────────────────────

interface PageLayoutProps {
  children: React.ReactNode;
  /** Extra classes applied to the <main> element */
  mainClassName?: string;
}

export function PageLayout({ children, mainClassName }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className={cn("min-h-screen bg-background", mainClassName)}>
        {children}
      </main>
      <Footer />
    </>
  );
}
