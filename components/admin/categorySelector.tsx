"use client";

import { useSourceCategories } from "@/hooks/dataFetching";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select";
import { useMemo } from "react";

interface CategorySelectorProps {
    selectedCategory: number | null;
    setSelectedCategory: (cat: number | null) => void;
}

export default function CategorySelector({
    selectedCategory,
    setSelectedCategory,
}: CategorySelectorProps) {

    const { data, isLoading, isError } = useSourceCategories();

    const categoryOptions = useMemo(() => {
        if (!data) return [];

        return [
            { label: "Pasirinkite kategoriją", value: null },
            ...data.map(c => ({
                label: c.name,
                value: c.id,
            })),
        ];
    }, [data]);

    return (
        <Select
            aria-label="Kategorija"
            items={categoryOptions}
            value={selectedCategory?.toString() ?? null}
            onValueChange={(val: string | null) => {
                setSelectedCategory(val ? parseInt(val, 10) : null);
            }}
        >
            <SelectTrigger size="lg">
                <SelectValue />
            </SelectTrigger>

            <SelectPopup alignItemWithTrigger={false}>
                {categoryOptions.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                        {label}
                    </SelectItem>
                ))}
            </SelectPopup>
        </Select>
    )

}
