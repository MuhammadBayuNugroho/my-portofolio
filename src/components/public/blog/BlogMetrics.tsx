"use client";

import { useMemo } from "react";
import { Clock, Eye } from "lucide-react";
import useSWR from "swr";
import { blogsApi } from "@/lib/api";

interface BlogMetricsProps {
  slug: string;
  initialViews: number;
  contentMarkdown: string;
}

export function BlogMetrics({ slug, initialViews, contentMarkdown }: BlogMetricsProps) {
  // Fetch real-time views from the API
  const { data } = useSWR(`blog-${slug}`, async () => {
    const res = await blogsApi.getBySlug(slug);
    return { views: res.data?.views ?? initialViews };
  }, { 
    fallbackData: { views: initialViews },
    refreshInterval: 60000 // refresh every 1 min
  });

  // Calculate reading time on the fly based on actual content
  const readingTime = useMemo(() => {
    if (!contentMarkdown) return 1;
    const wordCount = contentMarkdown.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute average
  }, [contentMarkdown]);

  const views = data?.views ?? initialViews;

  return (
    <div className="flex items-center gap-4 text-xs font-medium text-foreground-subtle">
      <span className="flex items-center gap-1.5 bg-background-elevated px-2.5 py-1 rounded-full border border-border">
        <Clock size={14} className="text-accent" />
        {readingTime} Menit Baca
      </span>
      <span className="flex items-center gap-1.5 bg-background-elevated px-2.5 py-1 rounded-full border border-border">
        <Eye size={14} className="text-accent" />
        {views} {views === 1 ? 'Kunjungan' : 'Kunjungan'}
      </span>
    </div>
  );
}
