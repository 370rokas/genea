"use client";

import { useSourceTags } from "@/hooks/dataFetching";
import { CreateTagDialog } from "@/components/admin/tagCreateDialog";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TagView() {
    const { data, isLoading, isError } = useSourceTags();

    return (
        <div>
            {isLoading && <div>Įkeliamos žymos...</div>}

            {isError && <div>Klaida įkeliant žymas.</div>}

            {data && (
                <Table className="w-full table-fixed pb-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]">ID</TableHead>
                            <TableHead className="w-[35%]">Pavadinimas</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((tag) => (
                            <TableRow
                                key={tag.id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <TableCell>{tag.id}</TableCell>
                                <TableCell>{tag.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <CreateTagDialog />
        </div>
    );
}
