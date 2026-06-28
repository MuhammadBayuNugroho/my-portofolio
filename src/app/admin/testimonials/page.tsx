"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { testimonialsApi, mediaApi } from "@/lib/api";
import type { Testimonial, TestimonialRelation } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Upload } from "lucide-react";

export default function AdminTestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTesti, setEditingTesti] = useState<Testimonial | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [authorOrganization, setAuthorOrganization] = useState("");
  const [authorImageUrl, setAuthorImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [relation, setRelation] = useState<TestimonialRelation>("Client");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<"Published" | "Draft" | "Archived">("Published");
  const [featured, setFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await testimonialsApi.getAll();
      if (res.success && res.data) {
        setTestimonials(res.data);
      }
    } catch (err) {
      setError("Gagal memuat data testimoni.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenCreate = () => {
    setEditingTesti(null);
    setAuthorName("");
    setAuthorRole("");
    setAuthorOrganization("");
    setAuthorImageUrl("");
    setContent("");
    setRating(5);
    setRelation("Client");
    setProjectId("");
    setStatus("Published");
    setFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (testi: Testimonial) => {
    setEditingTesti(testi);
    setAuthorName(testi.authorName);
    setAuthorRole(testi.authorRole);
    setAuthorOrganization(testi.authorOrganization);
    setAuthorImageUrl(testi.authorImageUrl || "");
    setContent(testi.content);
    setRating(testi.rating || 5);
    setRelation(testi.relation || "Client");
    setProjectId(testi.projectId || "");
    setStatus(testi.status || "Published");
    setFeatured(!!testi.featured);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return;
    try {
      await testimonialsApi.delete(id, user.token);
      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (err) {
      alert("Gagal menghapus testimoni.");
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
            subfolder: "testimonials",
          },
          user.token
        );

        if (uploadRes.success && uploadRes.data) {
          setAuthorImageUrl(uploadRes.data.url);
          alert("Avatar berhasil diunggah ke Google Drive!");
        }
      } catch (err) {
        alert("Gagal mengunggah avatar ke Google Drive.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !authorName || !content) return;
    setIsSaving(true);

    const payload = {
      authorName,
      authorRole,
      authorOrganization,
      authorImageUrl,
      content,
      rating: Number(rating),
      relation,
      projectId,
      status,
      featured,
    };

    try {
      if (editingTesti) {
        await testimonialsApi.update(editingTesti.id, payload, user.token);
      } else {
        await testimonialsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert("Gagal menyimpan testimoni.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Testimoni (Testimonials)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola rekomendasi, review, dan ulasan dari klien atau rekan kerja.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Testimonial
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col justify-between" hoverEffect={false}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {t.authorImageUrl ? (
                      <img src={t.authorImageUrl} alt={t.authorName} className="h-10 w-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">{t.authorName.slice(0, 2)}</div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{t.authorName}</h4>
                      <p className="text-[10px] text-foreground-subtle">{t.authorRole} di {t.authorOrganization}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(t)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-error/80 hover:text-error p-1 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed italic mb-3">"{t.content}"</p>
                <div className="flex justify-between items-center text-[10px] text-foreground-subtle border-t border-border/40 pt-2">
                  <span>Hubungan: {t.relation}</span>
                  <span>Rating: {t.rating}/5</span>
                </div>
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
              {editingTesti ? "Edit Testimoni" : "Tambah Testimoni Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Nama Pengarang</label>
                  <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Jabatan (Role)</label>
                  <input type="text" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Organisasi/Perusahaan</label>
                  <input type="text" value={authorOrganization} onChange={(e) => setAuthorOrganization(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Hubungan</label>
                  <select value={relation} onChange={(e) => setRelation(e.target.value as TestimonialRelation)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <option value="Client">Client</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Supervisee">Supervisee</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Foto Avatar (Google Drive)</label>
                <div className="flex gap-2">
                  <input type="text" value={authorImageUrl} onChange={(e) => setAuthorImageUrl(e.target.value)} className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="https://lh3.googleusercontent.com/..." />
                  <label className="bg-background-overlay hover:bg-background-elevated border border-border px-3 py-2 rounded text-xs cursor-pointer flex items-center gap-1 font-semibold text-foreground">
                    <Upload size={12} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Isi Testimoni</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-20" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featuredCheck" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-foreground cursor-pointer">Featured?</label>
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
