"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { DialogHeader, DialogTitle, DialogDescription, DialogPanel, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { SearchSourcesResponseItem } from "@/types";
import { submitFormReportSource } from "@/actions/reportSourceForm";
import { schemaFormReportSource } from "@/lib/zodSchemas";

type FormErrors = Record<string, string | string[]>;

async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = schemaFormReportSource.safeParse(Object.fromEntries(formData));
    if (!result.success) {
        const { fieldErrors } = z.flattenError(result.error);
        return { errors: fieldErrors as FormErrors };
    }
    return {
        errors: {} as FormErrors,
    };
}

interface SourceReportFormProps {
    item: SearchSourcesResponseItem;
}

export default function SourceReportForm({ item }: SourceReportFormProps) {
    const [submittingForm, setSubmittingForm] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmittingForm(true);
        const response = await submitForm(event);
        await new Promise((r) => setTimeout(r, 800));
        setFormErrors(response.errors);
        setSubmittingForm(false);
        if (Object.keys(response.errors).length === 0) {
            console.log("Form submitted:", Object.fromEntries(formData), " src id: ", item.id);

            const res = await submitFormReportSource(formData, item.id);
            console.log("Server response:", res);

            if (!res.success) {
                alert("Įvyko klaida siunčiant pranešimą: " + (res.error || "Nežinoma klaida"));
                return;
            }

            alert("Jūsų pranešimas buvo sėkmingai išsiųstas. Ačiū!");
            window.location.reload();
        }
    };


    return (
        <Form errors={formErrors} onSubmit={onSubmit}>
            <DialogHeader>
                <DialogTitle>Pranešti apie šaltinį</DialogTitle>
                <DialogDescription>Pasirinktas šaltinis: {item.title}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
                <Field name="message">
                    <FieldLabel>Pranešimas</FieldLabel>
                    <Textarea disabled={submittingForm} required />
                </Field>

                <Field name="replyTo">
                    <FieldLabel>Jeigu norite gauti atsakymą, įveskite savo el. pašto adresą</FieldLabel>
                    <Input disabled={submittingForm} />
                </Field>
            </DialogPanel>
            <DialogFooter>
                <Button disabled={submittingForm} type="submit">
                    Pranešti
                </Button>

                <DialogClose render={<Button variant="ghost" />}>Atšaukti</DialogClose>
            </DialogFooter>
        </Form>
    );
}