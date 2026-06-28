/**
 * hooks/use-fetch.ts — Generic data fetching hook with SWR.
 *
 * Wraps SWR for consistent data fetching patterns:
 * - Automatic caching and revalidation
 * - Loading and error states
 * - Typed responses
 */

"use client";

import useSWR, { type SWRConfiguration } from "swr";
import type { ApiResponse } from "@/types";

// Generic fetcher function
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  const data: ApiResponse<T> = await res.json();
  if (!data.success) {
    throw new Error(data.error ?? "API error");
  }
  return data.data;
}

interface UseFetchReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * useFetch — Typed SWR hook for API data fetching.
 * @param url - The API endpoint URL (null to skip fetching)
 * @param config - SWR configuration options
 */
export function useFetch<T>(
  url: string | null,
  config?: SWRConfiguration
): UseFetchReturn<T> {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher<T>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      ...config,
    }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}
