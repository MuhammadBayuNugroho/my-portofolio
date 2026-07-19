"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Trash2, Plus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface GalleryUploadProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  isUploading: boolean;
  onUploadFile: (file: File) => Promise<void>;
  className?: string;
}

export function GalleryUpload({
  label,
  images = [],
  onChange,
  isUploading,
  onUploadFile,
  className,
}: GalleryUploadProps) {
  const [newUrl, setNewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        await onUploadFile(e.target.files[i]);
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (url && !images.includes(url)) {
      onChange([...images, url]);
      setNewUrl("");
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;
    onChange(newImages);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;
    onChange(newImages);
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {label && (
        <span className="text-xs font-semibold text-foreground-muted select-none">
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {/* Thumbnail Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 bg-background-overlay rounded-xl border border-border">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-background flex flex-col items-center justify-center"
            >
              <img
                src={img}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Toolbar Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity duration-200">
                {/* Delete button (Top Right) */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="self-end p-1.5 rounded-md bg-error/15 hover:bg-error/30 text-error-foreground border border-error/20 transition-colors cursor-pointer"
                  title="Hapus Gambar"
                >
                  <Trash2 size={12} />
                </button>

                {/* Navigation Sorting arrows (Bottom Center) */}
                <div className="flex justify-center items-center gap-2 mt-auto w-full">
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Pindahkan ke Kiri"
                  >
                    <ArrowLeft size={12} />
                  </button>
                  <span className="text-[10px] text-white/80 font-bold font-mono">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMoveRight(index)}
                    disabled={index === images.length - 1}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Pindahkan ke Kanan"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border border-dashed border-border rounded-xl bg-background-elevated/40 text-foreground-subtle text-xs">
          Galeri foto masih kosong.
        </div>
      )}

      {/* Input panel to add via URL or upload file */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleAddUrl} className="flex-1 flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Tempel URL gambar baru..."
            className="flex-1 rounded-lg border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <button
            type="submit"
            disabled={!newUrl.trim()}
            className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-background-overlay text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            <span>Tambah URL</span>
          </button>
        </form>

        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size={14} className="py-0" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              <span>Unggah Gambar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
