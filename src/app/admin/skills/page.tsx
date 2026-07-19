"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { skillsApi } from "@/lib/api";
import type { Skill, SkillLevel } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal, Input } from "@/components/ui";
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
          placeholder="Contoh: Frontend, Design, Tools..."
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



export default function AdminSkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState<SkillLevel>("Intermediate");
  const [percentage, setPercentage] = useState(80);
  const [order, setOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Suggestions are derived solely from existing skill categories (no hardcoded defaults)
  const existingCategories = useMemo(() => {
    return [...new Set(skills.map((s) => s.category).filter(Boolean))];
  }, [skills]);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const res = await skillsApi.getAll();
      if (res.success && res.data) setSkills(res.data.sort((a, b) => a.order - b.order));
    } catch { setError("Gagal memuat data skill."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleOpenCreate = () => {
    setEditingSkill(null); setName(""); setCategory("");
    setLevel("Intermediate"); setPercentage(80); setOrder(skills.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill); setName(skill.name); setCategory(skill.category);
    setLevel(skill.level); setPercentage(skill.percentage); setOrder(skill.order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus keahlian ini?")) return;
    try {
      await skillsApi.delete(id, user.token);
      setSkills(skills.filter((s) => s.id !== id));
    } catch { alert("Gagal menghapus keahlian."); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setIsSaving(true);
    const payload = { name, category, level, percentage: Number(percentage), order: Number(order) };
    try {
      if (editingSkill) {
        await skillsApi.update(editingSkill.id, payload, user.token);
      } else {
        await skillsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchSkills();
    } catch { alert("Gagal menyimpan data keahlian."); }
    finally { setIsSaving(false); }
  };

  const grouped = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    skills.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [skills]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Keahlian (Skills)</h1>
          <p className="text-xs text-foreground-muted mt-1">Kelola data keahlian dan spesialisasi teknis Anda.</p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Tambah Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
      ) : error ? (
        <div className="p-4 text-center text-error bg-error/10 border border-error/20 rounded-md">{error}</div>
      ) : skills.length === 0 ? (
        <Card className="p-12 text-center" hoverEffect={false}>
          <p className="text-xs text-foreground-muted mb-4">Belum ada data skill.</p>
          <Button onClick={handleOpenCreate} variant="primary" className="gap-2"><Plus size={14} />Tambah Pertama</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([cat, catSkills]) => (
            <div key={cat}>
              <h2 className="font-display text-h3 font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-[10px] text-accent uppercase tracking-widest font-bold bg-accent/10 px-2 py-1 rounded">{cat}</span>
                <span className="text-xs text-foreground-muted">({catSkills.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catSkills.map((skill) => (
                  <Card key={skill.id} className="p-5 flex flex-col justify-between" hoverEffect={false}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-display text-body font-bold text-foreground">{skill.name}</h4>
                        <div className="flex gap-1">
                          <button onClick={() => handleOpenEdit(skill)} className="text-foreground-subtle hover:text-foreground p-1 transition-colors"><Edit2 size={13} /></button>
                          <button onClick={() => handleDelete(skill.id)} className="text-error/80 hover:text-error p-1 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center text-xs text-foreground-subtle mb-4">
                        <span>{skill.level}</span><span>•</span>
                        <span>{skill.percentage}%</span><span>•</span>
                        <span>#{skill.order}</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-overlay rounded-full h-1.5 overflow-hidden">
                      <div className="bg-accent h-1.5 rounded-full" style={{ width: `${skill.percentage}%` }} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? "Edit Keahlian" : "Tambah Keahlian Baru"}
        maxWidth="max-w-md"
        asForm
        onSubmit={handleSave}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Nama Skill *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Next.js, Photoshop, dll."
            required
          />

          <CategoryInput
            value={category}
            onChange={setCategory}
            suggestions={existingCategories}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground-muted select-none">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <Input
              type="number"
              min="0"
              max="100"
              label="Kemahiran (%) *"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              required
            />
          </div>

          <Input
            type="number"
            min="1"
            label="Urutan Tampil *"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
