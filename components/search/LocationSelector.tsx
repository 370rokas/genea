"use client";

import { useMemo, useState } from "react";
import { Autocomplete, AutocompleteEmpty, AutocompleteInput, AutocompleteItem, AutocompleteList, AutocompletePopup, AutocompleteStatus } from "../ui/autocomplete";
import { cn } from "@/lib/utils";
import { useLocations } from "@/hooks/dataFetching";

interface LocationSelectorProps {
    selectedLocations: string[];
    setSelectedLocations: (selected: string[]) => void;
    className?: string;
}

export function LocationSelector({ selectedLocations, setSelectedLocations, className }: LocationSelectorProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { data: locations, isLoading: locationsLoading } = useLocations();
    const locationData = useMemo(() => {
        if (!locations) return [];
        return locations.map(loc => ({ label: loc.name, value: loc.id.toString() }));
    }, [locations]);

    const handleSelect = (value: string) => {
        if (!selectedLocations.includes(value)) {
            setSelectedLocations([...selectedLocations, value]);
        }
        setSearchQuery("");
    };

    function getIdFromValue(value: string): number | null {
        const location = locations ? locations.find(loc => loc.name === value) : null;
        return location ? location.id : null;
    };

    const getNameFromId = (id: string) => locations?.find(loc => loc.id.toString() === id)?.name || "";

    const shouldRenderPopup = searchQuery.length > 0 && locationData.some(loc => loc.label.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={cn("w-full", className)}>
            <Autocomplete
                limit={7}
                items={locationData}
                itemToStringValue={(item) => item?.label || ""}
                value={searchQuery}
                onValueChange={(value: string, reason) => {
                    if (reason.reason === "item-press") {
                        const id = getIdFromValue(value);
                        if (id !== null) {
                            handleSelect(id.toString());
                        }
                    } else {
                        setSearchQuery(value);
                    }
                }}
            >
                <AutocompleteInput placeholder="Ieškoti vietovardžių..." size="lg" className="w-full" />
                {shouldRenderPopup && (
                    <AutocompletePopup className="w-full" aria-busy={locationsLoading || undefined}>
                        <AutocompleteEmpty>Nerasta rezultatų</AutocompleteEmpty>
                        <AutocompleteList>
                            {(vietovardis) => (
                                <AutocompleteItem key={vietovardis.value} value={vietovardis}>
                                    <div className="flex w-full flex-col gap-1">
                                        <span>{vietovardis.label}</span>
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
                        <span className="truncate max-w-full">{getNameFromId(location)}</span>
                        <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => {
                                setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
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