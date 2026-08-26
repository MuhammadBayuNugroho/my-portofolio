import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/public/PageLayout";
import { Container } from "@/components/public/Container";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { blogsApi } from "@/lib/api";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";
import { BlogMetrics } from "@/components/public/blog/BlogMetrics";
import { TableOfContents } from "@/components/public/blog/TableOfContents";
import { LikeButton } from "@/components/public/blog/LikeButton";
import { ShareButton } from "@/components/public/blog/ShareButton";
import { BlogComments } from "@/components/public/blog/BlogComments";

export const revalidate = 60; // ISR: Cache akan diperbarui maksimal setiap 60 detik

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await blogsApi.getBySlug(slug);
    if (res.success && res.data) {
      const blog = res.data;
      return {
        title: blog.title,
        description: blog.excerpt || blog.title,
        openGraph: {
          title: `${blog.title} | ${SITE_CONFIG.name}`,
          description: blog.excerpt || blog.title,
          url: `${SITE_CONFIG.url}/blog/${blog.slug}`,
          type: "article",
          images: [
            {
              url: blog.coverImage,
              alt: blog.title,
            },
          ],
        },
      };
    }
  } catch {
    // Abaikan error untuk fallback ke default
  }
  return {
    title: "Blog Detail",
  };
}

export async function generateStaticParams() {
  try {
    const res = await blogsApi.getAll();
    const items = (res.data || []).filter((blog) => blog.status === "Published");
    if (items.length === 0) {
      return [{ slug: "placeholder-blog" }];
    }
    return items.map((blog) => ({
      slug: blog.slug,
    }));
  } catch {
    return [{ slug: "placeholder-blog" }];
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let blog = null;
  try {
    const res = await blogsApi.getBySlug(slug);
    if (res.success && res.data && res.data.status === "Published") {
      blog = res.data;
    }
  } catch {
    notFound();
  }

  if (!blog || blog.status !== "Published") {
    notFound();
  }

  return (
    <PageLayout mainClassName="py-12">
      <Container>
        {/* Back button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-caption text-foreground-muted hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Header meta */}
            <div className="mb-6">
              <Badge variant="primary" className="mb-4">{blog.category}</Badge>
              
              <h1 className="font-display text-h1 text-foreground mb-4 leading-tight">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-subtle">
                <span className="flex items-center gap-1.5 bg-background-overlay px-2.5 py-1 rounded-full border border-border">
                  <Calendar size={14} className="text-foreground-muted" />
                  {formatDate(blog.createdAt)}
                </span>
                <BlogMetrics 
                  slug={blog.slug} 
                  initialViews={blog.views || 0} 
                  contentMarkdown={blog.contentMarkdown || ""} 
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border mb-10 bg-background-overlay">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            {/* Markdown Content Parser */}
            <article 
              id="blog-content" 
              className="prose prose-slate dark:prose-invert prose-headings:font-display prose-a:text-accent hover:prose-a:text-accent-hover prose-img:rounded-xl max-w-none"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
              >
                {blog.contentMarkdown || ""}
              </ReactMarkdown>
            </article>

            {/* Interaksi Blog: Sukai & Bagikan */}
            <div className="flex flex-wrap items-center gap-3 py-5 border-y border-border/80 my-8">
              <LikeButton slug={blog.slug} initialLikes={blog.likes || 0} />
              <ShareButton title={blog.title} />
            </div>

            {/* Kolom Komentar */}
            <BlogComments slug={blog.slug} />
          </div>

          {/* Sidebar (TOC & Tags) */}
          <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-8">
            {/* Table of Contents */}
            <TableOfContents />

            {/* Tags */}
            <div className="bg-background-elevated border border-border rounded-xl p-6">
              <h3 className="font-display text-caption font-bold text-foreground mb-4 uppercase tracking-wider">
                Topik Artikel
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <span key={tag} className="text-xs text-foreground-subtle bg-background-overlay border border-border px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </PageLayout>
  );
}
