"use client";

import { SourceCategory, SourceProposal } from "@/types";
import useSWR from "swr";

export const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSourceCategories() {
    const { data, error, isLoading } = useSWR<SourceCategory[]>("/api/getSourceCategories", fetcher);

    return {
        data: data,
        isLoading,
        isError: error
    };
}

export function useSourceProposals() {
    const { data, error, isLoading } = useSWR<SourceProposal[]>("/api/admin/sources/proposals/get", fetcher);

    return {
        data: data,
        isLoading,
        isError: error
    };
}