"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ExperienceType } from "@/types";
import { getDuration } from "@/lib/utils";
import { Briefcase, Calendar, MapPin, CheckCircle2, Award, Landmark, Compass, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { experiencesApi } from "@/lib/api";

export default function ExperiencePage() {
  const { data: experiences = [], isLoading } = useSWR("experiences", () =>
    experiencesApi.getAll().then((res) => res.data || [])
  );

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = [...new Set(experiences.map((exp) => exp.type))].filter(Boolean) as string[];
    return ["All", ...cats];
  }, [experiences]);

  const filteredData = experiences.filter((exp) => {
    if (activeCategory === "All") return true;
    return exp.type === activeCategory;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-16">
        <Container>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-h1 text-foreground mb-4">
              Riwayat Pengalaman & Prestasi
            </h1>
            <p className="text-body text-foreground-muted">
              Eksplorasi riwayat profesional karir, keaktifan organisasi, serta pencapaian dan kepemimpinan.
            </p>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-6 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                {cat === "Proffesional" ? "Professional" : cat}
              </button>
            ))}
          </div>

          {/* Vertical Timeline Layout */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : filteredData.length > 0 ? (
            <div className="relative max-w-3xl mx-auto pl-6 border-l-2 border-border/80 flex flex-col gap-10">
              {filteredData.map((exp, idx) => {
                const duration = getDuration(exp.startDate, exp.endDate);
                
                // Set icon based on type category roughly
                let Icon = Briefcase;
                const typeLower = exp.type?.toLowerCase() || "";
                if (typeLower.includes("achievement") || typeLower.includes("prestasi")) Icon = Award;
                else if (typeLower.includes("leader") || typeLower.includes("pimpin")) Icon = Landmark;
                else if (typeLower.includes("organization") || typeLower.includes("organisasi") || typeLower.includes("volunteer")) Icon = Compass;
                
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline Node Icon/Dot */}
                    <span className="absolute -left-[35px] top-1.5 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-background-elevated border-2 border-accent text-accent shadow-soft dark:shadow-dark-soft">
                      <Icon size={12} />
                    </span>

                    {/* Card container */}
                    <Card className="p-6" hoverEffect={true}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                        <div>
                          <span className="text-[10px] text-accent uppercase font-bold tracking-wider mb-1 block">
                            {exp.type === "Proffesional" ? "Professional" : exp.type}
                          </span>
                          <h3 className="font-display text-h3 text-foreground font-semibold">
                            {exp.title}
                          </h3>
                          <p className="text-caption text-foreground-muted font-medium">
                            {exp.organization}
                          </p>
                        </div>

                        {exp.isCurrent && (
                          <Badge variant="success">Aktif Sekarang</Badge>
                        )}
                      </div>

                      {/* Location & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-subtle mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {duration.display}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {exp.location}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-foreground-muted leading-relaxed mb-4 whitespace-pre-wrap">
                        {exp.description}
                      </p>

                      {/* Highlights Bullet List */}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <div className="border-t border-border/40 pt-4 mt-2">
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block mb-2">
                            Pencapaian Utama
                          </span>
                          <ul className="flex flex-col gap-2">
                            {exp.highlights.map((highlight, hIdx) => (
                              <li key={hIdx} className="flex items-start gap-2 text-xs text-foreground-muted">
                                <CheckCircle2 size={14} className="text-accent mt-0.5 flex-shrink-0" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-body-lg text-foreground-muted">Pengalaman tidak ditemukan.</p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
