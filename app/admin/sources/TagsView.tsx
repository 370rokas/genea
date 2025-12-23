"use client";

import { useSourceTags } from "@/app/saltiniai/dataFetching";
import { CreateTagDialog } from "@/components/admin/tagCreateDialog";

export default function TagView() {
    const { data, isLoading, isError } = useSourceTags();

    return (
        <div>
            {isLoading && <div>Įkeliamos žymos...</div>}

            {isError && <div>Klaida įkeliant žymas.</div>}

            {data && (
                <ul>
                    {data.map((tag) => (
                        <li key={tag.id}>
                            {tag.name} (ID: {tag.id})
                        </li>
                    ))}
                </ul>
            )}

            <CreateTagDialog />
        </div>
    );
}
