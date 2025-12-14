"use client";

import { useEffect, useState } from "react";
import { vietovardziai } from "@/app/tempData";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { Spinner } from "../ui/spinner";
import { Autocomplete, AutocompleteInput, AutocompleteItem, AutocompleteList, AutocompletePopup, AutocompleteStatus } from "../ui/autocomplete";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
    selectedLocations: string[];
    setSelectedLocations: (selected: string[]) => void;
    className?: string;
}

async function searchLocations(query: string, filter: (item: string, query: string) => boolean) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 100));

    if (Math.random() < 0.01 || query === "error") {
        throw new Error("Serverio klaida");
    }

    return vietovardziai.filter(
        (item) => filter(item, query)
    )
}

export function LocationSelector({ selectedLocations, setSelectedLocations, className }: LocationSelectorProps) {    
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { contains } = AutocompletePrimitive.useFilter({ sensitivity: "base" });

    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        let ignore = false;

        const timeoutId = setTimeout(async () => {
            try {
                const results = await searchLocations(searchQuery, contains);
                const filtered = results.filter(
                    (item) => !selectedLocations.includes(item)
                );

                if (!ignore) setSearchResults(filtered);
            } catch (error) {
                if (!ignore) {
                    setError("Serverio klaida. Bandykite dar kartą.");
                    setSearchResults([]);
                }
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(timeoutId);
            ignore = true;
        };
    }, [searchQuery, contains]);

    let status: React.ReactNode = `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
    if (isLoading) {
        status = (
        <span className="flex items-center justify-between gap-2 text-muted-foreground">
            Kraunama...
            <Spinner />
        </span>
        );
    } else if (error) {
        status = (
        <span className="font-normal text-destructive text-sm">{error}</span>
        );
    } else if (searchResults.length === 0 && searchQuery) {
        status = (
        <span className="font-normal text-muted-foreground text-sm">
            Rezultatų nerasta...
        </span>
        );
    }

    const handleSelect = (value: string) => {
        setSelectedLocations([...selectedLocations, value]);

        setSearchQuery("");
        setSearchResults([]);
    };

    const shouldRenderPopup = searchQuery !== "";

    return (
        <div className={cn("w-full", className)}>
            <Autocomplete
                filter={null}
                items={searchResults}
                itemToStringValue={(item: string) => (item)}
                value={searchQuery}
                onValueChange={(value: string, reason) => {
                    if (reason.reason === "item-press") {
                    handleSelect(value);
                    } else {
                    setSearchQuery(value);
                    }
                }}
            >
                <AutocompleteInput placeholder="Ieškoti vietovardžių..." size="lg" className="w-full"/>
                    {shouldRenderPopup && (
                        
                        <AutocompletePopup className="w-full" aria-busy={isLoading || undefined}>
                            <AutocompleteStatus className="text-muted-foreground">
                                {status}
                            </AutocompleteStatus>

                            <AutocompleteList>
                                {(vietovardis: string) => (
                                    <AutocompleteItem key={vietovardis} value={vietovardis}>
                                        <div className="flex w-full flex-col gap-1">
                                            <span>{vietovardis}</span>
                                        </div>
                                    </AutocompleteItem>
                                )}
                            </AutocompleteList>
                        </AutocompletePopup>
                    )}
            </Autocomplete>

            <div className="mt-2 flex w-full flex-wrap gap-2 items-start">
                {selectedLocations.map((location) => (
                    <div
                        key={location}
                        className="flex-shrink-0 flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 max-w-full"
                    >
                    <span className="truncate max-w-full">{location}</span>
                        <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => {
                            const newSelected = selectedLocations.filter(
                                (loc) => loc !== location
                            );
                            setSelectedLocations(newSelected);
                            }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}