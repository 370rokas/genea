"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-gray-100 text-center py-4 mt-8 text-gray-600">
            <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} Genea, sukurta <Link href="https://github.com/370rokas" target="_blank" rel="noopener noreferrer"> <u>Roko</u></Link>.
                Prisidėk prie kūrimo <Link href="https://github.com/370rokas/genea" target="_blank" rel="noopener noreferrer"><u>čia</u></Link>. <br />
                Dabartinė versija: {
                    process.env.GENEA_COMMIT_SHA ? <Link href={"https://github.com/370rokas/genea/commit/" + process.env.GENEA_COMMIT_SHA} ><u>{process.env.GENEA_COMMIT_SHA}</u></Link> : "nežinoma"
                }.
            </p>
        </footer>
    );
}