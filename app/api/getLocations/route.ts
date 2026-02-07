import { fetchLocations } from "@/lib/db";



export async function GET() {
    const locations = await fetchLocations();

    return new Response(
        JSON.stringify(locations),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}