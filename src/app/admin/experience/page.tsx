"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { experiencesApi } from "@/lib/api";
import type { Experience, ExperienceType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Briefcase, MapPin, Calendar, Star } from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";

// ─── Flexible Category Tag Input ────────────────────────────────
function CategoryInput({
  value,
  onChange,
  suggestions,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(inputVal.toLowerCase()) && s !== inputVal
  );

  const commit = (v: string) => {
    setInputVal(v);
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-semibold text-foreground-muted">{label}</label>
      <input
        type="text"
        value={inputVal}
        onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
        placeholder="Ketik atau pilih..."
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-border bg-background-elevated shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => commit(s)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [type, setType] = useState<string>("Professional");
  const [logoUrl, setLogoUrl] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Collect all existing types for autocomplete
  const existingTypes = useMemo(() => {
    const all = [...new Set(experiences.map((e) => e.type))].filter(Boolean) as string[];
    return all;
  }, [experiences]);

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categoriesTabs = useMemo(() => {
    return ["All", ...existingTypes];
  }, [existingTypes]);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const res = await experiencesApi.getAll();
      if (res.success && res.data) {
        setExperiences(res.data);
      }
    } catch {
      setError("Gagal memuat data pengalaman.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchExperiences(); }, []);

  // Data filtered by tab
  const displayed = useMemo(() => {
    let list = [...experiences];
    if (activeCategory !== "All") {
      list = list.filter((e) => e.type === activeCategory);
    }
    // sort by order, then start date desc
    return list.sort((a, b) => {
      if ((a.order || 0) !== (b.order || 0)) return (a.order || 0) - (b.order || 0);
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    });
  }, [experiences, activeCategory]);

  const handleOpenCreate = () => {
    setEditingExp(null);
    setTitle(""); setOrganization(""); setLocation("");
    setStartDate(""); setEndDate(""); setIsCurrent(false);
    setDescription(""); setHighlightsInput("");
    setType("Professional");
    setLogoUrl(""); setLink("");
    setOrder(0);
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
    setType(exp.type as string);
    setLogoUrl(exp.logoUrl || "");
    setLink(exp.link || "");
    setOrder(exp.order || 0);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus item ini?")) return;
    try {
      await experiencesApi.delete(id, user.token);
      setExperiences(experiences.filter((e) => e.id !== id));
    } catch {
      alert("Gagal menghapus data.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !organization) return;
    setIsSaving(true);
    const highlights = highlightsInput.split(",").map((h) => h.trim()).filter(Boolean);
    const payload = { title, organization, location, startDate, endDate: isCurrent ? "" : endDate, isCurrent, description, highlights, type, logoUrl, link, order: Number(order) };
    try {
      if (editingExp) {
        await experiencesApi.update(editingExp.id, payload, user.token);
      } else {
        await experiencesApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch {
      alert("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Experience & Journey</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola seluruh pengalaman kerja profesional dan perjalanan karir Anda.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Tambah Baru
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-background-overlay w-fit">
        {categoriesTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-5 py-2 rounded-md text-xs font-semibold transition-colors",
              activeCategory === cat
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-error bg-error/10 border border-error/20 rounded-md">{error}</div>
      ) : displayed.length === 0 ? (
        <Card className="p-12 text-center" hoverEffect={false}>
          <Briefcase className="mx-auto text-border mb-4" size={48} />
          <p className="text-foreground font-semibold">Belum ada pengalaman.</p>
          <p className="text-xs text-foreground-muted">Tambahkan pengalaman pertama Anda.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((exp) => (
            <Card key={exp.id} className="p-5 flex flex-col md:flex-row justify-between gap-4" hoverEffect={false}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {exp.type}
                  </span>
                  {exp.isCurrent && (
                    <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                      <Star size={10} /> Aktif
                    </span>
                  )}
                  {exp.order !== undefined && exp.order > 0 && (
                    <span className="text-[10px] bg-foreground/10 text-foreground px-2 py-0.5 rounded font-bold">
                      Order: {exp.order}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-base">{exp.title}</h3>
                <p className="text-foreground-muted text-sm">{exp.organization}</p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-foreground-subtle">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {formatDateShort(exp.startDate)} - {exp.isCurrent ? "Sekarang" : formatDateShort(exp.endDate)}</span>
                  {exp.location && <span className="flex items-center gap-1"><MapPin size={12}/> {exp.location}</span>}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Button onClick={() => handleOpenEdit(exp)} variant="outline" className="px-3 py-1.5 h-auto text-xs flex items-center gap-1">
                  <Edit2 size={12} /> Edit
                </Button>
                <Button onClick={() => handleDelete(exp.id)} variant="outline" className="px-3 py-1.5 h-auto text-xs flex items-center gap-1 text-error hover:text-error-foreground hover:bg-error border-error/20 hover:border-error">
                  <Trash2 size={12} /> Hapus
                </Button>
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
              {editingExp ? "Edit Pengalaman" : "Tambah Pengalaman"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Jabatan / Posisi / Penghargaan</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Nama Organisasi / Perusahaan</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Lokasi (Opsional)</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Jakarta, Indonesia" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kategori / Tipe (Ketik untuk buat baru)</label>
                  <CategoryInput value={type} onChange={setType} suggestions={existingTypes} label="" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Mulai</label>
                  <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Misal: 2021-01 atau Jan 2021" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Selesai</label>
                  <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isCurrent} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs disabled:opacity-50" placeholder="Biarkan kosong jika masih aktif" />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input type="checkbox" id="isCurrent" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded" />
                  <label htmlFor="isCurrent" className="text-xs font-semibold text-foreground cursor-pointer">Masih Aktif</label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Deskripsi Tugas (Opsional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-20" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Highlight Pencapaian (Pisahkan dengan koma)</label>
                <textarea value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-16" placeholder="Meningkatkan konversi 20%, Memimpin tim 5 orang..." />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Urutan Tampil (Opsional)</label>
                  <input type="number" min="0" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="0" />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border">
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
