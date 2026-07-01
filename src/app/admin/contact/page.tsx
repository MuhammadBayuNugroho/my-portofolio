"use client";

import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/use-auth";
import { contactApi } from "@/lib/api";
import type { ContactMessage } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Mail, MailOpen, Trash2, Loader2, Plus, X, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "unread" | "read";

export default function AdminContactPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Compose form
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cSubject, setCSubject] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const {
    data: messages = [],
    isLoading,
    mutate,
  } = useSWR(
    user ? ["messages", user.token] : null,
    () => contactApi.getMessages(user!.token).then((r) => r.data || [])
  );

  const displayed = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleMarkRead = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await contactApi.markRead(id, user.token);
        mutate();
      } catch {
        alert("Gagal memperbarui status.");
      }
    },
    [user, mutate]
  );

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await contactApi.deleteMessage(id, user.token);
      mutate();
      setDeleteId(null);
      if (viewMsg?.id === id) setViewMsg(null);
    } catch (err) {
      alert("Gagal menghapus pesan: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cEmail || !cMessage) return;
    setIsSending(true);
    try {
      await contactApi.sendMessage({
        senderName: cName,
        senderEmail: cEmail,
        subject: cSubject || "(Tanpa Subjek)",
        message: cMessage,
      });
      setCName(""); setCEmail(""); setCSubject(""); setCMessage("");
      setIsComposeOpen(false);
      mutate();
    } catch {
      alert("Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  const handleViewAndMarkRead = (msg: ContactMessage) => {
    setViewMsg(msg);
    if (!msg.isRead) handleMarkRead(msg.id);
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `Semua (${messages.length})` },
    { key: "unread", label: `Belum Dibaca (${unreadCount})` },
    { key: "read", label: "Sudah Dibaca" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-h1 text-foreground font-bold">Pesan Kontak</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Kelola seluruh pesan masuk dari halaman kontak website Anda.
            {unreadCount > 0 && (
              <span className="ml-2 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mutate()} className="gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsComposeOpen(true)} className="gap-2">
            <Plus size={14} /> Tulis Pesan
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-background-overlay w-fit">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors",
              filter === f.key
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Message List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : displayed.length === 0 ? (
        <Card className="p-12 text-center" hoverEffect={false}>
          <Mail size={32} className="text-foreground-muted mx-auto mb-3" />
          <p className="text-xs text-foreground-muted">Tidak ada pesan untuk filter ini.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((msg) => (
            <Card
              key={msg.id}
              className={cn(
                "p-5 cursor-pointer transition-all",
                !msg.isRead ? "border-accent/40 bg-accent/5" : "border-border/40"
              )}
              hoverEffect={true}
              onClick={() => handleViewAndMarkRead(msg)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "mt-0.5 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase",
                    !msg.isRead ? "bg-accent/20 text-accent" : "bg-background-overlay text-foreground-muted"
                  )}>
                    {msg.senderName?.slice(0, 2) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{msg.senderName}</span>
                      {!msg.isRead && (
                        <span className="text-[9px] bg-accent text-accent-foreground font-bold px-1.5 py-0.5 rounded">Baru</span>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground-subtle">{msg.senderEmail}</p>
                    <p className="text-xs font-semibold text-foreground mt-1 truncate">{msg.subject || "(Tanpa Subjek)"}</p>
                    <p className="text-xs text-foreground-muted truncate mt-0.5">{msg.message}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[9px] text-foreground-subtle whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {!msg.isRead && (
                      <button
                        onClick={() => handleMarkRead(msg.id)}
                        title="Tandai Dibaca"
                        className="p-1.5 rounded text-foreground-subtle hover:text-foreground hover:bg-background-overlay transition-colors"
                      >
                        <MailOpen size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(msg.id)}
                      title="Hapus"
                      className="p-1.5 rounded text-error/60 hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Message Detail Modal */}
      {viewMsg && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6" hoverEffect={false}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-h3 font-bold text-foreground">{viewMsg.senderName}</h2>
                  {viewMsg.isRead && <MailOpen size={14} className="text-foreground-muted" />}
                </div>
                <p className="text-xs text-foreground-subtle">{viewMsg.senderEmail}</p>
                <p className="text-[10px] text-foreground-subtle mt-0.5">
                  {new Date(viewMsg.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <button onClick={() => setViewMsg(null)} className="text-foreground-muted hover:text-foreground p-1 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="border-t border-border/60 pt-4 mb-4">
              <p className="text-xs font-semibold text-foreground-muted mb-1">Subjek</p>
              <p className="text-sm font-bold text-foreground">{viewMsg.subject || "(Tanpa Subjek)"}</p>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-foreground-muted mb-2">Pesan</p>
              <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-wrap bg-background-overlay p-4 rounded-md">
                {viewMsg.message}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setDeleteId(viewMsg.id); setViewMsg(null); }}
                className="gap-2 text-error border-error/30 hover:bg-error/10"
              >
                <Trash2 size={14} /> Hapus
              </Button>
              <a
                href={`mailto:${viewMsg.senderEmail}?subject=Re: ${encodeURIComponent(viewMsg.subject || "")}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
              >
                <Mail size={14} /> Balas via Email
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6" hoverEffect={false}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-h3 font-bold text-foreground">Tulis Pesan Baru</h2>
              <button onClick={() => setIsComposeOpen(false)} className="text-foreground-muted hover:text-foreground p-1 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCompose} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Nama Pengirim</label>
                  <input type="text" value={cName} onChange={(e) => setCName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground-muted">Email Pengirim</label>
                  <input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Subjek</label>
                <input type="text" value={cSubject} onChange={(e) => setCSubject(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs" placeholder="(Opsional)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground-muted">Pesan</label>
                <textarea value={cMessage} onChange={(e) => setCMessage(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs h-24 resize-none" required />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>Batal</Button>
                <Button type="submit" variant="primary" disabled={isSending}>
                  {isSending ? "Mengirim..." : "Kirim Pesan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 text-center" hoverEffect={false}>
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-error" />
            </div>
            <h3 className="font-display text-h3 font-bold text-foreground mb-2">Hapus Pesan?</h3>
            <p className="text-xs text-foreground-muted mb-6">
              Pesan akan dihapus permanen dari database dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button
                variant="primary"
                onClick={() => handleDelete(deleteId)}
                className="bg-error hover:bg-error/90 text-white border-transparent"
              >
                Ya, Hapus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
