"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Blog } from "@/types";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0" hoverEffect={true}>
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-background-overlay border-b border-border/60 group">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="primary">{blog.category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date & Reading time */}
        <div className="flex items-center gap-4 text-[10px] text-foreground-subtle mb-2 font-medium">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(blog.createdAt)}
          </span>
          {blog.readingTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {blog.readingTime} Menit Baca
            </span>
          )}
        </div>

        <Link href={`/blog/${blog.slug}`} className="hover:underline">
          <h3 className="font-display text-h3 text-foreground font-semibold mb-2.5 line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-xs text-foreground-muted line-clamp-3 mb-4 leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {blog.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-foreground-subtle font-medium bg-background-overlay border border-border px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
