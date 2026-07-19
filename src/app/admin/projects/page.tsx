"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { projectsApi, mediaApi } from "@/lib/api";
import type { Project } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GalleryUpload } from "@/components/admin/GalleryUpload";
import { Plus, Edit2, Trash2, Loader2, ExternalLink, Github, Figma, LayoutGrid, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Flexible Category Input ────────────────────────────────────
function CategoryInput({
  value,
  onChange,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
  );
  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground-muted select-none">
        Kategori * <span className="text-[10px] text-foreground-subtle font-normal">(ketik untuk baru)</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="w-full rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          placeholder="Contoh: Web, UI/UX, Mobile..."
          required
        />
        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden">
            {filtered.map((s) => (
              <button key={s} type="button" onMouseDown={() => { onChange(s); setOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors cursor-pointer">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isGalleryOnly, setIsGalleryOnly] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft" | "Archived">("Published");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(1);
  const [techInput, setTechInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Suggestions derived solely from existing projects (no hardcoded defaults)
  const existingCategories = useMemo(() => {
    return [...new Set(projects.map((p) => p.category).filter(Boolean))];
  }, [projects]);

  // Category tabs for list view
  const categoryTabs = useMemo(() => ["All", ...existingCategories], [existingCategories]);

  const filteredProjects = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.category === activeTab);
  }, [projects, activeTab]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectsApi.getAll();
      if (res.success && res.data) {
        setProjects(res.data.sort((a, b) => a.order - b.order));
      }
    } catch {
      setError("Gagal memuat data proyek.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setTitle(""); setSlug(""); setDescription(""); setContentMarkdown("");
    setCoverImage(""); setImages([]);
    setProjectUrl(""); setGithubUrl(""); setFigmaUrl("");
    setCategory(""); setIsGalleryOnly(false);
    setStatus("Published"); setFeatured(false);
    setOrder(projects.length + 1);
    setTechInput("");
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setSlug(project.slug);
    setDescription(project.description);
    setContentMarkdown(project.contentMarkdown);
    setCoverImage(project.coverImage);
    setImages(project.images || []);
    setProjectUrl(project.projectUrl || "");
    setGithubUrl(project.githubUrl || "");
    setFigmaUrl(project.figmaUrl || "");
    setCategory(project.category);
    setIsGalleryOnly(!!project.isGalleryOnly);
    setStatus(project.status || "Published");
    setFeatured(!!project.featured);
    setOrder(project.order || 1);
    setTechInput(project.techStack ? project.techStack.join(", ") : "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      await projectsApi.delete(id, user.token);
      setProjects(projects.filter((p) => p.id !== id));
    } catch {
      alert("Gagal menghapus proyek.");
    }
  };

  // Generic Base64 uploader helper
  const handleUploadFile = async (file: File, subfolder: string): Promise<string> => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(",")[1];
        try {
          const uploadRes = await mediaApi.upload(
            {
              filename: file.name,
              mimeType: file.type,
              base64Content,
              subfolder,
            },
            user!.token
          );
          if (uploadRes.success && uploadRes.data) {
            resolve(uploadRes.data.url);
          } else {
            reject(new Error("Gagal mengunggah gambar"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
    }).finally(() => {
      setIsUploading(false);
    });
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const url = await handleUploadFile(file, "projects/cover");
      setCoverImage(url);
    } catch {
      alert("Gagal mengunggah cover image ke Google Drive.");
    }
  };

  const handleGalleryUpload = async (file: File) => {
    try {
      const url = await handleUploadFile(file, "projects/gallery");
      setImages((prev) => [...prev, url]);
    } catch {
      alert("Gagal mengunggah gambar galeri ke Google Drive.");
    }
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !slug || !category) return;
    setIsSaving(true);

    const parsedTech = techInput.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      title, slug, description, contentMarkdown,
      coverImage, images,
      techStack: parsedTech,
      projectUrl, githubUrl, figmaUrl,
      category, isGalleryOnly,
      status, featured,
      order: Number(order),
    };

    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, payload, user.token);
      } else {
        await projectsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch {
      alert("Gagal menyimpan data proyek.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Proyek & Karya (Projects)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola proyek portofolio dan item galeri visual. Centang &quot;Gallery Only&quot; untuk menampilkan sebagai item galeri di halaman publik.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Tambah Proyek
        </Button>
      </div>

      {/* Category Tabs */}
      {!isLoading && !error && categoryTabs.length > 1 && (
        <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-background-overlay w-fit">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors",
                activeTab === cat
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {cat}
              <span className="ml-1.5 text-[10px] opacity-60">
                ({cat === "All" ? projects.length : projects.filter(p => p.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-error bg-error/10 border border-error/20 rounded-md">
          {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center" hoverEffect={false}>
          <Package className="mx-auto text-border mb-4" size={48} />
          <p className="text-foreground font-semibold">Belum ada proyek{activeTab !== "All" ? ` untuk kategori "${activeTab}"` : ""}.</p>
          <p className="text-xs text-foreground-muted mt-1">Tambahkan proyek pertama Anda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <Card key={proj.id} className="flex flex-col overflow-hidden" hoverEffect={false}>
              {proj.coverImage && (
                <div className="h-40 overflow-hidden relative">
                  <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="text-[9px] bg-background/80 border border-border px-2 py-0.5 rounded font-bold uppercase text-foreground">
                      {proj.category}
                    </span>
                    {proj.isGalleryOnly && (
                      <span className="text-[9px] bg-accent/80 text-accent-foreground border border-accent/20 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                        <LayoutGrid size={8} /> Gallery
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-foreground-subtle">
                      Order: {proj.order} • {proj.status}
                      {proj.featured && " • ⭐ Featured"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(proj)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(proj.id)} className="text-error/80 hover:text-error p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-display text-body font-bold text-foreground mb-1 leading-snug">{proj.title}</h4>
                  <p className="text-xs text-foreground-muted line-clamp-2 mb-3">{proj.description}</p>
                </div>

                <div className="border-t border-border/40 pt-3 flex flex-wrap gap-1 items-center justify-between text-xs text-foreground-subtle">
                  <span className="truncate max-w-[60%]">Stack: {proj.techStack?.join(", ") || "—"}</span>
                  <div className="flex gap-2">
                    {proj.projectUrl && (
                      <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                        <Github size={12} />
                      </a>
                    )}
                    {proj.figmaUrl && (
                      <a href={proj.figmaUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                        <Figma size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Proyek" : "Tambah Proyek Baru"}
        maxWidth="max-w-2xl"
        asForm
        onSubmit={handleSave}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? "Menyimpan..." : isUploading ? "Mengunggah..." : "Simpan Proyek"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Judul Proyek *"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingProject) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                }
              }}
              required
            />
            <Input
              label="Slug URL *"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          {/* Description */}
          <Textarea
            label="Deskripsi Singkat *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={300}
            showCounter
          />

          {/* Cover Image & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <ImageUpload
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              onRemove={() => setCoverImage("")}
              isUploading={isUploading}
              onUploadFile={handleCoverUpload}
            />
            <CategoryInput value={category} onChange={setCategory} suggestions={existingCategories} />
          </div>

          {/* Gallery Images */}
          <GalleryUpload
            label="Gambar Galeri Tambahan"
            images={images}
            onChange={setImages}
            isUploading={isUploading}
            onUploadFile={handleGalleryUpload}
          />

          {/* Tech Stack */}
          <Input
            label="Tech Stack (Pisahkan dengan koma)"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Next.js, TypeScript, TailwindCSS"
          />

          {/* Project Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Live URL"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
            <Input
              label="Figma URL"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://figma.com/..."
            />
          </div>

          {/* Studi Kasus / Markdown Content */}
          <Textarea
            label="Studi Kasus (Markdown — Opsional)"
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            placeholder="# Tentang Proyek Ini..."
            className="font-mono"
            rows={6}
          />

          {/* Flags & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-background-overlay/60 rounded-xl border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGalleryOnly}
                  onChange={(e) => setIsGalleryOnly(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 accent-accent"
                />
                <span>Gallery Only <span className="font-normal text-foreground-muted block text-[10px] mt-0.5">Tampil hanya sebagai galeri visual, tanpa halaman detail</span></span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 accent-accent"
                />
                <span>Featured? <span className="font-normal text-foreground-muted block text-[10px] mt-0.5">Tampil di halaman utama</span></span>
              </label>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground-muted select-none">Urutan & Status</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-1/3 rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  title="Urutan tampil"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Published" | "Draft" | "Archived")}
                  className="w-2/3 rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
