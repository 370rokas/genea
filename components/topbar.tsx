"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Topbar() {
    return (
        <header className="w-full bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <Link href="/" className="text-xl font-bold text-gray-900">
                    Genea
                </Link>

                <nav className="flex space-x-4">
                    <Link href="/saltiniai" passHref>
                        <Button variant="ghost">Šaltinių Sąrašas</Button>
                    </Link>
                    <Link href="/saltiniai/naujas" passHref>
                        <Button variant="ghost">Pridėti Šaltinį</Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
