"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "../Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SkillCategory } from "@/types";
import { Code2, ArrowUpRight, Loader2 } from "lucide-react";
import { fadeUpVariants, staggerContainerVariants, viewportOptions, staggerItemVariants } from "@/lib/animations";
import Link from "next/link";
import useSWR from "swr";
import { skillsApi } from "@/lib/api";

export function SkillsPreview() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "All">("All");

  const { data: skills = [], isLoading } = useSWR("skills", () =>
    skillsApi.getAll().then((res) => res.data || [])
  );

  const categories: (SkillCategory | "All")[] = [
    "All",
    "Frontend",
    "Design",
    "Backend",
    "Tools",
    "Soft Skills",
  ];

  const filteredSkills = activeCategory === "All"
    ? skills
    : skills.filter(skill => skill.category === activeCategory);

  return (
    <section className="section-padding bg-background">
      <Container>
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="flex flex-col gap-10"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 rounded-full bg-violet-muted/20 px-3 py-1 text-xs font-semibold text-violet mb-4">
                <Code2 size={12} />
                <span>Keahlian</span>
              </motion.div>
              <motion.h2 variants={fadeUpVariants} className="font-display text-h1 text-foreground">
                Teknologi & Desain yang Saya Kuasai
              </motion.h2>
            </div>
            
            <motion.div variants={fadeUpVariants}>
              <Link href="/skills" className="inline-flex items-center gap-1.5 text-accent font-medium hover:text-accent-hover transition-colors text-caption">
                Lihat detail semua keahlian
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Categories Tab Bar */}
          <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-2 border-b border-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-caption font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Skills Grid */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : (
            <motion.div
              variants={staggerContainerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {filteredSkills.slice(0, 9).map((skill) => (
              <motion.div key={skill.id} variants={staggerItemVariants}>
                <Card className="p-5 flex flex-col justify-between" hoverEffect={true}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-body font-semibold text-foreground">{skill.name}</span>
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
              </motion.div>
            ))}
          </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
