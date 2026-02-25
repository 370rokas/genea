"use client";

import { getUnhandledMessages, UserMessage } from "@/lib/messages";
import { markMessageAsHandled } from "@/lib/messages";
import { useState, useEffect, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel, CardFooter, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function MessagesPage() {
    const [messages, setMessages] = useState<UserMessage[]>([]);
    const [pending, startTransition] = useTransition();
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchMessages() {
            const msgs = await getUnhandledMessages();
            setMessages(msgs);
        }
        fetchMessages();
    }, []);

    function handleComplete(id: number) {
        setLoadingIds((prev) => new Set(prev).add(id));
        startTransition(async () => {
            await markMessageAsHandled(id);
            setMessages((prev) => prev.filter((m) => m.id !== id));
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        });
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Neapdoroti pranešimai</h1>
                {messages.length > 0 && (
                    <Badge variant="warning">{messages.length} laukia</Badge>
                )}
            </div>

            {messages.length === 0 ? (
                <Card>
                    <CardPanel className="py-12 text-center text-muted-foreground">
                        Nėra neapdorotų pranešimų.
                    </CardPanel>
                </Card>
            ) : (
                <ul className="space-y-4">
                    {messages.map((msg) => (
                        <li key={msg.id}>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start gap-2">
                                        <CardTitle className="text-base">{msg.message}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {new Date(msg.created_at).toLocaleString("lt-LT")}
                                    </CardDescription>
                                    <CardAction>
                                        <div className="flex gap-2">
                                            {msg.related_source_id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={`/admin/sources/${msg.related_source_id}`}
                                                        />
                                                    }
                                                >
                                                    Atidaryti šaltinį
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => handleComplete(msg.id)}
                                                disabled={loadingIds.has(msg.id)}
                                            >
                                                {loadingIds.has(msg.id) ? "Vykdoma..." : "Atlikta"}
                                            </Button>
                                        </div>
                                    </CardAction>
                                </CardHeader>

                                {msg.reply_to && (
                                    <CardPanel className="text-sm text-muted-foreground border-t">
                                        <span className="font-medium">Atsakymas į:</span>{" "}
                                        {msg.reply_to}
                                    </CardPanel>
                                )}
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}