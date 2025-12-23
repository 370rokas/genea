"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/search/LocationSelector";

import { SourceTable } from "@/components/sources/SourceTable";
import { useSourceCategories, useSources, useSourceTags } from "./dataFetching";
import CategorySelector from "@/components/admin/categorySelector";
import TagSelector from "@/components/search/tagSelector";


export default function SourcesPage() {
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [filterText, setFilterText] = useState<string>("");

    const { data: tags, isLoading: tagsLoading } = useSourceTags();
    const { data: sources, isLoading: sourcesLoading } = useSources();
    const { data: categories, isLoading: categoriesLoading } = useSourceCategories();
    return (
        <main className="flex min-h-screen flex-col items-center pt-12 px-24 bg-gray-200">

            {/* Main Search Bar*/}
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
                        onChange={(text) => setFilterText(text.target.value)}
                    />

                    <Button onClick={() => { setShowFilters(!showFilters) }}>
                        {showFilters ? "Slėpti filtrus" : "Rodyti filtrus"}
                    </Button>
                </div>
            </div>

            {/* Additional Filters */}
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

            {/* Search Results */}
            <div className="flex w-full max-w-1xl flex-col gap-4 bg-white p-4 rounded-md shadow-md">
                {sourcesLoading || categoriesLoading || tagsLoading || sources == undefined ? (
                    <div>Įkeliama...</div>
                ) : (
                    <SourceTable displayData={sources} filterSettings={
                        {
                            categoryId: selectedCategory,
                            locationIds: selectedLocations.map(loc => Number(loc)),
                            tagsIds: selectedTags,
                            text: filterText,
                        }} />
                )}
            </div>
        </main>
    );
}
