"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { commentsApi } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";
import { Button, Input, Textarea, LoadingSpinner } from "@/components/ui";
import { MessageSquare, Loader2, Info } from "lucide-react";
import type { BlogComment } from "@/types";

interface BlogCommentsProps {
  slug: string;
}

export function BlogComments({ slug }: BlogCommentsProps) {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch comments
  const { data: res, mutate, isLoading } = useSWR(`comments-${slug}`, () =>
    commentsApi.getByBlogSlug(slug)
  );

  const comments = res?.data || [];

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("comment-author-name") || "";
      const savedEmail = localStorage.getItem("comment-author-email") || "";
      setFormData((prev) => ({
        ...prev,
        authorName: savedName,
        authorEmail: savedEmail,
      }));
    } catch (_) {
      // Abaikan error pembacaan localStorage
    }
  }, []);

  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-indigo-500",
      "from-emerald-500 to-teal-500",
      "from-violet-500 to-purple-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
      "from-sky-500 to-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.authorName.trim()) {
      newErrors.authorName = "Nama lengkap wajib diisi";
    }
    if (formData.authorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      newErrors.authorEmail = "Format email tidak valid";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Komentar tidak boleh kosong";
    } else if (formData.content.trim().length < 5) {
      newErrors.content = "Komentar terlalu pendek (minimal 5 karakter)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Save credentials to localStorage
    try {
      localStorage.setItem("comment-author-name", formData.authorName);
      localStorage.setItem("comment-author-email", formData.authorEmail);
    } catch (_) {
      // Abaikan error penulisan localStorage
    }

    // Optimistic UI updates
    const tempId = `temp_${Date.now()}`;
    const newCommentPlaceholder: BlogComment = {
      id: tempId,
      blogSlug: slug,
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      content: formData.content,
      status: "Approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previousRes = res;
    // Mutate SWR cache locally
    mutate({ success: true, data: [...comments, newCommentPlaceholder] }, false);

    try {
      const response = await commentsApi.create({
        blogSlug: slug,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        content: formData.content,
      });

      if (response.success) {
        setSubmitSuccess(true);
        // Clear only the comment content, retain name and email
        setFormData((prev) => ({ ...prev, content: "" }));
        // Trigger server refetch to replace the placeholder
        mutate();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        // Rollback on logic failure
        mutate(previousRes, false);
        alert(response.error || "Gagal mengirim komentar. Silakan coba lagi.");
      }
    } catch (err) {
      // Rollback on network error
      mutate(previousRes, false);
      console.error(err);
      alert("Terjadi kesalahan jaringan. Pastikan Apps Script Anda online dan dapat diakses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-border flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-accent" />
        <h2 className="font-display text-h3 text-foreground font-semibold">
          Diskusi ({comments.length})
        </h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-background-elevated border border-border rounded-2xl p-6 flex flex-col gap-5"
      >
        <h3 className="font-display text-caption font-bold text-foreground uppercase tracking-wider">
          Tinggalkan Masukan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="authorName"
            name="authorName"
            label="Nama Lengkap"
            placeholder="Contoh: John Doe"
            value={formData.authorName}
            onChange={handleChange}
            error={errors.authorName}
            disabled={isSubmitting}
            required
          />

          <Input
            id="authorEmail"
            name="authorEmail"
            label="Email (opsional, tidak dipublikasikan)"
            placeholder="Contoh: john@example.com"
            type="email"
            value={formData.authorEmail}
            onChange={handleChange}
            error={errors.authorEmail}
            disabled={isSubmitting}
          />
        </div>

        <Textarea
          id="content"
          name="content"
          label="Pesan / Komentar"
          placeholder="Tuliskan masukan, pertanyaan, atau komentar Anda di sini..."
          value={formData.content}
          onChange={handleChange}
          error={errors.content}
          disabled={isSubmitting}
          maxLength={1000}
          showCounter
          rows={4}
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-foreground-subtle">
            <Info size={12} className="shrink-0" />
            <span>Komentar akan langsung muncul di halaman ini.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto min-w-[120px] transition-all cursor-pointer font-semibold text-xs !bg-accent !text-white hover:!bg-accent-hover !opacity-100 disabled:!opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Loader2 className="animate-spin" size={14} />
                Mengirim...
              </span>
            ) : (
              "Kirim Komentar"
            )}
          </Button>
        </div>

        {submitSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
            Komentar Anda berhasil terkirim! Terima kasih atas masukannya.
          </p>
        )}
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {isLoading && comments.length === 0 ? (
          <LoadingSpinner size={24} className="py-12" />
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-background-elevated border border-border border-dashed rounded-2xl text-center">
            <MessageSquare size={36} className="text-foreground-subtle mb-3 opacity-40" />
            <p className="text-caption font-semibold text-foreground mb-1">
              Belum ada komentar
            </p>
            <p className="text-xs text-foreground-subtle max-w-[280px]">
              Jadilah yang pertama memberikan tanggapan atau masukan untuk artikel ini!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {comments.map((comment) => {
              const initials = getInitials(comment.authorName);
              const avatarBg = getAvatarGradient(comment.authorName);

              return (
                <div
                  key={comment.id}
                  className="bg-background-elevated border border-border rounded-xl p-5 flex gap-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarBg} text-white font-sans text-xs font-bold flex items-center justify-center shrink-0 shadow-sm select-none`}
                  >
                    {initials}
                  </div>

                  {/* Comment Details */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-sans text-xs font-semibold text-foreground truncate">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] text-foreground-subtle font-medium shrink-0">
                        {formatRelativeDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-foreground-muted whitespace-pre-line leading-relaxed mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
