"use client";

import Topbar from "@/components/topbar";
import Link from "next/link";

export default function Home() {

  return (
    <>
      <Topbar />
      <main className="flex min-h-screen flex-col items-center p-24 bg-gray-200">

        <div className="flex w-full flex-col gap-4 mb-8">

          <Link href="/saltiniai" className="text-2xl font-bold underline">
            Visi šaltiniai
          </Link>

          <Link href="/saltiniai/naujas" className="text-2xl font-bold underline">
            Pridėti naują šaltinį
          </Link>
        </div>
      </main>
    </>
  );
}
