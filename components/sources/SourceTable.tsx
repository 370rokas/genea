import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchSourcesResponseItem } from "@/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { MessageCircleIcon } from "lucide-react";
import { Dialog, DialogPopup, DialogTrigger } from "../ui/dialog";
import SourceReportForm from "./SourceReportForm";
import { useSourceTags, useLocations, useSourceCategories } from "@/hooks/dataFetching";

interface HighlightSettings {
    textQuery?: string;
    tagIds?: number[];
    locationIds?: number[];
}

interface SourceTableProps {
    className?: string;
    displayData: SearchSourcesResponseItem[];
    highlightSettings?: HighlightSettings;
}

function ExpandableCell({
    children,
    expanded,
}: {
    children: React.ReactNode;
    expanded: boolean;
}) {
    return (
        <div className={`text-sm break-words transition-all ${expanded ? "whitespace-normal" : "truncate"}`}>
            {children}
        </div>
    );
}

export function SourceTable({ className, displayData, highlightSettings }: SourceTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    // Load tags and locations for ID-to-name mapping
    const { data: tags } = useSourceTags();
    const { data: locations } = useLocations();
    const { data: categories } = useSourceCategories();

    return (
        <Table className={`w-full table-fixed ${className}`}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[20%]">Pavadinimas</TableHead>
                    <TableHead className="w-[35%]">Aprašymas</TableHead>
                    <TableHead className="w-[10%] hidden xl:table-cell">Kategorija</TableHead>
                    <TableHead className="w-[10%] hidden xl:table-cell">Vietovardžiai</TableHead>
                    <TableHead className="w-[10%] hidden xl:table-cell">Žymos</TableHead>
                    <TableHead className="w-[10%]">Nuoroda</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {displayData.map((item) => {
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
                                    {item.category_id && categories ? (
                                        categories.find(cat => cat.id === item.category_id)?.name || "—"
                                    ) : "—"}
                                </ExpandableCell>
                            </TableCell>

                            <TableCell className="overflow-hidden hidden xl:table-cell">
                                <ExpandableCell expanded={expanded}>
                                    {item.location_ids && locations ? (
                                        item.location_ids
                                            .map(id => locations.find(loc => loc.id == id)?.name)
                                            .filter(Boolean)
                                            .map((name, index) => (
                                                <span key={index}>
                                                    {highlightSettings?.locationIds?.includes(item.location_ids[index]) ? (
                                                        <span className="bg-yellow-200">{name}</span>
                                                    ) : (
                                                        name
                                                    )}
                                                    {index < item.location_ids.length - 1 && ", "}
                                                </span>
                                            ))
                                    ) : "—"}
                                </ExpandableCell>
                            </TableCell>

                            <TableCell className="overflow-hidden hidden xl:table-cell">
                                <ExpandableCell expanded={expanded}>
                                    {item.tag_ids && tags ? (
                                        item.tag_ids
                                            .map(id => tags.find(tag => tag.id === id)?.name)
                                            .filter(Boolean)
                                            .map((name, index) => (
                                                <span key={index}>
                                                    {highlightSettings?.tagIds?.includes(item.tag_ids[index]) ? (
                                                        <span className="bg-yellow-200">{name}</span>
                                                    ) : (
                                                        name
                                                    )}
                                                    {index < item.tag_ids.length - 1 && ", "}
                                                </span>
                                            ))
                                    ) : (
                                        "—"
                                    )}
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

                            <TableCell className="overflow-hidden text-center">
                                <Dialog>
                                    <DialogTrigger render={<Button variant="destructive" size="icon-sm">
                                        <MessageCircleIcon />
                                    </Button>} />

                                    <DialogPopup>
                                        <SourceReportForm item={item} />
                                    </DialogPopup>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}