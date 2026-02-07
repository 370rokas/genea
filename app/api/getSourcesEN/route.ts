import { fetchDisplaySourcesEN } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const locations = await fetchDisplaySourcesEN();

    return new Response(
        JSON.stringify(locations),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}