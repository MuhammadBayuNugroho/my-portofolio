"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { certificatesApi, mediaApi } from "@/lib/api";
import type { Certificate, CertificateCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Upload } from "lucide-react";

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
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
        placeholder="Contoh: Frontend, Leadership, Cloud..."
        required
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-border bg-background-elevated shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_CATEGORIES = ["Frontend", "Design", "Leadership", "Backend", "Cloud", "Data", "Soft Skills", "Other"];

export default function AdminCertificatesPage() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState<CertificateCategory>("Frontend");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Expired">("Active");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const existingCategories = React.useMemo(() => {
    const cats = [...new Set(certs.map((c) => c.category))];
    return [...new Set([...DEFAULT_CATEGORIES, ...cats])];
  }, [certs]);

  const fetchCerts = async () => {
    setIsLoading(true);
    try {
      const res = await certificatesApi.getAll();
      if (res.success && res.data) {
        setCerts(res.data);
      }
    } catch (err) {
      setError("Gagal memuat data sertifikat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleOpenCreate = () => {
    setEditingCert(null);
    setTitle("");
    setIssuer("");
    setCategory("Frontend");
    setIssueDate("");
    setExpiryDate("");
    setCredentialId("");
    setCredentialUrl("");
    setImageUrl("");
    setDescription("");
    setStatus("Active");
    setFeatured(false);
    setOrder(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cert: Certificate) => {
    setEditingCert(cert);
    setTitle(cert.title);
    setIssuer(cert.issuer);
    setCategory(cert.category);
    setIssueDate(cert.issueDate || "");
    setExpiryDate(cert.expiryDate || "");
    setCredentialId(cert.credentialId || "");
    setCredentialUrl(cert.credentialUrl || "");
    setImageUrl(cert.imageUrl || "");
    setDescription(cert.description || "");
    setStatus(cert.status || "Active");
    setFeatured(!!cert.featured);
    setOrder(cert.order || 0);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) return;
    try {
      await certificatesApi.delete(id, user.token);
      setCerts(certs.filter((c) => c.id !== id));
    } catch (err) {
      alert("Gagal menghapus sertifikat.");
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
            subfolder: "certificates",
          },
          user.token
        );

        if (uploadRes.success && uploadRes.data) {
          setImageUrl(uploadRes.data.url);
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
    if (!user || !title || !issuer) return;
    setIsSaving(true);

    const payload = {
      title,
      issuer,
      category,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      imageUrl,
      description,
      status,
      featured,
      order: Number(order),
    };

    try {
      if (editingCert) {
        await certificatesApi.update(editingCert.id, payload, user.token);
      } else {
        await certificatesApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchCerts();
    } catch (err) {
      alert("Gagal menyimpan data sertifikat.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Sertifikat (Certificates)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola file sertifikasi keahlian, kursus online, dan tanda penghargaan Anda.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Certificate
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
          {certs.map((c) => (
            <Card key={c.id} className="flex flex-col overflow-hidden" hoverEffect={false}>
              {c.imageUrl && (
                <div className="h-40 overflow-hidden relative">
                  <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] bg-background/80 border border-border px-2 py-0.5 rounded font-bold uppercase text-foreground">
                    {c.category}
                  </span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-foreground-subtle">{c.status} • {c.issueDate}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(c)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-error/80 hover:text-error p-1 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-display text-body font-bold text-foreground mb-1 leading-snug">{c.title}</h4>
                  <p className="text-xs text-foreground-muted mb-3">Penerbit: {c.issuer}</p>
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
              {editingCert ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Nama Sertifikat</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Penerbit (Issuer)</label>
                <input type="text" value={issuer} onChange={(e) => setIssuer(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
              </div>



              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">
                  Kategori
                  <span className="ml-1 text-[9px] text-foreground-subtle font-normal">(ketik untuk buat baru)</span>
                </label>
                <CategoryInput value={category} onChange={(v) => setCategory(v as CertificateCategory)} suggestions={existingCategories} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Terbit</label>
                  <input type="text" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Expired</label>
                  <input type="text" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD (Opsional)" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Credential ID</label>
                  <input type="text" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Credential URL</label>
                  <input type="text" value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Gambar Preview (Google Drive)</label>
                <div className="flex gap-2">
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="https://lh3.googleusercontent.com/..." required />
                  <label className="bg-background-overlay hover:bg-background-elevated border border-border px-3 py-2 rounded text-xs cursor-pointer flex items-center gap-1 font-semibold text-foreground">
                    <Upload size={12} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 items-center mt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                  <span>Featured?</span>
                </label>
                <div className="flex flex-col gap-1.5 col-span-3">
                  <label className="text-xs font-semibold text-foreground-muted">Status & Urutan Tampil (Opsional)</label>
                  <div className="flex gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value as "Active" | "Expired")} className="w-1/2 rounded-md border border-border bg-background px-3 py-2 text-xs">
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                    </select>
                    <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-1/2 rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Urutan (opsional)" />
                  </div>
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
