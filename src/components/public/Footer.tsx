import Link from "next/link";
import { Container } from "./Container";
import { SITE_CONFIG } from "@/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-elevated py-12 text-foreground-muted">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-display text-body font-bold text-foreground mb-1">
              {SITE_CONFIG.name}
            </p>
            <p className="text-xs">{SITE_CONFIG.tagline}</p>
          </div>

          <div className="flex gap-6 text-caption">
            <a
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href={SITE_CONFIG.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={SITE_CONFIG.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="border-t border-border/55 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
