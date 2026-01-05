import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceDisplayData } from "@/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { MessageCircleIcon } from "lucide-react";
import { Form } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogPopup, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldLabel } from "../ui/field";

interface FilterSettings {
    categoryId: string | null;
    tagsIds?: number[] | null;
    locationIds?: number[] | null;
    text?: string;
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
    const [submittingForm, setSubmittingForm] = useState<boolean>(false);



    function shouldDisplayRow(item: SourceDisplayData): boolean {
        if (filterSettings) {
            // Category filter
            if (filterSettings.categoryId && item.category.id.toString() !== filterSettings.categoryId) {
                return false;
            }

            // Tags filter: must contain any of the selected tag IDs
            if (filterSettings.tagsIds && filterSettings.tagsIds.length > 0) {
                const itemTagIds = item.tags.map(tag => tag.id);
                const hasMatchingTag = filterSettings.tagsIds.some(tagId => itemTagIds.includes(tagId));
                if (!hasMatchingTag) {
                    return false;
                }
            }

            // Location filter
            if (filterSettings.locationIds && filterSettings.locationIds.length > 0) {
                const itemLocationIds = item.locations.map(loc => loc.id);
                const hasLocation = filterSettings.locationIds.some(locId => itemLocationIds.includes(locId));
                if (!hasLocation) {
                    return false;
                }
            }

            // Text filter
            if (filterSettings.text && filterSettings.text.trim() !== "") {
                const lowerText = filterSettings.text.toLowerCase();
                if (
                    !item.title.toLowerCase().includes(lowerText) &&
                    !item.description.toLowerCase().includes(lowerText)
                ) {
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
                    <TableHead className="w-[40%]">Aprašymas</TableHead>
                    <TableHead className="w-[10%] hidden xl:table-cell">Vietovardžiai</TableHead>
                    <TableHead className="w-[10%] hidden xl:table-cell">Žymos</TableHead>
                    <TableHead className="w-[10%]">Nuoroda</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
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

                            <TableCell className="overflow-hidden text-center">
                                <Dialog>
                                    <DialogTrigger render={<Button variant="destructive" size="icon-sm">
                                        <MessageCircleIcon />
                                    </Button>} />

                                    <DialogPopup>
                                        <Form>
                                            <DialogHeader>
                                                <DialogTitle>Pranešti apie šaltinį</DialogTitle>
                                                <DialogDescription>Pasirinktas šaltinis: {item.title}</DialogDescription>
                                            </DialogHeader>
                                            <DialogPanel>
                                                <Field name="pranesimas">
                                                    <FieldLabel>Pranešimas</FieldLabel>
                                                    <Textarea disabled={submittingForm} />
                                                </Field>


                                            </DialogPanel>
                                            <DialogFooter>
                                                <Button disabled={submittingForm} type="submit">
                                                    Pranešti
                                                </Button>

                                                <DialogClose render={<Button variant="ghost" />}>Atšaukti</DialogClose>
                                            </DialogFooter>
                                        </Form>
                                    </DialogPopup>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    )
};