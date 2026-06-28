import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { Badge } from "@/components/ui/Badge";
import { DUMMY_BLOGS } from "@/data/dummy";
import { ArrowLeft, Calendar, Clock, List } from "lucide-react";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DUMMY_BLOGS.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const blog = DUMMY_BLOGS.find((b) => b.slug === slug);

  if (!blog) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
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

                <div className="flex items-center gap-4 text-xs text-foreground-subtle">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(blog.createdAt)}
                  </span>
                  {blog.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {blog.readingTime} Menit Baca
                    </span>
                  )}
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
              <article className="prose dark:prose-invert max-w-none">
                <h2>1. Pengantar Utama</h2>
                <p>
                  Situs web berkecepatan tinggi tidak hanya menyenangkan pengguna tetapi juga berkontribusi besar bagi peringkat SEO. Di Next.js, ini dicapai melalui optimasi resource secara pasif dan kompilasi statis.
                </p>
                <p>
                  Dalam seri tutorial ini, kita merinci bagaimana membagi modul antarmuka web, menerapkan caching state, serta menyambungkannya ke Google Sheets API secara aman.
                </p>

                <h2>2. Penerapan TypeScript Tipe Ketat (Strict)</h2>
                <p>
                  Mendeklarasikan interface untuk setiap entitas data (seperti Project, Blog, dan Journey) menghindari kesalahan parse runtime secara dini saat kita memproses respon baris dari spreadsheet.
                </p>
                <pre>
                  <code>
{`export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  coverImage: string;
  tags: string[];
}`}
                  </code>
                </pre>

                <h2>3. Kesimpulan Akhir</h2>
                <p>
                  Dengan pemisahan logika fetching (Repository Pattern) dan dynamic routing Next.js, transisi visual terasa organik tanpa memakan resource jaringan yang berlebihan.
                </p>
              </article>
            </div>

            {/* Sidebar (TOC & Tags) */}
            <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-8">
              {/* Table of Contents */}
              <div className="bg-background-elevated border border-border rounded-xl p-6">
                <h3 className="font-display text-caption font-bold text-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <List size={16} className="text-accent" />
                  Daftar Isi
                </h3>
                <nav className="flex flex-col gap-2.5 text-xs text-foreground-muted">
                  <a href="#" className="hover:text-accent hover:underline">1. Pengantar Utama</a>
                  <a href="#" className="hover:text-accent hover:underline">2. Penerapan TypeScript</a>
                  <a href="#" className="hover:text-accent hover:underline">3. Kesimpulan Akhir</a>
                </nav>
              </div>

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
      </main>
      <Footer />
    </>
  );
}
