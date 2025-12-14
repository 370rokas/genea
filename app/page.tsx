"use client";

import Link from "next/link";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-200">

      <div className="flex w-full flex-col gap-4 mb-8">

        <Link href="/saltiniai" className="text-2xl font-bold underline">
          Eiti į šaltinių puslapį
        </Link>
      </div>
    </main>
  );
}
