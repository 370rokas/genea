"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasPermission, Permission } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BookOpenText, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

type SidebarItem = {
    label: string;
    href: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    permission?: Permission;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: "Pagrindinis",
        href: "/admin",
    },
    {
        label: "Vartotojai",
        href: "/admin/users",
        permission: "MANAGE_USERS",
        icon: User2Icon
    },
    {
        label: "Šaltiniai",
        href: "/admin/sources",
        permission: "MANAGE_SOURCES",
        icon: BookOpenText
    }
];

export function AdminSidebar({
    user,
    permissions,
}: {
    user: string;
    permissions: Permission[];
}) {
    const router = useRouter();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r bg-background">
            {/* Header */}
            <div className="px-4 py-5">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
                    Valdymas
                </h2>
            </div>

            <Separator />

            {/* Scrollable menu */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="flex flex-col gap-1">
                    {SIDEBAR_ITEMS.filter((item) =>
                        hasPermission(permissions, item.permission)
                    ).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium",
                                "hover:bg-muted"
                            )}
                        >
                            {item.icon && (
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                            )}
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>

            <Separator />

            {/* User info & logout - fixed at bottom */}
            <div className="px-4 py-5">
                <span className="text-sm text-muted-foreground">
                    Prisijungta kaip <strong>{user}</strong>
                    <br />
                    <Button
                        variant="link"
                        className="p-0 text-sm"
                        onClick={() => router.push("/api/auth/signout")}
                    >
                        Atsijungti
                    </Button>
                </span>
            </div>
        </aside>
    );
}
