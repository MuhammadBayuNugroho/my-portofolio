"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Find all h2 and h3 elements inside the blog-content container
    const elements = Array.from(
      document.querySelectorAll("#blog-content h2, #blog-content h3")
    );

    const parsedHeadings: Heading[] = elements.map((el) => ({
      id: el.id || "",
      text: el.textContent || "",
      level: el.tagName === "H2" ? 2 : 3,
    })).filter(h => h.id);

    setHeadings(parsedHeadings);

    if (parsedHeadings.length === 0) return;

    // Use IntersectionObserver to track which heading is currently active in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // Track the visible headings
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Sort by bounding top to pick the one closest to viewport top
          const closest = visibleEntries.reduce((prev, curr) => {
            return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top)
              ? curr
              : prev;
          });
          setActiveId(closest.target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px", // Fires when heading is in the upper area of the viewport
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    // Also fallback: highlight first heading if page is scrolled to top
    const handleScroll = () => {
      if (window.scrollY < 100 && parsedHeadings.length > 0) {
        setActiveId(parsedHeadings[0].id);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Fixed navbar height offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update URL hash safely without jumping
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-6">
      <h3 className="font-display text-caption font-bold text-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
        <List size={16} className="text-accent" />
        Daftar Isi
      </h3>
      <nav className="flex flex-col gap-2 relative">
        {/* Left vertical border guideline */}
        <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-border/50" />

        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleScroll(e, heading.id)}
              className={cn(
                "block text-xs transition-all duration-200 border-l-[2px] py-1 -ml-[1px] pl-3 select-none",
                heading.level === 3 ? "pl-6 text-[11px]" : "",
                isActive
                  ? "text-accent border-accent font-semibold translate-x-[2px]"
                  : "text-foreground-muted border-transparent hover:text-foreground hover:border-foreground-muted"
              )}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
