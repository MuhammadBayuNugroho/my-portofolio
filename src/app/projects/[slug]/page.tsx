import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/public/projects/ProjectCard";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { projectsApi } from "@/lib/api";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";

export const revalidate = 60; // ISR: Cache akan diperbarui maksimal setiap 60 detik

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await projectsApi.getBySlug(slug);
    if (res.success && res.data) {
      const project = res.data;
      return {
        title: project.title,
        description: project.description || project.title,
        openGraph: {
          title: `${project.title} | ${SITE_CONFIG.name}`,
          description: project.description || project.title,
          url: `${SITE_CONFIG.url}/projects/${project.slug}`,
          type: "website",
          images: [
            {
              url: project.coverImage,
              alt: project.title,
            },
          ],
        },
      };
    }
  } catch {
    // Fallback ke default title jika terjadi error
  }
  return {
    title: "Proyek Detail",
  };
}

export async function generateStaticParams() {
  try {
    const res = await projectsApi.getAll();
    const items = res.data || [];
    if (items.length === 0) {
      return [{ slug: "placeholder-project" }];
    }
    return items.map((project) => ({
      slug: project.slug,
    }));
  } catch {
    return [{ slug: "placeholder-project" }];
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  let project = null;
  let relatedProjects: any[] = [];

  try {
    const res = await projectsApi.getBySlug(slug);
    if (res.success && res.data) {
      project = res.data;
    }
  } catch {
    notFound();
  }

  if (!project) {
    notFound();
  }

  try {
    const allProjRes = await projectsApi.getAll();
    if (allProjRes.success && allProjRes.data) {
      relatedProjects = allProjRes.data.filter(
        (p) => p.category === project.category && p.id !== project.id
      ).slice(0, 3);
    }
  } catch {
    // Abaikan jika tidak ada data related projects
  }

  return (
    <PageLayout mainClassName="py-12">
      <Container>
        {/* Back button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-caption font-medium px-3 py-1.5 rounded-md border border-border bg-foreground text-background hover:opacity-80 mb-8 transition-opacity"
        >
          <ArrowLeft size={14} />
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
          <div className="lg:col-span-4 bg-background-elevated border border-border rounded-xl p-6 flex flex-col gap-3 w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
              Tautan Proyek
            </p>
            {project.projectUrl && (
              <Button variant="primary" size="lg" asChild className="w-full gap-2">
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Kunjungi Live Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button variant="outline" size="md" asChild className="w-full gap-2">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  Lihat Kode Sumber
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
          <article className="prose prose-slate dark:prose-invert prose-headings:font-display prose-a:text-accent hover:prose-a:text-accent-hover prose-img:rounded-xl max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.contentMarkdown || ""}
            </ReactMarkdown>
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
    </PageLayout>
  );
}
