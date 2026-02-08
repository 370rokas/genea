"use client";

import React, { useState } from 'react';
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FullSourceData } from "@/types";
import TagSelector from '@/components/search/tagSelector';
import { LocationSelector } from '@/components/search/LocationSelector';
import { Textarea } from '@/components/ui/textarea';
import CategorySelector from './categorySelector';

export function EditSourceForm({ startingData }: { startingData: FullSourceData }) {
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
        startingData.tags?.map(t => t.id) || []
    );

    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
        startingData.locations?.map(l => l.id.toString()) || []
    );

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        startingData.category_id ? parseInt(startingData.category_id) : null // @ts-ignore
    );

    console.log("Selected category ID:", selectedCategoryId);
    console.log(startingData)

    const [isSaving, setIsSaving] = useState(false);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);

        const finalData = {
            ...Object.fromEntries(formData),
            tag_ids: selectedTagIds,
            location_ids: selectedLocationIds.map(id => parseInt(id)),
            category_id: selectedCategoryId ?? null,
            id: startingData.id
        };

        setIsSaving(true);

        fetch("/api/admin/sources/editSource", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(finalData)
        }).then(res => {
            if (res.ok) {
                alert("Šaltinis sėkmingai atnaujintas!");
            } else {
                alert("Klaida atnaujinant šaltinį.");
            }
        }).catch(() => {
            alert("Klaida atnaujinant šaltinį.");
        }).finally(() => {
            setIsSaving(false);
            window.location.reload();
        });
    }

    return (
        <Form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor="title">Pavadinimas</FieldLabel>
                    <Input id="title" name="title" defaultValue={startingData.title} disabled={isSaving} />
                </Field>
                <Field>
                    <FieldLabel htmlFor="title_en">Pavadinimas (EN)</FieldLabel>
                    <Input id="title_en" name="title_en" defaultValue={startingData.title_en || ""} disabled={isSaving} />
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="description">Aprašymas</FieldLabel>
                <Textarea id="description" name="description" defaultValue={startingData.description} disabled={isSaving} />
            </Field>

            <Field>
                <FieldLabel htmlFor="description_en">Aprašymas (EN)</FieldLabel>
                <Textarea id="description_en" name="description_en" defaultValue={startingData.description_en || ""} disabled={isSaving} />
            </Field>

            <Field>
                <FieldLabel htmlFor="link">Nuoroda</FieldLabel>
                <Input id="link" name="link" defaultValue={startingData.link} disabled={isSaving} />
            </Field>

            <Field>
                <FieldLabel htmlFor="category">Kategorija</FieldLabel>
                <CategorySelector
                    selectedCategory={selectedCategoryId}
                    setSelectedCategory={setSelectedCategoryId}
                />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <Field>
                    <FieldLabel>Žymos</FieldLabel>
                    <TagSelector
                        selectedTags={selectedTagIds}
                        setSelectedTags={setSelectedTagIds}
                    />
                </Field>

                <Field>
                    <FieldLabel>Vietovės</FieldLabel>
                    <LocationSelector
                        selectedLocations={selectedLocationIds}
                        setSelectedLocations={setSelectedLocationIds}
                    />
                </Field>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" disabled={isSaving}>Išsaugoti visus pakeitimus</Button>
            </div>
        </Form>
    );
}