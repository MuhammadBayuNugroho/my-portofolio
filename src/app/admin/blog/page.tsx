"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { blogsApi, mediaApi } from "@/lib/api";
import type { Blog } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Upload } from "lucide-react";

export default function AdminBlogPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("Tech");
  const [status, setStatus] = useState<"Published" | "Draft" | "Archived">("Published");
  const [featured, setFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await blogsApi.getAll();
      if (res.success && res.data) {
        setBlogs(res.data);
      }
    } catch (err) {
      setError("Gagal memuat data blog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContentMarkdown("");
    setCoverImage("");
    setTagsInput("");
    setCategory("Tech");
    setStatus("Published");
    setFeatured(false);
    setReadingTime(5);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContentMarkdown(blog.contentMarkdown);
    setCoverImage(blog.coverImage);
    setTagsInput(blog.tags ? blog.tags.join(", ") : "");
    setCategory(blog.category || "Tech");
    setStatus(blog.status || "Published");
    setFeatured(!!blog.featured);
    setReadingTime(blog.readingTime || 5);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
    try {
      await blogsApi.delete(id, user.token);
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (err) {
      alert("Gagal menghapus artikel.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            subfolder: "blog",
          },
          user.token
        );

        if (uploadRes.success && uploadRes.data) {
          setCoverImage(uploadRes.data.url);
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

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      title,
      slug,
      excerpt,
      contentMarkdown,
      coverImage,
      tags,
      category,
      status,
      featured,
      readingTime: Number(readingTime),
    };

    try {
      if (editingBlog) {
        await blogsApi.update(editingBlog.id, payload, user.token);
      } else {
        await blogsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      alert("Gagal menyimpan data blog.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Artikel Blog (Blog)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola publikasi artikel, tips teknologi, dan materi edukatif di web Anda.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Article
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
          {blogs.map((blog) => (
            <Card key={blog.id} className="flex flex-col overflow-hidden" hoverEffect={false}>
              {blog.coverImage && (
                <div className="h-40 overflow-hidden relative">
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] bg-background/80 border border-border px-2 py-0.5 rounded font-bold uppercase text-foreground">
                    {blog.category}
                  </span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-foreground-subtle">{blog.status} • {blog.views} Views</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(blog)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="text-error/80 hover:text-error p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-display text-body font-bold text-foreground mb-1 leading-snug">{blog.title}</h4>
                  <p className="text-xs text-foreground-muted line-clamp-2 mb-3">{blog.excerpt}</p>
                </div>
                <div className="border-t border-border/40 pt-3 flex flex-wrap gap-1 text-[10px] text-foreground-subtle">
                  Tags: {blog.tags ? blog.tags.join(", ") : "-"}
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
              {editingBlog ? "Edit Artikel" : "Tambah Artikel Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Judul Artikel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingBlog) {
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
                <label className="text-xs font-semibold text-foreground-muted">Kutipan Singkat (Excerpt)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-16"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Konten Lengkap (Markdown)</label>
                <textarea
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-40 font-mono"
                  required
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
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    placeholder="Tech, Design, Lifestyle"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-semibold text-foreground-muted">Tags (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    placeholder="Next.js, Frontend, CSS"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Estimasi Baca (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center mt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                  <span>Featured?</span>
                </label>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-semibold text-foreground-muted">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as "Published" | "Draft" | "Archived")} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
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
