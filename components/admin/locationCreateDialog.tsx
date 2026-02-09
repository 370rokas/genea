"use client";

import { Dialog, DialogClose, DialogPanel, DialogFooter, DialogHeader, DialogPopup, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// TODO: Add support for location parent ID's

export default function CreateLocationDialog() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")

        try {
            const response = await fetch("/api/admin/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: name }),
            })
            if (!response.ok) {
                throw new Error("Vietovės kūrimas nepavyko")
            }
            window.location.reload()
        } catch (err: any) {
            setError(err.message || "Įvyko klaida")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger render={<Button>Sukurti vietovę</Button>} />

            <DialogPopup className="sm:max-w-sm">
                <Form className="contents" onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Sukurti vietovę</DialogTitle>
                    </DialogHeader>

                    <DialogPanel>
                        <Field name="name">
                            <FieldLabel>Vietovės pavadinimas</FieldLabel>
                            <Input
                                type="text"
                                name="name"
                                placeholder="Įveskite pavadinimą"
                            />
                        </Field>

                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </DialogPanel>

                    <DialogFooter>
                        <DialogClose render={<Button variant="ghost" />}>
                            Atšaukti
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Kuriama..." : "Sukurti"}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogPopup>
        </Dialog>
    )
}