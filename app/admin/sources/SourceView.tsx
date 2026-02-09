"use client";

import React from 'react';
import Link from 'next/link';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

import { AdminSourceListing } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SearchIcon, SquarePenIcon } from 'lucide-react';
import { Group, GroupSeparator, GroupText } from '@/components/ui/group';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useAdminSourceListings } from '@/hooks/dataFetching';

export default function SourceView() {
    const { data: sources, isLoading: sourcesLoading } = useAdminSourceListings();

    const columnHelper = createColumnHelper<AdminSourceListing>();

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('title', {
                header: 'Pavadinimas',
                cell: info => <span className="font-medium whitespace-nowrap">{info.getValue()}</span>,
            }),
            columnHelper.accessor('description', {
                header: 'Aprašymas',
                cell: info => (
                    <div
                        className="max-w-[300px] truncate text-muted-foreground"
                        title={info.getValue()}
                    >
                        {info.getValue()}
                    </div>
                ),
            }),
            columnHelper.accessor('state', {
                header: '',
                cell: info => (
                    <div className="flex items-center gap-2">
                        {info.getValue() === "OK" ? (
                            <div className="flex items-center gap-2">
                                <span
                                    aria-label="Aktyvus šaltinis"
                                    className="inline-block size-2 rounded-full bg-emerald-500"
                                />
                            </div>
                        ) : (
                            <span className="text-muted-foreground">{info.getValue()}</span>
                        )}
                    </div>
                ),
            }),
            columnHelper.display({
                header: '',
                id: 'actions',
                cell: info => (
                    <div className="flex gap-2 flex items-center">
                        <Link href={`/admin/sources/${info.row.original.id}`}>
                            <Button aria-label="Redaguoti" size="icon" variant="ghost">
                                <SquarePenIcon aria-hidden="true" className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                ),
            })
        ],
        [columnHelper]
    );

    const [query, setQuery] = React.useState('');
    const filteredSources = React.useMemo(() => {
        if (!sources) return [];
        if (!query.trim()) return sources;
        const lower = query.toLowerCase();
        return sources.filter(
            (s) =>
                s.title?.toLowerCase().includes(lower) ||
                s.description?.toLowerCase().includes(lower)
        );
    }, [sources, query]);

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    const table = useReactTable({
        data: filteredSources,
        columns: columns,
        state: {
            pagination
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: true
    });

    if (sourcesLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full table-fixed pb-4">
            <div className="flex items-center justify-between gap-4 mb-5">
                <Group className='max-w-sm w-full'>
                    <InputGroup>
                        <InputGroupInput aria-label="Ieškoti" placeholder="Ieškoti" type="search" onChange={(e) => setQuery(e.target.value)} />
                        <InputGroupAddon>
                            <SearchIcon aria-hidden="true" />
                        </InputGroupAddon>
                    </InputGroup>
                </Group>

                <Group className='max-w-sm'>
                    <Button size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <ArrowLeft aria-hidden="true" />
                    </Button>

                    <GroupSeparator />

                    <GroupText className="text-sm">
                        {table.getState().pagination.pageIndex + 1} iš {table.getPageCount()}
                    </GroupText>

                    <GroupSeparator />

                    <Button size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <ArrowLeft className="rotate-180" aria-hidden="true" />
                    </Button>

                </Group>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} colSpan={header.colSpan} className="whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}