"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/search/LocationSelector";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TEMP_DATA } from "./tempData";

const categoryChoices = [
  { label: "Pasirinkite kategoriją", value: null },
  { label: "Metrikai", value: "Metrics" },
  { label: "Žemėlapiai", value: "Maps" },
  { label: "Literatūra", value: "Literature" },
  { label: "Surašymai", value: "Revisions" },
  { label: "Nuotraukos", value: "Pictures" },
];

interface SourceData {
    id: string;
    
    title: string;
    description: string;
    link: string;

    category: string;
    tags: string[];

    locationNames: string[];
}

function ExpandableCell({
  children,
  expanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
}) {
  return (
    <div
      className={`
        text-sm
        break-words
        transition-all
        ${expanded ? "whitespace-normal" : "truncate"}
      `}
    >
      {children}
    </div>
  );
}


export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-200">
      
      {/* Main Search Bar*/}
      <div className="flex w-full flex-col gap-4 mb-8">

        <Select aria-label="Kategorija" items={categoryChoices} onValueChange={setSelectedCategory}>
          <SelectTrigger size="lg">
            <SelectValue />
          </SelectTrigger>

          <SelectPopup alignItemWithTrigger={false}>
            {categoryChoices.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <div className="flex w-full max-w-1xl gap-4 mb-4">
            <Input
              aria-label="Teksto paieška"
              placeholder="Teksto paieška"
              size="lg"
              type="text"
            />

            <Button onClick={() => {setShowFilters(!showFilters)}}>
              { showFilters ? "Slėpti filtrus" : "Rodyti filtrus" }
            </Button>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="w-full max-w-8xl mb-8">
        <AnimatePresence initial={false}> 
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8 p-4 bg-white shadow-md rounded-md">
                {/* Filtravimas pagal vietovardžius */}
                <div>
                  <Label className="text-md mb-2">Filtruoti pagal vietovardžius:</Label>
                  <LocationSelector
                    selectedLocations={selectedLocations}
                    setSelectedLocations={setSelectedLocations}
                  />
                </div>

                {/* Antras filtras..... */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      <div className="flex w-full max-w-1xl flex-col gap-4 bg-white p-4 rounded-md shadow-md">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Pavadinimas</TableHead>
                <TableHead className="w-[45%]">Aprašymas</TableHead>
                <TableHead className="w-[10%] hidden xl:table-cell">Vietovardžiai</TableHead>
                <TableHead className="w-[10%] hidden xl:table-cell">Žymos</TableHead>
                <TableHead className="w-[10%]">Nuoroda</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {TEMP_DATA.map((item: SourceData) => {
                const expanded = expandedRowId === item.id;

                return (
                  <TableRow
                    key={item.id}
                    onClick={() =>
                      setExpandedRowId(expanded ? null : item.id)
                    }
                    className={`
                      align-top
                      cursor-pointer
                      transition-colors
                      hover:bg-gray-50
                      ${expanded ? "bg-gray-50" : ""}
                    `}
                  >
                    <TableCell className="overflow-hidden">
                      <ExpandableCell expanded={expanded}>
                        {item.title}
                      </ExpandableCell>
                    </TableCell>

                    <TableCell className="overflow-hidden">
                      <ExpandableCell expanded={expanded}>
                        {item.description}
                      </ExpandableCell>
                    </TableCell>

                    <TableCell className="overflow-hidden hidden xl:table-cell">
                      <ExpandableCell expanded={expanded}>
                        {item.locationNames.join(", ")}
                      </ExpandableCell>
                    </TableCell>

                    <TableCell className="overflow-hidden hidden xl:table-cell">
                      <ExpandableCell expanded={expanded}>
                        {item.tags.join(", ")}
                      </ExpandableCell>
                    </TableCell>

                    <TableCell className="overflow-hidden">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 underline truncate block"
                      >
                        Atidaryti šaltinį
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>
    </main>
  );
}
