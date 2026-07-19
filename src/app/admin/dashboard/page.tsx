"use client";

import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { projectsApi, blogsApi, certificatesApi, contactApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { FolderOpen, BookOpen, Award, Image, Mail, ArrowUpRight, MessageSquare } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  // Dynamic SWR Fetchers
  const { data: projects = [] } = useSWR("projects", () => 
    projectsApi.getAll().then((res) => res.data || [])
  );
  const { data: blogs = [] } = useSWR("blogs", () => 
    blogsApi.getAll().then((res) => res.data || [])
  );
  const { data: certs = [] } = useSWR("certs", () => 
    certificatesApi.getAll().then((res) => res.data || [])
  );
  const { data: messages = [], mutate: mutateMessages } = useSWR(user ? ["messages", user.token] : null, () => 
    contactApi.getMessages(user!.token).then((res) => res.data || [])
  );

  const stats = [
    { label: "Total Proyek", value: projects.length, icon: FolderOpen, color: "text-accent" },
    { label: "Total Blog", value: blogs.length, icon: BookOpen, color: "text-violet" },
    { label: "Total Sertifikat", value: certs.length, icon: Award, color: "text-success" },
    { label: "Aset Galeri", value: projects.filter(p => p.isGalleryOnly).length, icon: Image, color: "text-warning" },
  ];

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    try {
      await contactApi.markRead(id, user.token);
      mutateMessages();
    } catch (err) {
      alert("Gagal memperbarui status pesan.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-h1 text-foreground font-bold tracking-tight">Dashboard</h1>
        <p className="text-xs text-foreground-muted mt-1.5 leading-relaxed">
          Ikhtisar statistik konten website portofolio dan pesan masuk langsung dari Google Spreadsheet.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="p-5 flex items-center justify-between border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-white dark:bg-[#0B0B0C] shadow-sm hover:shadow-md transition-all duration-300"
            hoverEffect={true}
          >
            <div>
              <p className="text-xs font-semibold text-foreground-muted mb-1.5">{stat.label}</p>
              <h3 className="font-display text-2xl font-bold text-foreground leading-none">{stat.value}</h3>
            </div>
            <div className={`h-11 w-11 rounded-lg bg-background-overlay flex items-center justify-center border border-border/40 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Messages & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Message Center */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail size={16} className="text-accent" />
            <h2 className="font-display text-h3 text-foreground font-semibold">Pesan Masuk Terbaru</h2>
          </div>

          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <Card className="p-8 text-center text-xs text-foreground-muted border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-white dark:bg-[#0B0B0C]" hoverEffect={false}>
                Tidak ada pesan masuk.
              </Card>
            ) : (
              messages.slice(0, 5).map((msg) => (
                <Card
                  key={msg.id}
                  className={`p-5 flex flex-col gap-3.5 bg-white dark:bg-[#0B0B0C] border transition-all duration-300 ${
                    msg.isRead
                      ? "border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]"
                      : "border-accent/40 shadow-[0_0_12px_rgba(56,189,248,0.05)]"
                  }`}
                  hoverEffect={false}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-semibold text-foreground">{msg.senderName}</h4>
                        {!msg.isRead && (
                          <span className="bg-accent/10 text-accent text-[9px] font-semibold px-2 py-0.5 rounded-full border border-accent/20">
                            Baru
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-foreground-subtle mt-0.5">{msg.senderEmail}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[9px] text-foreground-subtle">
                        {new Date(msg.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!msg.isRead && (
                        <button
                          onClick={() => handleMarkRead(msg.id)}
                          className="text-[10px] text-accent hover:text-accent-hover hover:underline font-bold cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border/40 pt-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Subjek: {msg.subject}</p>
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Settings Shortcuts */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} className="text-accent" />
            <h2 className="font-display text-h3 text-foreground font-semibold">Aksi Cepat</h2>
          </div>

          <Card className="p-5 flex flex-col gap-2.5 bg-white dark:bg-[#0B0B0C] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] shadow-sm" hoverEffect={false}>
            {[
              { label: "➕ Buat Project Baru",       href: "/admin/projects" },
              { label: "✍️ Tulis Artikel Blog",      href: "/admin/blog" },
              { label: "🖼️ Kelola Galeri",           href: "/admin/projects" },
              { label: "🔧 Tambah Skill",            href: "/admin/skills" },
              { label: "🏆 Tambah Sertifikat",       href: "/admin/certificates" },
              { label: "💬 Lihat Testimoni",         href: "/admin/testimonials" },
              { label: "📬 Pesan Kontak",            href: "/admin/contact" },
              { label: "💼 Kelola Experience",       href: "/admin/experience" },
            ].map((shortcut, idx) => (
              <Link
                key={idx}
                href={shortcut.href}
                className="flex items-center justify-between p-3 rounded-lg bg-background-overlay/40 hover:bg-background-overlay border border-border/60 hover:border-border text-xs font-semibold text-foreground transition-all duration-200"
              >
                <span>{shortcut.label}</span>
                <ArrowUpRight size={13} className="text-foreground-subtle" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
