"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { projectsApi, mediaApi } from "@/lib/api";
import type { Project, ProjectCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Upload } from "lucide-react";

export default function AdminGalleryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("UI/UX");
  const [order, setOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    try {
      const res = await projectsApi.getAll();
      if (res.success && res.data) {
        // Filter projects that are marked as isGalleryOnly
        const galleryItems = res.data.filter((p) => p.isGalleryOnly === true);
        setItems(galleryItems.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      setError("Gagal memuat data galeri.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle("");
    setCoverImage("");
    setCategory("UI/UX");
    setOrder(items.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Project) => {
    setEditingItem(item);
    setTitle(item.title);
    setCoverImage(item.coverImage);
    setCategory(item.category);
    setOrder(item.order || 1);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus item galeri ini?")) return;
    try {
      await projectsApi.delete(id, user.token);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert("Gagal menghapus item galeri.");
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
            subfolder: "projects/gallery",
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
    if (!user || !title || !coverImage) return;
    setIsSaving(true);

    // Slug generator for gallery items
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-gallery-" + Date.now();

    const payload = {
      title,
      slug,
      description: "Visual asset - " + title,
      contentMarkdown: "",
      coverImage,
      images: [coverImage],
      techStack: [],
      category,
      isGalleryOnly: true,
      status: "Published" as const,
      featured: false,
      order: Number(order),
    };

    try {
      if (editingItem) {
        await projectsApi.update(editingItem.id, payload, user.token);
      } else {
        await projectsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchGalleryItems();
    } catch (err) {
      alert("Gagal menyimpan item galeri.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Galeri Visual (Gallery)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola karya seni visual, logo, atau ilustrasi murni (isGalleryOnly) yang langsung terhubung ke Google Drive.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Visual
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden relative group" hoverEffect={false}>
              <div className="h-40 overflow-hidden relative">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <button onClick={() => handleOpenEdit(item)} className="p-2 bg-background/90 text-foreground hover:bg-background rounded-full transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-error/90 text-error-foreground hover:bg-error rounded-full transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-background-elevated">
                <span className="text-[9px] text-accent uppercase font-bold tracking-wider mb-1 block">
                  {item.category}
                </span>
                <h5 className="font-semibold text-xs text-foreground truncate">{item.title}</h5>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6" hoverEffect={false}>
            <h2 className="font-display text-h3 font-bold text-foreground mb-4">
              {editingItem ? "Edit Visual Asset" : "Tambah Visual Asset Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Nama Karya</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  placeholder="Karya Minimalis Modern"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Unggah File (Ke Drive)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs"
                    placeholder="https://lh3.googleusercontent.com/..."
                    required
                  />
                  <label className="bg-background-overlay hover:bg-background-elevated border border-border px-3 py-2 rounded text-xs cursor-pointer flex items-center gap-1 font-semibold text-foreground">
                    <Upload size={12} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Web Design">Web Design</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Illustration">Illustration</option>
                    <option value="UI/UX">UI/UX</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
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
