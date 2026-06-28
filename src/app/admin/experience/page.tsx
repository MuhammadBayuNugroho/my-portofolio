"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { experiencesApi } from "@/lib/api";
import type { Experience } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function AdminExperiencePage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [highlightsInput, setHighlightsInput] = useState("");
  const [type, setType] = useState<"Professional" | "Freelance">("Professional");
  const [logoUrl, setLogoUrl] = useState("");
  const [link, setLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const res = await experiencesApi.getAll();
      if (res.success && res.data) {
        // Filter only Professional and Freelance types
        const filtered = res.data.filter((e) => e.type === "Professional" || e.type === "Freelance");
        setExperiences(filtered);
      }
    } catch (err) {
      setError("Gagal memuat data pengalaman.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenCreate = () => {
    setEditingExp(null);
    setTitle("");
    setOrganization("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setDescription("");
    setHighlightsInput("");
    setType("Professional");
    setLogoUrl("");
    setLink("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingExp(exp);
    setTitle(exp.title);
    setOrganization(exp.organization);
    setLocation(exp.location || "");
    setStartDate(exp.startDate || "");
    setEndDate(exp.endDate || "");
    setIsCurrent(!!exp.isCurrent);
    setDescription(exp.description);
    setHighlightsInput(exp.highlights ? exp.highlights.join(", ") : "");
    setType(exp.type === "Freelance" ? "Freelance" : "Professional");
    setLogoUrl(exp.logoUrl || "");
    setLink(exp.link || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) return;
    try {
      await experiencesApi.delete(id, user.token);
      setExperiences(experiences.filter((exp) => exp.id !== id));
    } catch (err) {
      alert("Gagal menghapus pengalaman.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !organization) return;
    setIsSaving(true);

    const highlights = highlightsInput.split(",").map((h) => h.trim()).filter(Boolean);

    const payload = {
      title,
      organization,
      location,
      startDate,
      endDate: isCurrent ? "" : endDate,
      isCurrent,
      description,
      highlights,
      type,
      logoUrl,
      link,
    };

    try {
      if (editingExp) {
        await experiencesApi.update(editingExp.id, payload, user.token);
      } else {
        await experiencesApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err) {
      alert("Gagal menyimpan data pengalaman.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Pengalaman Kerja (Experience)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola pengalaman profesional kerja full-time, part-time, maupun freelance.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Experience
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
          {experiences.map((exp) => (
            <Card key={exp.id} className="p-5 flex flex-col justify-between" hoverEffect={false}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-accent uppercase font-bold tracking-wider">
                    {exp.type}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(exp)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(exp.id)} className="text-error/80 hover:text-error p-1 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-display text-body font-bold text-foreground mb-1 leading-snug">
                  {exp.title}
                </h4>
                <p className="text-xs text-foreground-muted font-semibold mb-2">
                  {exp.organization} — {exp.location || "Remotely"}
                </p>
                <p className="text-[10px] text-foreground-subtle mb-3">
                  {exp.startDate} s/d {exp.isCurrent ? "Sekarang" : exp.endDate}
                </p>
                <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3 mb-4">
                  {exp.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6" hoverEffect={false}>
            <h2 className="font-display text-h3 font-bold text-foreground mb-4">
              {editingExp ? "Edit Pengalaman Kerja" : "Tambah Pengalaman Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Nama Jabatan/Role</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Organisasi/Perusahaan</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Lokasi</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Jakarta, Remote" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tipe Pekerjaan</label>
                  <select value={type} onChange={(e) => setType(e.target.value as "Professional" | "Freelance")} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs">
                    <option value="Professional">Professional</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Mulai</label>
                  <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <input type="checkbox" id="currentCheck" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded" />
                    <label htmlFor="currentCheck" className="text-xs font-semibold text-foreground cursor-pointer">Saat Ini Aktif?</label>
                  </div>
                  {!isCurrent && (
                    <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD" required />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Deskripsi Tugas</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-20" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Poin Highlight (Pisahkan dengan koma)</label>
                <input type="text" value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Meningkatkan performa web 40%, dll." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Logo Perusahaan URL</label>
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Website Link</label>
                  <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
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
