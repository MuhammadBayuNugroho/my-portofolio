"use client";

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
        <h1 className="font-display text-h1 text-foreground font-bold">Dashboard</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Ikhtisar statistik konten website portofolio dan pesan masuk langsung dari Google Spreadsheet.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6 flex items-center justify-between" hoverEffect={true}>
            <div>
              <p className="text-xs font-semibold text-foreground-muted mb-1">{stat.label}</p>
              <h3 className="font-display text-h2 font-bold text-foreground">{stat.value}</h3>
            </div>
            <div className={`h-12 w-12 rounded-lg bg-background-overlay flex items-center justify-center ${stat.color}`}>
              <stat.icon size={22} />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Messages & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Message Center */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-accent" />
            <h2 className="font-display text-h3 text-foreground font-semibold">Pesan Masuk Terbaru</h2>
          </div>

          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <Card className="p-8 text-center text-xs text-foreground-muted" hoverEffect={false}>
                Tidak ada pesan masuk.
              </Card>
            ) : (
              messages.slice(0, 5).map((msg) => (
                <Card key={msg.id} className={`p-5 flex flex-col gap-3 border ${msg.isRead ? "border-border/40" : "border-accent/40"}`} hoverEffect={false}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-foreground">{msg.senderName}</h4>
                        {!msg.isRead && (
                          <span className="bg-accent/15 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded">Baru</span>
                        )}
                      </div>
                      <p className="text-[10px] text-foreground-subtle">{msg.senderEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                          className="text-[9px] text-accent hover:underline font-bold"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border/40 pt-2">
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
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" />
            <h2 className="font-display text-h3 text-foreground font-semibold">Aksi Cepat</h2>
          </div>

          <Card className="p-6 flex flex-col gap-4" hoverEffect={false}>
            {[
              { label: "Buat Project Baru", href: "/admin/projects" },
              { label: "Tulis Artikel Baru", href: "/admin/blog" },
              { label: "Unggah Media Baru", href: "/admin/gallery" },
            ].map((shortcut, idx) => (
              <a
                key={idx}
                href={shortcut.href}
                className="flex items-center justify-between p-3 rounded-md bg-background hover:bg-background-overlay border border-border text-xs font-semibold text-foreground transition-colors"
              >
                <span>{shortcut.label}</span>
                <ArrowUpRight size={14} className="text-foreground-subtle" />
              </a>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
