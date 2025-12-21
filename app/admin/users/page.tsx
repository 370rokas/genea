"use client";

import { hasPermission, Permission, UserData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { UsersTable } from "./UsersTable";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogPopup, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

async function fetchUsers(): Promise<UserData[]> {
    const res = await fetch("/api/users/getAllUsers");
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export function useUsers() {
    return useQuery({
        queryKey: ["getUsers"],
        queryFn: fetchUsers,
        staleTime: 1000 * 60 * 5
    })
}

export default function UserManagementPage() {
    const { data: session } = useSession();
    const allowed = hasPermission(
        session?.user.permissions as Permission[] || [],
        "MANAGE_USERS"
    );

    if (!allowed) window.location.href = "/admin";

    const { data: users, isLoading: usersLoading } = useUsers();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setLoading(true);

        const response = await fetch("/api/users/createUser", {
            method: "POST",
            body: JSON.stringify({
                username: formData.get("username"),
                password: formData.get("password"),
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setLoading(false);

        if (response.ok) {
            window.location.reload();
        } else {
            alert("Klaida kuriant vartotoją");
        }
    };

    return (
        <div className="flex w-full max-w-1xl flex-col gap-4 bg-white p-4 rounded-md shadow-md">
            {usersLoading || users == undefined ? (
                <div>Įkeliama...</div>
            ) : (
                <>
                    <UsersTable displayData={users} />

                    <Dialog>
                        <DialogTrigger render={<Button>
                            Pridėti vartotoją
                        </Button>} />

                        <DialogPopup className="sm:max-w-sm">
                            <Form className="contents" onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Sukurti vartotoją</DialogTitle>
                                </DialogHeader>
                                <DialogPanel className="grid gap-4">
                                    <Field name="username">
                                        <FieldLabel>Slapyvardis</FieldLabel>
                                        <Input defaultValue="Slapyvardis" type="text" />
                                    </Field>
                                    <Field name="password">
                                        <FieldLabel>Slaptažodis</FieldLabel>
                                        <Input defaultValue="Slaptažodis" type="password" />
                                    </Field>
                                </DialogPanel>
                                <DialogFooter>
                                    <DialogClose render={<Button variant="ghost" />}>
                                        Cancel
                                    </DialogClose>
                                    <Button disabled={loading} type="submit">Save</Button>
                                </DialogFooter>
                            </Form>
                        </DialogPopup>
                    </Dialog>

                </>
            )}
        </div>
    )
}