"use client";

import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, EllipsisIcon, SquarePenIcon, Trash2 } from "lucide-react";
import { LocationData } from "@/types";
import {
    AlertDialog,
    AlertDialogClose,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogPopup,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

interface LocationsTableProps {
    locationData: LocationData[];
}

const columnHelper = createColumnHelper<LocationData>();

export function LocationsTable({ locationData }: LocationsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

    const handleDelete = (location: LocationData) => {
        const res = fetch("/api/admin/location", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            // @ts-expect-error
            body: JSON.stringify({ id: parseInt(location.id) }),
        }).then((res) => {
            if (res.ok) {
                alert("Vieta sėkmingai ištrinta");
                window.location.reload();
            } else {
                res.text().then((text) => {
                    alert("Klaida trinant vietą: " + text);
                }).catch((error) => {
                    alert("Klaida trinant vietą: " + JSON.stringify(error));
                }).finally(() => {
                    window.location.reload();
                });
            }
        }).catch((error) => {
            alert("Klaida trinant vietą: " + JSON.stringify(error));
            window.location.reload();
        });
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        if (!currentLocation) return;

        try {
            const res = await fetch("/api/admin/location", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // @ts-expect-error - type mismatch, but backend expects integer
                    id: parseInt(currentLocation.id as string),
                    name
                }),
            });

            if (res.ok) {
                alert("Vieta sėkmingai atnaujinta");
                setEditDialogOpen(false);
                window.location.reload();
            } else {
                const text = await res.text();
                alert("Klaida atnaujinant vietą: " + text);
            }
        } catch (error) {
            alert("Klaida atnaujinant vietą: " + JSON.stringify(error));
        }
    };

    const columns = [
        columnHelper.accessor("id", {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: (info) => info.getValue(),
            size: 5,
        }),
        columnHelper.accessor("name", {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                        Pavadinimas
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: (info) => info.getValue(),
            size: 35,
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const location = row.original;

                return (
                    <AlertDialog>
                        <Menu>
                            <MenuTrigger render={<Button variant="outline" />}>
                                <EllipsisIcon className="h-4 w-4" />
                            </MenuTrigger>
                            <MenuPopup align="start">
                                <MenuItem onClick={(e) => {
                                    setCurrentLocation(location);
                                    setEditDialogOpen(true);
                                }}>
                                    <SquarePenIcon /> Redaguoti
                                </MenuItem>

                                <MenuItem className="text-red-600" render={<AlertDialogTrigger />}>
                                    <Trash2 className="h-4 w-4" /> Ištrinti
                                </MenuItem>
                            </MenuPopup>
                        </Menu>

                        <AlertDialogPopup>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Ar tikrai norite ištrinti šią vietą?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Šis veiksmas yra negrįžtamas. Vieta "<b>{location.name}</b>" bus visam laikui ištrinta.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogClose render={<Button variant="outline" />}>Atšaukti</AlertDialogClose>
                                <AlertDialogClose render={<Button variant="destructive" />} onClick={(e) => {
                                    handleDelete(location);
                                }}>Ištrinti</AlertDialogClose>
                            </AlertDialogFooter>
                        </AlertDialogPopup>
                    </AlertDialog>
                );
            },
            size: 10,
        }),
    ];

    const table = useReactTable({
        data: locationData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="rounded-md border overflow-hidden my-2">
            <Dialog onOpenChange={setEditDialogOpen} open={editDialogOpen}>
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>Redaguoti vietą: <b>{currentLocation?.name}</b></DialogTitle>
                    </DialogHeader>
                    <Form onSubmit={handleEditSubmit}>
                        <DialogPanel>
                            <Field>
                                <FieldLabel>Pavadinimas</FieldLabel>
                                <Input name="name" type="text" required />
                            </Field>
                        </DialogPanel>
                        <DialogFooter>
                            <DialogClose render={<Button variant="outline" type="button" />}>Atšaukti</DialogClose>
                            <Button type="submit">Išsaugoti</Button>
                        </DialogFooter>
                    </Form>
                </DialogPopup>
            </Dialog>

            <Table className="w-full table-fixed">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{ width: `${header.column.columnDef.size}%` }}
                                >
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
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}