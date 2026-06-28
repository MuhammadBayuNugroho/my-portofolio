import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/public/projects/ProjectCard";
import { DUMMY_PROJECTS } from "@/data/dummy";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DUMMY_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  const project = DUMMY_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  // Related Projects logic (same category, excluding current project)
  const relatedProjects = DUMMY_PROJECTS.filter(
    (p) => p.category === project.category && p.id !== project.id
  ).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <Container>
          {/* Back button */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Proyek
          </Link>

          {/* Project Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-8">
              <Badge variant="primary" className="mb-4">{project.category}</Badge>
              <h1 className="font-display text-h1 text-foreground mb-4">
                {project.title}
              </h1>
              <p className="text-body text-foreground-muted leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA panel */}
            <div className="lg:col-span-4 bg-background-elevated border border-border rounded-xl p-6 flex flex-col gap-4 w-full">
              <h3 className="font-display text-h3 text-foreground mb-2">Tautan Proyek</h3>
              {project.projectUrl && (
                <Button variant="primary" asChild className="w-full gap-2">
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    Kunjungi Live Demo
                    <ExternalLink size={16} />
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="outline" asChild className="w-full gap-2">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    Lihat Kode Sumber
                    <Github size={16} />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Cover image banner */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border mb-16 bg-background-overlay">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Content Markdown Case Study */}
          <div className="max-w-3xl mx-auto border-b border-border pb-16 mb-16">
            <article className="prose dark:prose-invert">
              <h1>Studi Kasus Proyek</h1>
              <p>
                Bagian ini berisi visualisasi dan penyusunan sistematis terkait proses penemuan solusi digital di dalam proyek <strong>{project.title}</strong>.
              </p>
              <h2>1. Latar Belakang Masalah</h2>
              <p>
                Setiap solusi yang efisien berakar dari pendefinisian problem yang presisi. Dalam pengerjaan portfolio ini, fokus utamanya adalah menjaga rasio performa dan konsistensi visual layout.
              </p>
              <h2>2. Metodologi Pendekatan</h2>
              <p>
                Mengadopsi prinsip desain modular Apple Style yang dipadukan dengan struktur Next.js App Router. Penggunaan design tokens menjamin konsistensi palet warna pada dark maupun light mode.
              </p>
              <blockquote>
                Prinsip utama desain adalah kesederhanaan visual yang menyembunyikan kompleksitas fungsionalitas di baliknya.
              </blockquote>
              <h2>3. Kesimpulan</h2>
              <p>
                Lighthouse score dapat dipertahankan di atas rata-rata industri dengan load time di bawah 1 detik, memastikan tingkat konversi dan aksesibilitas maksimal.
              </p>
            </article>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div>
              <h2 className="font-display text-h2 text-foreground mb-8">
                Proyek Terkait
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
