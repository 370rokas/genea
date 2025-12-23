"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LocationData } from "@/types";

interface LocationsTableProps {
    locationData: LocationData[];
}

export function LocationsTable({ locationData }: LocationsTableProps) {
    return (
        <Table className="w-full table-fixed">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[5%]">ID</TableHead>
                    <TableHead className="w-[35%]">Pavadinimas</TableHead>
                    <TableHead className="w-[60%]">URI</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {locationData.map((loc) => (
                    <TableRow
                        key={loc.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <TableCell>{loc.id}</TableCell>
                        <TableCell>{loc.name}</TableCell>
                        <TableCell>{loc.path}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}