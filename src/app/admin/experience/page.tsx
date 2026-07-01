"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { experiencesApi } from "@/lib/api";
import type { Experience, ExperienceType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2, Briefcase, MapPin, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Jenis tipe berdasarkan tab ─────────────────────────────────
const WORK_TYPES: ExperienceType[] = ["Professional", "Freelance", "Career"];
const ORG_TYPES: ExperienceType[] = ["Organizational", "Volunteer"];
const ACH_TYPES: ExperienceType[] = ["Achievement", "Leadership"];
const EDU_TYPES: ExperienceType[] = ["Education", "Pendidikan"];

type TabKey = "work" | "organization" | "achievement" | "education";

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
  const [activeTab, setActiveTab] = useState<TabKey>("work");

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
  const [type, setType] = useState<ExperienceType>("Professional");
  const [logoUrl, setLogoUrl] = useState("");
  const [link, setLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Collect all existing types for autocomplete
  const existingTypes = useMemo(() => {
    const all = [...new Set(experiences.map((e) => e.type))];
    return all;
  }, [experiences]);

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
    return experiences.filter((e) => {
      if (activeTab === "work") return WORK_TYPES.includes(e.type as ExperienceType);
      if (activeTab === "organization") return ORG_TYPES.includes(e.type as ExperienceType);
      if (activeTab === "achievement") return ACH_TYPES.includes(e.type as ExperienceType);
      if (activeTab === "education") return EDU_TYPES.includes(e.type as ExperienceType);
      return false;
    });
  }, [experiences, activeTab]);

  const defaultType: ExperienceType = 
    activeTab === "work" ? "Professional" :
    activeTab === "organization" ? "Organizational" :
    activeTab === "achievement" ? "Achievement" : "Education";

  const handleOpenCreate = () => {
    setEditingExp(null);
    setTitle(""); setOrganization(""); setLocation("");
    setStartDate(""); setEndDate(""); setIsCurrent(false);
    setDescription(""); setHighlightsInput("");
    setType(defaultType);
    setLogoUrl(""); setLink("");
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
    setType(exp.type as ExperienceType);
    setLogoUrl(exp.logoUrl || "");
    setLink(exp.link || "");
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
    const payload = { title, organization, location, startDate, endDate: isCurrent ? "" : endDate, isCurrent, description, highlights, type, logoUrl, link };
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

  const tabs = [
    { key: "work" as TabKey, label: "💼 Pekerjaan", desc: "Professional, Freelance" },
    { key: "organization" as TabKey, label: "👥 Organisasi", desc: "Organizational, Volunteer" },
    { key: "achievement" as TabKey, label: "🏆 Prestasi", desc: "Achievement, Leadership" },
    { key: "education" as TabKey, label: "🎓 Pendidikan", desc: "Education, Kursus" },
  ];

  const typeOptions: ExperienceType[] = 
    activeTab === "work" ? WORK_TYPES :
    activeTab === "organization" ? ORG_TYPES :
    activeTab === "achievement" ? ACH_TYPES : EDU_TYPES;

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
      <div className="flex gap-1 p-1 rounded-lg bg-background-overlay w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2 rounded-md text-xs font-semibold transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {tab.label}
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
          <p className="text-xs text-foreground-muted mb-4">Belum ada data untuk kategori ini.</p>
          <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
            <Plus size={14} /> Tambah Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayed.map((exp) => (
            <Card key={exp.id} className="p-5 flex flex-col gap-3" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-accent uppercase font-bold tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                  {exp.type}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(exp)} className="text-foreground-subtle hover:text-foreground p-1.5 rounded transition-colors hover:bg-background-overlay">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="text-error/70 hover:text-error p-1.5 rounded transition-colors hover:bg-error/10">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-display text-body font-bold text-foreground leading-snug">{exp.title}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-foreground-subtle">
                  <span className="flex items-center gap-1"><Briefcase size={10} />{exp.organization}</span>
                  {exp.location && <span className="flex items-center gap-1"><MapPin size={10} />{exp.location}</span>}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-foreground-subtle">
                  <Calendar size={10} />
                  <span>{exp.startDate} — {exp.isCurrent ? "Sekarang" : (exp.endDate || "-")}</span>
                </div>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">{exp.description}</p>

              {exp.highlights && exp.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                  {exp.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="flex items-center gap-1 text-[9px] text-foreground-muted bg-background-overlay px-2 py-0.5 rounded-full">
                      <Star size={8} className="text-warning" />{h}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6" hoverEffect={false}>
            <h2 className="font-display text-h3 font-bold text-foreground mb-5">
              {editingExp ? "Edit Data" : "Tambah Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">

              {/* Tipe */}
              <CategoryInput
                label="Tipe / Kategori"
                value={type}
                onChange={(v) => setType(v as ExperienceType)}
                suggestions={[...typeOptions, ...existingTypes].filter((v, i, a) => a.indexOf(v) === i)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Nama Jabatan / Role</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Organisasi / Perusahaan</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Lokasi</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="Jakarta, Remote, dll." />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Tanggal Mulai</label>
                  <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded" />
                    Saat Ini Aktif
                  </label>
                  {!isCurrent && (
                    <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="YYYY-MM-DD" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Deskripsi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-20 resize-none" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Poin Highlight (pisahkan koma)</label>
                <input type="text" value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  placeholder="Meningkatkan performa 40%, Memimpin 4 developer, dll." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Logo URL</label>
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="https://..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Website Link</label>
                  <input type="text" value={link} onChange={(e) => setLink(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="https://..." />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
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
