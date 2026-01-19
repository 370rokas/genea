"use client";

import { CreateCategoryDialog } from "@/components/admin/categoryCreateDialog";
import { useSourceCategories } from "@/hooks/dataFetching";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceCategory } from "@/types";

interface CategoriesTableProps {
    categoryData: SourceCategory[];
}

function CategoriesTable({ categoryData }: CategoriesTableProps) {
    return (
        <Table className="w-full table-fixed pb-4">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[5%]">ID</TableHead>
                    <TableHead className="w-[35%]">Pavadinimas</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {categoryData.map((category) => (
                    <TableRow
                        key={category.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function CategoryView() {
    const { data, isLoading, isError } = useSourceCategories();

    return (<div>
        {isLoading && <div>Įkeliama kategorijos...</div>}

        {isError && <div>Klaida įkeliant kategorijas.</div>}

        {data && (
            <CategoriesTable categoryData={data} />
        )}

        <CreateCategoryDialog />
    </div>);
}