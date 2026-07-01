"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { settingsApi, mediaApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import useSWR from "swr";

export default function SettingsPage() {
  const { user } = useAuth();
  const token = user?.token;
  
  // Fetch existing settings
  const { data: settings = [], isLoading, mutate } = useSWR("settings", () =>
    settingsApi.getAll().then((res) => res.data || [])
  );

  // Resume State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Other general settings state (if needed in the future)
  // For now, we only focus on resume_url

  const currentResumeUrl = settings.find((s) => s.key === "resume_url")?.value || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setUploadStatus({ type: "error", msg: "File harus berformat PDF." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setUploadStatus({ type: "error", msg: "Ukuran file maksimal 5MB." });
        return;
      }
      setResumeFile(file);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!resumeFile || !token) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // 1. Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(resumeFile);
      
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1]; // Remove data:application/pdf;base64,
        
        try {
          // 2. Upload to GAS (Google Drive)
          const uploadRes = await mediaApi.upload(
            {
              filename: resumeFile.name,
              mimeType: resumeFile.type,
              base64Content: base64String,
              subfolder: "resume"
            },
            token
          );

          if (!uploadRes.success || !uploadRes.data) {
            throw new Error(uploadRes.error || "Gagal mengunggah file");
          }

          const fileUrl = uploadRes.data.downloadUrl || uploadRes.data.url;

          // 3. Save to Settings table
          await settingsApi.upsert(
            {
              key: "resume_url",
              value: fileUrl,
              type: "url",
              description: "Link CV PDF"
            },
            token
          );

          setUploadStatus({ type: "success", msg: "CV berhasil diunggah dan disimpan!" });
          setResumeFile(null);
          mutate(); // Refresh settings data
        } catch (uploadError: any) {
          console.error("Upload error:", uploadError);
          setUploadStatus({ type: "error", msg: uploadError.message || "Gagal menyimpan CV." });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadStatus({ type: "error", msg: "Gagal membaca file lokal." });
        setIsUploading(false);
      };
    } catch (error: any) {
      console.error(error);
      setUploadStatus({ type: "error", msg: error.message || "Terjadi kesalahan." });
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-h2 text-foreground mb-2">Pengaturan Umum</h1>
        <p className="text-body text-foreground-muted">Kelola pengaturan situs dan berkas CV Anda.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <Card className="p-6">
          <h2 className="font-display text-h3 text-foreground mb-6 flex items-center gap-2">
            <FileText className="text-accent" size={20} />
            Pengaturan Resume / CV
          </h2>

          <div className="flex flex-col gap-6">
            <div className="bg-background-overlay p-4 rounded-lg border border-border">
              <span className="text-xs font-semibold text-foreground-muted block mb-1">Status CV Saat Ini:</span>
              {currentResumeUrl ? (
                <a 
                  href={currentResumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> CV telah diunggah dan aktif
                </a>
              ) : (
                <span className="text-sm text-foreground-subtle flex items-center gap-2">
                  <AlertCircle size={16} /> Belum ada CV yang diunggah
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-foreground">Unggah PDF Baru</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-foreground-subtle">
                Format yang didukung: PDF. Ukuran maksimal: 5MB.
              </p>
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-md text-sm flex items-center gap-2 ${
                uploadStatus.type === "success" 
                  ? "bg-success/10 text-success border border-success/20" 
                  : "bg-error/10 text-error border border-error/20"
              }`}>
                {uploadStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {uploadStatus.msg}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                onClick={handleUpload} 
                disabled={!resumeFile || isUploading}
                variant="primary"
                className="gap-2 min-w-[140px] justify-center"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={16} /> Simpan CV Baru
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
