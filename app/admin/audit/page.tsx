"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxValue,
    ComboboxChipsInput,
    ComboboxPopup,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useAdminUserList } from "@/hooks/dataFetching";
import { EventType, EventLogEntry } from "@/types/api";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

const PAGE_SIZE = 20;

function eventTypeBadgeVariant(eventType: string): "default" | "success" | "destructive" | "warning" | "info" | "secondary" {
    const lower = eventType.toLowerCase();
    if (lower.includes("delete") || lower.includes("remove")) return "destructive";
    if (lower.includes("create") || lower.includes("add")) return "success";
    if (lower.includes("update") || lower.includes("edit") || lower.includes("modify")) return "warning";
    if (lower.includes("login") || lower.includes("auth") || lower.includes("access")) return "info";
    return "secondary";
}

function AuditLogTable({ logs, userMap }: { logs: any[]; userMap: Record<string, string> }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Nerasta įrašų
            </div>
        );
    }

    // Determine columns from first log entry
    const allKeys = Array.from(new Set(logs.flatMap(log => Object.keys(log))));
    // Prioritize common audit columns
    const prioritized = ["id", "type", "timestamp", "userId", "sourceId", "data"];
    const columns = [
        ...prioritized.filter(k => allKeys.includes(k)),
        ...allKeys.filter(k => !prioritized.includes(k)),
    ];

    const parseTimestamp = (value: any): Date | null => {
        if (value === null || value === undefined) return null;
        // If it's a number and looks like seconds (< year 3000 in ms would be ~32503680000)
        if (typeof value === "number") {
            const asMs = value * 1000;
            // Heuristic: if raw value < 1e12 it's almost certainly seconds, not ms
            return new Date(value < 1e12 ? value * 1000 : value);
        }
        return new Date(value);
    };

    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-gray-300">—</span>;
        }
        if (key === "type") {
            return (
                <Badge variant={eventTypeBadgeVariant(String(value))} size="sm">
                    {String(value)}
                </Badge>
            );
        }
        if (key === "timestamp") {
            const date = parseTimestamp(value);
            if (!date || isNaN(date.getTime())) return <span className="text-gray-300">—</span>;
            return (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {date.toLocaleString("lt-LT")}
                </span>
            );
        }
        if (key === "userId") {
            const username = userMap[String(value)];
            return (
                <span className="text-sm">
                    {username
                        ? <><span className="font-medium">{username}</span> <span className="text-gray-400 text-xs">#{value}</span></>
                        : String(value)
                    }
                </span>
            );
        }
        if (key === "sourceId") {
            return (
                <Link
                    href={`/admin/sources/${value}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                >
                    {String(value)}
                </Link>
            );
        }
        if (typeof value === "object") {
            return (
                <span className="text-xs font-mono text-gray-500 truncate max-w-[200px] block">
                    {JSON.stringify(value)}
                </span>
            );
        }
        return <span className="text-sm">{String(value)}</span>;
    };

    const columnLabel = (key: string) => {
        return key
            .replace(/_/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="overflow-x-auto rounded border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(col => (
                            <TableHead key={col} className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                                {columnLabel(col)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log, i) => (
                        <TableRow key={log.id ?? i} className="hover:bg-gray-50">
                            {columns.map(col => (
                                <TableCell key={col} className="text-sm max-w-[260px] truncate">
                                    {formatValue(col, log[col])}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function AuditPagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        pages.push(1);
        if (currentPage > 3) pages.push("ellipsis");
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push("ellipsis");
        pages.push(totalPages);
        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {getPageNumbers().map((page, i) =>
                    page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }}
                        aria-disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

export default function AuditPage() {
    const { data: userList, isLoading: usersLoading } = useAdminUserList();
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
        Object.keys(EventType)
    );
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");

    const userOptions = useMemo(() =>
        userList?.map((user) => ({ value: user.id, label: user.username })) || [],
        [userList]
    );

    async function fetchPage(page: number) {
        setLoading(true);
        try {
            const request = {
                page,
                event_type: selectedEventTypes.length === Object.keys(EventType).length ? undefined : selectedEventTypes,
                related_user_id: selectedUserIds.length > 0 ? selectedUserIds.map(id => parseInt(id, 10)) : undefined,
                related_source_id: selectedSourceId ? parseInt(selectedSourceId, 10) : undefined,
            };

            const response = await fetch("/api/admin/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });

            if (!response.ok) throw new Error("Failed to fetch audit logs");

            const result = await response.json();
            setData(result);
            setCurrentPage(page);
        } catch (error) {
            alert("Error fetching audit logs: " + error);
        } finally {
            setLoading(false);
        }
    }

    async function updateResults() {
        setCurrentPage(1);
        await fetchPage(1);
    }

    const allEventTypes = useMemo(() => Object.keys(EventType), []);
    const toggleAllEvents = (select: boolean) => {
        setSelectedEventTypes(select ? allEventTypes : []);
    };

    // id -> username lookup map
    const userMap = useMemo(() =>
        Object.fromEntries((userList ?? []).map(u => [String(u.id), u.username])),
        [userList]
    );

    // Derive pagination info from response
    const logs: EventLogEntry[] = data?.logs ?? [];
    const totalCount: number = logs.length; // no total in API, use hasMore for next page
    const hasMore: boolean = data?.hasMore ?? false;
    const totalPages = hasMore ? currentPage + 1 : currentPage; // we only know current + maybe next

    return (
        <div className="flex h-full">
            {/* Sidebar filters */}
            <div className="w-1/4 p-4 bg-gray-100 overflow-hidden space-y-6 shrink-0">
                <div className="flex flex-col gap-2">
                    <Label>Vartotojai</Label>
                    <Combobox
                        items={userOptions}
                        multiple
                        value={selectedUserIds}
                        onValueChange={(values) => setSelectedUserIds(values)}
                        disabled={usersLoading}
                    >
                        <ComboboxChips>
                            <ComboboxValue>
                                {(selectedIds: string[]) => {
                                    const selectedItems = (selectedIds || []).map(id =>
                                        // @ts-expect-error
                                        userOptions.find(opt => opt.value === id) || { value: id, label: id }
                                    );
                                    return selectedItems.map((item) => (
                                        <ComboboxChip
                                            key={item.value}
                                            // @ts-expect-error
                                            value={item.value}
                                        >
                                            {item.label}
                                        </ComboboxChip>
                                    ));
                                }}
                            </ComboboxValue>
                            <ComboboxChipsInput
                                placeholder={selectedUserIds.length > 0 ? "" : "Pasirinkite vartotoją..."}
                            />
                        </ComboboxChips>
                        <ComboboxPopup>
                            <ComboboxEmpty>Vartotojo nerasta.</ComboboxEmpty>
                            <ComboboxList>
                                {userOptions.map((item) => (
                                    // @ts-expect-error
                                    <ComboboxItem key={item.value} value={item.value} item={item}>
                                        {item.label}
                                    </ComboboxItem>
                                ))}
                            </ComboboxList>
                        </ComboboxPopup>
                    </Combobox>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Label className="shrink-0">Šaltinio ID</Label>
                    <Input
                        aria-label="Šaltinio ID"
                        placeholder="Šaltinio ID"
                        type="number"
                        value={selectedSourceId}
                        onChange={(e) => setSelectedSourceId(e.target.value)}
                    />
                </div>

                <Collapsible>
                    <div className="flex items-center justify-between pb-2">
                        <CollapsibleTrigger className="inline-flex items-center gap-2 font-medium group">
                            Įvykių tipai:
                            <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                    </div>
                    <CollapsiblePanel>
                        <div className="flex gap-4 mb-3">
                            <button onClick={() => toggleAllEvents(true)} className="text-xs text-blue-600 hover:underline font-medium">
                                Pažymėti visus
                            </button>
                            <button onClick={() => toggleAllEvents(false)} className="text-xs text-red-600 hover:underline font-medium">
                                Atšaukti visus
                            </button>
                        </div>
                        <CheckboxGroup
                            value={selectedEventTypes}
                            disabled={loading}
                            onValueChange={(values: string[]) => setSelectedEventTypes(values)}
                        >
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                                {allEventTypes.map((eventType) => (
                                    <div key={eventType} className="flex items-center gap-2">
                                        <Checkbox value={eventType} id={eventType} />
                                        <Label htmlFor={eventType} className="cursor-pointer text-sm truncate">
                                            {eventType}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CheckboxGroup>
                    </CollapsiblePanel>
                </Collapsible>

                <Button onClick={updateResults} disabled={loading} className="w-full">
                    {loading ? "Kraunama..." : "Atnaujinti"}
                </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 flex flex-col gap-4 min-w-0 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Audito žurnalai</h2>
                    {data && (
                        <span className="text-sm text-gray-500">
                            {logs.length} įrašų šiame puslapyje
                        </span>
                    )}
                </div>

                {/* Empty / loading states */}
                {!data && !loading && (
                    <div className="flex items-center justify-center h-60 text-gray-400 text-sm border rounded bg-white">
                        Pasirinkite filtrus ir spauskite „Atnaujinti"
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center h-60 text-gray-400 text-sm border rounded bg-white">
                        <svg className="animate-spin mr-2 size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Kraunama...
                    </div>
                )}

                {/* Table */}
                {data && !loading && (
                    <>
                        <AuditLogTable logs={logs} userMap={userMap} />

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                                Puslapis <span className="font-medium">{currentPage}</span> iš <span className="font-medium">{totalPages}</span>
                            </p>
                            <AuditPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => fetchPage(page)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}