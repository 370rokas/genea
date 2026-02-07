import { fetchDisplaySourcesLT } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const locations = await fetchDisplaySourcesLT();

    return new Response(
        JSON.stringify(locations),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}