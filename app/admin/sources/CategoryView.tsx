"use client";

import { CreateCategoryDialog } from "@/components/admin/categoryCreateDialog";
import { useSourceCategories } from "@/hooks/dataFetching";

export default function CategoryView() {
    const { data, isLoading, isError } = useSourceCategories();

    return (<div>
        {isLoading && <div>Įkeliama kategorijos...</div>}

        {isError && <div>Klaida įkeliant kategorijas.</div>}

        {data && (
            <ul>
                {data.map((category) => (
                    <li key={category.id}>
                        {category.name} (ID: {category.id})
                    </li>
                ))}
            </ul>
        )}

        <CreateCategoryDialog />
    </div>);
}