"use client";

import { LocationSelector } from "@/components/search/LocationSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSourceProposals } from "@/hooks/dataFetching";
import { ApproveSourceBody, RemoveSourceBody, SourceProposal } from "@/types";
import { useMemo, useState } from "react";
import CategorySelector from "@/components/admin/categorySelector";
import TagSelector from "@/components/search/tagSelector";

interface OnCloseReturn {
    status: "approved" | "rejected" | "closed";

    proposal_id: number;
    data?: {
        title: string;
        description: string;
        link: string;

        category_id: number | null;
        tag_ids: number[];
        location_ids: number[];
    }
}

function ProposalManageDialog({ proposal, onClose, open }: { proposal: SourceProposal; onClose: (data: OnCloseReturn) => void; open: boolean }) {

    function handleClose(open: boolean) {
        if (!open) {
            onClose({
                status: "closed",
                proposal_id: proposal.id,
            });
            return;
        }
    }

    const [title, setTitle] = useState(proposal.title);
    const [description, setDescription] = useState(proposal.description);
    const [link, setLink] = useState(proposal.link);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [tagIds, setTagIds] = useState<number[]>([]);
    const [locationIds, setLocationIds] = useState<number[]>([]);

    useMemo(() => {
        setTitle(proposal.title);
        setDescription(proposal.description);
        setLink(proposal.link);
    }, [proposal]);

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => handleClose(open)}>
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>Pasiūlymo valdymas</DialogTitle>
                </DialogHeader>

                <DialogPanel>
                    <DialogDescription>
                        <Field className="mb-4">
                            <FieldLabel>Pavadinimas:</FieldLabel>
                            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </Field>

                        <Field className="mb-4">
                            <FieldLabel>Aprašymas:</FieldLabel>
                            <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Field>

                        <Field className="mb-4">
                            <FieldLabel>Nuoroda:</FieldLabel>
                            <Input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
                        </Field>

                        <Field className="mb-4">
                            <FieldLabel>Kategorija:</FieldLabel>
                            <CategorySelector selectedCategory={categoryId} setSelectedCategory={setCategoryId} />
                        </Field>

                        <Field className="mb-4">
                            <FieldLabel>Vietovės:</FieldLabel>
                            <LocationSelector
                                selectedLocations={locationIds.map(id => id.toString())}
                                setSelectedLocations={(selected) => setLocationIds(selected.map(id => parseInt(id)))}
                            />
                        </Field>

                        <Field className="mb-4">
                            <FieldLabel>Žymos:</FieldLabel>
                            <TagSelector selectedTags={tagIds} setSelectedTags={setTagIds} />
                        </Field>
                    </DialogDescription>

                </DialogPanel>


                <DialogFooter>
                    <DialogClose render={<Button variant="secondary" />}>Uždaryti</DialogClose>
                    <Button variant="default" onClick={() => onClose({
                        status: "approved",
                        proposal_id: proposal.id,
                        data: {
                            title: title,
                            description: description,
                            link: link,
                            category_id: categoryId,
                            tag_ids: tagIds,
                            location_ids: locationIds,
                        }
                    })}>Patvirtinti</Button>
                    <Button variant="destructive" onClick={() => onClose({
                        status: "rejected",
                        proposal_id: proposal.id,
                    })}>Atmesti</Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
}

function ProposalTable({ proposals }: { proposals: SourceProposal[] }) {
    const [selectedProposal, setSelectedProposal] = useState<SourceProposal | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function onProposalClick(proposal: SourceProposal) {
        if (isModalOpen) {
            setIsModalOpen(false);
        }

        setSelectedProposal(proposal);
        setIsModalOpen(true);
    }

    return (
        <>
            <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Pavadinimas</TableHead>
                        <TableHead className="w-[70%]">Aprašymas</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {proposals.map((item) => (
                        <TableRow
                            key={item.id}
                            onClick={() => onProposalClick(item)}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>



            {selectedProposal && (
                <ProposalManageDialog
                    proposal={selectedProposal}
                    open={isModalOpen}
                    onClose={(data: OnCloseReturn) => {
                        console.log(data);

                        var endpoint: string | null = null;
                        var payload: ApproveSourceBody | RemoveSourceBody | null = null;

                        if (data.status == "approved") {
                            endpoint = "/api/admin/sources/proposals/approve";
                            payload = {
                                proposal_id: data.proposal_id,
                                data: data.data
                            } as ApproveSourceBody
                        } else if (data.status == "rejected") {
                            endpoint = "/api/admin/sources/proposals/remove";
                            payload = {
                                proposal_id: data.proposal_id
                            }
                        }

                        if (endpoint) {
                            fetch(endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            }).then((resp: Response) => {
                                if (resp.ok) {
                                    window.location.reload();
                                } else {
                                    alert("Nepavyko išsaugoti pakeitimų");
                                }
                            }).catch((err) => {
                                console.log(err);
                                alert("Nepavyko išsaugoti pakeitimų");
                            })
                        }

                        setIsModalOpen(false);
                        setSelectedProposal(null);
                    }}

                />
            )}
        </>
    )
}

export default function ProposalView() {
    const { data, isLoading, isError } = useSourceProposals();

    return (
        <div>
            {isLoading && <div>Įkeliami pasiūlymai...</div>}

            {isError && <div>Klaida įkeliant pasiūlymus.</div>}

            {data && (
                <ProposalTable proposals={data} />
            )}
        </div>
    );
}