import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchSourcesResponseItem } from "@/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { MessageCircleIcon } from "lucide-react";
import { Dialog, DialogPopup, DialogTrigger } from "../ui/dialog";
import SourceReportForm from "./SourceReportForm";
import { useSourceTags, useLocations } from "@/hooks/dataFetching";

interface SourceTableProps {
    className?: string;
    displayData: SearchSourcesResponseItem[];
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

export function SourceTable({ className, displayData }: SourceTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    // Load tags and locations for ID-to-name mapping
    const { data: tags } = useSourceTags();
    const { data: locations } = useLocations();

    // Helper functions to map IDs to names
    const getLocationNames = (locationIds: number[]) => {
        if (!locations || !locationIds?.length) return "—";
        return locationIds
            .map(id => locations.find(loc => loc.id === id)?.name)
            .filter(Boolean)
            .join(", ") || "—";
    };

    const getTagNames = (tagIds: number[]) => {
        if (!tags || !tagIds?.length) return "—";
        return tagIds
            .map(id => tags.find(tag => tag.id === id)?.name)
            .filter(Boolean)
            .join(", ") || "—";
    };

    return (
        <Table className={`w-full table-fixed ${className}`}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[25%]">Pavadinimas</TableHead>
                    <TableHead className="w-[40%]">Aprašymas</TableHead>
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
                                    {getLocationNames(item.location_ids)}
                                </ExpandableCell>
                            </TableCell>

                            <TableCell className="overflow-hidden hidden xl:table-cell">
                                <ExpandableCell expanded={expanded}>
                                    {getTagNames(item.tag_ids)}
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