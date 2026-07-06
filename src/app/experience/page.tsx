"use client";

import { useState } from "react";
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

type PageTab = "work" | "organization" | "achievement";

export default function ExperiencePage() {
  const [activeTab, setActiveTab] = useState<PageTab>("work");
  
  const { data: experiences = [], isLoading } = useSWR("experiences", () =>
    experiencesApi.getAll().then((res) => res.data || [])
  );

  // Tab 1: Kerja filters
  const [activeWorkType, setActiveWorkType] = useState<ExperienceType | "All">("All");
  const workTypes: (ExperienceType | "All")[] = ["All", "Professional", "Freelance", "Career"];
  
  // Tab 2: Organisasi filters
  const [activeOrgType, setActiveOrgType] = useState<ExperienceType | "All">("All");
  const orgTypes: (ExperienceType | "All")[] = ["All", "Organizational", "Volunteer"];
  
  // Tab 3: Prestasi filters
  const [activeAchType, setActiveAchType] = useState<ExperienceType | "All">("All");
  const achTypes: (ExperienceType | "All")[] = ["All", "Achievement", "Leadership"];

  // Filtering Logic
  const filteredData = experiences.filter((exp) => {
    const typeStr = (exp.type || "").toString().trim().toLowerCase();
    
    if (activeTab === "work") {
      if (!["professional", "proffesional", "freelance", "career"].includes(typeStr)) return false;
      const awt = activeWorkType.toLowerCase();
      return awt === "all" || typeStr === awt || (typeStr === "proffesional" && awt === "professional");
    }
    if (activeTab === "organization") {
      if (!["organizational", "volunteer"].includes(typeStr)) return false;
      const aot = activeOrgType.toLowerCase();
      return aot === "all" || typeStr === aot;
    }
    if (activeTab === "achievement") {
      if (!["achievement", "leadership"].includes(typeStr)) return false;
      const aat = activeAchType.toLowerCase();
      return aat === "all" || typeStr === aat;
    }
    return false;
  });

  // Journey Helper Icons & Colors (For Prestasi)
  const getJourneyIcon = (type: string) => {
    switch (type) {
      case "Achievement":
        return Award;
      case "Leadership":
        return Landmark;
      default:
        return Compass;
    }
  };

  const getJourneyColor = (type: string) => {
    switch (type) {
      case "Achievement":
        return "text-warning border-warning bg-warning/5";
      case "Leadership":
        return "text-accent border-accent bg-accent/5";
      default:
        return "text-foreground-muted border-border bg-background-overlay";
    }
  };

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

          {/* Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap justify-center rounded-lg bg-background-elevated p-1 border border-border gap-1">
              <button
                onClick={() => setActiveTab("work")}
                className={`px-4 sm:px-6 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "work"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Pengalaman Kerja
              </button>
              <button
                onClick={() => setActiveTab("organization")}
                className={`px-4 sm:px-6 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "organization"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Pengalaman Organisasi
              </button>
              <button
                onClick={() => setActiveTab("achievement")}
                className={`px-4 sm:px-6 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "achievement"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Prestasi
              </button>
            </div>
          </div>

          {/* TAB 1 & 2: WORK & ORGANIZATION */}
          {(activeTab === "work" || activeTab === "organization") && (
            <>
              {/* Type Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-6 mb-12">
                {(activeTab === "work" ? workTypes : orgTypes).map((t) => (
                  <button
                    key={t}
                    onClick={() => activeTab === "work" ? setActiveWorkType(t) : setActiveOrgType(t)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      (activeTab === "work" ? activeWorkType : activeOrgType) === t
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                    }`}
                  >
                    {t}
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
                          <Briefcase size={12} />
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
                          <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                            {exp.description}
                          </p>

                          {/* Highlights Bullet List */}
                          {exp.highlights?.length > 0 && (
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
            </>
          )}

          {/* TAB 3: ACHIEVEMENT */}
          {activeTab === "achievement" && (
            <>
              {/* Journey Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-6 mb-12">
                {achTypes.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveAchType(cat)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      activeAchType === cat
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Journey Timeline */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-accent" size={32} />
                </div>
              ) : filteredData.length > 0 ? (
                <div className="relative max-w-3xl mx-auto pl-6 border-l-2 border-border/80 flex flex-col gap-10">
                  {filteredData.map((item, idx) => {
                    const IconComponent = getJourneyIcon(item.type);
                    const colorClass = getJourneyColor(item.type);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="relative"
                      >
                        {/* Timeline Node Dot */}
                        <span className={`absolute -left-[35px] top-1.5 flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 ${colorClass} shadow-soft dark:shadow-dark-soft`}>
                          <IconComponent size={12} />
                        </span>

                        {/* Card Container */}
                        <Card className={`p-6 ${item.isCurrent ? "border-accent/40 shadow-glow-accent" : ""}`} hoverEffect={true}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-foreground-subtle uppercase font-bold tracking-wider">
                                  {item.type}
                                </span>
                                {item.isCurrent && (
                                  <Badge variant="primary" className="text-[8px] px-1.5 py-0">Aktif</Badge>
                                )}
                              </div>
                              <h3 className="font-display text-h3 text-foreground font-semibold">
                                {item.title}
                              </h3>
                              <p className="text-caption text-foreground-muted font-medium">
                                {item.organization}
                              </p>
                            </div>

                            <span className="inline-flex self-start md:self-center items-center gap-1 text-[10px] font-bold text-foreground-subtle bg-background-overlay border border-border px-2 py-0.5 rounded">
                              <Calendar size={10} />
                              {item.startDate ? new Date(item.startDate).getFullYear() : "Sekarang"}
                            </span>
                          </div>

                          <p className="text-xs text-foreground-muted leading-relaxed">
                            {item.description}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-body-lg text-foreground-muted">Prestasi tidak ditemukan.</p>
                </div>
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
