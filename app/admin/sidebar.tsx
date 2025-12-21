"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasPermission, Permission } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { User2Icon } from "lucide-react";
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
        <aside className="flex h-full w-64 flex-col border-r bg-background">
            <div className="px-4 py-5">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
                    Valdymas
                </h2>
            </div>

            <Separator />

            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="flex flex-col gap-1">
                    {SIDEBAR_ITEMS.filter((item) =>
                        hasPermission(permissions, item.permission)
                    ).map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                "h-10 justify-start px-3 text-sm font-medium",
                                "hover:bg-muted"
                            )}
                            onClick={() => {
                                router.push(item.href);
                            }}
                        >
                            <Link href={item.href}>
                                {item.icon && (
                                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                )}
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
            </ScrollArea>

            <Separator />

            {/* user info */}
            <div className="px-4 py-5">
                <span className="text-sm text-muted-foreground">
                    Prisijungta kaip <strong>{user}</strong>
                    <br />
                    <Button variant="link" className="p-0 text-sm" onClick={() => {
                        router.push('/api/auth/signout');
                    }}>Atsijungti</Button>
                </span>
            </div>
        </aside>
    );
}
