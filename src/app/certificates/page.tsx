"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Card, Badge, Input, Modal, LoadingSpinner, EmptyState } from "@/components/ui";
import type { Certificate, CertificateCategory } from "@/types";
import { Search, ExternalLink, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import useSWR from "swr";
import { certificatesApi } from "@/lib/api";

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CertificateCategory | "All">("All");

  const { data: certificates = [], isLoading } = useSWR("certificates", () =>
    certificatesApi.getAll().then((res) => {
      const data = res.data || [];
      return data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      });
    })
  );

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const categories = React.useMemo(() => {
    const cats = [...new Set(certificates.map((c) => c.category))].filter(Boolean) as string[];
    return ["All", ...cats];
  }, [certificates]);

  // Filtering Logic
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (cert.credentialId && cert.credentialId.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      activeCategory === "All" || cert.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout mainClassName="py-12">
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
              <Search className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4 pointer-events-none" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari penerbit atau ID..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Certificates Grid */}
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredCertificates.length > 0 ? (
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
            <EmptyState message="Sertifikat tidak ditemukan." />
          )}
        </Container>

      {/* Certificate Lightbox — reusable Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title={selectedCert?.title}
        maxWidth="max-w-3xl"
      >
        {selectedCert && (
          <div className="p-4 flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-background-overlay mb-4">
              <Image
                src={selectedCert.imageUrl}
                alt={selectedCert.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="w-full flex justify-end gap-3">
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
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
