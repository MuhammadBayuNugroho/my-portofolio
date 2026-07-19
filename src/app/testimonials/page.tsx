"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Card, LoadingSpinner, EmptyState } from "@/components/ui";
import type { TestimonialRelation } from "@/types";
import { Star, Quote, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { testimonialsApi } from "@/lib/api";

export default function TestimonialsPage() {
  const [activeRelation, setActiveRelation] = useState<TestimonialRelation | "All">("All");

  const { data: testimonials = [], isLoading } = useSWR("testimonials", () =>
    testimonialsApi.getAll().then((res) => res.data || [])
  );

  const relations = useMemo(() => {
    const rels = [...new Set(testimonials.map((t) => t.relation))].filter(Boolean) as string[];
    return ["All", ...rels];
  }, [testimonials]);

  // Filtering Logic
  const filteredTestimonials = testimonials.filter((t) => {
    return activeRelation === "All" || t.relation === activeRelation;
  });

  return (
    <PageLayout mainClassName="py-12">
      <Container>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-h1 text-foreground mb-4">
              Ulasan & Testimoni
            </h1>
            <p className="text-body text-foreground-muted">
              Pendapat jujur dari para klien, rekan kerja, dan mentor mengenai kolaborasi proyek serta gaya kepemimpinan saya.
            </p>
          </div>

          {/* Relation Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-6 mb-12">
            {relations.map((rel) => (
              <button
                key={rel}
                onClick={() => setActiveRelation(rel as TestimonialRelation | "All")}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeRelation === rel
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                }`}
              >
                {rel === "All" ? "Semua Relasi" : rel}
              </button>
            ))}
          </div>

          {/* Testimonials Grid */}
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTestimonials.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card className="h-full flex flex-col justify-between relative p-6" hoverEffect={true}>
                    {/* Background Quote Icon for Aesthetics */}
                    <div className="absolute top-6 right-6 text-foreground-subtle/20 pointer-events-none">
                      <Quote size={40} />
                    </div>

                    <div className="relative z-10">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-4 text-warning">
                        {Array.from({ length: t.rating }).map((_, sIdx) => (
                          <Star key={sIdx} size={16} fill="currentColor" />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="text-xs text-foreground-muted italic leading-relaxed mb-6">
                        "{t.content}"
                      </p>
                    </div>

                    {/* Author Footer */}
                    <div className="flex items-center gap-3 border-t border-border/40 pt-4 mt-auto">
                      {t.authorImageUrl ? (
                        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-border bg-background-overlay">
                          <Image
                            src={t.authorImageUrl}
                            alt={t.authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <MessageSquare size={16} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{t.authorName}</h4>
                        <p className="text-[10px] text-foreground-subtle truncate">
                          {t.authorRole} {t.authorOrganization ? `di ${t.authorOrganization}` : ""}
                        </p>
                        <span className="inline-block mt-1 text-[8px] bg-background-overlay text-foreground-muted border border-border px-1.5 py-0.5 rounded font-bold uppercase">
                          {t.relation}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState message="Ulasan tidak ditemukan." />
          )}
        </Container>
    </PageLayout>
  );
}
