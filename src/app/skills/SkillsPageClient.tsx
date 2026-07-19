"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Card, Badge, Input, SectionHeader, EmptyState, LoadingSpinner } from "@/components/ui";
import { Cpu, Search } from "lucide-react";
import useSWR from "swr";
import { skillsApi } from "@/lib/api";

export function SkillsPageClient() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const { data: skills = [], isLoading } = useSWR("skills", () =>
    skillsApi.getAll().then((res) => res.data || [])
  );

  const categories = React.useMemo(() => {
    const cats = [...new Set(skills.map((s) => s.category))].filter(Boolean) as string[];
    return ["All", ...cats];
  }, [skills]);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeFilter === "All" || skill.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout mainClassName="py-16">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionHeader
            badge="Kompetensi Teknis"
            BadgeIcon={Cpu}
            badgeVariant="violet"
            headingLevel="h1"
            title="Keahlian & Spesialisasi"
            description="Peta kompetensi penguasaan framework, tools desain grafis, sistem basis data, dan kemampuan interpersonal."
            align="center"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6 mb-10">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeFilter === cat
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full md:max-w-xs order-1 md:order-2">
            <Search className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4 pointer-events-none z-10" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari keahlian..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Skills Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="p-5 flex flex-col justify-between" hoverEffect={true}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-foreground-subtle uppercase font-bold tracking-wider mb-1 block">
                      {skill.category}
                    </span>
                    <span className="font-display text-body font-semibold text-foreground">{skill.name}</span>
                  </div>
                  <Badge variant="primary">{skill.level}</Badge>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-foreground-subtle mb-1.5">
                    <span>Kemahiran</span>
                    <span>{skill.percentage}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-background-overlay rounded-full h-1.5 border border-border/40 overflow-hidden">
                    <motion.div
                      className="bg-accent h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Keahlian tidak ditemukan."
            hint="Coba filter atau kata kunci yang berbeda."
          />
        )}
      </Container>
    </PageLayout>
  );
}
