"use client";

import { useState } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Badge, Input, SectionHeader, Modal, EmptyState, LoadingSpinner } from "@/components/ui";
import { ProjectCard } from "@/components/public/projects/ProjectCard";
import type { Project, ProjectCategory } from "@/types";
import { Search, ZoomIn, Calendar, Tag } from "lucide-react";
import useSWR from "swr";
import { projectsApi } from "@/lib/api";
import React from "react";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useSWR("projects", () =>
    projectsApi.getAll().then((res) => res.data || [])
  );

  // Search and Filters
  const [projectSearch, setProjectSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "All">("All");

  const existingCategories = React.useMemo(() => {
    const cats = [...new Set(projects.map((p) => p.category))];
    return ["All", ...cats];
  }, [projects]);

  const [selectedGalleryItem, setSelectedGalleryItem] = useState<Project | null>(null);

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      project.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (project.techStack &&
        project.techStack.some((tech) =>
          tech.toLowerCase().includes(projectSearch.toLowerCase())
        ));
    const matchesCategory = activeCategory === "All" || project.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout mainClassName="py-16">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionHeader
            headingLevel="h1"
            title="Portofolio Proyek & Karya Kreatif"
            description="Eksplorasi hasil rekayasa web, desain sistem antarmuka, ilustrasi vektor, dan mockup produk digital."
            align="center"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6 mb-10">
          {/* Category tabs */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 order-2 md:order-1">
            {existingCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as string)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategory === cat
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
            <Search className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4 pointer-events-none" />
            <Input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Cari proyek atau stack..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="h-full">
                {project.isGalleryOnly ? (
                  <div
                    onClick={() => setSelectedGalleryItem(project)}
                    className="relative rounded-xl overflow-hidden border border-border/60 bg-background-elevated group cursor-pointer shadow-soft hover:shadow-hover hover:border-border-strong transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-background-overlay">
                      {project.coverImage && (
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          width={400}
                          height={400}
                          loading="lazy"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 h-full w-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                          <ZoomIn size={18} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xs font-semibold text-foreground mb-1 line-clamp-1">
                        {project.title}
                      </h3>
                      <span className="text-[10px] text-foreground-subtle uppercase tracking-wider font-semibold">
                        {project.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <ProjectCard project={project} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Proyek tidak ditemukan."
            hint="Coba filter atau kata kunci yang berbeda."
          />
        )}
      </Container>

      {/* Gallery Lightbox — reusable Modal */}
      <Modal
        isOpen={!!selectedGalleryItem}
        onClose={() => setSelectedGalleryItem(null)}
        maxWidth="max-w-4xl"
        className="flex-col md:flex-row max-h-[90vh]"
      >
        {selectedGalleryItem && (
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left: Image */}
            <div className="relative flex-1 bg-background-overlay flex items-center justify-center min-h-[300px] md:min-h-0 aspect-video md:aspect-auto">
              {selectedGalleryItem.coverImage && (
                <Image
                  src={selectedGalleryItem.coverImage}
                  alt={selectedGalleryItem.title}
                  width={800}
                  height={600}
                  className="object-contain max-h-[70vh] w-full"
                />
              )}
            </div>

            {/* Right: Info Sidebar */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border p-6 flex flex-col justify-between bg-background-elevated">
              <div>
                <div className="mb-4">
                  <Badge variant="primary">{selectedGalleryItem.category}</Badge>
                </div>

                <h3 className="font-display text-h3 text-foreground font-bold mb-3">
                  {selectedGalleryItem.title}
                </h3>

                {selectedGalleryItem.description && (
                  <p className="text-xs text-foreground-muted mb-6 leading-relaxed">
                    {selectedGalleryItem.description}
                  </p>
                )}

                <div className="flex flex-col gap-3 border-t border-border/40 pt-4 text-xs">
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <Calendar size={14} />
                    <span>
                      Dibuat:{" "}
                      {new Date(selectedGalleryItem.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>

                  {selectedGalleryItem.techStack && selectedGalleryItem.techStack.length > 0 && (
                    <div className="flex items-start gap-2 text-foreground-muted">
                      <Tag size={14} className="mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {selectedGalleryItem.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-foreground-subtle text-[10px] bg-background-overlay border border-border px-1.5 py-0.5 rounded"
                          >
                            #{tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-6">
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  className="w-full py-2 bg-background-overlay hover:bg-border/60 text-xs font-semibold rounded-md border border-border text-foreground transition-colors cursor-pointer"
                >
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
