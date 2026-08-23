"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { blogsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types";

interface LikeButtonProps {
  slug: string;
  initialLikes?: number;
}

export function LikeButton({ slug, initialLikes = 0 }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Share SWR state using the same cache key as BlogMetrics
  const { data, mutate } = useSWR<Partial<Blog>>(`blog-${slug}`, async () => {
    const res = await blogsApi.getBySlug(slug);
    return res.data || {};
  }, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });

  const likesCount = data?.likes ?? initialLikes;

  // Check localStorage on mount
  useEffect(() => {
    try {
      const likedSlugs = JSON.parse(localStorage.getItem("liked-blogs") || "[]") as string[];
      setIsLiked(likedSlugs.includes(slug));
    } catch {
      setIsLiked(false);
    }
  }, [slug]);

  const handleLike = async () => {
    if (isPending) return;

    setIsPending(true);
    const nextLikedState = !isLiked;
    const diff = nextLikedState ? 1 : -1;
    const newLikesCount = Math.max(0, likesCount + diff);

    // 1. Optimistic Update SWR Cache
    const previousData = { ...data };
    mutate({ ...data, likes: newLikesCount }, false);
    setIsLiked(nextLikedState);

    // 2. Update localStorage
    try {
      const likedSlugs = JSON.parse(localStorage.getItem("liked-blogs") || "[]") as string[];
      if (nextLikedState) {
        if (!likedSlugs.includes(slug)) {
          likedSlugs.push(slug);
        }
      } else {
        const index = likedSlugs.indexOf(slug);
        if (index > -1) {
          likedSlugs.splice(index, 1);
        }
      }
      localStorage.setItem("liked-blogs", JSON.stringify(likedSlugs));
    } catch (e) {
      console.error("[LikeButton] LocalStorage write error:", e);
    }

    // 3. Send API POST to Apps Script backend
    try {
      const action = nextLikedState ? "like" : "unlike";
      const res = await blogsApi.like(slug, action);
      if (res.success && res.data) {
        mutate({ ...data, likes: res.data.likes }, false);
      } else {
        // Rollback if success is false
        mutate(previousData, false);
        setIsLiked(!nextLikedState);
      }
    } catch (err) {
      console.error("[LikeButton] API error:", err);
      // Rollback on network error
      mutate(previousData, false);
      setIsLiked(!nextLikedState);
      // Revert localStorage
      try {
        const likedSlugs = JSON.parse(localStorage.getItem("liked-blogs") || "[]") as string[];
        if (nextLikedState) {
          const index = likedSlugs.indexOf(slug);
          if (index > -1) likedSlugs.splice(index, 1);
        } else {
          if (!likedSlugs.includes(slug)) likedSlugs.push(slug);
        }
        localStorage.setItem("liked-blogs", JSON.stringify(likedSlugs));
      } catch (_) {
        // Abaikan error fallback localStorage
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-caption font-medium transition-all cursor-pointer select-none",
        isLiked
          ? "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          : "bg-background-elevated border-border text-foreground hover:bg-background-overlay hover:border-zinc-400 dark:hover:border-zinc-500"
      )}
      aria-label={isLiked ? "Batal menyukai artikel" : "Sukai artikel"}
    >
      <motion.div
        whileTap={{ scale: 1.4 }}
        animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex items-center justify-center"
      >
        <Heart
          size={16}
          className={cn(
            "transition-all duration-200",
            isLiked ? "fill-rose-500 text-rose-500" : "text-foreground-muted hover:text-rose-500"
          )}
        />
      </motion.div>
      <span>{likesCount} Suka</span>
    </button>
  );
}
