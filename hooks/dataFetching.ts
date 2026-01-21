"use client";

import { SourceCategory, SourceDisplayData, SourceTag, LocationData, SourceProposal } from "@/types";
import { useQuery } from "@tanstack/react-query";

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

async function fetchSourcesLT(): Promise<SourceDisplayData[]> {
  const res = await fetch('/api/getSourcesLT');
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

async function fetchSourcesEN(): Promise<SourceDisplayData[]> {
  const res = await fetch('/api/getSourcesEN');
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

async function fetchSourceProposals(): Promise<SourceProposal[]> {
  const res = await fetch('/api/admin/sources/proposals/get');
  if (!res.ok) throw new Error('Failed to fetch source proposals');
  return res.json();
}

async function fetchSourceCategories(): Promise<SourceCategory[]> {
  const res = await fetch('/api/getSourceCategories');
  if (!res.ok) throw new Error('Failed to fetch source categories');
  return res.json();
}

export function useSourceCategories() {
  return useQuery({
    queryKey: ['sourceCategories'],
    queryFn: fetchSourceCategories,
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

export function useSourcesLT() {
  return useQuery({
    queryKey: ['sourcesLT'],
    queryFn: fetchSourcesLT,
    staleTime: Infinity,
  });
}

export function useSourcesEN() {
  return useQuery({
    queryKey: ['sourcesEN'],
    queryFn: fetchSourcesEN,
    staleTime: Infinity,
  });
}

export function useSourceProposals() {
  return useQuery({
    queryKey: ['sourceProposals'],
    queryFn: fetchSourceProposals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}