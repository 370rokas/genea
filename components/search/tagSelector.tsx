"use client";

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxValue,
} from "@/components/ui/combobox";
import { useSourceTags } from "@/app/saltiniai/dataFetching";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface TagSelectorProps {
    selectedTags: number[];
    setSelectedTags: (tags: number[]) => void;
}

export default function TagSelector({
    selectedTags,
    setSelectedTags,
}: TagSelectorProps) {
    const { data, isLoading, isError } = useSourceTags();
    const [items, setItems] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        if (data) {
            setItems(data.map((tag) => ({ label: tag.name, value: tag.id })));
        }
    }, [data]);

    if (isLoading) {
        return <Skeleton />;
    }

    if (isError) {
        return <Label>Žymų įkėlimo klaida</Label>;
    }

    const handleSelectionChange = (selectedItems: { label: string; value: number }[]) => {
        setSelectedTags(selectedItems.map(item => item.value));
    };

    return (
        <Combobox
            items={items}
            multiple
            value={items.filter(item => selectedTags.includes(item.value))}
            onValueChange={handleSelectionChange}
        >
            <ComboboxChips>
                <ComboboxValue>
                    {(value: { value: number; label: string }[]) => (
                        <>
                            {value?.map((item) => (
                                <ComboboxChip aria-label={item.label} key={item.value}>
                                    {item.label}
                                </ComboboxChip>
                            ))}
                            <ComboboxInput
                                aria-label="Pasirinkite žymas"
                                placeholder={value.length > 0 ? undefined : "Pasirinkite žymas..."}
                            />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>

            <ComboboxPopup>
                <ComboboxEmpty>Rezultatų nerasta.</ComboboxEmpty>
                <ComboboxList>
                    {items.map((item) => (
                        <ComboboxItem key={item.value} value={item}>
                            {item.label}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxPopup>
        </Combobox>
    );
}
