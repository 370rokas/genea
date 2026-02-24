import { getSourceById } from "@/lib/db";
import { Label } from "@/components/ui/label";
import { EditSourceForm } from "@/components/admin/editSourceForm";

export default async function ManageSourcePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const data = await getSourceById(Number(slug));

    if (!data) return <div>Šaltinis nerastas.</div>;

    function handleFormSubmit(formData: any) {
        "use client";
        formData.id = data?.id;
        fetch("/api/admin/sources/editSource", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        }).then(res => {
            if (res.ok) {
                alert("Šaltinis sėkmingai atnaujintas!");
            } else {
                alert("Klaida atnaujinant šaltinį.");
            }
        }).catch(() => {
            alert("Klaida atnaujinant šaltinį.");
        }).finally(() => {
            window.location.reload();
        });
    }

    return (
        <div className="py-4 px-6">
            <Label className="block mb-6 font-bold text-2xl text-foreground">
                Šaltinio redagavimas
            </Label>

            <EditSourceForm startingData={data} onSubmit={handleFormSubmit} />

            <details className="mt-8">
                <summary className="cursor-pointer text-sm text-muted-foreground">RAW Data</summary>
                <pre className="p-4 bg-gray-100 rounded mt-2 text-xs">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </details>
        </div>
    );
}