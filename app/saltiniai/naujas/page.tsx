"use client";

import { useState } from "react";
import {
    Field,
    FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NewSourcePage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const res = await fetch("/api/submitSource", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    link,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Įvyko klaida");
            }

            // success
            setSuccess("Šaltinis sėkmingai įkeltas administratorių peržiūrai.");
            setTitle("");
            setDescription("");
            setLink("");
        } catch (err: any) {
            setError("Nepavyko įkelti šaltinio: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-24 bg-gray-200">
            <div className="flex w-full max-w-2xl flex-col gap-6">
                <h1 className="text-2xl font-bold mb-2">Naujas šaltinis</h1>

                <Form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="title">Pavadinimas</FieldLabel>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Aprašymas</FieldLabel>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="link">Nuoroda</FieldLabel>
                        <Input
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required
                        />
                    </Field>

                    {success && (
                        <p className="text-green-600 text-sm">{success}</p>
                    )}

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Siunčiama..." : "Pateikti"}
                    </Button>
                </Form>
            </div>
        </main>
    );
}
