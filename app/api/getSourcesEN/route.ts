import { fetchDisplaySourcesEN } from "@/lib/db";



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