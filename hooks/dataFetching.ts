"use client";

import { SourceCategory } from "@/types";
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