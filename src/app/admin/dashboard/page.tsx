import { Card } from "@/components/ui/Card";
import { DUMMY_PROJECTS, DUMMY_BLOGS, DUMMY_CERTIFICATES, DUMMY_GALLERY } from "@/data/dummy";
import { FolderOpen, BookOpen, Award, Image, Mail, ArrowUpRight, MessageSquare } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Proyek", value: DUMMY_PROJECTS.length, icon: FolderOpen, color: "text-accent" },
    { label: "Total Blog", value: DUMMY_BLOGS.length, icon: BookOpen, color: "text-violet" },
    { label: "Total Sertifikat", value: DUMMY_CERTIFICATES.length, icon: Award, color: "text-success" },
    { label: "Aset Galeri", value: DUMMY_GALLERY.length, icon: Image, color: "text-warning" },
  ];

  // Realistic contact messages mock (10 messages for testing admin dashboard lists)
  const mockMessages = [
    { id: "m-1", senderName: "Budi Santoso", senderEmail: "budi@fintech.id", subject: "Tawaran Kerjasama Web", message: "Halo Bayu, kami tertarik untuk berdiskusi mengenai proyek redesain landing page...", createdAt: "2026-06-27T10:00:00Z" },
    { id: "m-2", senderName: "Sarah Amalia", senderEmail: "sarah@ui.ac.id", subject: "Undangan Pembicara Talkshow", message: "Kami mengundang Anda sebagai pemateri dalam acara sharing session kepemimpinan...", createdAt: "2026-06-26T14:30:00Z" },
    { id: "m-3", senderName: "John Doe", senderEmail: "johndoe@email.com", subject: "Project Quote Inquiry", message: "I would like to get a pricing estimate for a custom Figma design system...", createdAt: "2026-06-25T08:15:00Z" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-h1 text-foreground font-bold">Dashboard</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Ikhtisar statistik konten website portofolio dan pesan masuk.
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
            {mockMessages.map((msg) => (
              <Card key={msg.id} className="p-5 flex flex-col gap-3" hoverEffect={false}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">{msg.senderName}</h4>
                    <p className="text-[10px] text-foreground-subtle">{msg.senderEmail}</p>
                  </div>
                  <span className="text-[9px] text-foreground-subtle">
                    {new Date(msg.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="border-t border-border/40 pt-2">
                  <p className="text-xs font-semibold text-foreground mb-1">Subjek: {msg.subject}</p>
                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              </Card>
            ))}
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
