"use client";

import PermissionSelector from "@/components/admin/permissionSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Permission, UpdateUserPayload, UserData } from "@/types";
import { useState } from "react";
import { toastManager } from "@/components/ui/toast";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogPanel,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogPopup,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { Field } from "@/components/ui/field";

interface SourceTableProps {
    displayData: UserData[];
}

export function UsersTable({ displayData }: SourceTableProps) {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

    // Password dialog states
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onRowClick = (user: UserData) => {
        setSelectedUser(user);
        setSelectedPermissions(user.permissions);
        setOpen(true);
    };

    const submitChanges = async () => {
        const payload: UpdateUserPayload = {
            username: selectedUser!.username,
        };

        if (JSON.stringify(selectedPermissions) !== JSON.stringify(selectedUser!.permissions)) {
            payload.permissions = selectedPermissions;
        }

        if (Object.keys(payload).length <= 1) {
            toastManager.add({ title: "Nėra ką atnaujinti", type: "info" });
            return;
        }

        try {
            const res = await fetch("/api/users/updateUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Update failed");

            toastManager.add({ title: "Vartotojas atnaujintas sėkmingai", type: "success" });
            setOpen(false);
            window.location.reload(); // reload page
        } catch {
            toastManager.add({ title: "Nepavyko atnaujinti vartotojo", type: "error" });
            setOpen(false);
        }
    };

    const submitPasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toastManager.add({ title: "Slaptažodžiai nesutampa", type: "error" });
            return;
        }

        const payload: UpdateUserPayload = {
            username: selectedUser!.username,
            password: newPassword,
        };

        try {
            const res = await fetch("/api/users/updateUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Password update failed");

            toastManager.add({ title: "Slaptažodis pakeistas sėkmingai", type: "success" });
            setPasswordDialogOpen(false);
            window.location.reload();
        } catch {
            toastManager.add({ title: "Nepavyko pakeisti slaptažodžio", type: "error" });
            setPasswordDialogOpen(false);
        }
    };

    return (
        <>
            <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[10%]">ID</TableHead>
                        <TableHead className="w-[30%]">Vardas</TableHead>
                        <TableHead className="w-[60%]">Teisės</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayData.map((item) => (
                        <TableRow
                            key={item.id}
                            onClick={() => onRowClick(item)}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.username}</TableCell>
                            <TableCell>{item.permissions.join(", ")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Sidebar for editing permissions */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-[400px]">
                    {selectedUser && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedUser.username}</SheetTitle>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                <div>
                                    <Label>Teisės:</Label>
                                    <PermissionSelector
                                        selectedPermissions={selectedPermissions}
                                        setSelectedPermissions={setSelectedPermissions}
                                    />
                                </div>

                                <Button className="w-full" onClick={submitChanges}>
                                    Išsaugoti
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => setPasswordDialogOpen(true)}
                                >
                                    Pakeisti slaptažodį
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Password change dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={(o) => {
                if (!o && (newPassword || confirmPassword)) setConfirmDiscardOpen(true);
                else setPasswordDialogOpen(o);
            }}>
                <DialogPopup showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Pakeisti slaptažodį</DialogTitle>
                        <DialogDescription>Įveskite naują slaptažodį ir patvirtinkite.</DialogDescription>
                    </DialogHeader>
                    <Form className="contents" onSubmit={(e) => { e.preventDefault(); submitPasswordChange(); }}>
                        <DialogPanel className="space-y-4">
                            <Field>
                                <Input
                                    type="password"
                                    placeholder="Naujas slaptažodis"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <Input
                                    type="password"
                                    placeholder="Patvirtinkite slaptažodį"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Field>
                        </DialogPanel>
                        <DialogFooter>
                            <DialogClose render={<Button variant="ghost">Atšaukti</Button>} />
                            <Button type="submit">Išsaugoti</Button>
                        </DialogFooter>
                    </Form>
                </DialogPopup>
            </Dialog>

            {/* Confirmation dialog for discarding password changes */}
            <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
                <AlertDialogPopup>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Atšaukti pakeitimus?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Jūsų įvestas slaptažodis bus prarastas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogClose render={<Button variant="ghost">Grįžti</Button>} />
                        <Button onClick={() => {
                            setConfirmDiscardOpen(false);
                            setNewPassword("");
                            setConfirmPassword("");
                            setPasswordDialogOpen(false);
                        }}>Atšaukti</Button>
                    </AlertDialogFooter>
                </AlertDialogPopup>
            </AlertDialog>
        </>
    );
}
