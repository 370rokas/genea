"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { AdminSidebar } from "./sidebar";
import { Permission } from "@/types";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    if (!session?.user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <form
                    className="w-full max-w-sm space-y-4 rounded-lg border p-6 shadow"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        await signIn("credentials", {
                            username: email,
                            password,
                            callbackUrl: "/admin",
                        });
                        setLoading(false);
                    }}
                >
                    <h2 className="text-xl font-semibold text-center">
                        Valdymo panelės prisijungimas
                    </h2>

                    <div className="space-y-2">
                        <Label htmlFor="username">Slapyvardis</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="slapyvardis"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Slaptažodis</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Jungiamasi..." : "Prisijungti"}
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex">
            <AdminSidebar
                permissions={session.user.permissions as Permission[]}
                user={session.user.username}
            />

            <main className="flex-1 ml-64 p-6">{children}</main>
        </div>
    );
}
