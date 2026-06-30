"use client";

import { useState } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Container } from "@/components/public/Container";
import { BlogCard } from "@/components/public/blog/BlogCard";
import { Search, Tag, Loader2 } from "lucide-react";
import useSWR from "swr";
import { blogsApi } from "@/lib/api";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | "All">("All");

  const { data: blogs = [], isLoading } = useSWR("blogs", () =>
    blogsApi.getAll().then((res) => res.data || [])
  );

  // Extract all unique tags
  const allTags = ["All", ...Array.from(new Set((blogs || []).flatMap((blog) => blog.tags || [])))];

  // Filtering Logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesTag = activeTag === "All" || (blog.tags && blog.tags.includes(activeTag));

    return matchesSearch && matchesTag;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <Container>
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-h1 text-foreground mb-4">
              Catatan & Pemikiran
            </h1>
            <p className="text-body text-foreground-muted">
              Ulasan, panduan teknis pemrograman web, konsep desain minimalis, dan catatan perjalanan kepemimpinan.
            </p>
          </div>

          {/* Search and Tag Filters */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border pb-6 mb-10">
            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2 order-2 md:order-1 items-center">
              <Tag size={14} className="text-foreground-subtle hidden sm:inline" />
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    activeTag === tag
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background-elevated text-foreground-muted border-border hover:text-foreground"
                  }`}
                >
                  {tag === "All" ? "Semua Tag" : `#${tag}`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs order-1 md:order-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full rounded-md border border-border bg-background-elevated pl-10 pr-4 py-2 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-accent"
              />
              <Search className="absolute left-3 top-2.5 text-foreground-subtle h-4 w-4" />
            </div>
          </div>

          {/* Blog Cards Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-body-lg text-foreground-muted">Artikel tidak ditemukan.</p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
