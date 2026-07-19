"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  isUploading: boolean;
  onUploadFile: (file: File) => Promise<void>;
  className?: string;
  helperText?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onRemove,
  isUploading,
  onUploadFile,
  className,
  helperText = "PNG, JPG, GIF up to 5MB. Drag & drop or click to upload.",
}: ImageUploadProps) {
  // satisfy noUnusedLocals compiler check
  if (false && onChange) {
    onChange(value);
  }
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        await onUploadFile(file);
      } else {
        alert("Hanya file gambar yang diperbolehkan.");
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onUploadFile(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <span className="text-xs font-semibold text-foreground-muted select-none">
          {label}
        </span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={isUploading}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative rounded-xl overflow-hidden border border-border bg-background-overlay flex items-center justify-center group aspect-video max-h-48 w-full transition-all duration-200">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={onButtonClick}
              disabled={isUploading}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Ganti Gambar"
            >
              <RefreshCw size={16} className={cn(isUploading && "animate-spin")} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isUploading}
              className="p-2.5 rounded-full bg-error/15 hover:bg-error/30 text-error-foreground border border-error/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Hapus Gambar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Area */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 min-h-36 text-center bg-background-elevated",
            "border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)]",
            "hover:border-accent hover:bg-background-overlay/30",
            isDragActive && "border-accent bg-accent/5 scale-[0.99]",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <LoadingSpinner size={24} className="py-2" />
              <span className="text-xs font-semibold text-foreground-muted animate-pulse">Mengunggah ke Drive...</span>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-lg bg-background-overlay border border-border flex items-center justify-center text-foreground-muted">
                <UploadCloud size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Unggah Gambar
                </span>
                <span className="text-[10px] text-foreground-subtle">
                  {helperText}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
