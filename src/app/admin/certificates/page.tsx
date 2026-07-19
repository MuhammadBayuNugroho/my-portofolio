"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { certificatesApi, mediaApi } from "@/lib/api";
import type { Certificate, CertificateCategory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal, Input } from "@/components/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";


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
          placeholder="Contoh: Frontend, Leadership, Cloud..."
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
  const [category, setCategory] = useState<CertificateCategory>("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Expired">("Active");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState<number | "">("");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Suggestions are derived solely from existing certificate categories (no hardcoded defaults)
  const existingCategories = React.useMemo(() => {
    return [...new Set(certs.map((c) => c.category).filter(Boolean))];
  }, [certs]);

  const fetchCerts = async () => {
    setIsLoading(true);
    try {
      const res = await certificatesApi.getAll();
      if (res.success && res.data) {
        // Urutkan berdasarkan order terlebih dahulu (yang punya order), 
        // lalu baru yang tidak punya order, dan terakhir berdasarkan tanggal
        const sortedCerts = res.data.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          if (a.order !== undefined) return -1;
          if (b.order !== undefined) return 1;
          // Keduanya undefined order, urutkan berdasarkan date descending
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        });
        setCerts(sortedCerts);
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
    setCategory("");
    setIssueDate("");
    setExpiryDate("");
    setCredentialId("");
    setCredentialUrl("");
    setImageUrl("");
    setDescription("");
    setStatus("Active");
    setFeatured(false);
    setOrder("");
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
    setOrder(cert.order !== undefined ? cert.order : "");
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

  const handleCoverUpload = async (file: File) => {
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
          user!.token
        );

        if (uploadRes.success && uploadRes.data) {
          setImageUrl(uploadRes.data.url);
        }
      } catch {
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
      order: order !== "" ? Number(order) : undefined,
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
        maxWidth="max-w-md"
        asForm
        onSubmit={handleSave}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Nama Sertifikat *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Penerbit (Issuer) *"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            required
          />

          <CategoryInput
            value={category}
            onChange={(v) => setCategory(v as CertificateCategory)}
            suggestions={existingCategories}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Terbit *"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              required
            />
            <Input
              label="Tanggal Expired"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="YYYY-MM-DD (Opsional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Credential ID"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
            />
            <Input
              label="Credential URL"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <ImageUpload
            label="Gambar Preview (Google Drive)"
            value={imageUrl}
            onChange={setImageUrl}
            onRemove={() => setImageUrl("")}
            isUploading={isUploading}
            onUploadFile={handleCoverUpload}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background-overlay/60 rounded-xl border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 accent-accent"
              />
              <span>Featured? <span className="font-normal text-foreground-muted block text-[10px] mt-0.5">Tampil di jajaran sertifikat utama</span></span>
            </label>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground-muted select-none">Status & Urutan</span>
              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Active" | "Expired")}
                  className="w-1/2 rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </select>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Urutan"
                  wrapperClassName="w-1/2"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
