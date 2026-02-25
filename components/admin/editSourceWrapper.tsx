"use client";

import { FullSourceData } from "@/types";
import { EditSourceForm, FormSubmitData } from "./editSourceForm";

export function EditSourceWrapper({ data }: { data: FullSourceData }) {
    function handleFormSubmit(formData: FormSubmitData) {
        fetch("/api/admin/sources/editSource", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, id: data.id }),
        })
            .then((res) => {
                if (res.ok) {
                    alert("Šaltinis sėkmingai atnaujintas!");
                } else {
                    alert("Klaida atnaujinant šaltinį.");
                }
            })
            .catch(() => alert("Klaida atnaujinant šaltinį."))
            .finally(() => window.location.reload());
    }

    return (
        <EditSourceForm
            startingData={data}
            onSubmit={handleFormSubmit}
            submitButtonText="Išsaugoti pakeitimus"
        />
    );
}