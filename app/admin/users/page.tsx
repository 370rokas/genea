"use client";

import { hasPermission, Permission, UserData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { UsersTable } from "./UsersTable";

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
    console.log(users, usersLoading);

    return (
        <div className="flex w-full max-w-1xl flex-col gap-4 bg-white p-4 rounded-md shadow-md">
            {usersLoading || users == undefined ? (
                <div>Įkeliama...</div>
            ) : (
                <UsersTable displayData={users} />
            )}
        </div>
    )
}