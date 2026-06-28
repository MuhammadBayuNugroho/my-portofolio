"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { skillsApi } from "@/lib/api";
import type { Skill, SkillCategory, SkillLevel } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function AdminSkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("Frontend");
  const [level, setLevel] = useState<SkillLevel>("Intermediate");
  const [percentage, setPercentage] = useState(80);
  const [order, setOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const res = await skillsApi.getAll();
      if (res.success && res.data) {
        setSkills(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      setError("Gagal memuat data skill.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setName("");
    setCategory("Frontend");
    setLevel("Intermediate");
    setPercentage(80);
    setOrder(skills.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setLevel(skill.level);
    setPercentage(skill.percentage);
    setOrder(skill.order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin menghapus keahlian ini?")) return;
    try {
      await skillsApi.delete(id, user.token);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      alert("Gagal menghapus keahlian.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setIsSaving(true);

    const payload = {
      name,
      category,
      level,
      percentage: Number(percentage),
      order: Number(order),
    };

    try {
      if (editingSkill) {
        await skillsApi.update(editingSkill.id, payload, user.token);
      } else {
        await skillsApi.create(payload, user.token);
      }
      setIsModalOpen(false);
      fetchSkills();
    } catch (err) {
      alert("Gagal menyimpan data keahlian.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Keahlian (Skills)</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola data keahlian dan spesialisasi teknis Anda.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={16} /> Add Skill
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
          {skills.map((skill) => (
            <Card key={skill.id} className="p-5 flex flex-col justify-between" hoverEffect={false}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-accent uppercase font-bold tracking-wider">
                    {skill.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(skill)}
                      className="text-foreground-subtle hover:text-foreground p-1 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-error/80 hover:text-error p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-display text-body font-bold text-foreground mb-1">{skill.name}</h4>
                <div className="flex gap-2 items-center text-xs text-foreground-subtle mb-4">
                  <span>Level: {skill.level}</span>
                  <span>•</span>
                  <span>Persentase: {skill.percentage}%</span>
                  <span>•</span>
                  <span>Urutan: {skill.order}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-background-overlay rounded-full h-1.5 overflow-hidden">
                <div className="bg-accent h-1.5 rounded-full" style={{ width: `${skill.percentage}%` }} />
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
              {editingSkill ? "Edit Keahlian" : "Tambah Keahlian Baru"}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Nama Skill</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
                  placeholder="Next.js, Photoshop, dll."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SkillCategory)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Design">Design</option>
                    <option value="Backend">Backend</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Kemahiran (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-accent"
                    required
                  />
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
