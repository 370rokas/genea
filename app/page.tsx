"use client";

import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Circle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      <Topbar />

      <main className="relative flex-1 max-w-4xl mx-auto w-full pt-20 px-6 pb-24">
        <section className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Sveiki atvykę į <span className="text-blue-600">Genea</span>
          </h1>

          <p className="text-xl text-gray-700 max-w-xl mx-auto leading-relaxed font-medium">
            genealoginių šaltinių duombazę
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-12 px-10 shadow-md" render={<Link href="/saltiniai">Peržiūrėti šaltinius</Link>} />
            <Button variant="outline" size="lg" className="h-12 px-10 bg-white border-gray-300 text-gray-700 hover:bg-gray-50" render={<Link href="/saltiniai/naujas">Pridėti naują</Link>} />
          </div>
        </section>

        {/* Status Card */}
        <Card className="overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-8 md:p-10">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-500 mb-6">
              Funkcionalumų įgyvendinimas:
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureItem checked label="Šaltinių peržiūra ir valdymas" />
              <FeatureItem checked label="Dubliavimosi tikrinimas" />
              <FeatureItem label="DUK sekcija, kanalas atgaliniam ryšiui" />
              <FeatureItem label="Kategorijų ir žymų valdymas" />
              <FeatureItem label="Angliška vartotojo sąsaja" />
              <FeatureItem label="Automatinis nuorodų būsenos tikrinimas" />
            </ul>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function FeatureItem({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <li className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
      ${checked
        ? 'bg-white border-blue-100 shadow-sm text-gray-900'
        : 'bg-gray-100/50 border-transparent text-gray-500 italic'}`}>

      <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full shadow-inner
        ${checked ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
        {checked ? <Check className="w-4 h-4" strokeWidth={3} /> : <Circle className="w-3 h-3 fill-current" />}
      </div>

      <span className="text-[15px] font-semibold tracking-tight">
        {label}
      </span>
    </li>
  );
}