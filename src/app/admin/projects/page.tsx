"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { projectsApi, mediaApi } from "@/lib/api";
import type { Project, ProjectCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Upload, ExternalLink } from "lucide-react";

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [category, setCategory] = useState<ProjectCategory>("Web");
  const [isGalleryOnly, setIsGalleryOnly] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft" | "Archived">("Published");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Temp Inputs
  const [techInput, setTechInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectsApi.getAll();
      if (res.success && res.data) {
        setProjects(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      setError("Gagal memuat data proyek.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContentMarkdown("");
    setCoverImage("");
    setImages([]);
    setProjectUrl("");
    setGithubUrl("");
    setFigmaUrl("");
    setCategory("Web");
    setIsGalleryOnly(false);
    setStatus("Published");
    setFeatured(false);
    setOrder(projects.length + 1);
    setTechInput("");
    setGalleryInput("");
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
    setGalleryInput(project.images ? project.images.join(", ") : "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      await projectsApi.delete(id, user.token);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert("Gagal menghapus proyek.");
    }
  };

  // Convert uploaded image to base64 and upload to Drive
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "cover" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Content = (reader.result as string).split(",")[1];
      try {
        const uploadRes = await mediaApi.upload(
          {
            filename: file.name,
            mimeType: file.type,
            base64Content,
            subfolder: "projects/" + (field === "cover" ? "cover" : "gallery"),
          },
          user.token
        );

        if (uploadRes.success && uploadRes.data) {
          if (field === "cover") {
            setCoverImage(uploadRes.data.url);
          } else {
            setImages([...images, uploadRes.data.url]);
          }
          alert("File berhasil diunggah ke Google Drive!");
        }
      } catch (err) {
        alert("Gagal mengunggah file ke Google Drive.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !slug) return;
    setIsSaving(true);

    const parsedTech = techInput.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedImages = galleryInput ? galleryInput.split(",").map((s) => s.trim()).filter(Boolean) : images;

    const payload = {
      title,
      slug,
      description,
      contentMarkdown,
      coverImage,
      images: parsedImages,
      techStack: parsedTech,
      projectUrl,
      githubUrl,
      figmaUrl,
      category,
      isGalleryOnly,
      status,
      featured,
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
    } catch (err) {
      alert("Gagal menyimpan data proyek.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Proyek (Projects)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola studi kasus proyek portofolio dan item galeri visual Anda.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-error bg-error/10 border border-error/20 rounded-md">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="flex flex-col overflow-hidden" hoverEffect={false}>
              {proj.coverImage && (
                <div className="h-40 overflow-hidden relative">
                  <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] bg-background/80 border border-border px-2 py-0.5 rounded font-bold uppercase text-foreground">
                    {proj.category}
                  </span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-foreground-subtle">Order: {proj.order} • {proj.status}</span>
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
                  <span>Stack: {proj.techStack ? proj.techStack.join(", ") : "-"}</span>
                  <div className="flex gap-2">
                    {proj.projectUrl && (
                      <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                        <ExternalLink size={12} />
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 my-8" hoverEffect={false}>
            <h2 className="font-display text-h3 font-bold text-foreground mb-4">
              {editingProject ? "Edit Proyek" : "Tambah Proyek Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Judul Proyek</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingProject) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                      }
                    }}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Slug URL</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Deskripsi Singkat</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-16"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Studi Kasus (Markdown)</label>
                <textarea
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-32 font-mono"
                  placeholder="# Studi Kasus Proyek..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Cover Image URL (Direct Link)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
                    />
                    <label className="bg-background-overlay hover:bg-background-elevated border border-border px-3 py-2 rounded text-xs cursor-pointer flex items-center gap-1 font-semibold text-foreground">
                      <Upload size={12} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} disabled={isUploading} />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Web">Web</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Tech Stack (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  placeholder="Next.js, TailwindCSS, TypeScript"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Project Live URL</label>
                  <input type="text" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">GitHub Repositori URL</label>
                  <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Figma File URL</label>
                  <input type="text" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 items-center mt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                  <input type="checkbox" checked={isGalleryOnly} onChange={(e) => setIsGalleryOnly(e.target.checked)} className="rounded" />
                  <span>Gallery Only?</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                  <span>Featured?</span>
                </label>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-semibold text-foreground-muted">Urutan & Status</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-1/3 rounded-md border border-border bg-background px-3 py-2 text-xs" />
                    <select value={status} onChange={(e) => setStatus(e.target.value as "Published" | "Draft" | "Archived")} className="w-2/3 rounded-md border border-border bg-background px-3 py-2 text-xs">
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving || isUploading}>
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
