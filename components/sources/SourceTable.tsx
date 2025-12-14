import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceDisplayData } from "@/types";
import { useState } from "react";

interface FilterSettings {
    categoryId: string | null;
    tagsIds?: number[] | null;
    locationIds?: number[] | null;
}

interface SourceTableProps {
    displayData: SourceDisplayData[];
    filterSettings?: FilterSettings;
};

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
};

export function SourceTable({ displayData, filterSettings }: SourceTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    function shouldDisplayRow(item: SourceDisplayData): boolean {
        if (filterSettings) {
            // Category filter
            if (filterSettings.categoryId && item.category.id.toString() !== filterSettings.categoryId) {
                return false;
            }

            // Must contain all tagIds
            if (filterSettings.tagsIds && filterSettings.tagsIds.length > 0) {
                const itemTagIds = item.tags.map(tag => tag.id);
                const hasAllTags = filterSettings.tagsIds.every(tagId => itemTagIds.includes(tagId));
                if (!hasAllTags) {
                    return false;
                }
            }

            // Must contain one or more locationIds
            if (filterSettings.locationIds && filterSettings.locationIds.length > 0) {
                const itemLocationIds = item.locations.map(loc => loc.id);
                const hasLocation = filterSettings.locationIds.some(locId => itemLocationIds.includes(locId));
                if (!hasLocation) {
                    return false;
                }
            }
        }

        return true;
    }

    return (
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
                {displayData.map((item: SourceDisplayData) => {
                    const expanded = expandedRowId === item.id;

                    if (!shouldDisplayRow(item)) {
                        return null;
                    }

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
                                    {
                                        item.locations
                                            .map(loc => loc.name)
                                            .join(", ")
                                    }
                                </ExpandableCell>
                            </TableCell>

                            <TableCell className="overflow-hidden hidden xl:table-cell">
                                <ExpandableCell expanded={expanded}>
                                    {
                                        item.tags
                                            .map(tag => tag.name)
                                            .join(", ")
                                    }
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
    )
};