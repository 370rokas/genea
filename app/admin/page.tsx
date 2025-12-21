"use client";

import { useSession } from "next-auth/react";

export default function AdminHomepage() {
    const { data: session } = useSession();

    return <div>Sveiki: {session?.user?.username}</div>;
}