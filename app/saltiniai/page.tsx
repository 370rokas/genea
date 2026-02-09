"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/search/LocationSelector";
import { SearchSourcesRequest, SearchSourcesResponseItem } from "@/types";
import { SourceTable } from "@/components/sources/SourceTable";
import CategorySelector from "@/components/admin/categorySelector";
import TagSelector from "@/components/search/tagSelector";
import MobileSourceView from "@/components/sources/SourceMobileView";

function doSearch(params: SearchSourcesRequest): Promise<SearchSourcesResponseItem[]> {
    const searchParams = new URLSearchParams();

    if (params.query) searchParams.set("q", params.query);
    if (params.category) searchParams.set("cat", String(params.category));
    if (params.locationIds?.length) searchParams.set("locs", params.locationIds.join(","));
    if (params.tagIds?.length) searchParams.set("tags", params.tagIds.join(","));
    if (params.lang) searchParams.set("lang", params.lang);
    if (params.page) searchParams.set("page", String(params.page));

    return fetch(`/api/searchSources?${searchParams.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(res => res.json())
        .catch(err => {
            console.error("Search error:", err);
            alert("Įvyko klaida atliekant paiešką. Bandykite dar kartą.");
            return [];
        });
}

export default function SourcesPage() {
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    // Immediate state for the input
    const [filterTextInput, setFilterTextInput] = useState<string>("");
    // Debounced state for the actual query
    const [filterText, setFilterText] = useState<string>("");

    // Debounce the text filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterText(filterTextInput);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [filterTextInput]);

    // Infinite query for sources
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["sources", selectedCategory, selectedLocations, selectedTags, filterText],
        queryFn: ({ pageParam = 1 }) =>
            doSearch({
                query: filterText || undefined,
                category: selectedCategory ? Number(selectedCategory) : undefined,
                locationIds: selectedLocations.map(loc => Number(loc)),
                tagIds: selectedTags,
                lang: "lt",
                page: pageParam,
            }),
        getNextPageParam: (lastPage, allPages) => {
            // If we got a full page (50 items), there might be more
            if (lastPage.length === 50) {
                return allPages.length + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Flatten all pages into a single array
    const allSources = data?.pages.flat() ?? [];

    return (
        <main className="flex min-h-screen flex-col items-center pt-2 px-2 md:pt-12 md:px-24 bg-gray-200">
            {/* Paieška */}
            <div className="flex w-full flex-col gap-4 mb-8">
                <CategorySelector
                    selectedCategory={selectedCategory ? Number(selectedCategory) : null}
                    setSelectedCategory={(catId: number | null) => {
                        if (catId === null) {
                            setSelectedCategory(null);
                        } else {
                            setSelectedCategory(String(catId));
                        }
                    }}
                />

                <div className="flex w-full max-w-1xl gap-4 mb-4">
                    <Input
                        aria-label="Teksto paieška"
                        placeholder="Teksto paieška"
                        size="lg"
                        type="text"
                        value={filterTextInput}
                        onChange={(e) => setFilterTextInput(e.target.value)}
                    />

                    <Button onClick={() => setShowFilters(!showFilters)}>
                        {showFilters ? "Slėpti filtrus" : "Rodyti filtrus"}
                    </Button>
                </div>
            </div>

            {/* Filtrai */}
            <div className="w-full max-w-8xl mb-8">
                <AnimatePresence initial={false}>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8 p-4 bg-white shadow-md rounded-md">
                                {/* Filtravimas pagal vietovardžius */}
                                <div>
                                    <Label className="text-md mb-2">Filtruoti pagal vietovardžius:</Label>
                                    <LocationSelector
                                        selectedLocations={selectedLocations}
                                        setSelectedLocations={setSelectedLocations}
                                    />
                                </div>

                                {/* Žymų filtras */}
                                <div>
                                    <Label className="text-md mb-2">Filtruoti pagal žymas:</Label>
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        setSelectedTags={setSelectedTags}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Paieškos rezultatai */}
            <div className="flex w-full max-w-1xl flex-col gap-4 bg-white p-4 rounded-md shadow-md">
                {isLoading ? (
                    <div>Įkeliama...</div>
                ) : isError ? (
                    <div>Klaida įkeliant duomenis</div>
                ) : (
                    <>
                        <SourceTable
                            className="hidden md:table"
                            displayData={allSources}
                        />

                        <MobileSourceView
                            className="table md:hidden"
                            displayData={allSources}
                        />

                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? "Įkeliama..." : "Įkelti daugiau"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}