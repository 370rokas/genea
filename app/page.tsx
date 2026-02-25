"use client";

import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, ExternalLink, HelpCircle } from "lucide-react";
import TreeSVG from "@/components/icons/tree";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      <Topbar />

      <main className="relative flex-1 max-w-6xl mx-auto w-full pt-5 px-6 pb-24">
        <div className="flex justify-center mb-4">
          <TreeSVG width={250} height={250} />
        </div>
        <section className="text-center mb-16 space-y-6">

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Sveiki atvykę į <span className="text-emerald-600">Genea</span>
          </h1>

          <p className="text-xl text-gray-700 max-w-xl mx-auto leading-relaxed font-medium">
            genealoginių šaltinių duomenų bazę
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/saltiniai">
              <Button size="lg" className="h-12 px-10 shadow-md">
                Peržiūrėti šaltinius
              </Button>
            </Link>
            <Link href="/saltiniai/naujas">
              <Button variant="outline" size="lg" className="h-12 px-10 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                Pridėti naują
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* FAQ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Dažniausiai užduodami klausimai</h2>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="Kaip naudotis paieška?"
                answer="Ieškoti šaltinius galima atsidarius šaltinių sąrašą. Galima filtruoti pagal kategoriją, ieškoti pagal tekstą, arba paspaudus Rodyti filtrus, filtruoti pagal žymas ir vietovę."
              />
              <FAQItem
                question="Kaip pridėti naują įrašą?"
                answer={`Norėdami pridėti naują šaltinį, paspauskite mygtuką „Pridėti šaltinį" viršuje.`}
              />
            </div>
          </section>

          {/* FB Grupės */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Bendruomenės</h2>
            </div>

            <div className="grid gap-4">
              <GroupCard
                name="Domiuosi genealogija"
                url="https://www.facebook.com/groups/domiuosigenealogija/"
                description="Didžiausia Lietuvos genealogijos entuziastų grupė diskusijoms ir pagalbai."
              />
            </div>

            <div className="grid gap-4">
              <GroupCard
                name="Sūduvos - Suvalkijos - Užnemunės genealogija"
                url="https://www.facebook.com/groups/370198376688363"
                description="Genealogijos tyrinėtojams ir entuziastams, ieškantiems savo protėvių šaknų Sūduvoje / Užnemunėje / Suvalkijoje."
              />
            </div>

            <div className="grid gap-4">
              <GroupCard
                name="Lietuvos Liuteronų Genealogija"
                url="https://www.facebook.com/groups/LiuteronuGenealogija"
                description="Lietuvos liuteronų genealogijos grupė, skirta dalintis informacija ir tyrinėti liuteronų protėvius Lietuvoje."
              />
            </div>

            <div className="grid gap-4">
              <GroupCard
                name="Senos nuotraukos. Genealogija"
                url="https://www.facebook.com/groups/293447049894656"
                description="Grupė skirta besidomintiems genealogija dalintis savo archyvuose esančiomis senomis, istorinėmis nuotraukomis, siekiant padėti vieni kitiems rasti ieškomų giminaičių atvaizdus."
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h4 className="font-bold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
    </div>
  );
}

function GroupCard({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-shadow bg-white group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Facebook Grupė
          </div>
          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 leading-snug">
            {description}
          </p>
        </div>
      </div>

      <Button
        render={<a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
          Prisijungti prie grupės
          <ExternalLink className="w-4 h-4" />
        </a>}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
      />
    </Card>
  );
}