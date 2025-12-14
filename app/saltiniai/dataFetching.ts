"use client";

import { SourceCategory, SourceDisplayData, SourceTag, LocationData } from "@/types";
import { useQuery } from "@tanstack/react-query";

async function fetchCategories(): Promise<SourceCategory[]> {
    const res = await fetch('/api/getSourceCategories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

async function fetchTags(): Promise<SourceTag[]> {
    const res = await fetch('/api/getSourceTags');
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
}

async function fetchLocations(): Promise<LocationData[]> {
    const res = await fetch('/api/getLocations');
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
}

async function fetchSources(): Promise<SourceDisplayData[]> {
    const res = await fetch('/api/getSources');
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
}

export function useSourceCategories() {
  return useQuery({
    queryKey: ['sourceCategories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSourceTags() {
  return useQuery({
    queryKey: ['sourceTags'],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    staleTime: Infinity,
  });
}
