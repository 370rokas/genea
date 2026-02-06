"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;

    return (
        <footer className="w-full bg-gray-100 text-center py-4 mt-8 text-gray-600">
            <p className="text-sm text-gray-600">
                &copy; {year || "2026"} Genea, sukurta <Link href="https://github.com/370rokas" target="_blank" rel="noopener noreferrer"> <u>Roko</u></Link>.
                Prisidėk prie kūrimo <Link href="https://github.com/370rokas/genea" target="_blank" rel="noopener noreferrer"><u>čia</u></Link>. <br />
                Dabartinė versija: {
                    commitSha ? (
                        <Link href={"https://github.com/370rokas/genea/commit/" + commitSha}>
                            <u>{commitSha.substring(0, 7)}</u>
                        </Link>
                    ) : "nežinoma"
                }.
            </p>
        </footer>
    );
}