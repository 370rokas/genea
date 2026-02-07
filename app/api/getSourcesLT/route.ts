import { fetchDisplaySourcesLT } from "@/lib/db";



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