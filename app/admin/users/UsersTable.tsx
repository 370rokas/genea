import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserData } from "@/types";
import { useState } from "react";

interface SourceTableProps {
    displayData: UserData[];
};

function Cell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`text-sm break-words transition-all`}>
            {children}
        </div>
    );
};

export function UsersTable({ displayData }: SourceTableProps) {
    return (
        <Table className="w-full table-fixed">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[25%]">ID</TableHead>
                    <TableHead className="w-[30%]">Vardas</TableHead>
                    <TableHead className="w-[45%]">Teisės</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {displayData.map((item: UserData) => {

                    return (
                        <TableRow
                            key={item.id}
                            className={`
                      align-top
                      cursor-pointer
                      transition-colors
                      hover:bg-gray-50
                    `}
                        >
                            <TableCell className="overflow-hidden">
                                {item.id}
                            </TableCell>

                            <TableCell className="overflow-hidden">
                                {item.username}
                            </TableCell>

                            <TableCell className="overflow-hidden ">
                                {item.permissions.join(", ")}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    )
};