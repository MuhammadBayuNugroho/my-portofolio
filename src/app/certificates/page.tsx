"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DUMMY_CERTIFICATES } from "@/data/dummy";
import type { CertificateCategory } from "@/types";
import { Search, ExternalLink, Calendar, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CertificateCategory | "All">("All");
  const [selectedCert, setSelectedCert] = useState<typeof DUMMY_CERTIFICATES[0] | null>(null);

  const categories: (CertificateCategory | "All")[] = [
    "All",
    "Frontend",
    "Design",
    "Leadership",
    "Backend",
    "Cloud",
  ];

  // Filtering Logic
  const filteredCertificates = DUMMY_CERTIFICATES.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (cert.credentialId && cert.credentialId.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      activeCategory === "All" || cert.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <Container>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-h1 text-foreground mb-4">
              Sertifikasi & Kredensial
            </h1>
            <p className="text-body text-foreground-muted">
              Daftar verifikasi keahlian teknis, profesional, dan kepemimpinan yang diperoleh secara resmi.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6 mb-10">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 order-2 md:order-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs order-1 md:order-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari penerbit atau ID..."
                className="w-full rounded-md border border-border bg-background-elevated pl-10 pr-4 py-2 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-accent"
              />
              <Search className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4" />
            </div>
          </div>

          {/* Certificates Grid */}
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCertificates.map((cert) => (
                <Card key={cert.id} className="flex flex-col p-0 overflow-hidden" hoverEffect={true}>
                  {/* Preview Banner */}
                  <div className="relative aspect-video w-full overflow-hidden bg-background-overlay border-b border-border/60 group">
                    <Image
                      src={cert.imageUrl}
                      alt={cert.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 gap-3">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="h-10 w-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent cursor-pointer hover:bg-accent/40 transition-colors"
                        title="Lihat Pratinjau"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary">{cert.category}</Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-foreground-subtle mb-1.5">
                      <Calendar size={14} />
                      <span>Diperoleh: {formatDate(cert.issueDate, "MMMM yyyy")}</span>
                    </div>

                    <h3 className="font-display text-h3 text-foreground font-semibold mb-2 line-clamp-1">
                      {cert.title}
                    </h3>
                    
                    <p className="text-xs text-foreground-muted mb-4 font-medium">
                      Penerbit: {cert.issuer}
                    </p>

                    {cert.credentialId && (
                      <p className="text-[10px] font-mono text-foreground-subtle mb-5">
                        ID: {cert.credentialId}
                      </p>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-4 mt-auto border-t border-border/40 pt-4">
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1"
                        >
                          Verifikasi Resmi
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-body-lg text-foreground-muted">Sertifikat tidak ditemukan.</p>
            </div>
          )}
        </Container>
      </main>

      {/* Lightbox Certificate Preview */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-background-elevated border border-border rounded-xl overflow-hidden shadow-glow-accent cursor-default p-4 flex flex-col items-center"
            >
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="font-display text-h3 text-foreground font-semibold line-clamp-1">
                  {selectedCert.title}
                </h3>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="rounded-full p-1.5 hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-background-overlay">
                <Image
                  src={selectedCert.imageUrl}
                  alt={selectedCert.title}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="w-full flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 bg-background-overlay hover:bg-border/60 text-xs font-semibold rounded-md border border-border text-foreground transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {selectedCert.credentialUrl && (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
                  >
                    Verifikasi Kredensial
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
}
